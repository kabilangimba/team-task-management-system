from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Task
from .serializers import TaskSerializer, TaskCreateSerializer, TaskUpdateSerializer
from users.permissions import IsAdminOrManager

class TaskViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return TaskCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return TaskUpdateSerializer
        return TaskSerializer
    
    def get_queryset(self):
        user = self.request.user
        queryset = Task.objects.all()
        
        # Filter based on role
        if user.is_member:
            # Members only see their assigned tasks
            queryset = queryset.filter(assignee=user)
        elif user.is_manager:
            # Managers see tasks they created or are assigned to
            queryset = queryset.filter(
                Q(created_by=user) | Q(assignee=user)
            )
        # Admins see all tasks
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by assignee if provided
        assignee_filter = self.request.query_params.get('assignee')
        if assignee_filter:
            queryset = queryset.filter(assignee_id=assignee_filter)
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    def create(self, request, *args, **kwargs):
        # Only admins and managers can create tasks
        if not (request.user.is_admin or request.user.is_manager):
            return Response(
                {'error': 'Only admins and managers can create tasks'},
                status=status.HTTP_403_FORBIDDEN
            )
        # Managers cannot assign tasks to themselves
        if request.user.is_manager:
            assignee_id = request.data.get('assignee')
            if assignee_id is not None:
                try:
                    assignee_id = int(assignee_id)
                    if assignee_id == request.user.id:
                        return Response(
                            {'error': 'Managers cannot assign tasks to themselves. Please assign to a team member.'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                except (ValueError, TypeError):
                    pass  # Let serializer handle validation
        return super().create(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        task = self.get_object()
        user = request.user
        
        # Check permissions
        if user.is_member:
            # Members can only update status of their assigned tasks
            if task.assignee != user:
                return Response(
                    {'error': 'You can only update your assigned tasks'},
                    status=status.HTTP_403_FORBIDDEN
                )
            # Members can only update status
            allowed_fields = {'status'}
            if not set(request.data.keys()).issubset(allowed_fields):
                return Response(
                    {'error': 'Members can only update task status'},
                    status=status.HTTP_403_FORBIDDEN
                )
        elif user.is_manager:
            # Managers can update tasks they created
            if task.created_by != user and not user.is_admin:
                return Response(
                    {'error': 'You can only update tasks you created'},
                    status=status.HTTP_403_FORBIDDEN
                )
            # Managers cannot assign tasks to themselves
            assignee_id = request.data.get('assignee')
            if assignee_id is not None:
                try:
                    assignee_id = int(assignee_id)
                    if assignee_id == user.id:
                        return Response(
                            {'error': 'Managers cannot assign tasks to themselves. Please assign to a team member.'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                except (ValueError, TypeError):
                    pass  # Let serializer handle validation
        
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        # Only admins and managers can delete tasks
        if not (request.user.is_admin or request.user.is_manager):
            return Response(
                {'error': 'Only admins and managers can delete tasks'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        task = self.get_object()
        if request.user.is_manager and task.created_by != request.user:
            return Response(
                {'error': 'Managers can only delete tasks they created'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        user = request.user
        
        if user.is_admin:
            queryset = Task.objects.all()
        elif user.is_manager:
            queryset = Task.objects.filter(Q(created_by=user) | Q(assignee=user))
        else:
            queryset = Task.objects.filter(assignee=user)
        
        stats = {
            'total': queryset.count(),
            'todo': queryset.filter(status='todo').count(),
            'in_progress': queryset.filter(status='in_progress').count(),
            'done': queryset.filter(status='done').count(),
        }
        
        return Response(stats)
