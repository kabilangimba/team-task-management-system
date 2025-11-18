import { useState, useEffect } from 'react';
import { userService } from '../services/taskService';

const UserForm = ({ user, onClose }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'member',
    password: '',
    password_confirm: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        password: '',
        password_confirm: '',
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!user && formData.password !== formData.password_confirm) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      if (user) {
        const { password: _password, password_confirm: _password_confirm, ...updateData } = formData;
        await userService.updateUser(user.id, updateData);
      } else {
        await userService.createUser(formData);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.email?.[0] || 
               err.response?.data?.username?.[0] || 
               'An error occurred');
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
        <h2>{user ? 'Edit User' : 'Create User'}</h2>
        
        {error && <div style={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>
          
          <div style={styles.formGroup}>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>
          
          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label>First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>
            
            <div style={styles.formGroup}>
              <label>Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>
          </div>
          
          <div style={styles.formGroup}>
            <label>Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="member">Member</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          {!user && (
            <>
              <div style={styles.formGroup}>
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
              
              <div style={styles.formGroup}>
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="password_confirm"
                  value={formData.password_confirm}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
            </>
          )}
          
          <div style={styles.actions}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? 'Saving...' : user ? 'Update' : 'Create'}
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
  error: { backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '4px' },
  actions: { display: 'flex', gap: '1rem', marginTop: '1rem' },
  cancelBtn: { backgroundColor: '#6b7280', color: 'white', padding: '0.75rem', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1 },
  submitBtn: { backgroundColor: '#3b82f6', color: 'white', padding: '0.75rem', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1 },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
};

export default UserForm;