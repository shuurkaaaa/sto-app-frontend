import React, { useState } from 'react';
import axios from 'axios';

const API = 'http://127.0.0.1:5000/api/auth';

export const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [devUrl, setDevUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setDevUrl('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Невірний формат email');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/forgot-password`, { email });
      setMessage(res.data?.message || 'Лист надіслано (якщо такий email існує).');
      if (res.data?.data?.devResetUrl) setDevUrl(res.data.data.devResetUrl);
    } catch (err) {
      setError(err.response?.data?.message || 'Помилка з’єднання з сервером');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setMessage('');
    setError('');
    setDevUrl('');
    onClose();
  };

  return (
    <div className="sto-modal-overlay" style={{ zIndex: 6000 }}>
      <div className="sto-modal" style={{ maxWidth: '420px' }}>
        <h2 className="mt-0 mb-3 text-light" style={{ fontSize: '20px' }}>Скидання паролю</h2>

        {!message ? (
          <form onSubmit={handleSubmit} noValidate>
            <p className="sto-text-muted small mb-3">
              Введіть email, на який зареєстровано акаунт. Ми надішлемо посилання для встановлення нового паролю.
            </p>

            {error && (
              <div className="rounded-3 mb-3 p-2 small sto-text-danger"
                   style={{ background: 'rgba(251, 113, 133, 0.1)', border: '1px solid rgba(251, 113, 133, 0.2)' }}>
                {error}
              </div>
            )}

            <div className="mb-3">
              <input
                type="email"
                placeholder="Email"
                className="sto-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </div>

            <div className="d-flex justify-content-end gap-2 mt-3">
              <button type="button" onClick={handleClose} className="sto-btn sto-btn-ghost" disabled={loading}>
                Скасувати
              </button>
              <button type="submit" className="sto-btn sto-btn-primary" disabled={loading}>
                {loading ? 'Надсилання...' : 'Надіслати лист'}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="rounded-3 mb-3 p-2 small sto-text-success"
                 style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              {message}
            </div>
            {devUrl && (
              <div className="rounded-3 mb-3 p-2 small"
                   style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', color: '#93c5fd' }}>
                <div className="fw-bold mb-1">DEV-режим (RESEND_API_KEY не заданий):</div>
                <a href={devUrl} className="text-info small" style={{ wordBreak: 'break-all' }}>{devUrl}</a>
              </div>
            )}
            <div className="d-flex justify-content-end">
              <button onClick={handleClose} className="sto-btn sto-btn-primary">Закрити</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
