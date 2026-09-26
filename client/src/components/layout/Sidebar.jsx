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

import useSidebarStore from '../../store/useSidebarStore';

const Sidebar = () => {
  const { collapsed, toggleSidebar } = useSidebarStore();
  const [operationsOpen, setOperationsOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(true);

  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const goToMainPage = () => {
    navigate('/');
  };

  // Active item: 3px left border with amber (#F5A623) + #FEF3C7 at 40% opacity
  // Hover state: smooth 150ms transition
  const navItemClass = ({ isActive }) =>
    `relative group flex items-center gap-3 ${
      collapsed ? 'justify-center px-0' : 'px-3'
    } py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ease-in-out ${
      isActive
        ? 'border-l-[3px] border-l-[#F5A623] bg-[#FEF3C7]/40 dark:bg-amber-400/10 text-[#D97706] dark:text-amber-400 shadow-xs font-semibold rounded-l-none'
        : 'border-l-[3px] border-l-transparent text-[#64748B] hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/5'
    }`;

  // Helper for rendering tooltip in collapsed mode
  const renderNavTooltip = (label) => {
    if (!collapsed) return null;
    return (
      <span className="pointer-events-none absolute left-full ml-2.5 px-2.5 py-1 text-xs font-semibold text-white bg-slate-900 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 whitespace-nowrap">
        {label}
      </span>
    );
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-40 flex flex-col transition-all duration-300 bg-[#FFFFFF] dark:bg-slate-900/95 backdrop-blur-xl border-r border-[#E2E8F0] dark:border-slate-800 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div
        className={`h-16 flex items-center border-b border-[#E2E8F0] dark:border-slate-800 relative transition-all duration-300 ${
          collapsed ? 'justify-center px-2' : 'justify-start px-4'
        }`}
      >
        <button
          type="button"
          onClick={goToMainPage}
          className={`flex items-center gap-3 overflow-hidden text-left cursor-pointer group focus:outline-none ${
            collapsed ? 'justify-center' : ''
          }`}
          title="Go to main page"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-[#F5A623] text-slate-950 shadow-md group-hover:scale-105 group-hover:shadow-amber-400/40 active:scale-95 transition-all duration-150">
            <Boxes className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="font-extrabold text-base text-[#0F172A] dark:text-white tracking-tight group-hover:text-[#F5A623] transition-colors">
                Stock<span className="text-[#F5A623]">Sense</span>
              </div>
              <p className="text-[10px] text-[#64748B] dark:text-slate-500 font-medium tracking-wider uppercase">
                Inventory System
              </p>
            </div>
          )}
        </button>

        {/* Clean edge toggle button — never overlaps brand icon */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="absolute -right-3.5 top-5 w-7 h-7 rounded-full bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 shadow-md flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:scale-110 active:scale-95 transition-all duration-150 cursor-pointer z-50 focus:outline-none"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {/* Dashboard */}
        <NavLink to="/dashboard" className={navItemClass} title="Dashboard">
          <LayoutDashboard size={18} className="shrink-0" />
          {!collapsed && <span>Dashboard</span>}
          {renderNavTooltip('Dashboard')}
        </NavLink>

        {/* Products */}
        <NavLink to="/products" className={navItemClass} title="Products">
          <Package size={18} className="shrink-0" />
          {!collapsed && <span>Products</span>}
          {renderNavTooltip('Products')}
        </NavLink>

        {/* Operations Section */}
        <div className="pt-3">
          {!collapsed ? (
            <button
              onClick={() => setOperationsOpen(!operationsOpen)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#64748B] dark:text-slate-500 hover:text-[#0F172A] dark:hover:text-slate-300 transition-colors duration-150"
            >
              <span>Operations</span>
              <ChevronDown
                size={12}
                className={`transition-transform duration-150 ${
                  operationsOpen ? 'rotate-0' : '-rotate-90'
                }`}
              />
            </button>
          ) : (
            <div className="h-px my-2 bg-[#E2E8F0] dark:bg-slate-800" />
          )}

          {(operationsOpen || collapsed) && (
            <div className="mt-1 space-y-1">
              <NavLink to="/receipts" className={navItemClass} title="Receipts">
                <Boxes size={17} className="shrink-0 text-[#22C55E]" />
                {!collapsed && <span>Receipts</span>}
                {renderNavTooltip('Receipts')}
              </NavLink>

              <NavLink to="/deliveries" className={navItemClass} title="Delivery Orders">
                <Truck size={17} className="shrink-0 text-[#EF4444]" />
                {!collapsed && <span>Delivery Orders</span>}
                {renderNavTooltip('Delivery Orders')}
              </NavLink>

              <NavLink to="/transfers" className={navItemClass} title="Internal Transfers">
                <ArrowLeftRight size={17} className="shrink-0 text-[#F59E0B]" />
                {!collapsed && <span>Internal Transfers</span>}
                {renderNavTooltip('Internal Transfers')}
              </NavLink>

              <NavLink to="/adjustments" className={navItemClass} title="Inventory Adjustment">
                <Sliders size={17} className="shrink-0 text-[#64748B] dark:text-slate-400" />
                {!collapsed && <span>Inventory Adjustment</span>}
                {renderNavTooltip('Inventory Adjustment')}
              </NavLink>

              <NavLink to="/moves" className={navItemClass} title="Move History">
                <History size={17} className="shrink-0 text-[#64748B] dark:text-slate-400" />
                {!collapsed && <span>Move History</span>}
                {renderNavTooltip('Move History')}
              </NavLink>
            </div>
          )}
        </div>

        {/* Settings Section */}
        <div className="pt-3">
          {!collapsed ? (
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#64748B] dark:text-slate-500 hover:text-[#0F172A] dark:hover:text-slate-300 transition-colors duration-150"
            >
              <span>Settings</span>
              <ChevronDown
                size={12}
                className={`transition-transform duration-150 ${
                  settingsOpen ? 'rotate-0' : '-rotate-90'
                }`}
              />
            </button>
          ) : (
            <div className="h-px my-2 bg-[#E2E8F0] dark:bg-slate-800" />
          )}

          {(settingsOpen || collapsed) && (
            <div className="mt-1 space-y-1">
              <NavLink to="/settings/warehouses" className={navItemClass} title="Warehouses">
                <Warehouse size={17} className="shrink-0 text-[#64748B] dark:text-slate-400" />
                {!collapsed && <span>Warehouses</span>}
                {renderNavTooltip('Warehouses')}
              </NavLink>
            </div>
          )}
        </div>
      </div>

      {/* User / Profile Footer */}
      <div className="p-3 border-t border-[#E2E8F0] dark:border-slate-800 bg-[#FFFFFF] dark:bg-slate-950/40">
        <NavLink
          to="/profile"
          className={`flex items-center gap-3 p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-white/5 transition-colors duration-150 mb-1 group relative ${
            collapsed ? 'justify-center' : ''
          }`}
          title="My Profile"
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-400/40"
            />
          ) : (
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs bg-[#F5A623] text-slate-950 shadow-xs">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : <User size={14} />}
            </div>
          )}
          {!collapsed && (
            <div className="truncate flex-1">
              <div className="text-xs font-semibold text-[#0F172A] dark:text-white truncate">{user?.name || 'User'}</div>
              <div className="text-[11px] text-[#64748B] dark:text-slate-400 capitalize truncate">
                {user?.role?.replace('_', ' ') || 'Staff'}
              </div>
            </div>
          )}
          {renderNavTooltip('My Profile')}
        </NavLink>

        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-[#EF4444] hover:bg-rose-500/10 transition-colors duration-150 cursor-pointer group relative ${
            collapsed ? 'justify-center' : ''
          }`}
          title="Logout"
        >
          <LogOut size={16} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
          {renderNavTooltip('Logout')}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
