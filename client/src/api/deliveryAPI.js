import axiosInstance from './axiosInstance';

export const deliveryAPI = {
  getDeliveries: (params) => axiosInstance.get('/deliveries', { params }),
  getDeliveryById: (id) => axiosInstance.get(`/deliveries/${id}`),
  createDelivery: (data) => axiosInstance.post('/deliveries', data),
  updateDelivery: (id, data) => axiosInstance.put(`/deliveries/${id}`, data),
  validateDelivery: (id) => axiosInstance.post(`/deliveries/${id}/validate`),
  cancelDelivery: (id) => axiosInstance.post(`/deliveries/${id}/cancel`)
};

export default deliveryAPI;
