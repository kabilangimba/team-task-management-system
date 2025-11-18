import { useState, useEffect } from 'react';
import { taskService } from '../services/taskService';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsData, tasksData] = await Promise.all([
        taskService.getStats(),
        taskService.getTasks(),
      ]);
      setStats(statsData);
      setRecentTasks(tasksData.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Welcome, {user?.first_name}!</h1>
      
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <h3>Total Tasks</h3>
          <p style={styles.statNumber}>{stats?.total || 0}</p>
        </div>
        <div style={{ ...styles.statCard, borderLeft: '4px solid #f59e0b' }}>
          <h3>To Do</h3>
          <p style={styles.statNumber}>{stats?.todo || 0}</p>
        </div>
        <div style={{ ...styles.statCard, borderLeft: '4px solid #3b82f6' }}>
          <h3>In Progress</h3>
          <p style={styles.statNumber}>{stats?.in_progress || 0}</p>
        </div>
        <div style={{ ...styles.statCard, borderLeft: '4px solid #10b981' }}>
          <h3>Done</h3>
          <p style={styles.statNumber}>{stats?.done || 0}</p>
        </div>
      </div>
      
      <div style={styles.recentSection}>
        <h2>Recent Tasks</h2>
        {recentTasks.length === 0 ? (
          <p>No tasks yet.</p>
        ) : (
          <div style={styles.taskList}>
            {recentTasks.map((task) => (
              <div key={task.id} style={styles.taskCard}>
                <h4>{task.title}</h4>
                <p style={styles.taskDesc}>{task.description}</p>
                <div style={styles.taskMeta}>
                  <span style={getStatusStyle(task.status)}>{task.status}</span>
                  {task.assignee_details && (
                    <span>Assigned to: {task.assignee_details.first_name}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
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
  title: { fontSize: '2rem', marginBottom: '2rem' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' },
  statCard: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderLeft: '4px solid #6366f1' },
  statNumber: { fontSize: '2.5rem', fontWeight: 'bold', color: '#1f2937', margin: '0.5rem 0 0 0' },
  recentSection: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  taskList: { display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' },
  taskCard: { padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '4px' },
  taskDesc: { color: '#6b7280', margin: '0.5rem 0' },
  taskMeta: { display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' },
  statusBadge: { padding: '0.25rem 0.75rem', borderRadius: '12px', color: 'white', fontSize: '0.875rem' },
};

export default Dashboard;