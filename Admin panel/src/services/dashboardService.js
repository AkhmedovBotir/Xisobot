import api from './api';

export const dashboardService = {
  // Dashboard ma'lumotlarini olish
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },
};
