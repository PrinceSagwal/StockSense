import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Truck,
  ArrowLeftRight,
  Barcode,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  ScanLine,
  Sliders,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import useThemeStore from '../../store/useThemeStore';
import toast from 'react-hot-toast';

const StaffDashboard = ({ data }) => {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const {
    taskQueue,
    dailyActivity,
    recentTasks,
    operationBreakdown,
    recentMoves
  } = data;

  // Barcode / SKU search state
  const [skuSearch, setSkuSearch] = useState('');

  const handleSkuLookup = (e) => {
    e.preventDefault();
    if (!skuSearch.trim()) {
      toast.error('Please enter an SKU or product name to scan');
      return;
    }
    navigate(`/products?search=${encodeURIComponent(skuSearch.trim())}`);
  };

  // Strict Design Palette
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

  const pieColors = [COLORS.secondary, COLORS.danger, COLORS.warning, '#64748B'];

  // Prepare Task Queue Load Data for Bar Chart
  const queueData = [
    {
      name: 'Receipts',
      Ready: taskQueue?.receipts?.ready || 0,
      Waiting: taskQueue?.receipts?.pending || 0
    },
    {
      name: 'Deliveries',
      Ready: taskQueue?.deliveries?.ready || 0,
      Waiting: taskQueue?.deliveries?.pending || 0
    },
    {
      name: 'Transfers',
      Ready: taskQueue?.transfers?.ready || 0,
      Waiting: taskQueue?.transfers?.pending || 0
    }
  ];

  // Daily Activity Data
  const activityData =
    dailyActivity && dailyActivity.length > 0
      ? dailyActivity.map((d) => ({
          date: d.date.slice(5),
          receipts: d.receipt || 0,
          deliveries: d.delivery || 0,
          transfers: d.transfer || 0
        }))
      : [
          { date: 'Day 1', receipts: 2, deliveries: 4, transfers: 1 },
          { date: 'Day 2', receipts: 3, deliveries: 2, transfers: 2 },
          { date: 'Day 3', receipts: 5, deliveries: 6, transfers: 1 },
          { date: 'Day 4', receipts: 1, deliveries: 3, transfers: 0 },
          { date: 'Day 5', receipts: 4, deliveries: 7, transfers: 3 },
          { date: 'Day 6', receipts: 6, deliveries: 5, transfers: 2 },
          { date: 'Day 7', receipts: 3, deliveries: 4, transfers: 1 }
        ];

  // Operation Breakdown for Pie Chart
  const opsShareData =
    operationBreakdown && operationBreakdown.length > 0
      ? operationBreakdown.map((op) => ({
          name: op.type.charAt(0).toUpperCase() + op.type.slice(1),
          value: op.count || 0
        }))
      : [
          { name: 'Receipts', value: 12 },
          { name: 'Deliveries', value: 24 },
          { name: 'Transfers', value: 8 },
          { name: 'Adjustments', value: 4 }
        ];

  // Volume by operation type for Bar Chart
  const volumeData =
    operationBreakdown && operationBreakdown.length > 0
      ? operationBreakdown.map((op) => ({
          operation: op.type.charAt(0).toUpperCase() + op.type.slice(1),
          totalQty: op.totalQty || 0
        }))
      : [
          { operation: 'Receipts', totalQty: 120 },
          { operation: 'Deliveries', totalQty: 240 },
          { operation: 'Transfers', totalQty: 85 },
          { operation: 'Adjustments', totalQty: 15 }
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
      {/* Staff Queue Command Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#22C55E] text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
            <ClipboardList size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-[#0F172A] dark:text-white uppercase tracking-wider">
                Warehouse Floor Workstation
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-400/20 text-[#22C55E] border border-emerald-400/30">
                Staff Ops
              </span>
            </div>
            <p className="text-xs text-[#64748B] dark:text-slate-400">
              Immediate picking, receiving, internal moving and quick barcode lookup
            </p>
          </div>
        </div>

        {/* Quick SKU Scanner / Barcode Input */}
        <form onSubmit={handleSkuLookup} className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Barcode size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              placeholder="Scan or enter SKU..."
              value={skuSearch}
              onChange={(e) => setSkuSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 text-[#0F172A] dark:text-white placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] shadow-xs"
            />
          </div>
          <button
            type="submit"
            className="btn-lift inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#F5A623] hover:bg-[#F59E0B] text-slate-950 shadow-xs transition-all cursor-pointer shrink-0"
          >
            <ScanLine size={14} /> Scan
          </button>
        </form>
      </div>

      {/* Task Queue Counters with colored top borders, micro inner glow & drop shadow */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Receipts Ready */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-[#E2E8F0] dark:border-slate-800 border-t-[3px] border-t-[#22C55E] shadow-sm hover:shadow-md card-hover-elevate relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B] dark:text-slate-400">Inbound Dock Queue</span>
            <div className="p-2 rounded-xl shadow-inner ring-1 ring-inset bg-emerald-500/10 border-emerald-500/20 text-[#22C55E]">
              <Boxes size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#0F172A] dark:text-white">
              {taskQueue?.receipts?.ready || 0}
            </span>
            <span className="text-xs font-bold text-[#22C55E]">Ready to Check-in</span>
          </div>
          <div className="mt-1 text-[11px] text-[#64748B]">
            {taskQueue?.receipts?.pending || 0} waiting for vendor delivery
          </div>
          <Link to="/receipts" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#22C55E] hover:underline">
            Process Inbound <ChevronRight size={13} />
          </Link>
        </motion.div>

        {/* Deliveries Ready */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 }}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-[#E2E8F0] dark:border-slate-800 border-t-[3px] border-t-[#F5A623] shadow-sm hover:shadow-md card-hover-elevate relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B] dark:text-slate-400">Outbound Pick & Pack</span>
            <div className="p-2 rounded-xl shadow-inner ring-1 ring-inset bg-amber-500/10 border-amber-500/20 text-[#F5A623]">
              <Truck size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#0F172A] dark:text-white">
              {taskQueue?.deliveries?.ready || 0}
            </span>
            <span className="text-xs font-bold text-[#D97706] dark:text-amber-400">Ready to Pick/Pack</span>
          </div>
          <div className="mt-1 text-[11px] text-[#64748B]">
            {taskQueue?.deliveries?.pending || 0} awaiting product availability
          </div>
          <Link to="/deliveries" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#D97706] dark:text-amber-400 hover:underline">
            Process Pick List <ChevronRight size={13} />
          </Link>
        </motion.div>

        {/* Transfers Ready */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-[#E2E8F0] dark:border-slate-800 border-t-[3px] border-t-[#06B6D4] shadow-sm hover:shadow-md card-hover-elevate relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B] dark:text-slate-400">Internal Transfers</span>
            <div className="p-2 rounded-xl shadow-inner ring-1 ring-inset bg-cyan-500/10 border-cyan-500/20 text-[#06B6D4]">
              <ArrowLeftRight size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#0F172A] dark:text-white">
              {taskQueue?.transfers?.ready || 0}
            </span>
            <span className="text-xs font-bold text-[#06B6D4]">Ready for Transit</span>
          </div>
          <div className="mt-1 text-[11px] text-[#64748B]">
            {taskQueue?.transfers?.pending || 0} scheduled transfers
          </div>
          <Link to="/transfers" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#06B6D4] hover:underline">
            Execute Transfers <ChevronRight size={13} />
          </Link>
        </motion.div>
      </div>

      {/* 4 STAFF GRAPHS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* GRAPH 1: 7-Day Activity Trends (Area Chart) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-[#E2E8F0] dark:border-slate-800 shadow-sm card-hover-elevate">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#22C55E]" />
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">7-Day Task Volume</h3>
              </div>
              <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                Completed movement operations across the past 7 days
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-[#22C55E] font-bold border border-emerald-500/20">
              DAILY RUNS
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -15, bottom: 10 }}>
                <defs>
                  <linearGradient id="recGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="delGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F5A623" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#F5A623" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
                <XAxis dataKey="date" stroke={COLORS.textSecondary} fontSize={11} tickLine={false} />
                <YAxis stroke={COLORS.textSecondary} fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" formatter={(v) => <span className="text-xs text-[#64748B] dark:text-slate-300">{v}</span>} />
                <Area type="monotone" dataKey="receipts" name="Receipts" stroke="#22C55E" fill="url(#recGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="deliveries" name="Deliveries" stroke="#F5A623" fill="url(#delGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRAPH 2: Work Queue Load (Bar Chart: Ready vs Waiting) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-[#E2E8F0] dark:border-slate-800 shadow-sm card-hover-elevate">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-[#F5A623]" />
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">Active Queue Backlog</h3>
              </div>
              <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                Tasks ready to process right now vs awaiting dependencies
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-[#D97706] dark:text-amber-400 font-bold border border-amber-500/20">
              QUEUES
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={queueData} margin={{ top: 10, right: 10, left: -15, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
                <XAxis dataKey="name" stroke={COLORS.textSecondary} fontSize={11} tickLine={false} />
                <YAxis stroke={COLORS.textSecondary} fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" formatter={(v) => <span className="text-xs text-[#64748B] dark:text-slate-300">{v}</span>} />
                <Bar dataKey="Ready" fill="#22C55E" radius={[4, 4, 0, 0]} name="Ready to Action" />
                <Bar dataKey="Waiting" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Pending / Waiting" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRAPH 3: Operation Share (Pie / Donut Chart) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-[#E2E8F0] dark:border-slate-800 shadow-sm card-hover-elevate">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Sliders size={16} className="text-[#06B6D4]" />
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">Operation Types Breakdown</h3>
              </div>
              <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                Distribution of executed transactions (last 30 days)
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-500/10 text-[#0E7490] dark:text-cyan-400 font-bold border border-cyan-500/20">
              SHARE
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={opsShareData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {opsShareData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(v) => <span className="text-xs text-[#64748B] dark:text-slate-300">{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRAPH 4: Movement Quantity Volume (Bar Chart) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-[#E2E8F0] dark:border-slate-800 shadow-sm card-hover-elevate">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Barcode size={16} className="text-[#F5A623]" />
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">Units Handled per Operation</h3>
              </div>
              <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                Physical unit throughput handled by operation type
              </p>
            </div>
            <Link to="/moves" className="text-xs font-bold text-[#F5A623] hover:underline">
              Ledger
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeData} margin={{ top: 10, right: 10, left: -15, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
                <XAxis dataKey="operation" stroke={COLORS.textSecondary} fontSize={11} tickLine={false} />
                <YAxis stroke={COLORS.textSecondary} fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="totalQty" name="Units Handled" fill="#F5A623" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ACTIONABLE TASK QUEUES TABLE / CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Inbound Check-in Queue */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-[#E2E8F0] dark:border-slate-800 shadow-sm card-hover-elevate">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Boxes size={16} className="text-[#22C55E]" />
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">Inbound Check-in Queue</h3>
            </div>
            <Link to="/receipts" className="text-xs font-bold text-[#22C55E] hover:underline">
              View All Receipts
            </Link>
          </div>

          <div className="space-y-2">
            {recentTasks?.receipts && recentTasks.receipts.length > 0 ? (
              recentTasks.receipts.map((rec) => (
                <div
                  key={rec._id}
                  className="p-3 rounded-xl flex items-center justify-between bg-[#F1F5F9] dark:bg-slate-800/40 border border-[#E2E8F0] dark:border-slate-800"
                >
                  <div>
                    <div className="font-mono text-xs font-bold text-[#0F172A] dark:text-white">
                      {rec.reference}
                    </div>
                    <div className="text-[11px] text-[#64748B] mt-0.5">
                      Supplier: <span className="font-semibold text-slate-700 dark:text-slate-300">{rec.supplier}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-[999px] border ${
                        rec.status === 'ready'
                          ? 'bg-emerald-50 text-[#22C55E] border-emerald-200'
                          : 'bg-amber-50 text-[#F59E0B] border-amber-200'
                      }`}
                    >
                      {rec.status}
                    </span>
                    <Link
                      to={`/receipts/${rec._id}`}
                      className="w-8 h-8 rounded-full flex items-center justify-center bg-[#22C55E] text-white hover:bg-emerald-600 transition-all duration-150 hover:scale-105"
                      title="Open Receipt"
                    >
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-[#64748B]">
                No active receipts in queue
              </div>
            )}
          </div>
        </div>

        {/* Pending Dispatch Orders */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-[#E2E8F0] dark:border-slate-800 shadow-sm card-hover-elevate">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Truck size={16} className="text-[#F5A623]" />
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">Pending Dispatch Orders</h3>
            </div>
            <Link to="/deliveries" className="text-xs font-bold text-[#F5A623] hover:underline">
              View All Deliveries
            </Link>
          </div>

          <div className="space-y-2">
            {recentTasks?.deliveries && recentTasks.deliveries.length > 0 ? (
              recentTasks.deliveries.map((del) => (
                <div
                  key={del._id}
                  className="p-3 rounded-xl flex items-center justify-between bg-[#F1F5F9] dark:bg-slate-800/40 border border-[#E2E8F0] dark:border-slate-800"
                >
                  <div>
                    <div className="font-mono text-xs font-bold text-[#0F172A] dark:text-white">
                      {del.reference}
                    </div>
                    <div className="text-[11px] text-[#64748B] mt-0.5">
                      Customer: <span className="font-semibold text-slate-700 dark:text-slate-300">{del.customer}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-[999px] border ${
                        del.status === 'ready'
                          ? 'bg-emerald-50 text-[#22C55E] border-emerald-200'
                          : 'bg-amber-50 text-[#F59E0B] border-amber-200'
                      }`}
                    >
                      {del.status}
                    </span>
                    <Link
                      to={`/deliveries/${del._id}`}
                      className="w-8 h-8 rounded-full flex items-center justify-center bg-[#F5A623] text-slate-950 hover:bg-[#F59E0B] transition-all duration-150 hover:scale-105"
                      title="Open Delivery"
                    >
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-[#64748B]">
                No active delivery orders waiting
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default StaffDashboard;
