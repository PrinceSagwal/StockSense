import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import {
  Boxes,
  Package,
  Truck,
  Sliders,
  History,
  LayoutDashboard,
  Warehouse,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowLeftRight,
} from 'lucide-react';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [operationsOpen, setOperationsOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(true);

  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-xs font-semibold'
        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent'
    }`;

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-40 flex flex-col transition-all duration-300 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-amber-400 text-slate-950 shadow-md">
            <Boxes className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight">
                Stock<span className="text-amber-500">Sense</span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-wider uppercase">
                Inventory System
              </p>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {/* Dashboard */}
        <NavLink to="/dashboard" className={navItemClass} title="Dashboard">
          <LayoutDashboard size={18} className="shrink-0" />
          {!collapsed && <span>Dashboard</span>}
        </NavLink>

        {/* Products */}
        <NavLink to="/products" className={navItemClass} title="Products">
          <Package size={18} className="shrink-0" />
          {!collapsed && <span>Products</span>}
        </NavLink>

        {/* Operations Section */}
        <div className="pt-3">
          {!collapsed ? (
            <button
              onClick={() => setOperationsOpen(!operationsOpen)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              <span>Operations</span>
              <ChevronDown
                size={12}
                className={`transition-transform duration-200 ${
                  operationsOpen ? 'rotate-0' : '-rotate-90'
                }`}
              />
            </button>
          ) : (
            <div className="h-px my-2 bg-slate-200 dark:bg-slate-800" />
          )}

          {(operationsOpen || collapsed) && (
            <div className="mt-1 space-y-1">
              <NavLink to="/receipts" className={navItemClass} title="Receipts">
                <Boxes size={17} className="shrink-0 text-emerald-500" />
                {!collapsed && <span>Receipts</span>}
              </NavLink>

              <NavLink to="/deliveries" className={navItemClass} title="Delivery Orders">
                <Truck size={17} className="shrink-0 text-rose-500" />
                {!collapsed && <span>Delivery Orders</span>}
              </NavLink>

              <NavLink to="/transfers" className={navItemClass} title="Internal Transfers">
                <ArrowLeftRight size={17} className="shrink-0 text-amber-500" />
                {!collapsed && <span>Internal Transfers</span>}
              </NavLink>

              <NavLink to="/adjustments" className={navItemClass} title="Inventory Adjustment">
                <Sliders size={17} className="shrink-0 text-slate-500 dark:text-slate-400" />
                {!collapsed && <span>Inventory Adjustment</span>}
              </NavLink>

              <NavLink to="/moves" className={navItemClass} title="Move History">
                <History size={17} className="shrink-0 text-slate-500 dark:text-slate-400" />
                {!collapsed && <span>Move History</span>}
              </NavLink>
            </div>
          )}
        </div>

        {/* Settings Section */}
        <div className="pt-3">
          {!collapsed ? (
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              <span>Settings</span>
              <ChevronDown
                size={12}
                className={`transition-transform duration-200 ${
                  settingsOpen ? 'rotate-0' : '-rotate-90'
                }`}
              />
            </button>
          ) : (
            <div className="h-px my-2 bg-slate-200 dark:bg-slate-800" />
          )}

          {(settingsOpen || collapsed) && (
            <div className="mt-1 space-y-1">
              <NavLink to="/settings/warehouses" className={navItemClass} title="Warehouses">
                <Warehouse size={17} className="shrink-0 text-slate-500 dark:text-slate-400" />
                {!collapsed && <span>Warehouses</span>}
              </NavLink>
            </div>
          )}
        </div>
      </div>

      {/* User / Profile Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40">
        <NavLink
          to="/profile"
          className="flex items-center gap-3 p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-white/5 transition-colors mb-1"
          title="My Profile"
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-400/40"
            />
          ) : (
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs bg-amber-400 text-slate-950 shadow-xs">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : <User size={14} />}
            </div>
          )}
          {!collapsed && (
            <div className="truncate flex-1">
              <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">{user?.name || 'User'}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 capitalize truncate">
                {user?.role?.replace('_', ' ') || 'Staff'}
              </div>
            </div>
          )}
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
          title="Logout"
        >
          <LogOut size={16} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
