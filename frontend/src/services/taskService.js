import api from './api';

export const taskService = {
  getTasks: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.assignee) params.append('assignee', filters.assignee);
    
    const response = await api.get(`/tasks/?${params}`);
    return response.data;
  },

  getTask: async (id) => {
    const response = await api.get(`/tasks/${id}/`);
    return response.data;
  },

  createTask: async (taskData) => {
    const response = await api.post('/tasks/', taskData);
    return response.data;
  },

  updateTask: async (id, taskData) => {
    const response = await api.patch(`/tasks/${id}/`, taskData);
    return response.data;
  },

  deleteTask: async (id) => {
    const response = await api.delete(`/tasks/${id}/`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/tasks/stats/');
    return response.data;
  },
};

export const userService = {
  getUsers: async () => {
    const response = await api.get('/users/');
    return response.data;
  },

  getUser: async (id) => {
    const response = await api.get(`/users/${id}/`);
    return response.data;
  },

  createUser: async (userData) => {
    const response = await api.post('/users/', userData);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}/`, userData);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}/`);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/users/me/');
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await api.put('/users/change_password/', passwordData);
    return response.data;
  },
};