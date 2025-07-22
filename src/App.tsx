import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminProvider, useAdmin } from './contexts/AdminContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AddProduct from './components/AddProduct';
import ManageProducts from './components/ManageProducts';
import Orders from './components/Orders';
import StockManagement from './components/StockManagement';
import ShippingManagement from './components/ShippingManagement';
import Navbar from './components/Navbar';
import './App.css';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAdmin();
  return user?.isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAdmin();
  
  if (!user?.isAuthenticated) {
    return (
      <div style={{ width: '100vw', minHeight: '100vh' }}>
        {children}
      </div>
    );
  }

  return (
    <div className="app-layout">
      <div className="main-content">
        <Navbar />
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
};

const AppRoutes: React.FC = () => {
  const { user } = useAdmin();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={user?.isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-product"
        element={
          <ProtectedRoute>
            <AddProduct />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <ManageProducts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/stock"
        element={
          <ProtectedRoute>
            <StockManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/shipping"
        element={
          <ProtectedRoute>
            <ShippingManagement />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <div style={{ width: '100vw', minHeight: '100vh' }}>
      <AdminProvider>
        <Router>
          <AppLayout>
            <AppRoutes />
          </AppLayout>
        </Router>
      </AdminProvider>
    </div>
  );
};

export default App;
