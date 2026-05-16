import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { CombinedProvider } from './Context/CombinedContext';
import { apiClient } from './services/apiClient';

import Dashboard from './Pages/Dashboard';
import Inventory from './Pages/Inventory';
import Staff from './Pages/Staff';
import Analytics from './Pages/Analytics';
import Services from './Pages/Services';
import Notifications from './Pages/Notifications';
import Customers from './Pages/Customers';
import Login from './Pages/Login';
import ResetPassword from './Pages/ResetPassword';

const Sidebar = ({ onLogout }) => (
  <div className="sto-sidebar">
    <h2 className="sto-sidebar-title">СТО Адмін</h2>
    <nav>
      <NavLink to="/analytics" className="sto-nav-link">Аналітика</NavLink>
      <NavLink to="/dashboard" className="sto-nav-link">Журнал замовлень</NavLink>
      <NavLink to="/customers" className="sto-nav-link">Клієнтська база</NavLink>
      <NavLink to="/inventory" className="sto-nav-link">Склад запчастин</NavLink>
      <NavLink to="/services" className="sto-nav-link">Прайс-лист</NavLink>
      <NavLink to="/staff" className="sto-nav-link">Співробітники</NavLink>
      <NavLink to="/notifications" className="sto-nav-link">Сповіщення</NavLink>
    </nav>
    <button onClick={onLogout} className="sto-btn sto-btn-ghost mt-auto mb-3">
      Вийти
    </button>
  </div>
);

const AuthenticatedLayout = ({ onLogout }) => (
  <CombinedProvider>
    <div className="d-flex" style={{ minHeight: '100vh', width: '100%' }}>
      <Sidebar onLogout={onLogout} />
      <div className="sto-main sto-main--auth">
        <Outlet />
      </div>
    </div>
  </CombinedProvider>
);

export default function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem('token');

    if (!token || token === 'null' || !token.trim()) {
      setIsAuth(false);
      setAuthChecked(true);
      return undefined;
    }

    apiClient.get('/auth/me')
      .then(() => {
        if (!cancelled) setIsAuth(true);
      })
      .catch(() => {
        if (!cancelled) {
          localStorage.removeItem('token');
          setIsAuth(false);
        }
      })
      .finally(() => {
        if (!cancelled) setAuthChecked(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuth(false);
  };

  if (!authChecked) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '100vh', background: 'var(--sto-bg, #0f172a)' }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Завантаження...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 2000,
          style: {
            background: '#1E293B',
            color: '#F1F5F9',
            border: '1px solid #334155',
            borderRadius: '12px',
            padding: '12px',
            fontSize: '14px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          },
          success: { iconTheme: { primary: '#10B981', secondary: '#F1F5F9' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#F1F5F9' } },
        }}
      />

      <Router>
        <Routes>
          <Route path="/" element={!isAuth ? <Login setAuth={setIsAuth} /> : <Navigate to="/analytics" replace />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route
            element={isAuth ? <AuthenticatedLayout onLogout={handleLogout} /> : <Navigate to="/" replace />}
          >
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/services" element={<Services />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>

          <Route path="*" element={<Navigate to={isAuth ? "/analytics" : "/"} replace />} />
        </Routes>
      </Router>
    </>
  );
}
