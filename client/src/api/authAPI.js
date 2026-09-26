import axiosInstance from './axiosInstance';

export const authAPI = {
  signup: (userData) => axiosInstance.post('/auth/signup', userData),
  login: (credentials) => axiosInstance.post('/auth/login', credentials),
  logout: () => axiosInstance.post('/auth/logout'),
  getMe: () => axiosInstance.get('/auth/me'),
  forgotPassword: (email) => axiosInstance.post('/auth/forgot-password', { email }),
  verifyOTP: (email, otp) => axiosInstance.post('/auth/verify-otp', { email, otp }),
  resetPassword: (email, otp, newPassword) =>
    axiosInstance.post('/auth/reset-password', { email, otp, newPassword }),
  updateProfile: (formData) =>
    axiosInstance.put('/auth/me', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  sendPhoneOTP: (phone) => axiosInstance.post('/auth/phone/send-otp', { phone }),
  verifyPhoneOTP: (phone, otp) => axiosInstance.post('/auth/phone/verify-otp', { phone, otp })
};

export default authAPI;
