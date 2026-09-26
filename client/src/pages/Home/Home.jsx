import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ThemeToggle from '../../components/common/ThemeToggle';
import {
  Boxes,
  Package,
  Truck,
  ArrowLeftRight,
  Sliders,
  History,
  Warehouse,
  ArrowRight,
  BarChart3,
  ShieldCheck,
  Zap,
  Bell,
  ChevronRight
} from 'lucide-react';

/* ---- Reusable animation variants ---- */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' } }),
};

const features = [
  {
    icon: Package,
    title: 'Product Catalog',
    desc: 'Manage SKUs, categories, units, and reorder thresholds with rich product data.',
    accent: '#F59E0B',
  },
  {
    icon: Boxes,
    title: 'Receipts (Inbound)',
    desc: 'Record incoming stock from suppliers with full traceability and validation.',
    accent: '#10B981',
  },
  {
    icon: Truck,
    title: 'Delivery Orders',
    desc: 'Fulfill customer orders with real-time stock deduction and status tracking.',
    accent: '#EF4444',
  },
  {
    icon: ArrowLeftRight,
    title: 'Internal Transfers',
    desc: 'Move stock between warehouse zones or locations seamlessly.',
    accent: '#F59E0B',
  },
  {
    icon: Sliders,
    title: 'Inventory Adjustments',
    desc: 'Correct discrepancies with auditable adjustment entries and reason codes.',
    accent: '#10B981',
  },
  {
    icon: History,
    title: 'Stock Move Ledger',
    desc: 'Full chronological ledger of every stock movement across your warehouses.',
    accent: '#6366F1',
  },
  {
    icon: BarChart3,
    title: 'Live Dashboard',
    desc: 'KPI cards, low-stock alerts, and category distribution charts in real time.',
    accent: '#F59E0B',
  },
  {
    icon: Bell,
    title: 'Real-time Alerts',
    desc: 'Instant low-stock notifications via WebSocket and email alerts.',
    accent: '#EF4444',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Auth',
    desc: 'JWT sessions, bcrypt passwords, and Twilio phone OTP verification.',
    accent: '#10B981',
  },
];

const stats = [
  { value: '100%', label: 'Real-time Updates', accent: '#F59E0B' },
  { value: '∞',   label: 'Product SKUs',       accent: '#10B981' },
  { value: '3x',  label: 'Faster Operations',  accent: '#EF4444' },
  { value: '24/7', label: 'Always Online',      accent: '#06B6D4' },
];

const Home = () => {
  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 dark:bg-[#0A0F1E] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* ── Subtle Background Accent ── */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 pointer-events-none w-[700px] h-[500px] bg-amber-500/5 dark:bg-amber-400/10 blur-[120px] rounded-full" />

      {/* ── Navigation ── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-amber-400 text-slate-950 shadow-md">
            <Boxes className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-slate-900 dark:text-white text-lg tracking-tight">
            Stock<span className="text-amber-500">Sense</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Dark / Light Toggle */}
          <ThemeToggle />

          <Link
            to="/login"
            className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 rounded-xl text-sm font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-sm transition-all"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 py-24 md:py-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
            <Zap size={13} className="text-amber-500" />
            Built on MERN Stack · Real-time Inventory Intelligence
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white leading-[1.08] tracking-tight mb-6 max-w-4xl mx-auto">
            Warehouse &<br />
            <span className="text-amber-500">Inventory</span>{' '}
            <span className="text-emerald-500">Management</span>
            <br />
            <span className="text-3xl md:text-5xl text-slate-400 dark:text-slate-500 font-bold">Simplified & Automated.</span>
          </h1>

          <p className="text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed text-slate-600 dark:text-slate-400">
            StockSense gives your team complete control over inbound receipts, outbound deliveries,
            internal transfers, and live warehouse inventory — designed with a clean, high-performance UI.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg shadow-amber-400/20 transition-all group"
            >
              Start for Free
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              Sign In <ChevronRight size={16} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Stats ── */}
      <section className="px-6 md:px-12 pb-20">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              custom={i}
              className="text-center p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-xs"
            >
              <div className="text-4xl font-black mb-1" style={{ color: s.accent }}>{s.value}</div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-6 md:px-12 py-20 bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200/70 dark:border-slate-800/60">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4 bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Full Feature Suite
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Everything you need to<br />
              <span className="text-amber-500">run your warehouse</span>
            </h2>
            <p className="text-base mt-3 max-w-xl mx-auto text-slate-600 dark:text-slate-400">
              From first inbound receipt to final customer delivery, StockSense handles every step of your inventory lifecycle.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  custom={i * 0.4}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-amber-500/40 dark:hover:border-amber-400/40 shadow-xs hover:shadow-md transition-all group"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${f.accent}15`, border: `1px solid ${f.accent}30` }}
                  >
                    <Icon size={18} style={{ color: f.accent }} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How it Works ── */}
      <section className="px-6 md:px-12 py-20">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">How StockSense Works</h2>
            <p className="text-sm md:text-base mt-2 text-slate-500 dark:text-slate-400">
              Simple 3-step flow to streamline all stock operations
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { num: '01', title: 'Set Up Products', desc: 'Add your product catalog with SKUs, categories, units, and reorder points.', color: '#F59E0B' },
              { num: '02', title: 'Configure Warehouses', desc: 'Define warehouse zones, locations, and assign managers to each zone.', color: '#10B981' },
              { num: '03', title: 'Go Live', desc: 'Start processing receipts, deliveries, and transfers. Dashboard updates in real time.', color: '#EF4444' },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={i}
                className="relative p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs"
              >
                <div
                  className="text-6xl font-black mb-4 leading-none opacity-20"
                  style={{ color: step.color }}
                >
                  {step.num}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{step.desc}</p>
                <div
                  className="absolute top-6 right-6 w-2.5 h-2.5 rounded-full"
                  style={{ background: step.color }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 md:px-12 py-20">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center rounded-3xl p-10 md:p-14 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 shadow-lg shadow-amber-500/5"
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-amber-400 text-slate-950 shadow-md">
            <Boxes className="w-7 h-7" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4">
            Ready to take control<br />of your inventory?
          </h2>
          <p className="text-sm md:text-base mb-8 text-slate-600 dark:text-slate-400">
            Sign up in seconds. Experience real-time warehouse intelligence today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md transition-all group"
            >
              Create Free Account
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            >
              Sign In
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-6 md:px-12 py-8 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-amber-400 text-slate-950 font-bold">
            <Boxes className="w-3.5 h-3.5" />
          </div>
          <span className="font-extrabold text-slate-900 dark:text-white text-sm">
            Stock<span className="text-amber-500">Sense</span>
          </span>
        </div>
        <p>© 2026 StockSense · Warehouse & Inventory Management Platform</p>
        <div className="flex items-center gap-4">
          <Link to="/login" className="hover:text-slate-900 dark:hover:text-white transition-colors">Login</Link>
          <Link to="/signup" className="hover:text-slate-900 dark:hover:text-white transition-colors">Sign Up</Link>
        </div>
      </footer>
    </div>
  );
};

export default Home;
