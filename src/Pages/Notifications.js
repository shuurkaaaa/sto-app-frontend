import React, { useState } from 'react';
import { useNotifications } from '../Context/NotificationsContext';
import { toast } from 'react-hot-toast';

const Notifications = () => {
  const { notifications, loading, refresh, addNote, removeNote, clearAllManual } = useNotifications();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', message: '', priority: 'medium', scheduledAt: '' });

  const ukTranslations = {
    manual: 'РУЧНА ЗАМІТКА',
    inventory: 'СКЛАД / ДЕФІЦИТ',
    service: 'ПЛАНОВЕ ТО',
    delay: 'ЗАТРИМКА РОБОТИ',
  };

  const getAccentColor = (type, priority) => {
    if (priority === 'high') return '#EF4444';
    switch (type) {
      case 'inventory': return '#EF4444';
      case 'delay': return '#F59E0B';
      case 'service': return '#3B82F6';
      case 'manual': return '#10B981';
      default: return '#64748B';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || formData.title.length < 3) return toast.error('Заголовок занадто короткий');
    if (!formData.message || formData.message.length < 5) return toast.error('Додайте опис замітки');
    addNote(formData);
    setFormData({ title: '', message: '', priority: 'medium', scheduledAt: '' });
    setIsFormOpen(false);
  };

  const isManual = (note) =>
    !note.id.toString().includes('stock') &&
    !note.id.toString().includes('service') &&
    !note.id.toString().includes('delay');

  if (loading && notifications.length === 0) {
    return (
      <div className="sto-page d-flex align-items-center justify-content-center sto-text-muted" style={{ minHeight: '100vh' }}>
        Синхронізація з сервером OneWayLogistic...
      </div>
    );
  }

  return (
    <div className="sto-page" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div
        className="d-flex justify-content-between align-items-center mb-4 pb-3"
        style={{ borderBottom: '1px solid var(--sto-bg-2)' }}
      >
        <div>
          <h1 className="m-0 text-light fw-bold" style={{ fontSize: '32px' }}>Центр сповіщень</h1>
          <p className="sto-text-dim mt-1 m-0">Інтелектуальна система моніторингу 2026</p>
        </div>

        <div className="d-flex gap-2">
          {notifications.some(isManual) && (
            <button
              onClick={() => {
                if (window.confirm('Видалити всі ручні замітки? Системні сповіщення залишаться.')) {
                  clearAllManual();
                }
              }}
              className="sto-btn fw-bold"
              style={{ background: 'transparent', color: '#EF4444', border: '1px solid #EF4444' }}
            >
              🗑 Очистити сторінку
            </button>
          )}

          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="sto-btn fw-bold text-white"
            style={{ background: isFormOpen ? '#EF4444' : '#3B82F6' }}
          >
            {isFormOpen ? 'Закрити форму' : '+ Створити замітку'}
          </button>
          <button onClick={() => refresh()} className="sto-btn sto-btn-secondary">
            Оновити
          </button>
        </div>
      </div>

      {isFormOpen && (
        <div className="sto-card mb-4" style={{ borderRadius: '24px' }}>
          <h3 className="mt-0 mb-3" style={{ color: '#3B82F6' }}>Нове персональне нагадування</h3>
          <form onSubmit={handleSubmit} className="d-grid gap-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="d-flex flex-column gap-1">
              <label className="sto-label">Заголовок</label>
              <input
                className="sto-input"
                placeholder="Що саме потрібно зробити?"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="d-flex flex-column gap-1">
              <label className="sto-label">Коли нагадати? (необов'язково)</label>
              <input
                type="datetime-local"
                className="sto-input"
                value={formData.scheduledAt}
                onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
              />
            </div>
            <div className="d-flex flex-column gap-1" style={{ gridColumn: 'span 2' }}>
              <label className="sto-label">Деталі (опис)</label>
              <textarea
                className="sto-input sto-textarea"
                style={{ minHeight: '80px', resize: 'vertical' }}
                placeholder="Вкажіть подробиці..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>
            <div className="d-flex flex-column gap-1">
              <label className="sto-label">Пріоритетність</label>
              <select
                className="sto-select"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="low">Низький</option>
                <option value="medium">Середній</option>
                <option value="high">Критичний</option>
              </select>
            </div>
            <button
              type="submit"
              className="sto-btn fw-bold align-self-end text-white"
              style={{ background: '#10B981' }}
            >
              Зберегти в базі
            </button>
          </form>
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="sto-card text-center" style={{ padding: '100px', borderRadius: '24px' }}>
          <p className="sto-text-muted" style={{ fontSize: '18px' }}>Активних сповіщень немає</p>
          <p className="sto-text-dim small">
            Повідомлення автоматично архівуються через 24 години
          </p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {notifications.map((note) => (
            <div
              key={note.id}
              className="sto-card d-flex justify-content-between align-items-center"
              style={{
                borderLeft: `8px solid ${getAccentColor(note.type, note.priority)}`,
                borderRadius: '20px',
              }}
            >
              <div className="flex-grow-1">
                <div className="d-flex align-items-center gap-3 mb-2">
                  <h4 className="m-0 text-light fw-bold" style={{ fontSize: '18px' }}>
                    {note.title}
                  </h4>
                  <span
                    className="sto-text-muted fw-bold"
                    style={{
                      fontSize: '10px',
                      background: 'var(--sto-bg)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                    }}
                  >
                    {ukTranslations[note.type] || 'СИСТЕМА'}
                  </span>
                </div>
                <p className="m-0 mt-1" style={{ color: '#CBD5E1', lineHeight: '1.5' }}>
                  {note.message}
                </p>
              </div>

              <div
                className="text-end d-flex flex-column gap-2"
                style={{ minWidth: '140px' }}
              >
                <span className="sto-text-dim fw-bold small">{note.date}</span>
                {isManual(note) && (
                  <button
                    onClick={() => removeNote(note.id)}
                    className="border-0 p-0 fw-bold sto-text-danger small"
                    style={{ background: 'none', cursor: 'pointer' }}
                  >
                    🗑 Видалити
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <footer
        className="text-center mt-5 sto-text-bg2"
        style={{ color: 'var(--sto-bg-2)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}
      >
        OneWayLogistic Intelligence System &copy; 2026
      </footer>
    </div>
  );
};

export default Notifications;
