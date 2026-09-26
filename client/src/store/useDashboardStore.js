import { create } from 'zustand';
import dashboardAPI from '../api/dashboardAPI';

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

  // Manager specific state
  inventoryValuation: [],
  operationsBreakdown: { receipts: {}, deliveries: {}, transfers: {} },
  warehouseDistribution: [],
  stockHealth: { healthy: 0, low: 0, outOfStock: 0, total: 0 },

  // Staff specific state
  taskQueue: {
    receipts: { pending: 0, ready: 0 },
    deliveries: { pending: 0, ready: 0 },
    transfers: { pending: 0, ready: 0 }
  },
  dailyActivity: [],
  recentTasks: { receipts: [], deliveries: [], transfers: [] },
  operationBreakdown: [],

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

  // Manager fetches
  fetchManagerData: async () => {
    try {
      const [valRes, opsRes, whRes, healthRes] = await Promise.allSettled([
        dashboardAPI.getInventoryValuation(),
        dashboardAPI.getOperationsBreakdown(),
        dashboardAPI.getWarehouseDistribution(),
        dashboardAPI.getStockHealth()
      ]);

      set({
        inventoryValuation: valRes.status === 'fulfilled' && valRes.value?.success ? valRes.value.data : [],
        operationsBreakdown: opsRes.status === 'fulfilled' && opsRes.value?.success ? opsRes.value.data : { receipts: {}, deliveries: {}, transfers: {} },
        warehouseDistribution: whRes.status === 'fulfilled' && whRes.value?.success ? whRes.value.data : [],
        stockHealth: healthRes.status === 'fulfilled' && healthRes.value?.success ? healthRes.value.data : { healthy: 0, low: 0, outOfStock: 0, total: 0 }
      });
    } catch (err) {
      console.error('Failed to fetch manager dashboard data:', err);
    }
  },

  // Staff fetches
  fetchStaffData: async () => {
    try {
      const [queueRes, actRes, taskRes, opRes] = await Promise.allSettled([
        dashboardAPI.getStaffTaskQueue(),
        dashboardAPI.getStaffDailyActivity(),
        dashboardAPI.getStaffRecentTasks(),
        dashboardAPI.getStaffOperationBreakdown()
      ]);

      set({
        taskQueue: queueRes.status === 'fulfilled' && queueRes.value?.success ? queueRes.value.data : {
          receipts: { pending: 0, ready: 0 },
          deliveries: { pending: 0, ready: 0 },
          transfers: { pending: 0, ready: 0 }
        },
        dailyActivity: actRes.status === 'fulfilled' && actRes.value?.success ? actRes.value.data : [],
        recentTasks: taskRes.status === 'fulfilled' && taskRes.value?.success ? taskRes.value.data : { receipts: [], deliveries: [], transfers: [] },
        operationBreakdown: opRes.status === 'fulfilled' && opRes.value?.success ? opRes.value.data : []
      });
    } catch (err) {
      console.error('Failed to fetch staff dashboard data:', err);
    }
  },

  fetchAllDashboardData: async (role) => {
    set({ isLoading: true });
    try {
      const promises = [
        get().fetchKPIs(),
        get().fetchRecentMoves(),
        get().fetchStockChart(),
        get().fetchLowStock()
      ];

      if (role === 'inventory_manager') {
        promises.push(get().fetchManagerData());
      } else {
        promises.push(get().fetchStaffData());
      }

      await Promise.allSettled(promises);
    } finally {
      set({ isLoading: false });
    }
  }
}));

export default useDashboardStore;
