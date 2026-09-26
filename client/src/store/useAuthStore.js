import { create } from 'zustand';
import authAPI from '../api/authAPI';
import socket from '../socket/socket';
import toast from 'react-hot-toast';

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  fetchUser: async () => {
    try {
      set({ isLoading: true });
      const res = await authAPI.getMe();
      if (res?.success && res.data) {
        set({ user: res.data, isAuthenticated: true });
        socket.connect();
      } else {
        set({ user: null, isAuthenticated: false });
      }
    } catch (err) {
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    try {
      set({ isLoading: true });
      const res = await authAPI.login({ email, password });
      if (res?.success && res.data) {
        set({ user: res.data, isAuthenticated: true });
        socket.connect();
        toast.success(res.message || 'Logged in successfully!');
        return res.data;
      }
    } catch (err) {
      const msg = err.message || 'Login failed. Please check credentials.';
      toast.error(msg);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  sendPhoneOTP: async (phone) => {
    try {
      const res = await authAPI.sendPhoneOTP(phone);
      toast.success(res.message || 'OTP sent successfully!');
      return res;
    } catch (err) {
      const msg = err.message || 'Failed to send verification code';
      toast.error(msg);
      throw err;
    }
  },

  loginWithPhoneOTP: async (phone, otp) => {
    try {
      set({ isLoading: true });
      const res = await authAPI.verifyPhoneOTP(phone, otp);
      if (res?.success && res.data) {
        set({ user: res.data, isAuthenticated: true });
        socket.connect();
        toast.success(res.message || 'Phone verified! Logged in successfully.');
        return res.data;
      }
    } catch (err) {
      const msg = err.message || 'Invalid or expired verification code';
      toast.error(msg);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  signup: async (userData) => {
    try {
      set({ isLoading: true });
      const res = await authAPI.signup(userData);
      if (res?.success && res.data) {
        set({ user: res.data, isAuthenticated: true });
        socket.connect();
        toast.success('Account created successfully!');
        return res.data;
      }
    } catch (err) {
      const msg = err.message || 'Registration failed.';
      toast.error(msg);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.warn('Logout network error:', err);
    } finally {
      socket.disconnect();
      set({ user: null, isAuthenticated: false });
      toast.success('Logged out successfully');
    }
  },

  updateProfile: async (formData) => {
    try {
      set({ isLoading: true });
      const res = await authAPI.updateProfile(formData);
      if (res?.success && res.data) {
        set({ user: res.data });
        toast.success('Profile updated successfully');
        return res.data;
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
      throw err;
    } finally {
      set({ isLoading: false });
    }
  }
}));

export default useAuthStore;
