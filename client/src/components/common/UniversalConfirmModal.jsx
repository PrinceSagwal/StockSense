import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import useConfirmStore from '../../store/useConfirmStore';

const UniversalConfirmModal = () => {
  const {
    isOpen,
    title,
    message,
    confirmText,
    cancelText,
    type,
    onConfirm,
    onCancel
  } = useConfirmStore();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onCancel();
      } else if (e.key === 'Enter') {
        onConfirm();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel, onConfirm]);

  if (!isOpen) return null;

  // Type-specific icons, colors, and button styles
  const config = {
    danger: {
      icon: AlertTriangle,
      color: '#EF4444',
      iconBg: 'bg-red-500/10 dark:bg-red-500/15',
      iconBorder: 'border-red-500/25',
      buttonBg: 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25 focus:ring-red-500/40'
    },
    warning: {
      icon: AlertCircle,
      color: '#F5A623',
      iconBg: 'bg-amber-500/10 dark:bg-amber-500/15',
      iconBorder: 'border-amber-500/25',
      buttonBg: 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-lg shadow-amber-500/25 focus:ring-amber-500/40'
    },
    success: {
      icon: CheckCircle2,
      color: '#22C55E',
      iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
      iconBorder: 'border-emerald-500/25',
      buttonBg: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25 focus:ring-emerald-500/40'
    },
    info: {
      icon: Info,
      color: '#06B6D4',
      iconBg: 'bg-cyan-500/10 dark:bg-cyan-500/15',
      iconBorder: 'border-cyan-500/25',
      buttonBg: 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-500/25 focus:ring-cyan-500/40'
    }
  }[type] || {
    icon: AlertCircle,
    color: '#F5A623',
    iconBg: 'bg-amber-500/10',
    iconBorder: 'border-amber-500/25',
    buttonBg: 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-lg shadow-amber-500/25 focus:ring-amber-500/40'
  };

  const IconComponent = config.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onCancel}
          className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 14 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden p-6 text-left"
        >
          {/* Close corner button */}
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>

          {/* Header with Type Icon */}
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${config.iconBg} ${config.iconBorder}`}
            >
              <IconComponent size={24} style={{ color: config.color }} />
            </div>

            <div className="flex-1 pr-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                {title}
              </h3>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
            >
              {cancelText}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              autoFocus
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all focus:outline-none focus:ring-2 cursor-pointer ${config.buttonBg}`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UniversalConfirmModal;
