import api from './api';

export const dillerService = {
  // Barcha dillerlarni olish
  getAllDillers: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.search) queryParams.append('search', params.search);
    
    const queryString = queryParams.toString();
    const url = `/diller${queryString ? `?${queryString}` : ''}`;
    const response = await api.get(url);
    return response.data;
  },

  // Bitta dillerni olish
  getDillerById: async (id) => {
    const response = await api.get(`/diller/${id}`);
    return response.data;
  },

  // Yangi diller yaratish
  createDiller: async (data) => {
    const response = await api.post('/diller', data);
    return response.data;
  },

  // Dillerni yangilash
  updateDiller: async (id, data) => {
    const response = await api.put(`/diller/${id}`, data);
    return response.data;
  },

  // Dillerni o'chirish
  deleteDiller: async (id) => {
    const response = await api.delete(`/diller/${id}`);
    return response.data;
  },
};
