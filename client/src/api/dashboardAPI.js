import axiosInstance from './axiosInstance';

export const dashboardAPI = {
  // Shared
  getKPIs: () => axiosInstance.get('/dashboard/kpis'),
  getRecentMoves: () => axiosInstance.get('/dashboard/recent-moves'),
  getStockChart: () => axiosInstance.get('/dashboard/stock-chart'),
  getLowStock: () => axiosInstance.get('/dashboard/low-stock'),

  // Manager-specific
  getInventoryValuation: () => axiosInstance.get('/dashboard/manager/inventory-valuation'),
  getOperationsBreakdown: () => axiosInstance.get('/dashboard/manager/operations-breakdown'),
  getWarehouseDistribution: () => axiosInstance.get('/dashboard/manager/warehouse-distribution'),
  getStockHealth: () => axiosInstance.get('/dashboard/manager/stock-health'),

  // Staff-specific
  getStaffTaskQueue: () => axiosInstance.get('/dashboard/staff/task-queue'),
  getStaffDailyActivity: () => axiosInstance.get('/dashboard/staff/daily-activity'),
  getStaffRecentTasks: () => axiosInstance.get('/dashboard/staff/recent-tasks'),
  getStaffOperationBreakdown: () => axiosInstance.get('/dashboard/staff/operation-breakdown')
};

export default dashboardAPI;
