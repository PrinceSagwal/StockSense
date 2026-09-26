import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const PageWrapper = ({ children }) => {
  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#0A0F1E] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col pl-64 transition-all duration-300 min-h-screen">
        <Topbar />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default PageWrapper;
