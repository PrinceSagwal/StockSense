import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import PageWrapper from './PageWrapper';
import { Boxes } from 'lucide-react';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading, fetchUser } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, []);

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center"
        style={{ background: '#0A0A0A' }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
          style={{ background: '#F5C518', boxShadow: '0 0 30px rgba(245,197,24,0.5)' }}
        >
          <Boxes className="w-7 h-7 text-black animate-pulse" />
        </div>
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin mb-4"
          style={{ borderColor: 'rgba(245,197,24,0.3)', borderTopColor: '#F5C518' }}
        />
        <p className="text-sm font-medium" style={{ color: '#555' }}>
          Authenticating...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <PageWrapper>
      <Outlet />
    </PageWrapper>
  );
};

export default ProtectedRoute;
