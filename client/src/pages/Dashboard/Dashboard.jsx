import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useDashboardStore from '../../store/useDashboardStore';
import useSocket from '../../hooks/useSocket';
import {
  Boxes,
  AlertTriangle,
  PackageX,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  Clock,
  ArrowRight
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const kpiConfig = [
  { key: 'totalProducts',     label: 'Total Products',     icon: Boxes,        accent: '#F59E0B', link: '/products',          sub: 'Active catalog items' },
  { key: 'lowStockCount',     label: 'Low Stock',          icon: AlertTriangle, accent: '#F59E0B', link: '/products?status=low', sub: 'Below reorder level' },
  { key: 'outOfStockCount',   label: 'Out of Stock',       icon: PackageX,     accent: '#EF4444', link: '/products?status=out', sub: 'Zero available units' },
  { key: 'pendingReceipts',   label: 'Pending Receipts',   icon: ArrowDownLeft, accent: '#10B981', link: '/receipts',           sub: 'Awaiting incoming goods' },
  { key: 'pendingDeliveries', label: 'Pending Deliveries', icon: ArrowUpRight, accent: '#6366F1', link: '/deliveries',         sub: 'Orders to fulfill' },
];

const Dashboard = () => {
  const {
    kpis,
    recentMoves,
    stockChart,
    lowStockProducts,
    isLoading,
    fetchAllDashboardData,
  } = useDashboardStore();

  useEffect(() => { fetchAllDashboardData(); }, []);
  useSocket('stock:updated', () => { fetchAllDashboardData(); });

  const maxCategoryQty = Math.max(...(stockChart.map((c) => c.totalQuantity || 0)), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Overview</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time warehouse performance & inventory tracking
          </p>
        </div>
        <button
          onClick={() => fetchAllDashboardData()}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-xs transition-all disabled:opacity-40 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Low Stock Alert Banner */}
      {lowStockProducts && lowStockProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-rose-500/10 border border-rose-500/20 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-rose-500 text-white shadow-xs">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400">
                {lowStockProducts.length} item{lowStockProducts.length > 1 ? 's' : ''} need restocking
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                {lowStockProducts.slice(0, 3).map((p) => `${p.name} (${p.stockQuantity})`).join(', ')}
                {lowStockProducts.length > 3 ? ` +${lowStockProducts.length - 3} more` : ''}
              </p>
            </div>
          </div>
          <Link
            to="/products?status=low"
            className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 shrink-0"
          >
            Review <ArrowRight size={13} />
          </Link>
        </motion.div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiConfig.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-4 relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{kpi.label}</span>
                <div
                  className="p-2 rounded-xl"
                  style={{ background: `${kpi.accent}15` }}
                >
                  <Icon size={16} style={{ color: kpi.accent }} />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {kpis[kpi.key] ?? 0}
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{kpi.sub}</div>
              </div>
              <Link to={kpi.link} className="absolute inset-0" aria-label={kpi.label} />
            </motion.div>
          );
        })}
      </div>

      {/* Charts & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock by Category */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Stock by Category</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Quantity distributed across categories</p>
            </div>
            <TrendingUp size={16} className="text-amber-500" />
          </div>

          {stockChart && stockChart.length > 0 ? (
            <div className="space-y-4">
              {stockChart.map((cat, i) => {
                const percent = Math.round(((cat.totalQuantity || 0) / maxCategoryQty) * 100);
                const colors = ['#F59E0B', '#10B981', '#EF4444', '#6366F1', '#EC4899', '#06B6D4'];
                const color = colors[i % colors.length];
                return (
                  <div key={cat._id || cat.name} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700 dark:text-slate-300">{cat.name || 'Uncategorized'}</span>
                      <span className="text-slate-900 dark:text-white font-bold">{cat.totalQuantity || 0} units</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(percent, 2)}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.08 }}
                        className="h-full rounded-full"
                        style={{ background: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              No category stock data yet.
            </div>
          )}
        </div>

        {/* Recent Moves */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Moves</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Latest transactions</p>
            </div>
            <Link to="/moves" className="text-xs font-semibold text-amber-500 hover:text-amber-400 transition-colors">
              View all
            </Link>
          </div>

          <div className="space-y-1">
            {recentMoves && recentMoves.length > 0 ? (
              recentMoves.slice(0, 7).map((move) => (
                <div
                  key={move._id}
                  className="py-2.5 flex items-center justify-between text-xs border-b border-slate-100 dark:border-slate-800/60"
                >
                  <div className="truncate max-w-[140px]">
                    <div className="font-semibold text-slate-900 dark:text-white truncate">{move.product?.name || 'Item'}</div>
                    <div className="flex items-center gap-1 mt-0.5 text-slate-400 text-[10px]">
                      <Clock size={10} /> {formatDate(move.createdAt)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded-md text-[11px] ${
                        move.quantity > 0
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {move.quantity > 0 ? `+${move.quantity}` : move.quantity}
                    </span>
                    <div className="text-[10px] mt-0.5 uppercase text-slate-400">{move.type}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No recent stock operations.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
