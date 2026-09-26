import { create } from 'zustand';
import deliveryAPI from '../api/deliveryAPI';
import toast from 'react-hot-toast';

export const useDeliveryStore = create((set, get) => ({
  deliveries: [],
  selectedDelivery: null,
  pagination: { page: 1, limit: 20, total: 0, pages: 1 },
  filters: { status: 'all', customer: '', dateFrom: '', dateTo: '' },
  isLoading: false,

  fetchDeliveries: async () => {
    try {
      set({ isLoading: true });
      const { filters, pagination } = get();
      const params = {
        page: pagination.page, limit: pagination.limit,
        ...(filters.status && filters.status !== 'all' ? { status: filters.status } : {}),
        ...(filters.customer ? { customer: filters.customer } : {}),
        ...(filters.dateFrom ? { dateFrom: filters.dateFrom } : {}),
        ...(filters.dateTo ? { dateTo: filters.dateTo } : {})
      };
      const res = await deliveryAPI.getDeliveries(params);
      if (res?.success) set({ deliveries: res.data, pagination: res.pagination || get().pagination });
    } catch (err) { toast.error(err.message || 'Failed to fetch deliveries'); }
    finally { set({ isLoading: false }); }
  },

  fetchDelivery: async (id) => {
    try {
      set({ isLoading: true });
      const res = await deliveryAPI.getDeliveryById(id);
      if (res?.success) { set({ selectedDelivery: res.data }); return res.data; }
    } catch (err) { toast.error(err.message || 'Failed to load delivery'); throw err; }
    finally { set({ isLoading: false }); }
  },

  createDelivery: async (data) => {
    try {
      set({ isLoading: true });
      const res = await deliveryAPI.createDelivery(data);
      if (res?.success) { toast.success('Delivery order created'); await get().fetchDeliveries(); return res.data; }
    } catch (err) { toast.error(err.message || 'Failed to create delivery'); throw err; }
    finally { set({ isLoading: false }); }
  },

  updateDelivery: async (id, data) => {
    try {
      set({ isLoading: true });
      const res = await deliveryAPI.updateDelivery(id, data);
      if (res?.success) { toast.success('Delivery updated'); await get().fetchDeliveries(); return res.data; }
    } catch (err) { toast.error(err.message || 'Failed to update delivery'); throw err; }
    finally { set({ isLoading: false }); }
  },

  validateDelivery: async (id) => {
    try {
      set({ isLoading: true });
      const res = await deliveryAPI.validateDelivery(id);
      if (res?.success) { toast.success('Delivery validated — stock deducted!'); await get().fetchDeliveries(); return res.data; }
    } catch (err) { toast.error(err.message || 'Validation failed'); throw err; }
    finally { set({ isLoading: false }); }
  },

  cancelDelivery: async (id) => {
    try {
      set({ isLoading: true });
      const res = await deliveryAPI.cancelDelivery(id);
      if (res?.success) { toast.success('Delivery canceled'); await get().fetchDeliveries(); }
    } catch (err) { toast.error(err.message || 'Cancel failed'); throw err; }
    finally { set({ isLoading: false }); }
  },

  setFilters: (f) => { set((s) => ({ filters: { ...s.filters, ...f }, pagination: { ...s.pagination, page: 1 } })); get().fetchDeliveries(); },
  setPage: (p) => { set((s) => ({ pagination: { ...s.pagination, page: p } })); get().fetchDeliveries(); }
}));

export default useDeliveryStore;
