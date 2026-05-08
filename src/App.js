import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; 

// Імпортуємо наш єдиний CombinedProvider
import { CombinedProvider } from './Context/CombinedContext';

// Pages
import Dashboard from './Pages/Dashboard';
import Inventory from './Pages/Inventory';
import Staff from './Pages/Staff';
import Analytics from './Pages/Analytics';
import Services from './Pages/Services';
import Notifications from './Pages/Notifications';
import Customers from './Pages/Customers';
import Login from './Pages/Login'; 

const Sidebar = ({ onLogout }) => {
  const getLinkStyle = ({ isActive }) => ({
    padding: '14px 16px',
    color: isActive ? '#818CF8' : '#94A3B8',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    transition: 'all 0.2s ease',
    background: isActive ? 'rgba(129, 140, 248, 0.1)' : 'transparent',
    borderLeft: isActive ? '4px solid #818CF8' : '4px solid transparent',
    display: 'block',
    marginBottom: '4px'
  });

  return (
    <div style={{ width: '240px', background: '#1E293B', height: '100vh', padding: '20px', position: 'fixed', left: 0, top: 0, display: 'flex', flexDirection: 'column', zIndex: 100 }}>
      <h2 style={{ textAlign: 'center', color: '#F1F5F9', marginBottom: '40px', fontSize: '20px' }}>СТО Адмін</h2>
      <nav style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <NavLink to="/analytics" style={getLinkStyle}>Аналітика</NavLink>
        <NavLink to="/dashboard" style={getLinkStyle}>Журнал замовлень</NavLink>
        <NavLink to="/customers" style={getLinkStyle}>Клієнтська база</NavLink>
        <NavLink to="/inventory" style={getLinkStyle}>Склад запчастин</NavLink>
        <NavLink to="/services" style={getLinkStyle}>Прайс-лист</NavLink>
        <NavLink to="/staff" style={getLinkStyle}>Співробітники</NavLink>
        <NavLink to="/notifications" style={getLinkStyle}>Сповіщення</NavLink>
      </nav>
      <button onClick={onLogout} style={{ marginTop: 'auto', marginBottom: '20px', cursor: 'pointer', background: 'transparent', color: '#94A3B8', border: '1px solid #334155', padding: '12px', borderRadius: '8px', fontWeight: '500' }}>
        Вийти
      </button>
    </div>
  );
};

export default function App() {
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsAuth(!!token);
    };
    checkAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuth(false);
  };

  return (
    <CombinedProvider>
      {/* Оновлений Toaster: тривалість 2 секунди, без зайвих елементів */}
      <Toaster 
        position="top-right" 
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 2000, // Глобально 2 секунди
          style: {
            background: '#1E293B',
            color: '#F1F5F9',
            border: '1px solid #334155',
            borderRadius: '12px',
            padding: '12px',
            fontSize: '14px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          },
          // Вимикаємо стандартні іконки, якщо вони заважають мінімалізму
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#F1F5F9',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#F1F5F9',
            },
          },
        }}
      />
      
      <Router>
        <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
          {isAuth && <Sidebar onLogout={handleLogout} />}
          <div style={{
            flex: 1,
            marginLeft: isAuth ? '240px' : '0',
            minHeight: '100vh',
            background: '#0F172A',
            width: isAuth ? 'calc(100vw - 240px)' : '100%',
            boxSizing: 'border-box',
            padding: '20px'
          }}>
            <Routes>
              <Route path="/" element={!isAuth ? <Login setAuth={setIsAuth} /> : <Navigate to="/analytics" />} />
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