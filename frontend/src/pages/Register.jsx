import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password_confirm) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.email?.[0] || 
               err.response?.data?.username?.[0] || 
               'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.header}>
          <h1 style={styles.systemTitle}>Team Task Management System</h1>
          <p style={styles.subtitle}>Get started and organize your work</p>
        </div>
        
        <div style={styles.card}>
          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.description}>Sign up to start managing your tasks</p>
          
          {error && <div style={styles.error}>{error}</div>}
          
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                style={styles.input}
                placeholder="Choose a username"
                required
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={styles.input}
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div style={styles.row}>
              <div style={styles.formGroup}>
                <label style={styles.label}>First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="First name"
                  required
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Last name"
                  required
                />
              </div>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                style={styles.input}
                placeholder="Create a password"
                required
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Confirm Password</label>
              <input
                type="password"
                name="password_confirm"
                value={formData.password_confirm}
                onChange={handleChange}
                style={styles.input}
                placeholder="Confirm your password"
                required
              />
            </div>
            
            <button type="submit" disabled={loading} style={loading ? styles.buttonDisabled : styles.button}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          
          <p style={styles.link}>
            Already have an account? <Link to="/login" style={styles.linkText}>Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { 
    minHeight: '100vh', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '2rem 1rem',
  },
  wrapper: {
    width: '100%',
    maxWidth: '500px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  header: {
    textAlign: 'center',
    color: 'white',
  },
  systemTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    letterSpacing: '-0.02em',
    textShadow: '0 2px 10px rgba(0,0,0,0.2)',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  subtitle: {
    fontSize: '1.1rem',
    opacity: 0.95,
    fontWeight: '300',
  },
  card: { 
    backgroundColor: 'white', 
    padding: '2.5rem', 
    borderRadius: '16px', 
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)', 
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  title: { 
    fontSize: '1.75rem', 
    marginBottom: '0.5rem', 
    textAlign: 'center',
    fontWeight: '600',
    color: '#1f2937',
  },
  description: {
    fontSize: '0.95rem',
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: '2rem',
  },
  form: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '1.25rem' 
  },
  formGroup: { 
    display: 'flex', 
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: { 
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
  },
  input: { 
    padding: '0.875rem', 
    border: '2px solid #e5e7eb', 
    borderRadius: '8px', 
    fontSize: '1rem',
    transition: 'all 0.2s',
    backgroundColor: '#f9fafb',
  },
  button: { 
    backgroundColor: '#667eea', 
    color: 'white', 
    padding: '0.875rem', 
    border: 'none', 
    borderRadius: '8px', 
    fontSize: '1rem', 
    fontWeight: '600',
    cursor: 'pointer', 
    marginTop: '0.5rem',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
    color: 'white',
    padding: '0.875rem',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'not-allowed',
    marginTop: '0.5rem',
    opacity: 0.6,
  },
  error: { 
    backgroundColor: '#fee2e2', 
    color: '#991b1b', 
    padding: '0.875rem', 
    borderRadius: '8px', 
    marginBottom: '1rem',
    fontSize: '0.875rem',
    border: '1px solid #fecaca',
  },
  link: { 
    textAlign: 'center', 
    marginTop: '1.5rem',
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  linkText: {
    color: '#667eea',
    fontWeight: '600',
    textDecoration: 'none',
  },
  row: { 
    display: 'grid', 
    gridTemplateColumns: '1fr 1fr', 
    gap: '1rem' 
  },
};

export default Register;