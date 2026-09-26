import axiosInstance from './axiosInstance';

export const receiptAPI = {
  getReceipts: (params) => axiosInstance.get('/receipts', { params }),
  getReceiptById: (id) => axiosInstance.get(`/receipts/${id}`),
  createReceipt: (data) => axiosInstance.post('/receipts', data),
  updateReceipt: (id, data) => axiosInstance.put(`/receipts/${id}`, data),
  validateReceipt: (id, data) => axiosInstance.post(`/receipts/${id}/validate`, data),
  cancelReceipt: (id) => axiosInstance.post(`/receipts/${id}/cancel`)
};

export default receiptAPI;
