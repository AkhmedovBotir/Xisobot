import api from './api';

export const paymentService = {
  // Barcha to'lov tranzaksiyalarini olish
  getAllPayments: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.operatsiyaRaqami) queryParams.append('operatsiyaRaqami', params.operatsiyaRaqami);
    if (params.tranzaksiyaId) queryParams.append('tranzaksiyaId', params.tranzaksiyaId);
    if (params.terminalId) queryParams.append('terminalId', params.terminalId);
    if (params.merchantId) queryParams.append('merchantId', params.merchantId);
    if (params.mijozTelefonRaqami) queryParams.append('mijozTelefonRaqami', params.mijozTelefonRaqami);
    if (params.mijozIsmi) queryParams.append('mijozIsmi', params.mijozIsmi);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    const queryString = queryParams.toString();
    const url = `/payments${queryString ? `?${queryString}` : ''}`;
    const response = await api.get(url);
    return response.data;
  },

  // Bitta to'lov tranzaksiyasini olish
  getPaymentById: async (id) => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },

  // To'lov statistikasi
  getPaymentStats: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    
    const queryString = queryParams.toString();
    const url = `/payments/stats/summary${queryString ? `?${queryString}` : ''}`;
    const response = await api.get(url);
    return response.data;
  },
};
