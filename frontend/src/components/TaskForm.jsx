import { useState, useEffect } from 'react';
import { taskService } from '../services/taskService';

const TaskForm = ({ task, users, onClose, isMember, isManager, currentUser }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    deadline: '',
    assignee: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        deadline: task.deadline ? task.deadline.split('T')[0] : '',
        assignee: task.assignee || '',
      });
    }
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let dataToSend;
      
      if (isMember) {
        // Members can ONLY update status
        dataToSend = { status: formData.status };
      } else {
        // Admins and Managers can update everything
        dataToSend = { ...formData };
        if (!dataToSend.deadline) delete dataToSend.deadline;
        if (!dataToSend.assignee) delete dataToSend.assignee;
      }

      if (task) {
        await taskService.updateTask(task.id, dataToSend);
      } else {
        await taskService.createTask(dataToSend);
      }
      onClose();
    } catch (err) {
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.detail ||
                          (typeof err.response?.data === 'string' ? err.response.data : null) ||
                          err.message || 
                          'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2>{task ? 'Edit Task' : 'Create Task'}</h2>
        
        {isMember && (
          <div style={styles.info}>
            Members can only update task status
          </div>
        )}
        
        {error && <div style={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          {!isMember && (
            <>
              <div style={styles.formGroup}>
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
              
              <div style={styles.formGroup}>
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  style={{ ...styles.input, minHeight: '100px' }}
                />
              </div>
            </>
          )}
          
          <div style={styles.formGroup}>
            <label>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          
          {!isMember && (
            <>
              <div style={styles.formGroup}>
                <label>Deadline</label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
              
              <div style={styles.formGroup}>
                <label>Assignee</label>
                <select
                  name="assignee"
                  value={formData.assignee}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="">Unassigned</option>
                  {users
                    .filter(u => {
                      // Filter out admins
                      if (u.role === 'admin') return false;
                      // If current user is a manager, filter out themselves
                      if (isManager && currentUser && u.id === currentUser.id) return false;
                      return true;
                    })
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.first_name} {u.last_name} ({u.role})
                      </option>
                    ))}
                </select>
              </div>
            </>
          )}
          
          <div style={styles.actions}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? 'Saving...' : task ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { backgroundColor: 'white', padding: '2rem', borderRadius: '8px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' },
  formGroup: { display: 'flex', flexDirection: 'column' },
  input: { padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '1rem' },
  info: { backgroundColor: '#fef3c7', color: '#92400e', padding: '0.75rem', borderRadius: '4px', marginTop: '1rem' },
  error: { backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '4px' },
  actions: { display: 'flex', gap: '1rem', marginTop: '1rem' },
  cancelBtn: { backgroundColor: '#6b7280', color: 'white', padding: '0.75rem', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1 },
  submitBtn: { backgroundColor: '#3b82f6', color: 'white', padding: '0.75rem', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1 },
};

export default TaskForm;