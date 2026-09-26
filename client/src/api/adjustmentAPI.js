import axiosInstance from './axiosInstance';

export const adjustmentAPI = {
  getAdjustments: (params) => axiosInstance.get('/adjustments', { params }),
  createAdjustment: (data) => axiosInstance.post('/adjustments', data)
};

export default adjustmentAPI;
