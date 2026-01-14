import api from './api';

export const authService = {
  // Login admin
  login: async (email, password) => {
    const response = await api.post('/admin/login', { email, password });
    return response.data;
  },

  // Get current admin
  getCurrentAdmin: async () => {
    const response = await api.get('/admin/me');
    return response.data;
  },

  // Get all admins (SuperAdmin only)
  getAllAdmins: async () => {
    const response = await api.get('/admin');
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};
