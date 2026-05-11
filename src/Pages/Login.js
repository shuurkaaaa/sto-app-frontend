import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ForgotPasswordModal } from '../Components/AuthComponents/ForgotPasswordModal';
import { apiClient } from '../services/apiClient';

const Login = ({ setAuth }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
    setServerError('');
  };

  const validate = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) errors.email = 'Електронна пошта обов’язкова';
    else if (!emailRegex.test(formData.email)) errors.email = 'Невірний формат email';
    if (!formData.password) errors.password = 'Пароль обов’язковий';
    else if (formData.password.length < 8) errors.password = 'Мінімум 8 символів для безпеки';
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
      const res = await apiClient.post(`/auth/${endpoint}`, formData);
      const responseData = res.data;
      if (isLoginMode) {
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
      console.error('Login Error:', err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Помилка з’єднання з сервером';
      setServerError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ height: '100vh', background: 'var(--sto-bg)' }}
    >
      <form
        onSubmit={handleSubmit}
        className="sto-card text-center"
        style={{ padding: '40px', borderRadius: '20px', width: '100%', maxWidth: '400px' }}
        noValidate
      >
        <h1 className="text-light mb-4 fw-semibold" style={{ fontSize: '24px' }}>
          {isLoginMode ? 'Вхід до системи' : 'Реєстрація адміна'}
        </h1>

        {serverError && (
          <div
            className="rounded-3 mb-3 p-2 small sto-text-danger"
            style={{
              background: 'rgba(251, 113, 133, 0.1)',
              border: '1px solid rgba(251, 113, 133, 0.2)',
            }}
          >
            {serverError}
          </div>
        )}

        <div className="mb-3 text-start">
          <input
            name="email"
            type="email"
            placeholder="Email"
            className={`sto-input ${fieldErrors.email ? 'sto-input--error' : ''}`}
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />
          {fieldErrors.email && (
            <span className="d-block sto-text-danger small mt-1">{fieldErrors.email}</span>
          )}
        </div>

        <div className="mb-3 text-start">
          <input
            name="password"
            type="password"
            placeholder="Пароль"
            className={`sto-input ${fieldErrors.password ? 'sto-input--error' : ''}`}
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
          />
          {fieldErrors.password && (
            <span className="d-block sto-text-danger small mt-1">{fieldErrors.password}</span>
          )}
        </div>

        <button
          type="submit"
          className="sto-btn sto-btn-primary w-100 fw-bold"
          style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          disabled={loading}
        >
          {loading ? 'Обробка...' : isLoginMode ? 'Увійти' : 'Зареєструватися'}
        </button>

        <p
          className="sto-text-muted mt-3 small"
          style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
          onClick={() => {
            if (!loading) {
              setIsLoginMode(!isLoginMode);
              setFieldErrors({});
              setServerError('');
            }
          }}
        >
          {isLoginMode ? 'Немає акаунту? Створити' : 'Вже є акаунт? Увійти'}
        </p>

        {isLoginMode && (
          <p
            className="sto-text-dim small mt-1"
            style={{ cursor: 'pointer' }}
            onClick={() => !loading && setForgotOpen(true)}
          >
            Забули пароль?
          </p>
        )}
      </form>

      <ForgotPasswordModal isOpen={forgotOpen} onClose={() => setForgotOpen(false)} />
    </div>
  );
};

export default Login;
