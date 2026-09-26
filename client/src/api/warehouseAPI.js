import axiosInstance from './axiosInstance';

export const warehouseAPI = {
  getWarehouses: () => axiosInstance.get('/warehouses'),
  createWarehouse: (data) => axiosInstance.post('/warehouses', data),
  updateWarehouse: (id, data) => axiosInstance.put(`/warehouses/${id}`, data),
  getWarehouseLocations: (warehouseId) => axiosInstance.get(`/warehouses/${warehouseId}/locations`),
  addLocation: (warehouseId, data) => axiosInstance.post(`/warehouses/${warehouseId}/locations`, data),
  updateLocation: (warehouseId, locationId, data) =>
    axiosInstance.put(`/warehouses/${warehouseId}/locations/${locationId}`, data)
};

export default warehouseAPI;
