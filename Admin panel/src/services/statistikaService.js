import api from './api';

export const statistikaService = {
  // Statistika ma'lumotlarini olish
  getStatistika: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.keyin) queryParams.append('keyin', params.keyin);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.telefonRaqami) queryParams.append('telefonRaqami', params.telefonRaqami);
    if (params.dillerId) queryParams.append('dillerId', params.dillerId);
    if (params.sotuvchiId) queryParams.append('sotuvchiId', params.sotuvchiId);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    const queryString = queryParams.toString();
    const url = `/admin/statistika${queryString ? `?${queryString}` : ''}`;
    const response = await api.get(url);
    return response.data;
  },

  // Raqamli statistika ma'lumotlarini olish
  getStatistikaRaqamlar: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.keyin) queryParams.append('keyin', params.keyin);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.telefonRaqami) queryParams.append('telefonRaqami', params.telefonRaqami);
    if (params.dillerId) queryParams.append('dillerId', params.dillerId);
    if (params.sotuvchiId) queryParams.append('sotuvchiId', params.sotuvchiId);
    
    const queryString = queryParams.toString();
    const url = `/admin/statistika/raqamlar${queryString ? `?${queryString}` : ''}`;
    const response = await api.get(url);
    return response.data;
  },

  // Excel export qilish
  exportStatistika: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.keyin) queryParams.append('keyin', params.keyin);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.telefonRaqami) queryParams.append('telefonRaqami', params.telefonRaqami);
    if (params.dillerId) queryParams.append('dillerId', params.dillerId);
    if (params.sotuvchiId) queryParams.append('sotuvchiId', params.sotuvchiId);
    
    const queryString = queryParams.toString();
    const url = `/admin/statistika/export${queryString ? `?${queryString}` : ''}`;
    const response = await api.get(url);
    return response.data;
  },

  // Export statusini tekshirish
  getExportStatus: async (exportId) => {
    const response = await api.get(`/admin/statistika/export/status/${exportId}`);
    return response.data;
  },

  // Excel faylni yuklab olish
  downloadExport: async (filename, exportId) => {
    const queryParams = new URLSearchParams();
    if (exportId) queryParams.append('exportId', exportId);
    
    const queryString = queryParams.toString();
    const url = `/admin/statistika/export/download/${filename}${queryString ? `?${queryString}` : ''}`;
    const response = await api.get(url, {
      responseType: 'blob', // Binary data uchun
    });
    return response;
  },
};
