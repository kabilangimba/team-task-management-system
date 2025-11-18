import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/taskService';

const Profile = () => {
  const { user } = useAuth();
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    new_password_confirm: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.new_password !== passwordData.new_password_confirm) {
      setError("New passwords don't match");
      return;
    }

    setLoading(true);
    try {
      await userService.changePassword(passwordData);
      setSuccess('Password changed successfully!');
      setPasswordData({
        old_password: '',
        new_password: '',
        new_password_confirm: '',
      });
    } catch (err) {
      setError(err.response?.data?.old_password?.[0] || 
               err.response?.data?.new_password?.[0] ||
               'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1>Profile</h1>
      
      <div style={styles.card}>
        <h2>User Information</h2>
        <div style={styles.infoGrid}>
          <div>
            <strong>Name:</strong> {user?.first_name} {user?.last_name}
          </div>
          <div>
            <strong>Email:</strong> {user?.email}
          </div>
          <div>
            <strong>Username:</strong> {user?.username}
          </div>
          <div>
            <strong>Role:</strong> <span style={getRoleBadgeStyle(user?.role)}>{user?.role}</span>
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <h2>Change Password</h2>
        
        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}
        
        <form onSubmit={handlePasswordChange} style={styles.form}>
          <div style={styles.formGroup}>
            <label>Current Password</label>
            <input
              type="password"
              value={passwordData.old_password}
              onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
              style={styles.input}
              required
            />
          </div>
          
          <div style={styles.formGroup}>
            <label>New Password</label>
            <input
              type="password"
              value={passwordData.new_password}
              onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
              style={styles.input}
              required
            />
          </div>
          
          <div style={styles.formGroup}>
            <label>Confirm New Password</label>
            <input
              type="password"
              value={passwordData.new_password_confirm}
              onChange={(e) => setPasswordData({ ...passwordData, new_password_confirm: e.target.value })}
              style={styles.input}
              required
            />
          </div>
          
          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? 'Changing Password...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

const getRoleBadgeStyle = (role) => ({
  padding: '0.25rem 0.75rem',
  borderRadius: '12px',
  color: 'white',
  fontSize: '0.875rem',
  textTransform: 'uppercase',
  backgroundColor: role === 'admin' ? '#ef4444' : 
                   role === 'manager' ? '#3b82f6' : '#10b981',
});

const styles = {
  container: { maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' },
  card: { backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '2rem' },
  infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' },
  formGroup: { display: 'flex', flexDirection: 'column' },
  input: { padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '1rem' },
  submitBtn: { backgroundColor: '#3b82f6', color: 'white', padding: '0.75rem', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '0.5rem' },
  error: { backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' },
  success: { backgroundColor: '#d1fae5', color: '#065f46', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' },
};

export default Profile;