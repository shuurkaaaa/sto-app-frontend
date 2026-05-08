import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({ setAuth }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({}); 
  const [serverError, setServerError] = useState(''); 
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
    setServerError('');
  };

  const validate = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email) {
      errors.email = 'Електронна пошта обов’язкова';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Невірний формат email';
    }

    if (!formData.password) {
      errors.password = 'Пароль обов’язковий';
    } else if (formData.password.length < 8) {
      errors.password = 'Мінімум 8 символів для безпеки';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError('');
    const endpoint = isLoginMode ? 'login' : 'register';

    try {
      // ВИКОРИСТОВУЄМО 127.0.0.1 ЗАМІСТЬ localhost ДЛЯ КРАЩОЇ СУМІСНОСТІ З SAFARI
      const res = await axios.post(`http://127.0.0.1:5000/api/auth/${endpoint}`, formData);
      
      const responseData = res.data;

      if (isLoginMode) {
        // Перевіряємо структуру відповіді залежно від твого бекенду
        const token = responseData.token || responseData.data?.token;
        if (token) {
          localStorage.setItem('token', token);
          setAuth(true);
          navigate('/analytics');
        }
      } else {
        setIsLoginMode(true);
        alert(responseData.message || 'Реєстрація успішна! Тепер увійдіть.');
        setFormData({ email: formData.email, password: '' });
      }
    } catch (err) {
      console.error("Login Error:", err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Помилка з’єднання з сервером 127.0.0.1:5000';
      setServerError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.card} noValidate>
        <h1 style={styles.title}>{isLoginMode ? 'Вхід до системи' : 'Реєстрація адміна'}</h1>

        {serverError && <div style={styles.serverError}>{serverError}</div>}

        <div style={styles.inputGroup}>
          <input
            name="email"
            type="email"
            placeholder="Email"
            style={{
              ...styles.input,
              borderColor: fieldErrors.email ? '#FB7185' : '#334155',
              boxShadow: fieldErrors.email ? '0 0 0 1px #FB7185' : 'none'
            }}
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />
          {fieldErrors.email && <span style={styles.errorText}>{fieldErrors.email}</span>}
        </div>

        <div style={styles.inputGroup}>
          <input
            name="password"
            type="password"
            placeholder="Пароль"
            style={{
              ...styles.input,
              borderColor: fieldErrors.password ? '#FB7185' : '#334155',
              boxShadow: fieldErrors.password ? '0 0 0 1px #FB7185' : 'none'
            }}
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
          />
          {fieldErrors.password && <span style={styles.errorText}>{fieldErrors.password}</span>}
        </div>

        <button 
          type="submit" 
          style={{
            ...styles.button,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }} 
          disabled={loading}
        >
          {loading ? 'Обробка...' : isLoginMode ? 'Увійти' : 'Зареєструватися'}
        </button>

        <p style={styles.toggle} onClick={() => {
            if (!loading) {
                setIsLoginMode(!isLoginMode);
                setFieldErrors({});
                setServerError('');
            }
        }}>
          {isLoginMode ? 'Немає акаунту? Створити' : 'Вже є акаунт? Увійти'}
        </p>
      </form>
    </div>
  );
};

// Стилі залишаються без змін
const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0F172A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  card: { background: '#1E293B', padding: '40px', borderRadius: '20px', width: '100%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' },
  title: { color: '#F1F5F9', marginBottom: '32px', fontSize: '24px', fontWeight: '600' },
  inputGroup: { marginBottom: '20px', textAlign: 'left' },
  input: { width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid', backgroundColor: '#0F172A', color: 'white', outline: 'none', boxSizing: 'border-box', fontSize: '16px', transition: 'all 0.2s ease' },
  errorText: { color: '#FB7185', fontSize: '12px', marginTop: '6px', marginLeft: '4px', display: 'block' },
  serverError: { background: 'rgba(251, 113, 133, 0.1)', color: '#FB7185', padding: '12px', borderRadius: '10px', marginBottom: '24px', fontSize: '14px', border: '1px solid rgba(251, 113, 133, 0.2)' },
  button: { width: '100%', padding: '14px', borderRadius: '12px', background: '#818CF8', color: 'white', border: 'none', fontWeight: 'bold', fontSize: '16px', marginTop: '10px', transition: 'background 0.2s ease' },
  toggle: { color: '#94A3B8', marginTop: '20px', cursor: 'pointer', fontSize: '14px', textDecoration: 'none' }
};

export default Login;