import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { CombinedProvider } from './Context/CombinedContext';

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

export default function App() {
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    setIsAuth(!!localStorage.getItem('token'));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuth(false);
  };

  return (
    <CombinedProvider>
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
          error:   { iconTheme: { primary: '#EF4444', secondary: '#F1F5F9' } },
        }}
      />

      <Router>
        <div className="d-flex" style={{ minHeight: '100vh', width: '100%' }}>
          {isAuth && <Sidebar onLogout={handleLogout} />}
          <div className={`sto-main ${isAuth ? 'sto-main--auth' : 'sto-main--guest'}`}>
            <Routes>
              <Route path="/" element={!isAuth ? <Login setAuth={setIsAuth} /> : <Navigate to="/analytics" />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/analytics" element={isAuth ? <Analytics /> : <Navigate to="/" />} />
              <Route path="/dashboard" element={isAuth ? <Dashboard /> : <Navigate to="/" />} />
              <Route path="/customers" element={isAuth ? <Customers /> : <Navigate to="/" />} />
              <Route path="/inventory" element={isAuth ? <Inventory /> : <Navigate to="/" />} />
              <Route path="/services" element={isAuth ? <Services /> : <Navigate to="/" />} />
              <Route path="/staff" element={isAuth ? <Staff /> : <Navigate to="/" />} />
              <Route path="/notifications" element={isAuth ? <Notifications /> : <Navigate to="/" />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </Router>
    </CombinedProvider>
  );
}
