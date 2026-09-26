import { create } from 'zustand';
import dashboardAPI from '../api/dashboardAPI';
import toast from 'react-hot-toast';

export const useDashboardStore = create((set, get) => ({
  kpis: {
    totalProducts: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    pendingReceipts: 0,
    pendingDeliveries: 0,
    scheduledTransfers: 0
  },
  recentMoves: [],
  stockChart: [],
  lowStockProducts: [],
  isLoading: false,

  fetchKPIs: async () => {
    try {
      const res = await dashboardAPI.getKPIs();
      if (res?.success) {
        set({ kpis: res.data });
      }
    } catch (err) {
      console.error('Failed to fetch KPIs:', err);
    }
  },

  fetchRecentMoves: async () => {
    try {
      const res = await dashboardAPI.getRecentMoves();
      if (res?.success) {
        set({ recentMoves: res.data });
      }
    } catch (err) {
      console.error('Failed to fetch recent moves:', err);
    }
  },

  fetchStockChart: async () => {
    try {
      const res = await dashboardAPI.getStockChart();
      if (res?.success) {
        set({ stockChart: res.data });
      }
    } catch (err) {
      console.error('Failed to fetch stock chart:', err);
    }
  },

  fetchLowStock: async () => {
    try {
      const res = await dashboardAPI.getLowStock();
      if (res?.success) {
        set({ lowStockProducts: res.data });
      }
    } catch (err) {
      console.error('Failed to fetch low stock products:', err);
    }
  },

  fetchAllDashboardData: async () => {
    set({ isLoading: true });
    try {
      await Promise.allSettled([
        get().fetchKPIs(),
        get().fetchRecentMoves(),
        get().fetchStockChart(),
        get().fetchLowStock()
      ]);
    } finally {
      set({ isLoading: false });
    }
  }
}));

export default useDashboardStore;
