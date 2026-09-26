import { create } from 'zustand';
import receiptAPI from '../api/receiptAPI';
import toast from 'react-hot-toast';

export const useReceiptStore = create((set, get) => ({
  receipts: [],
  selectedReceipt: null,
  pagination: { page: 1, limit: 20, total: 0, pages: 1 },
  filters: { status: 'all', supplier: '', dateFrom: '', dateTo: '' },
  isLoading: false,

  fetchReceipts: async () => {
    try {
      set({ isLoading: true });
      const { filters, pagination } = get();
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.status && filters.status !== 'all' ? { status: filters.status } : {}),
        ...(filters.supplier ? { supplier: filters.supplier } : {}),
        ...(filters.dateFrom ? { dateFrom: filters.dateFrom } : {}),
        ...(filters.dateTo ? { dateTo: filters.dateTo } : {})
      };
      const res = await receiptAPI.getReceipts(params);
      if (res?.success) {
        set({ receipts: res.data, pagination: res.pagination || get().pagination });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch receipts');
    } finally {
      set({ isLoading: false });
    }
  },

  fetchReceipt: async (id) => {
    try {
      set({ isLoading: true });
      const res = await receiptAPI.getReceiptById(id);
      if (res?.success) { set({ selectedReceipt: res.data }); return res.data; }
    } catch (err) {
      toast.error(err.message || 'Failed to load receipt');
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  createReceipt: async (data) => {
    try {
      set({ isLoading: true });
      const res = await receiptAPI.createReceipt(data);
      if (res?.success) { toast.success('Receipt created'); await get().fetchReceipts(); return res.data; }
    } catch (err) {
      toast.error(err.message || 'Failed to create receipt');
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  updateReceipt: async (id, data) => {
    try {
      set({ isLoading: true });
      const res = await receiptAPI.updateReceipt(id, data);
      if (res?.success) { toast.success('Receipt updated'); await get().fetchReceipts(); return res.data; }
    } catch (err) {
      toast.error(err.message || 'Failed to update receipt');
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  validateReceipt: async (id, lines) => {
    try {
      set({ isLoading: true });
      const res = await receiptAPI.validateReceipt(id, lines ? { lines } : {});
      if (res?.success) { toast.success('Receipt validated — stock updated!'); await get().fetchReceipts(); return res.data; }
    } catch (err) {
      toast.error(err.message || 'Validation failed');
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  cancelReceipt: async (id) => {
    try {
      set({ isLoading: true });
      const res = await receiptAPI.cancelReceipt(id);
      if (res?.success) { toast.success('Receipt canceled'); await get().fetchReceipts(); }
    } catch (err) {
      toast.error(err.message || 'Failed to cancel receipt');
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  setFilters: (f) => { set((s) => ({ filters: { ...s.filters, ...f }, pagination: { ...s.pagination, page: 1 } })); get().fetchReceipts(); },
  setPage: (p) => { set((s) => ({ pagination: { ...s.pagination, page: p } })); get().fetchReceipts(); }
}));

export default useReceiptStore;
