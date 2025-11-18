from rest_framework import serializers
from .models import Task
from users.serializers import UserSerializer

class TaskSerializer(serializers.ModelSerializer):
    assignee_details = UserSerializer(source='assignee', read_only=True)
    created_by_details = UserSerializer(source='created_by', read_only=True)
    
    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'status', 'deadline', 
                  'assignee', 'assignee_details', 'created_by', 
                  'created_by_details', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

class TaskCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['title', 'description', 'status', 'deadline', 'assignee']
    
    def validate_assignee(self, value):
        if value and value.role not in ['manager', 'member']:
            raise serializers.ValidationError("Tasks can only be assigned to managers or members.")
        return value
    
    def validate(self, attrs):
        # Get the request user from context
        request = self.context.get('request')
        if request and request.user:
            user = request.user
            assignee = attrs.get('assignee')
            
            # Managers cannot assign tasks to themselves
            # assignee can be a User object or None
            if user.is_manager and assignee:
                assignee_id = assignee.id if hasattr(assignee, 'id') else assignee
                if assignee_id == user.id:
                    raise serializers.ValidationError({
                        'assignee': 'Managers cannot assign tasks to themselves. Please assign to a team member.'
                    })
        
        return attrs

class TaskUpdateSerializer(serializers.ModelSerializer):
    title = serializers.CharField(required=False)
    description = serializers.CharField(required=False, allow_blank=True)
    deadline = serializers.DateTimeField(required=False, allow_null=True)
    
    class Meta:
        model = Task
        fields = ['title', 'description', 'status', 'deadline', 'assignee']
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Make all fields optional for partial updates
        for field in self.fields.values():
            field.required = False
        # Set queryset for assignee field
        if 'assignee' in self.fields:
            from users.models import User
            self.fields['assignee'].queryset = User.objects.filter(role__in=['manager', 'member'])
            self.fields['assignee'].allow_null = True
    
    def validate_assignee(self, value):
        if value and value.role not in ['manager', 'member']:
            raise serializers.ValidationError("Tasks can only be assigned to managers or members.")
        return value
    
    def validate(self, attrs):
        # Get the request user from context
        request = self.context.get('request')
        if request and request.user:
            user = request.user
            assignee = attrs.get('assignee')
            
            # Only validate if assignee is being updated
            if assignee is not None:
                # Managers cannot assign tasks to themselves
                # assignee can be a User object or None
                if user.is_manager and assignee:
                    assignee_id = assignee.id if hasattr(assignee, 'id') else assignee
                    if assignee_id == user.id:
                        raise serializers.ValidationError({
                            'assignee': 'Managers cannot assign tasks to themselves. Please assign to a team member.'
                        })
        
        return attrs
