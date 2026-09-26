import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

import useSidebarStore from '../../store/useSidebarStore';

const PageWrapper = ({ children }) => {
  const location = useLocation();
  const { collapsed } = useSidebarStore();

  return (
    <div className="min-h-screen flex bg-[#F1F5F9] dark:bg-[#0A0F1E] text-[#0F172A] dark:text-slate-100 transition-colors duration-200">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col ${
          collapsed ? 'pl-20' : 'pl-64'
        } transition-all duration-300 min-h-screen`}
      >
        <Topbar />
        <main
          key={location.pathname}
          className="page-enter flex-1 p-6 md:p-8 max-w-[1600px] w-full mx-auto transition-all duration-300"
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default PageWrapper;
