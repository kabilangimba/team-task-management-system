import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.header}>
          <h1 style={styles.systemTitle}>Team Task Management System</h1>
          <p style={styles.subtitle}>Organize, track, and complete your tasks efficiently</p>
        </div>
        
        <div style={styles.card}>
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.description}>Sign in to your account to continue</p>
          
          {error && <div style={styles.error}>{error}</div>}
          
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={styles.input}
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={styles.input}
                placeholder="Enter your password"
                required
              />
            </div>
            
            <button type="submit" disabled={loading} style={loading ? styles.buttonDisabled : styles.button}>
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
          </form>
          
          <p style={styles.link}>
            Don't have an account? <Link to="/register" style={styles.linkText}>Register</Link>
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
    maxWidth: '450px',
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
};

export default Login;