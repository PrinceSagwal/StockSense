import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import useSocket from '../../hooks/useSocket';
import ThemeToggle from '../common/ThemeToggle';
import { Bell, User, AlertTriangle, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const Topbar = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'System Ready',
      message: 'StockSense inventory engine is operational.',
      time: 'Just now',
      read: false,
      type: 'info'
    }
  ]);
  const [showDropdown, setShowDropdown] = useState(false);

  useSocket('low_stock:alert', (data) => {
    toast(`⚠️ ${data.name || 'Product'} is low on stock (${data.quantity} left)`, {
      icon: '⚠️',
      duration: 6000,
    });
    setNotifications((prev) => [
      {
        id: Date.now(),
        title: 'Low Stock Alert',
        message: `${data.name || 'Product'} (SKU: ${data.sku || 'N/A'}) has dropped to ${data.quantity} units.`,
        time: 'Just now',
        read: false,
        type: 'warning',
        link: '/products'
      },
      ...prev
    ]);
  });

  useSocket('stock:updated', () => {});

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getPageTitle = (pathname) => {
    if (pathname.includes('/products/create')) return 'Add New Product';
    if (pathname.includes('/products/')) return 'Product Details';
    if (pathname.startsWith('/products')) return 'Products Management';
    if (pathname.includes('/receipts/create')) return 'Create Receipt';
    if (pathname.includes('/receipts/')) return 'Receipt Details';
    if (pathname.startsWith('/receipts')) return 'Receipts';
    if (pathname.includes('/deliveries/create')) return 'Create Delivery Order';
    if (pathname.includes('/deliveries/')) return 'Delivery Details';
    if (pathname.startsWith('/deliveries')) return 'Delivery Orders';
    if (pathname.includes('/transfers/create')) return 'Schedule Transfer';
    if (pathname.startsWith('/transfers')) return 'Internal Transfers';
    if (pathname.startsWith('/adjustments')) return 'Inventory Adjustment';
    if (pathname.startsWith('/moves')) return 'Stock Move History';
    if (pathname.startsWith('/settings/warehouses')) return 'Warehouse Settings';
    if (pathname.startsWith('/profile')) return 'My Profile';
    if (pathname.startsWith('/dashboard')) return 'Dashboard Overview';
    return 'StockSense';
  };

  return (
    <header className="h-16 sticky top-0 z-30 px-6 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      {/* Title */}
      <div>
        <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
          {getPageTitle(location.pathname)}
        </h1>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
          StockSense · Real-time Warehouse & Inventory Intelligence
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Dark/Light Mode Toggle Switch */}
        <ThemeToggle />

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowDropdown(!showDropdown);
              if (!showDropdown && unreadCount > 0) markAllAsRead();
            }}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors relative cursor-pointer"
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#F5A623] text-slate-950 text-[10px] font-bold rounded-full flex items-center justify-center notification-badge-pulse shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl py-3 z-50 animate-fade-in bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
              <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-900 dark:text-white text-sm">Notifications</span>
                {notifications.length > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs font-medium text-amber-500 hover:text-amber-400 transition-colors cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-400">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 flex items-start gap-3 transition-colors ${
                        !n.read ? 'bg-amber-500/5 dark:bg-amber-400/5' : ''
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {n.type === 'warning' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                        ) : (
                          <Package className="w-4 h-4 text-emerald-500" />
                        )}
                      </div>
                      <div className="flex-1 text-xs">
                        <div className="font-semibold text-slate-900 dark:text-white">{n.title}</div>
                        <div className="text-slate-600 dark:text-slate-400 mt-0.5">{n.message}</div>
                        <div className="text-slate-400 dark:text-slate-500 mt-1 text-[10px]">{n.time}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Pill */}
        <Link
          to="/profile"
          className="flex items-center gap-2.5 pl-3 border-l border-slate-200 dark:border-slate-800 hover:opacity-85 transition-opacity"
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-400/30"
            />
          ) : (
            <div className="w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs bg-amber-400 text-slate-950 shadow-xs">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : <User size={16} />}
            </div>
          )}
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
              {user?.name || 'User'}
            </div>
            <div className="text-[11px] capitalize text-slate-500 dark:text-slate-400">
              {user?.role?.replace('_', ' ') || 'Staff'}
            </div>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Topbar;
