import React, { useEffect, useState } from 'react';
import useDashboardStore from '../../store/useDashboardStore';
import useAuthStore from '../../store/useAuthStore';
import useSocket from '../../hooks/useSocket';
import ManagerDashboard from './ManagerDashboard';
import StaffDashboard from './StaffDashboard';
import { RefreshCw, UserCheck, ShieldCheck, ClipboardList } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuthStore();
  const dashboardState = useDashboardStore();
  const { isLoading, fetchAllDashboardData } = dashboardState;

  // Role detection: inventory_manager vs warehouse_staff
  const defaultView = user?.role === 'inventory_manager' ? 'manager' : 'staff';
  const [activeView, setActiveView] = useState(defaultView);

  // Sync activeView if user changes
  useEffect(() => {
    if (user?.role) {
      setActiveView(user.role === 'inventory_manager' ? 'manager' : 'staff');
    }
  }, [user?.role]);

  useEffect(() => {
    fetchAllDashboardData(activeView === 'manager' ? 'inventory_manager' : 'warehouse_staff');
  }, [activeView]);

  useSocket('stock:updated', () => {
    fetchAllDashboardData(activeView === 'manager' ? 'inventory_manager' : 'warehouse_staff');
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Role Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {activeView === 'manager' ? 'Executive Management' : 'Warehouse Floor'} Dashboard
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Logged in as <span className="font-semibold text-slate-700 dark:text-slate-200">{user?.name}</span> ({user?.role?.replace('_', ' ') || 'Staff'})
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Role Mode Toggle Switch (allows Managers to check Floor tasks, and Staff to see their floor view) */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setActiveView('manager')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeView === 'manager'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShieldCheck size={14} />
              <span>Manager</span>
            </button>
            <button
              onClick={() => setActiveView('staff')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeView === 'staff'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ClipboardList size={14} />
              <span>Staff Queue</span>
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => fetchAllDashboardData(activeView === 'manager' ? 'inventory_manager' : 'warehouse_staff')}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-xs transition-all disabled:opacity-40 cursor-pointer"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            <span className="hidden md:inline">Sync</span>
          </button>
        </div>
      </div>

      {/* Render Selected View */}
      {activeView === 'manager' ? (
        <ManagerDashboard data={dashboardState} />
      ) : (
        <StaffDashboard data={dashboardState} />
      )}
    </div>
  );
};

export default Dashboard;
