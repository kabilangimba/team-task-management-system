import { useState, useEffect, useCallback } from 'react';
import { taskService, userService } from '../services/taskService';
import { useAuth } from '../context/AuthContext';
import TaskForm from '../components/TaskForm';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filters, setFilters] = useState({ status: '', assignee: '' });
  const { user, isAdmin, isManager, isMember } = useAuth();

  const fetchData = useCallback(async () => {
  try {
    const tasksData = await taskService.getTasks(filters);
    setTasks(tasksData);
    
    // Fetch ALL users for assignee dropdown
    try {
      const usersData = await userService.getUsers();
      setUsers(usersData);
    } catch (userError) {
      console.error('Error fetching users:', userError);
      // If can't fetch users, at least show current user
      setUsers([user]);
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    setLoading(false);
  }
}, [filters, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateTask = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.deleteTask(id);
        fetchData();
      } catch (error) {
        alert('Error deleting task: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTask(null);
    fetchData();
  };

  const canEditTask = (task) => {
    if (isAdmin) return true;
    if (isManager && task.created_by === user.id) return true;
    if (isMember && task.assignee === user.id) return true;
    return false;
  };

  const canDeleteTask = (task) => {
    if (isAdmin) return true;
    if (isManager && task.created_by === user.id) return true;
    return false;
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Tasks</h1>
        {(isAdmin || isManager) && (
          <button onClick={handleCreateTask} style={styles.createBtn}>
            Create Task
          </button>
        )}
      </div>

      <div style={styles.filters}>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          style={styles.select}
        >
          <option value="">All Status</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        <select
          value={filters.assignee}
          onChange={(e) => setFilters({ ...filters, assignee: e.target.value })}
          style={styles.select}
        >
          <option value="">All Assignees</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.first_name} {u.last_name}
            </option>
          ))}
        </select>
      </div>

      <div style={styles.taskGrid}>
        {tasks.length === 0 ? (
          <p>No tasks found.</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} style={styles.taskCard}>
              <div style={styles.taskHeader}>
                <h3>{task.title}</h3>
                <span style={getStatusStyle(task.status)}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>
              
              <p style={styles.description}>{task.description}</p>
              
              <div style={styles.taskMeta}>
                {task.assignee_details && (
                  <div>
                    <strong>Assignee:</strong> {task.assignee_details.first_name} {task.assignee_details.last_name}
                  </div>
                )}
                {task.deadline && (
                  <div>
                    <strong>Deadline:</strong> {new Date(task.deadline).toLocaleDateString()}
                  </div>
                )}
                <div>
                  <strong>Created by:</strong> {task.created_by_details?.first_name || 'Unknown'}
                </div>
              </div>

              <div style={styles.actions}>
                {canEditTask(task) && (
                  <button onClick={() => handleEditTask(task)} style={styles.editBtn}>
                    Edit
                  </button>
                )}
                {canDeleteTask(task) && (
                  <button onClick={() => handleDeleteTask(task.id)} style={styles.deleteBtn}>
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <TaskForm
          task={editingTask}
          users={users}
          onClose={handleFormClose}
          isMember={isMember}
          isManager={isManager}
          currentUser={user}
        />
      )}
    </div>
  );
};

const getStatusStyle = (status) => ({
  ...styles.statusBadge,
  backgroundColor: status === 'done' ? '#10b981' : 
                   status === 'in_progress' ? '#3b82f6' : '#f59e0b',
});

const styles = {
  container: { maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' },
  loading: { textAlign: 'center', padding: '3rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  createBtn: { backgroundColor: '#3b82f6', color: 'white', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  filters: { display: 'flex', gap: '1rem', marginBottom: '2rem' },
  select: { padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px', flex: 1 },
  taskGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' },
  taskCard: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  taskHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' },
  description: { color: '#6b7280', marginBottom: '1rem' },
  taskMeta: { fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' },
  statusBadge: { padding: '0.25rem 0.75rem', borderRadius: '12px', color: 'white', fontSize: '0.75rem', textTransform: 'uppercase' },
  actions: { display: 'flex', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' },
  editBtn: { backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1 },
  deleteBtn: { backgroundColor: '#ef4444', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1 },
};

export default Tasks;