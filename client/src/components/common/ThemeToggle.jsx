import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import useThemeStore from '../../store/useThemeStore';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle dark/light theme"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className={`relative inline-flex items-center gap-2 p-1.5 rounded-xl border transition-all duration-200 cursor-pointer ${
        isDark
          ? 'bg-slate-800/80 border-slate-700/80 text-amber-400 hover:border-amber-400/50 hover:bg-slate-800'
          : 'bg-slate-100 border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-white shadow-xs'
      } ${className}`}
    >
      <div className="relative w-12 h-6 flex items-center bg-slate-900/20 dark:bg-slate-950/60 rounded-full p-0.5 border border-slate-700/30 dark:border-slate-700">
        {/* Sliding thumb */}
        <motion.div
          className={`w-5 h-5 rounded-full flex items-center justify-center shadow-md ${
            isDark ? 'bg-amber-400 text-slate-950' : 'bg-white text-slate-800'
          }`}
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          animate={{ x: isDark ? 24 : 0 }}
        >
          {isDark ? (
            <Moon size={11} className="stroke-[2.5]" />
          ) : (
            <Sun size={11} className="text-amber-500 stroke-[2.5]" />
          )}
        </motion.div>

        {/* Background icon hints */}
        <div className="absolute inset-0 flex justify-between items-center px-1.5 pointer-events-none text-[10px]">
          <Sun size={10} className={`transition-opacity ${isDark ? 'opacity-30 text-slate-400' : 'opacity-0'}`} />
          <Moon size={10} className={`transition-opacity ${isDark ? 'opacity-0' : 'opacity-30 text-slate-600'}`} />
        </div>
      </div>
    </button>
  );
};

export default ThemeToggle;
