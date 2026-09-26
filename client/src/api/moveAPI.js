import axiosInstance from './axiosInstance';

export const moveAPI = {
  getMoves: (params) => axiosInstance.get('/moves', { params })
};

export default moveAPI;
