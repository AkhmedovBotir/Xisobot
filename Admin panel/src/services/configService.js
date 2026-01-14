import api from './api';

export const configService = {
  // Foizni olish
  getFoiz: async () => {
    const response = await api.get('/admin/config/foiz');
    return response.data;
  },

  // Foizni yangilash
  updateFoiz: async (foiz) => {
    const response = await api.put('/admin/config/foiz', { foiz });
    return response.data;
  },
};
