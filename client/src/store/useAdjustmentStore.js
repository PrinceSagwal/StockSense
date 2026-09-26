import { create } from 'zustand';
import adjustmentAPI from '../api/adjustmentAPI';
import toast from 'react-hot-toast';

export const useAdjustmentStore = create((set, get) => ({
  adjustments: [],
  pagination: { page: 1, limit: 20, total: 0, pages: 1 },
  isLoading: false,

  fetchAdjustments: async (params = {}) => {
    try {
      set({ isLoading: true });
      const res = await adjustmentAPI.getAdjustments(params);
      if (res?.success) {
        set({
          adjustments: res.data,
          pagination: res.pagination || get().pagination
        });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch adjustments');
    } finally {
      set({ isLoading: false });
    }
  },

  createAdjustment: async (data) => {
    try {
      set({ isLoading: true });
      const res = await adjustmentAPI.createAdjustment(data);
      if (res?.success) {
        toast.success('Stock adjustment applied successfully!');
        await get().fetchAdjustments();
        return res.data;
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create adjustment');
      throw err;
    } finally {
      set({ isLoading: false });
    }
  }
}));

export default useAdjustmentStore;
