import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import {
  Boxes,
  AlertTriangle,
  PackageX,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Warehouse,
  ShieldCheck,
  Activity,
  Layers,
  ArrowRight,
  Plus,
  Clock,
  X
} from 'lucide-react';
import useThemeStore from '../../store/useThemeStore';
import { formatDate } from '../../utils/formatters';

const ManagerDashboard = ({ data }) => {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  // Dismissible Restock Alert Banner State
  const [alertDismissed, setAlertDismissed] = useState(false);

  const {
    kpis,
    lowStockProducts,
    recentMoves,
    inventoryValuation,
    operationsBreakdown,
    warehouseDistribution,
    stockHealth,
    stockChart
  } = data;

  // Strict Color Palette
  const COLORS = {
    primary: '#F5A623',
    secondary: '#22C55E',
    danger: '#EF4444',
    warning: '#F59E0B',
    info: '#06B6D4',
    bg: '#F1F5F9',
    surface: '#FFFFFF',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    grid: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  };

  const pieColors = [COLORS.secondary, COLORS.warning, COLORS.danger];

  // Stock Health Donut Data
  const stockHealthData = [
    { name: 'Optimal Stock', value: stockHealth?.healthy || 0, color: COLORS.secondary },
    { name: 'Low Stock Alert', value: stockHealth?.low || 0, color: COLORS.warning },
    { name: 'Out of Stock', value: stockHealth?.outOfStock || 0, color: COLORS.danger }
  ].filter((d) => d.value > 0);

  const displayHealthData =
    stockHealthData.length > 0
      ? stockHealthData
      : [{ name: 'Catalog', value: kpis.totalProducts || 1, color: COLORS.primary }];

  // Logistics Pipeline Stacked Bar Data
  const opsData = [
    {
      name: 'Receipts',
      Draft: operationsBreakdown?.receipts?.draft || 0,
      Waiting: operationsBreakdown?.receipts?.waiting || 0,
      Ready: operationsBreakdown?.receipts?.ready || 0,
      Done: operationsBreakdown?.receipts?.done || 0
    },
    {
      name: 'Deliveries',
      Draft: operationsBreakdown?.deliveries?.draft || 0,
      Waiting: operationsBreakdown?.deliveries?.waiting || 0,
      Ready: operationsBreakdown?.deliveries?.ready || 0,
      Done: operationsBreakdown?.deliveries?.done || 0
    },
    {
      name: 'Transfers',
      Draft: operationsBreakdown?.transfers?.draft || 0,
      Waiting: operationsBreakdown?.transfers?.waiting || 0,
      Ready: operationsBreakdown?.transfers?.ready || 0,
      Done: operationsBreakdown?.transfers?.done || 0
    }
  ];

  // Category Distribution Data
  const categoryData =
    inventoryValuation && inventoryValuation.length > 0
      ? inventoryValuation
      : stockChart && stockChart.length > 0
      ? stockChart.map((c) => ({ category: c.categoryName, totalStock: c.totalStock }))
      : [{ category: 'General', totalStock: 0 }];

  const totalCatStock = categoryData.reduce((acc, c) => acc + (c.totalStock || 0), 0) || 1;

  // Warehouse Distribution Data
  const whData =
    warehouseDistribution && warehouseDistribution.length > 0
      ? warehouseDistribution
      : [{ warehouse: 'Main Hub', totalQuantity: 0, productCount: 0 }];

  // KPI Cards configuration with top-border accents, icons & micro inner glow
  const kpiCards = [
    {
      key: 'totalProducts',
      label: 'Catalog Items',
      val: kpis.totalProducts,
      icon: Boxes,
      accent: COLORS.info,
      sub: 'Active catalog items',
      link: '/products'
    },
    {
      key: 'lowStockCount',
      label: 'Low Stock',
      val: kpis.lowStockCount,
      icon: AlertTriangle,
      accent: COLORS.warning,
      sub: 'Below reorder level',
      link: '/products?status=low'
    },
    {
      key: 'outOfStockCount',
      label: 'Out of Stock',
      val: kpis.outOfStockCount,
      icon: PackageX,
      accent: COLORS.danger,
      sub: 'Zero available units',
      link: '/products?status=out'
    },
    {
      key: 'pendingReceipts',
      label: 'Pending Receipts',
      val: kpis.pendingReceipts,
      icon: ArrowDownLeft,
      accent: COLORS.secondary,
      sub: 'Awaiting incoming goods',
      link: '/receipts'
    },
    {
      key: 'pendingDeliveries',
      label: 'Pending Deliveries',
      val: kpis.pendingDeliveries,
      icon: ArrowUpRight,
      accent: COLORS.primary,
      sub: 'Orders to fulfill',
      link: '/deliveries'
    }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 text-white p-2.5 rounded-xl border border-slate-700/60 shadow-xl backdrop-blur-md text-xs">
          <p className="font-bold text-[#F5A623] mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
              <span className="text-slate-300">{entry.name}:</span>
              <span className="font-mono font-bold text-white">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* 1. Restock Alert Banner: Dismissible + Pulsing Left Border Animation */}
      <AnimatePresence>
        {!alertDismissed && lowStockProducts && lowStockProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, margin: 0, padding: 0 }}
            transition={{ duration: 0.2 }}
            className="alert-pulse-border rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 border-l-4 border-l-[#EF4444] shadow-xs relative overflow-hidden"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-rose-50 dark:bg-rose-950/40 text-[#EF4444] border border-rose-200 dark:border-rose-900/40 shadow-xs">
                <AlertTriangle size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#EF4444]">
                  {lowStockProducts.length} item{lowStockProducts.length > 1 ? 's' : ''} breached safety threshold
                </h4>
                <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                  {lowStockProducts.slice(0, 3).map((p) => `${p.name} (${p.stockQuantity} units)`).join(', ')}
                  {lowStockProducts.length > 3 ? ` +${lowStockProducts.length - 3} more items` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
              <Link
                to="/products?status=low"
                className="text-xs font-bold text-[#EF4444] hover:underline flex items-center gap-1"
              >
                Review Items <ArrowRight size={13} />
              </Link>
              <button
                onClick={() => setAlertDismissed(true)}
                className="p-1 rounded-lg text-[#64748B] hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Dismiss alert"
              >
                <X size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Upgraded KPI Cards: Subtle drop shadow, micro inner glow on icon, thin colored top-border */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiCards.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              style={{ borderTopColor: kpi.accent }}
              className="p-4 relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900/80 border border-[#E2E8F0] dark:border-slate-800 border-t-[3px] shadow-sm hover:shadow-md card-hover-elevate transition-all duration-200 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#64748B] dark:text-slate-400">{kpi.label}</span>
                {/* Micro inner glow container */}
                <div
                  className="p-2 rounded-xl shadow-inner ring-1 ring-inset"
                  style={{
                    background: `${kpi.accent}14`,
                    borderColor: `${kpi.accent}30`
                  }}
                >
                  <Icon size={16} style={{ color: kpi.accent }} />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-[#0F172A] dark:text-white tracking-tight">
                  {kpi.val ?? 0}
                </div>
                <div className="text-[11px] text-[#64748B] dark:text-slate-500 mt-0.5">{kpi.sub}</div>
              </div>
              <Link to={kpi.link} className="absolute inset-0" aria-label={kpi.label} />
            </motion.div>
          );
        })}
      </div>

      {/* 3. Stock by Category Progress Bars & Recent Moves Panel with Vertical Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* "Stock by Category" bar chart: Rounded pill-style progress bars + inline percentage labels */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-[#E2E8F0] dark:border-slate-800 shadow-sm card-hover-elevate">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-[#F5A623]" />
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">Stock by Category</h3>
              </div>
              <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
                Quantity and percentage share distributed across categories
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-[#D97706] dark:text-amber-400 font-bold border border-amber-500/20">
              PROGRESS PILLS
            </span>
          </div>

          {categoryData && categoryData.length > 0 ? (
            <div className="space-y-4">
              {categoryData.map((cat, i) => {
                const totalStock = cat.totalStock || 0;
                const percent = Math.round((totalStock / totalCatStock) * 100);
                const pillColors = ['#F5A623', '#22C55E', '#06B6D4', '#F59E0B', '#64748B'];
                const color = pillColors[i % pillColors.length];

                return (
                  <div key={cat.category || i} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#0F172A] dark:text-slate-200">
                        {cat.category || 'Uncategorized'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[#64748B] dark:text-slate-400">
                          {totalStock.toLocaleString()} units
                        </span>
                        {/* Inline percentage label on the right */}
                        <span className="font-mono font-bold text-xs text-[#0F172A] dark:text-white min-w-[36px] text-right">
                          {percent}%
                        </span>
                      </div>
                    </div>

                    {/* Rounded pill-style progress bar */}
                    <div className="w-full h-3 rounded-[999px] bg-[#F1F5F9] dark:bg-slate-800 overflow-hidden p-0.5 border border-[#E2E8F0]/70 dark:border-slate-700/60">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(percent, 2)}%` }}
                        transition={{ duration: 0.7, ease: 'easeOut', delay: i * 0.05 }}
                        className="h-full rounded-[999px] shadow-xs"
                        style={{ backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-[#64748B]">
              No category stock data available yet.
            </div>
          )}
        </div>

        {/* "Recent Moves" panel: Vertical timeline line, real product name, color-coded +/- badge */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-[#E2E8F0] dark:border-slate-800 shadow-sm card-hover-elevate">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">Recent Moves</h3>
              <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">Continuous ledger timeline</p>
            </div>
            <Link to="/moves" className="text-xs font-semibold text-[#F5A623] hover:underline transition-colors">
              View all
            </Link>
          </div>

          <div className="relative">
            {recentMoves && recentMoves.length > 0 ? (
              <div className="relative pl-5 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E2E8F0] dark:before:bg-slate-800">
                {recentMoves.slice(0, 6).map((move) => {
                  const isInbound =
                    move.quantity > 0 ||
                    move.operationType === 'receipt' ||
                    move.type === 'receipt';
                  const prodName = move.productName || move.product?.name || 'Catalog Item';

                  return (
                    <div key={move._id} className="relative flex items-center justify-between text-xs group">
                      {/* Timeline dot */}
                      <span
                        className="absolute -left-5 top-1.5 w-2 h-2 rounded-full ring-2 ring-white dark:ring-slate-900 shrink-0"
                        style={{ backgroundColor: isInbound ? COLORS.secondary : COLORS.danger }}
                      />

                      <div className="truncate max-w-[140px] pr-2">
                        {/* Real product name shown */}
                        <div className="font-semibold text-[#0F172A] dark:text-white truncate" title={prodName}>
                          {prodName}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5 text-[#64748B] text-[10px]">
                          <Clock size={10} /> {formatDate(move.createdAt)}
                        </div>
                      </div>

                      {/* Color-coded +/- badge (green for inbound, red for outbound) */}
                      <div className="text-right shrink-0">
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded-[999px] text-[11px] border ${
                            isInbound
                              ? 'bg-emerald-50 text-[#22C55E] border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800/50'
                              : 'bg-rose-50 text-[#EF4444] border-rose-200 dark:bg-rose-950/40 dark:border-rose-800/50'
                          }`}
                        >
                          {isInbound ? `+${Math.abs(move.quantity)}` : `-${Math.abs(move.quantity)}`}
                        </span>
                        <div className="text-[10px] mt-0.5 uppercase text-[#64748B] font-medium tracking-wider">
                          {move.operationType || move.type || 'move'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-[#64748B]">
                No recent stock movements recorded.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Executive Analytical Graphs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* GRAPH 1: Stock Health Status (Donut) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-[#E2E8F0] dark:border-slate-800 shadow-sm card-hover-elevate">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-[#22C55E]" />
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">Stock Health Status</h3>
              </div>
              <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                Proportion of optimal, low stock, and zero units
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-[#22C55E] font-bold border border-emerald-500/20">
              HEALTH
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={displayHealthData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {displayHealthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-xs text-[#64748B] dark:text-slate-300">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRAPH 2: Operations Breakdown by Status (Stacked Bar Chart) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-[#E2E8F0] dark:border-slate-800 shadow-sm card-hover-elevate">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-[#F5A623]" />
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">Operations Breakdown by Status</h3>
              </div>
              <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                Receipts, deliveries and transfers across workflow states
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-[#D97706] dark:text-amber-400 font-bold border border-amber-500/20">
              STAGES
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={opsData} margin={{ top: 10, right: 10, left: -15, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
                <XAxis dataKey="name" stroke={COLORS.textSecondary} fontSize={11} tickLine={false} />
                <YAxis stroke={COLORS.textSecondary} fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  formatter={(value) => <span className="text-xs text-[#64748B] dark:text-slate-300">{value}</span>}
                />
                <Bar dataKey="Draft" stackId="a" fill="#64748B" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Waiting" stackId="a" fill="#F59E0B" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Ready" stackId="a" fill="#22C55E" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Done" stackId="a" fill="#06B6D4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRAPH 3: Warehouse Stock Allocation (Area Chart) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-[#E2E8F0] dark:border-slate-800 shadow-sm card-hover-elevate">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Warehouse size={16} className="text-[#F5A623]" />
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">Warehouse Stock Allocation</h3>
              </div>
              <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                Physical unit allocation across storage hubs
              </p>
            </div>
            <Link to="/settings/warehouses" className="text-xs font-bold text-[#F5A623] hover:underline">
              Manage Hubs
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={whData} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                <defs>
                  <linearGradient id="whGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F5A623" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#F5A623" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
                <XAxis dataKey="warehouse" stroke={COLORS.textSecondary} fontSize={11} tickLine={false} />
                <YAxis stroke={COLORS.textSecondary} fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="totalQuantity"
                  name="Inventory Units"
                  stroke="#F5A623"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#whGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRAPH 4: Category Stock Volume (Bar Chart) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-[#E2E8F0] dark:border-slate-800 shadow-sm card-hover-elevate">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Boxes size={16} className="text-[#06B6D4]" />
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">Inventory Valuation / SKU Volume</h3>
              </div>
              <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                Total item count comparison per category
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-500/10 text-[#0E7490] dark:text-cyan-400 font-bold border border-cyan-500/20">
              VALUATION
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
                <XAxis
                  dataKey="category"
                  stroke={COLORS.textSecondary}
                  fontSize={11}
                  tickLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis stroke={COLORS.textSecondary} fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="totalStock" name="Total Units" fill="#06B6D4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ManagerDashboard;
