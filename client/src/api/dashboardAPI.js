import axiosInstance from './axiosInstance';

export const dashboardAPI = {
  getKPIs: () => axiosInstance.get('/dashboard/kpis'),
  getRecentMoves: () => axiosInstance.get('/dashboard/recent-moves'),
  getStockChart: () => axiosInstance.get('/dashboard/stock-chart'),
  getLowStock: () => axiosInstance.get('/dashboard/low-stock')
};

export default dashboardAPI;
