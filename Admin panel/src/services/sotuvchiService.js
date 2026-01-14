import api from './api';

export const sotuvchiService = {
  // Barcha sotuvchilarni olish
  getAllSotuvchilar: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.search) queryParams.append('search', params.search);
    
    const queryString = queryParams.toString();
    const url = `/sotuvchi${queryString ? `?${queryString}` : ''}`;
    const response = await api.get(url);
    return response.data;
  },

  // Bitta sotuvchini olish
  getSotuvchiById: async (id) => {
    const response = await api.get(`/sotuvchi/${id}`);
    return response.data;
  },

  // Yangi sotuvchi yaratish
  createSotuvchi: async (data) => {
    const response = await api.post('/sotuvchi', data);
    return response.data;
  },

  // Sotuvchini yangilash
  updateSotuvchi: async (id, data) => {
    const response = await api.put(`/sotuvchi/${id}`, data);
    return response.data;
  },

  // Sotuvchini o'chirish
  deleteSotuvchi: async (id) => {
    const response = await api.delete(`/sotuvchi/${id}`);
    return response.data;
  },
};
