import React, { useState } from 'react';
import { useNotifications } from '../Context/NotificationsContext';
import { toast } from 'react-hot-toast';

const Notifications = () => {
  const { notifications, loading, refresh, addNote, removeNote, clearAllManual } = useNotifications();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'medium',
    scheduledAt: ''
  });

  const ukTranslations = {
    manual: 'РУЧНА ЗАМІТКА',
    inventory: 'СКЛАД / ДЕФІЦИТ',
    service: 'ПЛАНОВЕ ТО',
    delay: 'ЗАТРИМКА РОБОТИ'
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
    if (!formData.title || formData.title.length < 3) {
      return toast.error("Заголовок занадто короткий");
    }
    if (!formData.message || formData.message.length < 5) {
      return toast.error("Додайте опис замітки");
    }
    
    addNote(formData);
    setFormData({ title: '', message: '', priority: 'medium', scheduledAt: '' });
    setIsFormOpen(false);
  };

  if (loading && notifications.length === 0) {
    return (
      <div style={styles.loaderContainer}>
        Синхронізація з сервером OneWayLogistic...
      </div>
    );
  }

  return (
    <div style={styles.pageWrapper}>
      {/* Шапка */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>Центр сповіщень</h1>
          <p style={styles.headerSubtitle}>Інтелектуальна система моніторингу 2026</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          {/* Кнопка масового видалення ручних заміток */}
          {notifications.some(n => !n.id.toString().includes('stock') && !n.id.toString().includes('service') && !n.id.toString().includes('delay')) && (
            <button 
              onClick={() => {
                if(window.confirm("Видалити всі ручні замітки? Системні сповіщення залишаться.")) {
                  clearAllManual();
                }
              }} 
              style={styles.clearButton}
            >
              🗑 Очистити сторінку
            </button>
          )}

          <button 
            onClick={() => setIsFormOpen(!isFormOpen)}
            style={{ 
              ...styles.toggleButton, 
              backgroundColor: isFormOpen ? '#EF4444' : '#3B82F6' 
            }}
          >
            {isFormOpen ? 'Закрити форму' : '+ Створити замітку'}
          </button>
          <button onClick={() => refresh()} style={styles.refreshButton}>Оновити</button>
        </div>
      </div>

      {/* Форма створення */}
      {isFormOpen && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>Нове персональне нагадування</h3>
          <form onSubmit={handleSubmit} style={styles.formGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Заголовок</label>
              <input 
                style={styles.input}
                placeholder="Що саме потрібно зробити?"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Коли нагадати? (необов'язково)</label>
              <input 
                type="datetime-local"
                style={styles.input}
                value={formData.scheduledAt}
                onChange={e => setFormData({...formData, scheduledAt: e.target.value})}
              />
            </div>
            <div style={{ ...styles.inputGroup, gridColumn: 'span 2' }}>
              <label style={styles.label}>Деталі (опис)</label>
              <textarea 
                style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
                placeholder="Вкажіть подробиці..."
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Пріоритетність</label>
              <select 
                style={styles.input}
                value={formData.priority}
                onChange={e => setFormData({...formData, priority: e.target.value})}
              >
                <option value="low">Низький</option>
                <option value="medium">Середній</option>
                <option value="high">Критичний</option>
              </select>
            </div>
            <button type="submit" style={styles.submitButton}>Зберегти в базі</button>
          </form>
        </div>
      )}

      {/* Список повідомлень */}
      {notifications.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={{ color: '#94A3B8', fontSize: '18px' }}>Активних сповіщень немає</p>
          <p style={{ color: '#475569', fontSize: '14px' }}>Повідомлення автоматично архівуються через 24 години</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {notifications.map(note => (
            <div key={note.id} style={{
              ...styles.noteCard,
              borderLeft: `8px solid ${getAccentColor(note.type, note.priority)}`,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                  <h4 style={styles.noteTitle}>{note.title}</h4>
                  <span style={styles.typeBadge}>
                    {ukTranslations[note.type] || 'СИСТЕМА'}
                  </span>
                </div>
                <p style={styles.noteMessage}>{note.message}</p>
              </div>
              
              <div style={styles.noteActions}>
                <span style={styles.noteDate}>{note.date}</span>
                {/* Кнопка видалення: прихована для системних сповіщень */}
                {!note.id.toString().includes('stock') && 
                 !note.id.toString().includes('service') && 
                 !note.id.toString().includes('delay') && (
                  <button 
                    onClick={() => removeNote(note.id)}
                    style={styles.deleteButton}
                  >
                    🗑 Видалити
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <footer style={styles.footer}>
        OneWayLogistic Intelligence System &copy; 2026
      </footer>
    </div>
  );
};

const styles = {
  pageWrapper: { padding: '40px', maxWidth: '1200px', margin: '0 auto', backgroundColor: '#0F172A', minHeight: '100vh', color: '#F1F5F9' },
  loaderContainer: { padding: '40px', backgroundColor: '#0F172A', minHeight: '100vh', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid #1E293B', paddingBottom: '24px' },
  headerTitle: { margin: 0, fontSize: '32px', fontWeight: '800' },
  headerSubtitle: { color: '#64748B', marginTop: '4px' },
  toggleButton: { color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' },
  refreshButton: { backgroundColor: '#1E293B', color: '#fff', border: '1px solid #334155', padding: '12px 24px', borderRadius: '10px', cursor: 'pointer' },
  clearButton: { backgroundColor: 'transparent', color: '#EF4444', border: '1px solid #EF4444', padding: '12px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s', marginRight: '8px' },
  formCard: { backgroundColor: '#1E293B', padding: '32px', borderRadius: '24px', marginBottom: '40px', border: '1px solid #334155' },
  formTitle: { marginTop: 0, marginBottom: '20px', color: '#3B82F6' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' },
  input: { backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '10px', padding: '12px', color: '#fff', outline: 'none' },
  submitButton: { alignSelf: 'flex-end', backgroundColor: '#10B981', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontWeight: 'bold', cursor: 'pointer' },
  noteCard: { backgroundColor: '#1E293B', padding: '24px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  noteTitle: { margin: 0, fontSize: '18px', fontWeight: '700' },
  typeBadge: { fontSize: '10px', color: '#94A3B8', backgroundColor: '#0F172A', padding: '4px 10px', borderRadius: '6px', fontWeight: '800' },
  noteMessage: { margin: '4px 0 0 0', color: '#CBD5E1', lineHeight: '1.5' },
  noteActions: { textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '140px' },
  noteDate: { fontSize: '13px', color: '#64748B', fontWeight: '700' },
  deleteButton: { background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', padding: 0, transition: 'opacity 0.2s' },
  emptyState: { textAlign: 'center', padding: '100px', backgroundColor: '#1E293B', borderRadius: '24px' },
  footer: { marginTop: '60px', textAlign: 'center', color: '#1E293B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }
};

export default Notifications;