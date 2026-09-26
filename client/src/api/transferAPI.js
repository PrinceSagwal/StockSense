import axiosInstance from './axiosInstance';

export const transferAPI = {
  getTransfers: (params) => axiosInstance.get('/transfers', { params }),
  getTransferById: (id) => axiosInstance.get(`/transfers/${id}`),
  createTransfer: (data) => axiosInstance.post('/transfers', data),
  validateTransfer: (id) => axiosInstance.post(`/transfers/${id}/validate`),
  cancelTransfer: (id) => axiosInstance.post(`/transfers/${id}/cancel`)
};

export default transferAPI;
