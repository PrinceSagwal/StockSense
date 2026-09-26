import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import ThemeToggle from '../../components/common/ThemeToggle';
import useAuthStore from '../../store/useAuthStore';
import {
  Boxes,
  Package,
  Truck,
  ArrowLeftRight,
  Sliders,
  History,
  ArrowRight,
  BarChart3,
  ShieldCheck,
  Zap,
  Bell,
  ChevronRight,
  ChevronDown,
  ScanLine,
  Layers,
  Lock,
  RefreshCw,
  Sparkles
} from 'lucide-react';

/* ─── Animation Presets ───────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }
  }),
};

/* ─── Typewriter SVG Terminal Component ───────────────────────────── */
const TypewriterSVG = () => {
  const phrases = useMemo(
    () => [
      'Real-Time Warehouse Stock Intelligence',
      'Inbound ASN Receipts & Dock Check-in',
      'Instant SKU & Barcode Floor Scanner',
      'Inter-Warehouse Zone Transfers',
      'Physical Cycle Counts & Audited Adjustments',
      'Immutable Stock Move Ledger Traceability'
    ],
    []
  );

  const [phraseIndex, setPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer;
    const fullText = phrases[phraseIndex];

    if (!isDeleting) {
      if (currentText.length < fullText.length) {
        timer = setTimeout(() => {
          setCurrentText(fullText.slice(0, currentText.length + 1));
        }, 50);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2000);
      }
    } else {
      if (currentText.length > 0) {
        timer = setTimeout(() => {
          setCurrentText(fullText.slice(0, currentText.length - 1));
        }, 25);
      } else {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % phrases.length);
      }
    }

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, phraseIndex, phrases]);

  return (
    <div className="relative inline-flex items-center gap-3 my-4 px-4 py-2.5 sm:px-6 sm:py-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-amber-500/30 shadow-lg shadow-amber-500/10 backdrop-blur-md max-w-xl mr-auto">
      {/* SVG Terminal Prompt Icon */}
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        className="shrink-0 text-[#F5A623] animate-pulse"
        aria-hidden="true"
      >
        <path
          d="M4 17L10 11L4 5"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line
          x1="12"
          y1="19"
          x2="20"
          y2="19"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>

      {/* Typing Text */}
      <div className="flex items-center overflow-hidden">
        <span className="text-xs sm:text-sm md:text-base font-bold font-mono tracking-tight text-[#0F172A] dark:text-slate-100 whitespace-nowrap">
          {currentText}
        </span>
        {/* Glowing Cursor */}
        <span className="inline-block w-2 h-4 sm:h-5 ml-1 bg-[#F5A623] rounded-xs animate-pulse shadow-sm shadow-amber-400" />
      </div>
    </div>
  );
};

/* ─── Hero SVG Headline Draw Component ───────────────────────────── */
const SVGTextDraw = () => (
  <div className="relative w-full flex flex-col items-start select-none pointer-events-none">
    {/* "Warehouse &" */}
    <svg
      viewBox="0 0 820 85"
      className="w-full max-w-[820px]"
      style={{ overflow: 'visible' }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="wGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>
        <linearGradient id="invGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F5A623" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id="mgmtGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#16A34A" />
        </linearGradient>
      </defs>

      <text
        x="0"
        textAnchor="start"
        dominantBaseline="middle"
        y="50%"
        fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
        fontWeight="900"
        fontSize="72"
        fill="none"
        stroke="url(#wGrad)"
        strokeWidth="2"
        strokeDasharray="2400"
        strokeDashoffset="2400"
        style={{ animation: 'svgDraw 1.1s cubic-bezier(0.22,1,0.36,1) 0.1s forwards' }}
        className="dark:stroke-white"
      >
        Warehouse &amp;
      </text>
      <text
        x="0"
        textAnchor="start"
        dominantBaseline="middle"
        y="50%"
        fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
        fontWeight="900"
        fontSize="72"
        fill="url(#wGrad)"
        opacity="0"
        style={{ animation: 'svgFill 0.5s ease 1.0s forwards' }}
        className="dark-svg-fill"
      >
        Warehouse &amp;
      </text>
    </svg>

    {/* "Inventory Management" */}
    <svg
      viewBox="0 0 900 90"
      className="w-full max-w-[900px] -mt-1"
      style={{ overflow: 'visible' }}
      aria-hidden="true"
    >
      {/* Outline Draw Pass */}
      <text
        x="0"
        textAnchor="start"
        dominantBaseline="middle"
        y="52%"
        fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
        fontWeight="900"
        fontSize="70"
        fill="none"
        strokeWidth="2"
      >
        <tspan
          stroke="url(#invGrad)"
          strokeDasharray="2600"
          strokeDashoffset="2600"
          style={{ animation: 'svgDraw 1.1s cubic-bezier(0.22,1,0.36,1) 0.5s forwards' }}
        >
          Inventory
        </tspan>
        <tspan
          dx="28"
          stroke="url(#mgmtGrad)"
          strokeDasharray="3000"
          strokeDashoffset="3000"
          style={{ animation: 'svgDraw 1.2s cubic-bezier(0.22,1,0.36,1) 0.9s forwards' }}
        >
          Management
        </tspan>
      </text>

      {/* Solid Fill Pass */}
      <text
        x="0"
        textAnchor="start"
        dominantBaseline="middle"
        y="52%"
        fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
        fontWeight="900"
        fontSize="70"
        opacity="0"
        style={{ animation: 'svgFill 0.5s ease 1.5s forwards' }}
      >
        <tspan fill="url(#invGrad)">Inventory</tspan>
        <tspan dx="28" fill="url(#mgmtGrad)">Management</tspan>
      </text>
    </svg>

    <motion.p
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.8, ease: [0.22, 1, 0.36, 1] }}
      className="text-xl md:text-3xl font-extrabold text-[#64748B] dark:text-slate-400 mt-2 tracking-tight text-left"
    >
      Simplified, Automated &amp; Real-Time.
    </motion.p>
  </div>
);

/* ─── Animated BG Canvas — 60fps with reduced motion check ────────── */
const AnimatedBG = ({ containerRef }) => {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: null, y: null });

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let W, H;

    const NODES = 38;
    const nodes = [];

    const resize = () => {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const handleMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = e.clientX - rect.left;
      mouse.current.y = e.clientY - rect.top;
    };
    const handleLeave = () => {
      mouse.current.x = null;
      mouse.current.y = null;
    };

    const host = containerRef?.current || window;
    host.addEventListener('mousemove', handleMove, { passive: true });
    host.addEventListener('mouseleave', handleLeave, { passive: true });

    for (let i = 0; i < NODES; i++) {
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 2 + 1,
        hue: [35, 142, 186][Math.floor(Math.random() * 3)],
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Connecting lines
      for (let i = 0; i < NODES; i++) {
        for (let j = i + 1; j < NODES; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            const alpha = (1 - dist / 140) * 0.12;
            ctx.beginPath();
            ctx.strokeStyle = `hsla(${nodes[i].hue}, 80%, 60%, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Nodes
      for (const n of nodes) {
        if (mouse.current.x !== null) {
          const dx = mouse.current.x - n.x;
          const dy = mouse.current.y - n.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 160) {
            n.vx += (dx / d) * 0.007;
            n.vy += (dy / d) * 0.007;
          }
        }

        n.vx *= 0.985;
        n.vy *= 0.985;

        ctx.beginPath();
        const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 2.8);
        grd.addColorStop(0, `hsla(${n.hue}, 85%, 62%, 0.4)`);
        grd.addColorStop(1, `hsla(${n.hue}, 85%, 62%, 0)`);
        ctx.fillStyle = grd;
        ctx.arc(n.x, n.y, n.r * 2.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = `hsla(${n.hue}, 85%, 65%, 0.7)`;
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();

        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      }

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      host.removeEventListener('mousemove', handleMove);
      host.removeEventListener('mouseleave', handleLeave);
    };
  }, [containerRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-[0.32] dark:opacity-[0.22] pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

/* ─── Cursor-tracked spotlight ───────────────────────────────────── */
const HeroSpotlight = ({ containerRef }) => {
  const mx = useMotionValue(-400);
  const my = useMotionValue(-400);
  const sx = useSpring(mx, { stiffness: 60, damping: 20, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 60, damping: 20, mass: 0.6 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      mx.set(e.clientX - rect.left);
      my.set(e.clientY - rect.top);
    };
    el.addEventListener('mousemove', onMove, { passive: true });
    return () => el.removeEventListener('mousemove', onMove);
  }, [containerRef, mx, my]);

  const background = useTransform([sx, sy], ([x, y]) =>
    `radial-gradient(420px circle at ${x}px ${y}px, rgba(245,166,35,0.08), transparent 70%)`
  );

  return (
    <motion.div
      className="absolute inset-0 pointer-events-none hidden md:block"
      style={{ background, zIndex: 0 }}
    />
  );
};

/* ─── Floating Grid Lines BG ─────────────────────────────────────── */
const GridLines = () => (
  <div
    className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
    style={{
      backgroundImage: `
        linear-gradient(#0F172A 1px, transparent 1px),
        linear-gradient(to right, #0F172A 1px, transparent 1px)
      `,
      backgroundSize: '72px 72px',
    }}
  />
);

/* ─── Data: Core Features ────────────────────────────────────────── */
const features = [
  {
    icon: Package,
    title: 'Product Catalog & SKUs',
    desc: 'Manage SKUs, categories, units of measure, barcode tags, and automated safety stock reorder thresholds.',
    accent: '#F5A623',
    badge: 'Catalog'
  },
  {
    icon: Boxes,
    title: 'Inbound Receipts',
    desc: 'Receive supplier shipments with complete supplier ASN validation, automated staging, and inventory ingestion.',
    accent: '#22C55E',
    badge: 'Inbound'
  },
  {
    icon: Truck,
    title: 'Delivery Orders & Dispatch',
    desc: 'Pick, pack, and ship customer orders with automatic stock deductions, reservation checks, and dispatch records.',
    accent: '#EF4444',
    badge: 'Outbound'
  },
  {
    icon: ArrowLeftRight,
    title: 'Inter-Warehouse Transfers',
    desc: 'Move stock seamlessly between zones, racks, or distinct physical warehouses with transit tracking.',
    accent: '#F59E0B',
    badge: 'Transit'
  },
  {
    icon: Sliders,
    title: 'Inventory Cycle Counts',
    desc: 'Perform periodic physical counts, record discrepancies, and submit audited adjustments with reason codes.',
    accent: '#22C55E',
    badge: 'Auditing'
  },
  {
    icon: History,
    title: 'Immutable Stock Ledger',
    desc: 'Every single receipt, dispatch, and adjustment is recorded with timestamp, user ID, reference, and qty delta.',
    accent: '#06B6D4',
    badge: 'Compliance'
  },
  {
    icon: BarChart3,
    title: 'Role-Specific Dashboards',
    desc: 'Dedicated high-level views for Inventory Managers and high-speed operational views for Warehouse Staff.',
    accent: '#F5A623',
    badge: 'Intelligence'
  },
  {
    icon: Bell,
    title: 'Real-Time WebSocket Alerts',
    desc: 'Instant broadcast alerts whenever any SKU hits minimum reorder threshold across connected browser tabs.',
    accent: '#EF4444',
    badge: 'Live Sync'
  },
  {
    icon: ShieldCheck,
    title: 'Twilio 2FA & Secure Auth',
    desc: 'Enterprise-grade protection with phone OTP 2FA, JWT sessions, bcrypt hashing, and strict role permissions.',
    accent: '#22C55E',
    badge: 'Security'
  },
];

const stats = [
  { value: '100%', label: 'Real-time Sync', sub: 'WebSocket push events', accent: '#F5A623' },
  { value: '0-Lag', label: 'Ledger Auditability', sub: 'Atomic transactions', accent: '#22C55E' },
  { value: '3x', label: 'Faster Floor Picking', sub: 'Instant SKU search', accent: '#EF4444' },
  { value: '99.9%', label: 'System Reliability', sub: 'Enterprise uptime', accent: '#06B6D4' },
];

/* ─── Interactive Workflow Pipeline ──────────────────────────────── */
const workflows = [
  {
    id: 'inbound',
    title: '1. Inbound Receiving',
    icon: Boxes,
    accent: '#22C55E',
    summary: 'Supplier docks, inspects, and verifies incoming product batches against open receipts.',
    steps: [
      'Supplier ASN or delivery note matches open receipt',
      'Warehouse staff counts and logs received quantities',
      'System automatically flags over/under shipments',
      'Items booked into warehouse staging location'
    ]
  },
  {
    id: 'routing',
    title: '2. Zone Slotting & Transfer',
    icon: ArrowLeftRight,
    accent: '#F59E0B',
    summary: 'Stock is moved from dock staging into designated racks, bins, or distant facility branches.',
    steps: [
      'Pick path optimization directs staff to target bin location',
      'Internal transfer voucher created with source & destination',
      'Status transitions from Waiting to Ready to Done',
      'Real-time warehouse location balance updates'
    ]
  },
  {
    id: 'reconcile',
    title: '3. Physical Cycle Count',
    icon: Sliders,
    accent: '#06B6D4',
    summary: 'Staff verifies physical shelves against digital counts to catch shrinkage or misplacement.',
    steps: [
      'Blind counts performed by staff on mobile or handheld terminal',
      'Discrepancies flagged for manager sign-off',
      'Audited Stock Adjustment records reason (e.g. damaged, found)',
      'Ledger moves reflect final verified inventory balance'
    ]
  },
  {
    id: 'outbound',
    title: '4. Pick, Pack & Dispatch',
    icon: Truck,
    accent: '#EF4444',
    summary: 'Customer and client sales orders reserved, collected from shelves, and shipped out.',
    steps: [
      'Sales order creates Delivery Order in Ready state',
      'Stock reservation prevents double-allocation of same SKU',
      'Staff scans SKU barcode to confirm correct item picked',
      'Order marked Done and stock automatically deducted'
    ]
  }
];

/* ─── FAQ Items ──────────────────────────────────────────────────── */
const faqs = [
  {
    q: 'How does StockSense handle multiple warehouses and storage locations?',
    a: 'StockSense allows you to configure multiple physical warehouses (e.g., Central Distribution, Regional Hub, Cold Storage) and subdivide them into specific zones, aisles, and bin locations. Stock can be tracked per-location and transferred between them with full traceability.'
  },
  {
    q: 'What is the difference between Inventory Manager and Warehouse Staff dashboards?',
    a: 'Managers receive executive-level oversight including total valuation, low-stock restock alerts, operational breakdown charts, and warehouse distribution statistics. Warehouse Staff get an action-oriented workstation focused on quick SKU scanning, inbound check-in queues, and outbound pick-and-pack lists.'
  },
  {
    q: 'How does real-time low-stock alerting work?',
    a: 'Each product has a configurable minimum reorder threshold. The moment a delivery order or adjustment reduces stock below this quantity, a WebSocket event broadcasts a warning across the application and automatically triggers an alert on the dashboard and top navigation bell.'
  },
  {
    q: 'Is there a full audit trail for inventory compliance?',
    a: 'Yes. Every transaction (receipt, delivery, internal transfer, or adjustment) automatically posts an immutable record into the Stock Move Ledger. The ledger records product SKU, source/dest locations, quantity change, user, and timestamp.'
  },
  {
    q: 'Does StockSense support 2-Factor Authentication for floor devices?',
    a: 'Yes! Users can enable Twilio-powered SMS OTP verification during login, ensuring that only verified staff can access warehouse operations from warehouse floor tablets and workstations.'
  }
];

/* ─── HOME PAGE ──────────────────────────────────────────────────── */
const Home = () => {
  const heroRef = useRef(null);
  const pageRef = useRef(null);

  const { isAuthenticated, user } = useAuthStore();

  const [activeWorkflow, setActiveWorkflow] = useState('inbound');
  const [openFaq, setOpenFaq] = useState(null);
  const [previewTab, setPreviewTab] = useState('manager');
  const videoRef = useRef(null);

  // Resume video playback across page transitions
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const savedTime = parseFloat(localStorage.getItem('stocksense_hero_video_time') || '0');

    const handleLoadedMetadata = () => {
      if (savedTime && !isNaN(savedTime) && isFinite(savedTime) && savedTime < video.duration) {
        video.currentTime = savedTime;
      }
      video.play().catch(() => {});
    };

    if (video.readyState >= 1) {
      handleLoadedMetadata();
    } else {
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
    }

    const handleTimeUpdate = () => {
      if (video.currentTime) {
        localStorage.setItem('stocksense_hero_video_time', video.currentTime.toString());
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      if (video.currentTime) {
        localStorage.setItem('stocksense_hero_video_time', video.currentTime.toString());
      }
    };
  }, []);

  // Scroll-linked progress bar under the nav
  const { scrollYProgress } = useScroll();

  // Hero parallax
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(heroProgress, [0, 1], [0, -60]);
  const heroOpacity = useTransform(heroProgress, [0, 0.85], [1, 0]);
  const orbShiftA = useTransform(heroProgress, [0, 1], [0, 50]);
  const orbShiftB = useTransform(heroProgress, [0, 1], [0, -30]);

  return (
    <>
      <style>{`
        @keyframes svgDraw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes svgFill {
          to { opacity: 1; }
        }
        .dark .dark-svg-fill {
          fill: #FFFFFF !important;
        }
        @keyframes orbDriftA {
          0%, 100% { transform: translate(-50%, -80px) scale(1); }
          50% { transform: translate(-46%, -50px) scale(1.08); }
        }
        @keyframes orbDriftB {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(25px, -20px) scale(1.12); }
        }
        @keyframes pulseRing {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .orb-a { animation: orbDriftA 14s ease-in-out infinite; }
        .orb-b { animation: orbDriftB 18s ease-in-out infinite; }
        .orb-c { animation: orbDriftA 22s ease-in-out infinite reverse; }

        @media (prefers-reduced-motion: reduce) {
          .orb-a, .orb-b, .orb-c { animation: none !important; }
          [style*="stroke-dashoffset"] { stroke-dashoffset: 0 !important; opacity: 1 !important; }
        }
        .btn-lift {
          transition: transform 0.18s cubic-bezier(0.22,1,0.36,1), box-shadow 0.18s ease;
        }
        .btn-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(245,166,35,0.22);
        }
        .card-hover-elevate {
          transition: box-shadow 0.22s ease, transform 0.22s cubic-bezier(0.22,1,0.36,1), border-color 0.22s ease;
        }
        .card-hover-elevate:hover {
          box-shadow: 0 12px 35px rgba(0,0,0,0.08);
          transform: translateY(-3px);
        }
      `}</style>

      <div
        ref={pageRef}
        className="min-h-screen overflow-x-hidden bg-[#F1F5F9] dark:bg-[#080D1A] text-[#0F172A] dark:text-slate-100 transition-colors duration-300"
      >
        {/* Scroll Progress Bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-[2.5px] bg-[#F5A623] origin-left z-[60]"
          style={{ scaleX: scrollYProgress }}
        />

        {/* ── NAVIGATION ── */}
        <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 bg-white/85 dark:bg-[#080D1A]/90 backdrop-blur-xl border-b border-[#E2E8F0] dark:border-slate-800/70">
          <Link to="/" className="flex items-center gap-3 group focus:outline-none" title="StockSense Home">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#F5A623] text-slate-950 shadow-md shadow-amber-400/30 group-hover:scale-105 transition-transform duration-150">
              <Boxes className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-[#0F172A] dark:text-white text-lg tracking-tight group-hover:text-[#F5A623] transition-colors">
              Stock<span className="text-[#F5A623]">Sense</span>
            </span>
          </Link>

          {/* Quick Nav Icons — only visible when logged in */}
          {isAuthenticated && (
            <div className="hidden lg:flex items-center gap-1">
              {[
                { href: '#features', icon: Package, label: 'Features' },
                { href: '#workflow', icon: ArrowLeftRight, label: 'Workflows' },
                { href: '#preview', icon: BarChart3, label: 'Platform' },
                { href: '#architecture', icon: Layers, label: 'Architecture' },
                { href: '#faq', icon: Bell, label: 'FAQ' },
              ].map((nav) => {
                const NavIcon = nav.icon;
                return (
                  <a
                    key={nav.href}
                    href={nav.href}
                    className="relative group p-2.5 rounded-xl text-[#64748B] dark:text-slate-400 hover:text-[#F5A623] hover:bg-amber-500/10 transition-all duration-150"
                  >
                    <NavIcon size={20} />
                    <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2.5 py-1 text-[11px] font-bold text-white bg-slate-900 dark:bg-slate-700 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-150 whitespace-nowrap z-50">
                      {nav.label}
                    </span>
                  </a>
                );
              })}
            </div>
          )}

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {isAuthenticated ? (
              /* Logged-in: show user avatar + Go to Dashboard */
              <>
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-[#F5A623] text-slate-950 shadow-xs">
                    {user?.name ? user.name.slice(0, 2).toUpperCase() : '?'}
                  </div>
                  <span className="hidden md:block text-xs font-semibold text-[#0F172A] dark:text-white">{user?.name}</span>
                </div>
                <Link
                  to="/dashboard"
                  className="btn-lift flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-[#F5A623] hover:bg-[#F59E0B] text-slate-950 shadow-sm shadow-amber-400/30 transition-all"
                >
                  <BarChart3 size={15} />
                  Dashboard
                </Link>
              </>
            ) : (
              /* Logged-out: show Sign In + Get Started */
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-[#64748B] dark:text-slate-300 hover:text-[#0F172A] dark:hover:text-white px-3 py-1.5 transition-colors duration-150"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="btn-lift px-4 py-2 rounded-xl text-sm font-bold bg-[#F5A623] hover:bg-[#F59E0B] text-slate-950 shadow-sm shadow-amber-400/30 transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* ══════════════════════════════════════════════════════════
            HERO SECTION — Animated Canvas + SVG Draw + Dynamic Typing
        ══════════════════════════════════════════════════════════ */}
        <section
          ref={heroRef}
          className="relative flex flex-col items-center justify-center px-6 pt-16 pb-16 md:pt-24 md:pb-20 overflow-hidden min-h-[92vh]"
        >
          <AnimatedBG containerRef={heroRef} />
          <HeroSpotlight containerRef={heroRef} />
          <GridLines />

          {/* Ambient Glow Orbs */}
          <motion.div
            style={{ y: orbShiftA }}
            className="orb-a absolute top-[-80px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-400/10 dark:bg-amber-400/[0.12] blur-[100px] rounded-full pointer-events-none"
          />
          <motion.div
            style={{ y: orbShiftB }}
            className="orb-b absolute bottom-[40px] left-[10%] w-[300px] h-[250px] bg-green-400/8 dark:bg-green-400/10 blur-[80px] rounded-full pointer-events-none"
          />
          <motion.div
            style={{ y: orbShiftA }}
            className="orb-c absolute bottom-[60px] right-[8%] w-[260px] h-[220px] bg-cyan-400/8 dark:bg-cyan-400/10 blur-[80px] rounded-full pointer-events-none"
          />

          <motion.div
            style={{ y: heroY, opacity: heroOpacity }}
            className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center lg:items-center gap-10 lg:gap-14"
          >
            {/* ── LEFT: Text + CTAs ── */}
            <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
              {/* Top Pill */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 bg-amber-500/10 border border-amber-500/25 text-[#D97706] dark:text-amber-400 shadow-xs"
              >
                <Zap size={12} className="text-[#F5A623]" />
                Enterprise Warehouse &amp; Inventory Management Engine
              </motion.div>

              {/* SVG Headline Draw */}
              <SVGTextDraw />

              {/* Dynamic Typewriter Terminal */}
              <TypewriterSVG />

              {/* Subtitle Description */}
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 2.0, ease: [0.22, 1, 0.36, 1] }}
                className="text-base md:text-lg max-w-xl mb-10 leading-relaxed text-[#64748B] dark:text-slate-400"
              >
                StockSense delivers full end-to-end control across supplier receipts, pick/pack order
                deliveries, cross-zone transfers, and live audited cycle adjustments — backed by instant WebSocket alerts.
              </motion.p>

              {/* Hero CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 2.2, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4"
              >
                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    className="btn-lift relative flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-base font-bold bg-[#F5A623] hover:bg-[#F59E0B] text-slate-950 shadow-lg shadow-amber-400/25 transition-all group overflow-hidden"
                  >
                    <span className="absolute inset-0 -skew-x-12 translate-x-[-110%] group-hover:translate-x-[110%] bg-white/20 transition-transform duration-500 pointer-events-none" />
                    <BarChart3 size={17} />
                    Go to Dashboard
                    <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform duration-150" />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/signup"
                      className="btn-lift relative flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-base font-bold bg-[#F5A623] hover:bg-[#F59E0B] text-slate-950 shadow-lg shadow-amber-400/25 transition-all group overflow-hidden"
                    >
                      <span className="absolute inset-0 -skew-x-12 translate-x-[-110%] group-hover:translate-x-[110%] bg-white/20 transition-transform duration-500 pointer-events-none" />
                      Launch Live App
                      <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform duration-150" />
                    </Link>
                    <Link
                      to="/login"
                      className="btn-lift flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold bg-white/90 dark:bg-slate-800/90 border border-[#E2E8F0] dark:border-slate-700 text-[#0F172A] dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 backdrop-blur-sm transition-all"
                    >
                      Sign In to Dashboard <ChevronRight size={15} />
                    </Link>
                  </>
                )}
              </motion.div>
            </div>

            {/* ── RIGHT: Video Card ── */}
            <motion.div
              initial={{ opacity: 0, x: 40, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 2.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full lg:w-[640px] xl:w-[680px] flex-shrink-0"
            >
              {/* Outer glow ring */}
              <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-br from-amber-400/40 via-transparent to-amber-600/20 blur-sm pointer-events-none" />

              {/* Card */}
              <div className="relative rounded-2xl overflow-hidden border border-[#E2E8F0] dark:border-slate-700/80 shadow-2xl shadow-black/20 bg-[#0F172A] dark:bg-[#080D1A] aspect-video group">
                {/* Background grid pattern fallback */}
                <div
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{
                    backgroundImage: `linear-gradient(rgba(245,166,35,0.3) 1px, transparent 1px),
                                      linear-gradient(90deg, rgba(245,166,35,0.3) 1px, transparent 1px)`,
                    backgroundSize: '32px 32px',
                  }}
                />

                {/* Continuous Autoplaying Video */}
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  className="w-full h-full object-cover relative z-0"
                >
                  <source src="/video.mp4" type="video/mp4" />
                  <source src="/video.webm" type="video/webm" />
                  <source src="/video.mov" type="video/quicktime" />
                  <source src="/video" type="video/mp4" />
                </video>

                {/* Top bar chrome */}
                <div className="absolute top-0 left-0 right-0 h-8 bg-[#1E293B]/85 backdrop-blur-md flex items-center px-3 gap-1.5 border-b border-slate-700/50 z-10 pointer-events-none">
                  <div className="w-2 h-2 rounded-full bg-[#EF4444]" />
                  <div className="w-2 h-2 rounded-full bg-[#F5A623]" />
                  <div className="w-2 h-2 rounded-full bg-[#22C55E]" />
                  <div className="ml-3 flex-1 h-4 rounded bg-slate-700/60 text-[9px] text-slate-400 flex items-center px-2">
                    stocksense.app/live-preview
                  </div>
                </div>

                {/* Corner Live Status badge */}
                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-[10px] font-semibold text-white border border-white/10 flex items-center gap-1.5 z-10 pointer-events-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Preview
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>


        {/* ── KPI METRICS BANNER ── */}

        <section className="px-6 md:px-12 py-12 relative z-10 border-y border-[#E2E8F0] dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/30">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={i}
                whileHover={{ y: -3 }}
                className="relative text-center p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-[#E2E8F0] dark:border-slate-800 shadow-xs card-hover-elevate cursor-default overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: s.accent }} />
                <div className="text-3xl sm:text-4xl font-black mb-1" style={{ color: s.accent }}>
                  {s.value}
                </div>
                <div className="text-xs font-bold text-[#0F172A] dark:text-white">{s.label}</div>
                <div className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">{s.sub}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── INTERACTIVE WORKFLOW PIPELINE ── */}
        <section id="workflow" className="px-6 md:px-12 py-20 relative overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4 bg-emerald-500/10 text-[#22C55E] border border-emerald-500/20">
                End-to-End Traceability
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-[#0F172A] dark:text-white tracking-tight">
                How Inventory Moves in <span className="text-[#F5A623]">StockSense</span>
              </h2>
              <p className="text-sm md:text-base mt-3 max-w-xl mx-auto text-[#64748B] dark:text-slate-400">
                A continuous, automated lifecycle from dock receiving to customer dispatch.
              </p>
            </motion.div>

            {/* Workflow Step Buttons */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
              {workflows.map((w) => {
                const Icon = w.icon;
                const isActive = activeWorkflow === w.id;
                return (
                  <button
                    key={w.id}
                    onClick={() => setActiveWorkflow(w.id)}
                    className={`flex items-center gap-3 p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white dark:bg-slate-900 border-[#F5A623] shadow-md shadow-amber-500/10 ring-2 ring-amber-400/20'
                        : 'bg-white/60 dark:bg-slate-900/50 border-[#E2E8F0] dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform"
                      style={{
                        background: isActive ? `${w.accent}20` : 'rgba(100,116,139,0.1)',
                        color: isActive ? w.accent : '#64748B',
                      }}
                    >
                      <Icon size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#0F172A] dark:text-white">
                        {w.title}
                      </div>
                      <div className="text-[11px] text-[#64748B] dark:text-slate-400">
                        {isActive ? 'Selected' : 'View workflow'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Workflow Card Details */}
            {(() => {
              const active = workflows.find((w) => w.id === activeWorkflow) || workflows[0];
              const Icon = active.icon;
              return (
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-8 rounded-3xl bg-white dark:bg-slate-900/90 border border-[#E2E8F0] dark:border-slate-800 shadow-xl"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md"
                        style={{ background: active.accent, color: '#0F172A' }}
                      >
                        <Icon size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-[#0F172A] dark:text-white">
                          {active.title}
                        </h3>
                        <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">
                          {active.summary}
                        </p>
                      </div>
                    </div>

                    <Link
                      to="/login"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#F5A623] hover:bg-[#F59E0B] text-slate-950 transition-all shrink-0 self-start md:self-auto"
                    >
                      Process in App <ArrowRight size={14} />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {active.steps.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold text-white"
                            style={{ background: active.accent }}
                          >
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">
                            Phase {idx + 1}
                          </span>
                        </div>
                        <p className="text-xs font-medium leading-relaxed text-[#0F172A] dark:text-slate-300">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })()}
          </div>
        </section>

        {/* ── LIVE INTERACTIVE PLATFORM PREVIEW ── */}
        <section id="preview" className="px-6 md:px-12 py-20 bg-slate-100/70 dark:bg-slate-900/50 border-y border-[#E2E8F0] dark:border-slate-800/80">
          <div className="max-w-6xl mx-auto">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4 bg-amber-500/10 text-[#D97706] dark:text-amber-400 border border-amber-500/20">
                Interactive UI Showcase
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-[#0F172A] dark:text-white tracking-tight">
                Designed for Fast Execution &amp; High Precision
              </h2>
              <p className="text-sm md:text-base mt-2 max-w-lg mx-auto text-[#64748B] dark:text-slate-400">
                Switch between role perspectives to see how StockSense adapts to each team member.
              </p>

              {/* View Switcher Tabs */}
              <div className="inline-flex p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mt-6">
                <button
                  onClick={() => setPreviewTab('manager')}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    previewTab === 'manager'
                      ? 'bg-[#F5A623] text-slate-950 shadow-sm'
                      : 'text-[#64748B] dark:text-slate-400 hover:text-[#0F172A]'
                  }`}
                >
                  Inventory Manager View
                </button>
                <button
                  onClick={() => setPreviewTab('staff')}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    previewTab === 'staff'
                      ? 'bg-[#22C55E] text-white shadow-sm'
                      : 'text-[#64748B] dark:text-slate-400 hover:text-[#0F172A]'
                  }`}
                >
                  Warehouse Floor Staff View
                </button>
              </div>
            </motion.div>

            {/* Preview Card Mockup */}
            <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 shadow-2xl overflow-hidden relative">
              <div className="flex items-center justify-between pb-5 mb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-xs font-mono font-semibold text-[#64748B] dark:text-slate-400 ml-2">
                    {previewTab === 'manager' ? 'stocksense.app/manager/overview' : 'stocksense.app/staff/workstation'}
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Live Synced (WebSocket)
                </span>
              </div>

              {previewTab === 'manager' ? (
                /* Manager Mockup */
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                      <div className="text-[11px] font-bold text-[#D97706] uppercase tracking-wider">Total Valuation</div>
                      <div className="text-2xl font-black text-[#0F172A] dark:text-white mt-1">$1,248,500</div>
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">↑ 4.2% this month</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                      <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">In-Stock Health</div>
                      <div className="text-2xl font-black text-[#0F172A] dark:text-white mt-1">94.8%</div>
                      <div className="text-[11px] text-slate-500 mt-1">58 of 60 SKUs healthy</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20">
                      <div className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Reorder Required</div>
                      <div className="text-2xl font-black text-rose-600 mt-1">2 SKUs</div>
                      <div className="text-[11px] text-rose-500 font-semibold mt-1">Automatic alert triggered</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20">
                      <div className="text-[11px] font-bold text-cyan-600 uppercase tracking-wider">Active Warehouses</div>
                      <div className="text-2xl font-black text-[#0F172A] dark:text-white mt-1">4 Facilities</div>
                      <div className="text-[11px] text-slate-500 mt-1">23 storage locations</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-[#F5A623]" />
                      <span className="text-xs font-bold text-[#0F172A] dark:text-white">
                        Manager Restock Assistant: Supplier PO recommended for Industrial Steel Bearings (SKU: STL-BRG-01)
                      </span>
                    </div>
                    <Link to="/products" className="text-xs font-bold text-[#F5A623] hover:underline shrink-0">
                      View Catalog →
                    </Link>
                  </div>
                </div>
              ) : (
                /* Staff Mockup */
                <div className="space-y-6">
                  {/* SKU Barcode Bar */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 flex-1 px-3">
                      <ScanLine className="w-5 h-5 text-[#22C55E]" />
                      <span className="text-xs font-mono text-[#64748B] dark:text-slate-300">
                        Scan or enter SKU: [ SKU-9842-X ]
                      </span>
                    </div>
                    <button className="px-4 py-2 rounded-xl text-xs font-bold bg-[#22C55E] text-white shadow-xs">
                      Locate Bin Location
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                        <span>Inbound Dock Queue</span>
                        <Boxes size={16} className="text-[#22C55E]" />
                      </div>
                      <div className="text-2xl font-black text-[#0F172A] dark:text-white">16 Ready</div>
                      <div className="text-[11px] text-slate-500 mt-1">32 incoming shipments</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                        <span>Outbound Pick &amp; Pack</span>
                        <Truck size={16} className="text-[#EF4444]" />
                      </div>
                      <div className="text-2xl font-black text-[#0F172A] dark:text-white">25 Orders</div>
                      <div className="text-[11px] text-slate-500 mt-1">Fast shipping queue</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                        <span>Internal Transit</span>
                        <ArrowLeftRight size={16} className="text-[#F59E0B]" />
                      </div>
                      <div className="text-2xl font-black text-[#0F172A] dark:text-white">14 In-Transit</div>
                      <div className="text-[11px] text-slate-500 mt-1">Cross-warehouse transfers</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── COMPLETE FEATURES GRID ── */}
        <section id="features" className="px-6 md:px-12 py-20 relative overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4 bg-slate-200/70 dark:bg-slate-800 text-[#475569] dark:text-slate-300 border border-slate-300/50 dark:border-slate-700">
                Core Capabilities
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-[#0F172A] dark:text-white tracking-tight">
                Everything to Run a Modern Warehouse
              </h2>
              <p className="text-sm md:text-base mt-4 max-w-xl mx-auto text-[#64748B] dark:text-slate-400">
                Comprehensive inventory features built for accuracy, compliance, and speed.
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
                    viewport={{ once: true, margin: '-40px' }}
                    custom={i}
                    className="relative p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-[#E2E8F0] dark:border-slate-800 hover:border-[#F5A623]/40 shadow-xs card-hover-elevate group overflow-hidden"
                  >
                    <div
                      className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"
                      style={{ background: f.accent, transform: 'translate(30%, -30%)' }}
                    />
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                        style={{ background: `${f.accent}18`, border: `1px solid ${f.accent}35` }}
                      >
                        <Icon size={18} style={{ color: f.accent }} />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {f.badge}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#0F172A] dark:text-white mb-2">
                      {f.title}
                    </h3>
                    <p className="text-xs sm:text-sm leading-relaxed text-[#64748B] dark:text-slate-400">
                      {f.desc}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── ARCHITECTURE & SECURITY ── */}
        <section id="architecture" className="px-6 md:px-12 py-20 bg-slate-100/60 dark:bg-slate-900/40 border-y border-[#E2E8F0] dark:border-slate-800/80">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                  Engine Architecture
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-[#0F172A] dark:text-white tracking-tight">
                  High-Availability MERN Stack Built for Heavy Workloads
                </h2>
                <p className="text-sm md:text-base mt-4 text-[#64748B] dark:text-slate-400 leading-relaxed">
                  StockSense is engineered for real-world warehouse environments where dropped packets or delayed data are unacceptable.
                </p>

                <div className="space-y-4 mt-8">
                  {[
                    {
                      icon: Layers,
                      title: 'Atomic Mongo Transactions',
                      desc: 'Stock counts cannot desync. Movement ledger entries and balance changes execute within atomic database transactions.'
                    },
                    {
                      icon: RefreshCw,
                      title: '0-Lag WebSocket Push',
                      desc: 'Connected floor terminals receive real-time updates the second an inbound batch is checked in or a transfer moves.'
                    },
                    {
                      icon: Lock,
                      title: 'Twilio 2FA Verification',
                      desc: 'Optional phone OTP verification guards sensitive inventory operations and prevents unauthorized account takeovers.'
                    }
                  ].map((item, idx) => {
                    const ItemIcon = item.icon;
                    return (
                      <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-400/15 text-[#D97706] shrink-0 mt-0.5">
                          <ItemIcon size={18} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#0F172A] dark:text-white">{item.title}</h4>
                          <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Architecture Blueprint Card */}
              <div className="p-8 rounded-3xl bg-slate-900 text-white shadow-2xl border border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="text-xs font-mono font-bold text-[#F5A623] mb-2 uppercase tracking-widest">
                  System Blueprint
                </div>
                <h3 className="text-xl font-bold mb-6">StockSense Distributed Engine</h3>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
                    <span className="text-slate-300">Client UI Layer</span>
                    <span className="text-emerald-400 font-bold">React 18 + Vite + Tailwind</span>
                  </div>
                  <div className="text-center text-slate-500 text-xs">↓ REST API + WebSockets</div>
                  <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
                    <span className="text-slate-300">Backend API Services</span>
                    <span className="text-amber-400 font-bold">Node.js + Express + JWT</span>
                  </div>
                  <div className="text-center text-slate-500 text-xs">↓ Atomic Sessions</div>
                  <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
                    <span className="text-slate-300">Persistence Ledger</span>
                    <span className="text-cyan-400 font-bold">MongoDB Mongoose</span>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Role: Manager &amp; Staff RBAC</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Ready for Production
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FREQUENTLY ASKED QUESTIONS (FAQ) ── */}
        <section id="faq" className="px-6 md:px-12 py-20 relative">
          <div className="max-w-4xl mx-auto">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4 bg-slate-200/70 dark:bg-slate-800 text-[#475569] dark:text-slate-300 border border-slate-300/50 dark:border-slate-700">
                Common Questions
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-[#0F172A] dark:text-white tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-sm md:text-base mt-2 text-[#64748B] dark:text-slate-400">
                Everything you need to know about StockSense warehouse management.
              </p>
            </motion.div>

            <div className="space-y-3">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={index}
                    className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden transition-all shadow-xs"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full flex items-center justify-between p-5 text-left font-bold text-sm sm:text-base text-[#0F172A] dark:text-white cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        size={18}
                        className={`text-slate-400 transition-transform duration-200 shrink-0 ml-4 ${
                          isOpen ? 'rotate-180 text-[#F5A623]' : ''
                        }`}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#64748B] dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/80">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── CALL TO ACTION SECTION ── */}
        <section className="px-6 md:px-12 py-20 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="orb-a w-[600px] h-[300px] bg-amber-400/10 dark:bg-amber-400/15 blur-[100px] rounded-full" />
          </div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="relative max-w-3xl mx-auto text-center rounded-3xl p-10 md:p-14 bg-white/90 dark:bg-slate-900/90 border border-amber-500/25 shadow-xl shadow-amber-500/5 backdrop-blur-md"
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-[#F5A623] text-slate-950 shadow-lg shadow-amber-400/30">
              <Boxes className="w-7 h-7" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-[#0F172A] dark:text-white mb-4">
              Take Complete Control of Your Warehouse Today
            </h2>
            <p className="text-sm md:text-base mb-8 max-w-md mx-auto text-[#64748B] dark:text-slate-400">
              Set up your catalog, assign warehouse zones, and start processing shipments in minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="btn-lift relative flex items-center gap-2.5 px-9 py-3.5 rounded-xl text-base font-bold bg-[#F5A623] hover:bg-[#F59E0B] text-slate-950 shadow-md shadow-amber-400/20 transition-all group overflow-hidden"
                >
                  <span className="absolute inset-0 -skew-x-12 translate-x-[-110%] group-hover:translate-x-[110%] bg-white/20 transition-transform duration-500 pointer-events-none" />
                  <BarChart3 size={17} />
                  Open Dashboard
                  <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform duration-150" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="btn-lift relative flex items-center gap-2.5 px-9 py-3.5 rounded-xl text-base font-bold bg-[#F5A623] hover:bg-[#F59E0B] text-slate-950 shadow-md shadow-amber-400/20 transition-all group overflow-hidden"
                  >
                    <span className="absolute inset-0 -skew-x-12 translate-x-[-110%] group-hover:translate-x-[110%] bg-white/20 transition-transform duration-500 pointer-events-none" />
                    Create Free Account
                    <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform duration-150" />
                  </Link>
                  <Link
                    to="/login"
                    className="btn-lift flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 text-[#0F172A] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="px-6 md:px-12 py-8 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-[#E2E8F0] dark:border-slate-800 text-[#64748B] dark:text-slate-400 text-xs">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-[#F5A623] text-slate-950">
              <Boxes className="w-3.5 h-3.5" />
            </div>
            <span className="font-extrabold text-[#0F172A] dark:text-white text-sm">
              Stock<span className="text-[#F5A623]">Sense</span>
            </span>
          </Link>
          <p>© 2026 StockSense · Real-time Warehouse &amp; Inventory Management Platform</p>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link to="/dashboard" className="hover:text-[#0F172A] dark:hover:text-white transition-colors duration-150 font-semibold">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="hover:text-[#0F172A] dark:hover:text-white transition-colors duration-150">
                  Login
                </Link>
                <Link to="/signup" className="hover:text-[#0F172A] dark:hover:text-white transition-colors duration-150">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </footer>
      </div>
    </>
  );
};

export default Home;