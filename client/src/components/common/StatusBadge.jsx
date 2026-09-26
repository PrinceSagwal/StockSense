import React from 'react';

const statusStyles = {
  draft: 'bg-slate-100 text-slate-700 border-slate-300',
  waiting: 'bg-blue-50 text-blue-700 border-blue-200',
  ready: 'bg-amber-50 text-amber-700 border-amber-200',
  done: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  canceled: 'bg-rose-50 text-rose-700 border-rose-200',
  // Stock levels
  ok: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  low: 'bg-amber-50 text-amber-700 border-amber-200',
  out: 'bg-rose-50 text-rose-700 border-rose-200'
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
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style} capitalize tracking-wide`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          normalized === 'done' || normalized === 'ok'
            ? 'bg-emerald-500'
            : normalized === 'ready' || normalized === 'low'
            ? 'bg-amber-500'
            : normalized === 'canceled' || normalized === 'out'
            ? 'bg-rose-500'
            : normalized === 'waiting'
            ? 'bg-blue-500'
            : 'bg-slate-400'
        }`}
      />
      {label}
    </span>
  );
};

export default StatusBadge;
