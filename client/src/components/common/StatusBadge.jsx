import React from 'react';

const statusStyles = {
  draft: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  waiting: 'bg-cyan-50 text-cyan-800 border-cyan-200/80 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800/50',
  ready: 'bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50',
  done: 'bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50',
  canceled: 'bg-rose-50 text-rose-800 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50',

  // Stock levels
  ok: 'bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50',
  low: 'bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50',
  out: 'bg-rose-50 text-rose-800 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50'
};

const statusLabels = {
  draft: 'Draft',
  waiting: 'Waiting',
  ready: 'Ready',
  done: 'Done',
  canceled: 'Canceled',
  ok: 'In Stock',
  low: 'Low Stock',
  out: 'Out of Stock'
};

export const StatusBadge = ({ status }) => {
  const normalized = (status || 'draft').toLowerCase();
  const style = statusStyles[normalized] || 'bg-slate-100 text-slate-700 border-slate-200';
  const label = statusLabels[normalized] || status;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-[999px] text-[11px] font-semibold border ${style} tracking-wide select-none`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 shrink-0 ${
          normalized === 'done' || normalized === 'ok'
            ? 'bg-[#22C55E]'
            : normalized === 'ready' || normalized === 'low'
            ? 'bg-[#F59E0B]'
            : normalized === 'canceled' || normalized === 'out'
            ? 'bg-[#EF4444]'
            : normalized === 'waiting'
            ? 'bg-[#06B6D4]'
            : 'bg-slate-400'
        }`}
      />
      {label}
    </span>
  );
};

export default StatusBadge;
