import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout & Protected Route
import ProtectedRoute from './components/layout/ProtectedRoute';

// Public Pages
import Home from './pages/Home/Home';

// Auth Pages
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import ForgotPassword from './pages/Auth/ForgotPassword';

// Operations & App Pages
import Dashboard from './pages/Dashboard/Dashboard';
import ProductList from './pages/Products/ProductList';
import ProductCreate from './pages/Products/ProductCreate';
import ProductDetail from './pages/Products/ProductDetail';
import ReceiptList from './pages/Receipts/ReceiptList';
import ReceiptCreate from './pages/Receipts/ReceiptCreate';
import ReceiptDetail from './pages/Receipts/ReceiptDetail';
import DeliveryList from './pages/Deliveries/DeliveryList';
import DeliveryCreate from './pages/Deliveries/DeliveryCreate';
import DeliveryDetail from './pages/Deliveries/DeliveryDetail';
import TransferList from './pages/Transfers/TransferList';
import TransferCreate from './pages/Transfers/TransferCreate';
import AdjustmentPage from './pages/Adjustments/AdjustmentPage';
import MoveHistory from './pages/MoveHistory/MoveHistory';
import WarehouseSettings from './pages/Warehouses/WarehouseSettings';
import MyProfile from './pages/Profile/MyProfile';

import useThemeStore from './store/useThemeStore';

function App() {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: isDark ? '#111827' : '#FFFFFF',
            color: isDark ? '#F8FAFC' : '#0F172A',
            borderRadius: '12px',
            fontSize: '13px',
            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
            boxShadow: '0 16px 40px rgba(0,0,0,0.15)',
          },
          success: {
            iconTheme: { primary: '#10B981', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#fff' },
          },
        }}
      />

      <Routes>
        {/* Landing Page — loads directly at "/" */}
        <Route path="/" element={<Home />} />

        {/* Public Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Authenticated Application Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Products */}
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/create" element={<ProductCreate />} />
          <Route path="/products/:id" element={<ProductDetail />} />

          {/* Receipts (Incoming) */}
          <Route path="/receipts" element={<ReceiptList />} />
          <Route path="/receipts/create" element={<ReceiptCreate />} />
          <Route path="/receipts/:id" element={<ReceiptDetail />} />

          {/* Delivery Orders (Outgoing) */}
          <Route path="/deliveries" element={<DeliveryList />} />
          <Route path="/deliveries/create" element={<DeliveryCreate />} />
          <Route path="/deliveries/:id" element={<DeliveryDetail />} />

          {/* Internal Transfers */}
          <Route path="/transfers" element={<TransferList />} />
          <Route path="/transfers/create" element={<TransferCreate />} />

          {/* Inventory Adjustments & Move Ledger */}
          <Route path="/adjustments" element={<AdjustmentPage />} />
          <Route path="/moves" element={<MoveHistory />} />

          {/* Settings & Profile */}
          <Route path="/settings/warehouses" element={<WarehouseSettings />} />
          <Route path="/profile" element={<MyProfile />} />
        </Route>

        {/* 404 Catch All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
