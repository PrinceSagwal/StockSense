import { create } from 'zustand';
import transferAPI from '../api/transferAPI';
import toast from 'react-hot-toast';

export const useTransferStore = create((set, get) => ({
  transfers: [],
  selectedTransfer: null,
  pagination: { page: 1, limit: 20, total: 0, pages: 1 },
  filters: { status: 'all', sourceWarehouse: '', destinationWarehouse: '' },
  isLoading: false,

  fetchTransfers: async () => {
    try {
      set({ isLoading: true });
      const { filters, pagination } = get();
      const params = {
        page: pagination.page, limit: pagination.limit,
        ...(filters.status && filters.status !== 'all' ? { status: filters.status } : {}),
        ...(filters.sourceWarehouse ? { sourceWarehouse: filters.sourceWarehouse } : {}),
        ...(filters.destinationWarehouse ? { destinationWarehouse: filters.destinationWarehouse } : {})
      };
      const res = await transferAPI.getTransfers(params);
      if (res?.success) set({ transfers: res.data, pagination: res.pagination || get().pagination });
    } catch (err) { toast.error(err.message || 'Failed to fetch transfers'); }
    finally { set({ isLoading: false }); }
  },

  fetchTransfer: async (id) => {
    try {
      set({ isLoading: true });
      const res = await transferAPI.getTransferById(id);
      if (res?.success) { set({ selectedTransfer: res.data }); return res.data; }
    } catch (err) { toast.error(err.message || 'Failed to load transfer'); throw err; }
    finally { set({ isLoading: false }); }
  },

  createTransfer: async (data) => {
    try {
      set({ isLoading: true });
      const res = await transferAPI.createTransfer(data);
      if (res?.success) { toast.success('Transfer created'); await get().fetchTransfers(); return res.data; }
    } catch (err) { toast.error(err.message || 'Failed to create transfer'); throw err; }
    finally { set({ isLoading: false }); }
  },

  validateTransfer: async (id) => {
    try {
      set({ isLoading: true });
      const res = await transferAPI.validateTransfer(id);
      if (res?.success) { toast.success('Transfer validated — stock moved!'); await get().fetchTransfers(); return res.data; }
    } catch (err) { toast.error(err.message || 'Validation failed'); throw err; }
    finally { set({ isLoading: false }); }
  },

  cancelTransfer: async (id) => {
    try {
      set({ isLoading: true });
      const res = await transferAPI.cancelTransfer(id);
      if (res?.success) { toast.success('Transfer canceled'); await get().fetchTransfers(); }
    } catch (err) { toast.error(err.message || 'Cancel failed'); throw err; }
    finally { set({ isLoading: false }); }
  },

  setFilters: (f) => { set((s) => ({ filters: { ...s.filters, ...f }, pagination: { ...s.pagination, page: 1 } })); get().fetchTransfers(); },
  setPage: (p) => { set((s) => ({ pagination: { ...s.pagination, page: p } })); get().fetchTransfers(); }
}));

export default useTransferStore;
