import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';

const API = 'http://127.0.0.1:5000/api/auth';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let cancelled = false;
    const verify = async () => {
      try {
        await axios.get(`${API}/reset-password/${token}/verify`);
        if (!cancelled) setTokenValid(true);
      } catch (err) {
        if (!cancelled) setVerifyError(err.response?.data?.message || 'Посилання недійсне');
      } finally {
        if (!cancelled) setVerifying(false);
      }
    };
    if (token) verify();
    else { setVerifying(false); setVerifyError('Токен відсутній у посиланні'); }
    return () => { cancelled = true; };
  }, [token]);

  const validate = () => {
    const errors = {};
    if (!password || password.length < 8) errors.password = 'Мінімум 8 символів';
    if (password !== confirm) errors.confirm = 'Паролі не співпадають';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API}/reset-password`, { token, newPassword: password });
      setSuccess(res.data?.message || 'Пароль успішно змінено.');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Помилка сервера');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center"
         style={{ height: '100vh', background: 'var(--sto-bg)' }}>
      <div className="sto-card text-center"
           style={{ padding: '40px', borderRadius: '20px', width: '100%', maxWidth: '420px' }}>
        <h1 className="text-light mb-4 fw-semibold" style={{ fontSize: '22px' }}>
          Новий пароль
        </h1>

        {verifying && <p className="sto-text-muted">Перевірка посилання...</p>}

        {!verifying && !tokenValid && (
          <>
            <div className="rounded-3 mb-3 p-2 small sto-text-danger"
                 style={{ background: 'rgba(251, 113, 133, 0.1)', border: '1px solid rgba(251, 113, 133, 0.2)' }}>
              {verifyError}
            </div>
            <Link to="/" className="sto-btn sto-btn-primary w-100">До входу</Link>
          </>
        )}

        {!verifying && tokenValid && !success && (
          <form onSubmit={handleSubmit} noValidate>
            {serverError && (
              <div className="rounded-3 mb-3 p-2 small sto-text-danger"
                   style={{ background: 'rgba(251, 113, 133, 0.1)', border: '1px solid rgba(251, 113, 133, 0.2)' }}>
                {serverError}
              </div>
            )}

            <div className="mb-3 text-start">
              <input
                type="password"
                placeholder="Новий пароль"
                className={`sto-input ${fieldErrors.password ? 'sto-input--error' : ''}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              {fieldErrors.password && (
                <span className="d-block sto-text-danger small mt-1">{fieldErrors.password}</span>
              )}
            </div>

            <div className="mb-3 text-start">
              <input
                type="password"
                placeholder="Підтвердьте пароль"
                className={`sto-input ${fieldErrors.confirm ? 'sto-input--error' : ''}`}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                disabled={loading}
              />
              {fieldErrors.confirm && (
                <span className="d-block sto-text-danger small mt-1">{fieldErrors.confirm}</span>
              )}
            </div>

            <button type="submit" className="sto-btn sto-btn-primary w-100 fw-bold" disabled={loading}>
              {loading ? 'Збереження...' : 'Зберегти новий пароль'}
            </button>
          </form>
        )}

        {success && (
          <>
            <div className="rounded-3 mb-3 p-2 small sto-text-success"
                 style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              {success}
            </div>
            <p className="sto-text-muted small">Перенаправлення на сторінку входу...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
