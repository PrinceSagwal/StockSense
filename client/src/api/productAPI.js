import axiosInstance from './axiosInstance';

export const productAPI = {
  getProducts: (params) => axiosInstance.get('/products', { params }),
  getProductById: (id) => axiosInstance.get(`/products/${id}`),
  createProduct: (formData) =>
    axiosInstance.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  updateProduct: (id, formData) =>
    axiosInstance.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  deleteProduct: (id) => axiosInstance.delete(`/products/${id}`),
  getCategories: () => axiosInstance.get('/products/categories'),
  createCategory: (data) => axiosInstance.post('/products/categories', data)
};

export default productAPI;
