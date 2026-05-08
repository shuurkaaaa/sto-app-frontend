const palette = {
  bgPrimary: '#0F172A',
  bgSecondary: '#1E293B',
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  accent: '#818CF8',
  success: '#4ADE80',
  danger: '#F87171',
  border: '#334155'
};

export const inventoryStyles = {
  // 1. ГОЛОВНИЙ КОНТЕЙНЕР ТА КАРТКИ
  container: { 
    padding: '25px', 
    backgroundColor: palette.bgPrimary, 
    minHeight: '100vh',
    fontFamily: 'Inter, system-ui, sans-serif',
    color: palette.textPrimary
  },
  tableCard: { 
    backgroundColor: palette.bgSecondary, 
    borderRadius: '15px', 
    boxShadow: '0 4px 6px rgba(0,0,0,0.2)', 
    overflow: 'hidden',
    border: `1px solid ${palette.border}`
  },

  // 2. ТАБЛИЦЯ
  table: { 
    width: '100%', 
    borderCollapse: 'collapse' 
  },
  tableHeader: { 
    padding: '15px', 
    textAlign: 'left', 
    backgroundColor: palette.bgPrimary, 
    color: palette.textSecondary, 
    fontSize: '12px', 
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: '0.05em'
  },
  tableData: { 
    padding: '15px', 
    borderBottom: `1px solid ${palette.border}`, 
    fontSize: '14px',
    color: palette.textPrimary,
    verticalAlign: 'middle'
  },

  // 3. КНОПКИ
  mainAddButton: {
    padding: '12px 24px', 
    backgroundColor: palette.accent, 
    color: palette.textPrimary,
    borderRadius: '12px', 
    border: 'none', 
    cursor: 'pointer', 
    fontWeight: 'bold',
    boxShadow: `0 4px 12px rgba(129, 140, 248, 0.2)`,
    transition: 'all 0.2s'
  },
  purchaseButton: {
    padding: '12px 20px', 
    backgroundColor: palette.bgPrimary, 
    color: palette.textPrimary,
    borderRadius: '12px', 
    border: `1px solid ${palette.border}`, 
    cursor: 'pointer', 
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  miniButton: { 
    width: '28px', 
    height: '28px', 
    borderRadius: '6px', 
    border: `1px solid ${palette.border}`, 
    backgroundColor: palette.bgPrimary, 
    color: palette.textPrimary,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    transition: 'background 0.2s'
  },
  actionButton: {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    padding: '5px',
    borderRadius: '6px',
    fontSize: '18px',
    transition: 'transform 0.1s ease'
  },

  // 4. ТАБИ
  tab: (isActive) => ({
    padding: '10px 24px', 
    cursor: 'pointer', 
    borderRadius: '10px', 
    fontWeight: 'bold', 
    fontSize: '14px', 
    marginRight: '10px', 
    transition: '0.3s',
    backgroundColor: isActive ? palette.accent : palette.bgSecondary,
    color: isActive ? palette.textPrimary : palette.textSecondary,
    boxShadow: isActive ? '0 4px 10px rgba(129, 140, 248, 0.2)' : 'none',
    border: isActive ? `1px solid ${palette.accent}` : `1px solid ${palette.border}`
  }),

  // 5. ПОЛЯ ВВОДУ
  inlineInput: {
    border: `1px solid ${palette.border}`, 
    background: 'transparent',
    padding: '6px', 
    borderRadius: '6px', 
    width: '100%', 
    outline: 'none', 
    fontSize: '14px',
    color: palette.textPrimary,
    transition: 'all 0.2s'
  },

  // 6. МОДАЛЬНІ ВІКНА
  modalOverlay: {
    position: 'fixed', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.8)', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 9999,
    backdropFilter: 'blur(4px)',
    padding: '20px',
    boxSizing: 'border-box'
  },
  modalContent: {
    backgroundColor: palette.bgSecondary, 
    padding: '32px', 
    borderRadius: '24px',
    width: '100%',
    maxWidth: '550px',
    margin: 'auto',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    border: `1px solid ${palette.border}`,
    maxHeight: '90vh',
    overflowY: 'auto',
    boxSizing: 'border-box'
  },
  modalLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: palette.textSecondary,
    marginBottom: '6px',
    display: 'block',
    textTransform: 'uppercase'
  },
  modalInput: {
    width: '100%', 
    padding: '12px 16px', 
    marginBottom: '15px', 
    borderRadius: '10px',
    border: `1px solid ${palette.border}`, 
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: palette.bgPrimary,
    color: palette.textPrimary
  },

  // 7. СПЕЦІАЛЬНІ ФІЧІ
  imageThumbnail: {
    width: '45px', 
    height: '45px', 
    borderRadius: '8px', 
    objectFit: 'cover', 
    cursor: 'zoom-in', 
    border: `1px solid ${palette.border}`
  },
  compatibilityTag: {
    display: 'inline-block', 
    padding: '3px 10px', 
    margin: '2px',
    backgroundColor: palette.bgPrimary, 
    color: palette.accent, 
    borderRadius: '6px',
    fontSize: '11px', 
    fontWeight: '600', 
    border: `1px solid ${palette.accent}`,
    cursor: 'pointer'
  },
  logRow: {
    display: 'flex', 
    justifyContent: 'space-between', 
    padding: '12px',
    borderBottom: `1px solid ${palette.border}`, 
    fontSize: '13px',
    alignItems: 'center'
  },
  logType: (type) => ({
    fontWeight: 'bold',
    color: type === 'in' ? palette.success : palette.danger,
    backgroundColor: type === 'in' ? '#064e3b' : '#450a0a',
    padding: '2px 8px',
    borderRadius: '4px'
  }),

  // 8. СТАТУСИ ТА СПОВІЩЕННЯ
  stockBadge: (current, minimum) => ({
    padding: '6px 10px', 
    borderRadius: '8px', 
    fontSize: '13px', 
    fontWeight: '700',
    backgroundColor: Number(current) <= Number(minimum) ? '#450a0a' : '#064e3b',
    color: Number(current) <= Number(minimum) ? palette.danger : palette.success,
    display: 'inline-block',
    minWidth: '45px',
    textAlign: 'center'
  }),
  dropdownMenu: {
    position: 'absolute', 
    top: '55px', 
    right: 0, 
    zIndex: 100,
    backgroundColor: palette.bgSecondary, 
    padding: '10px', 
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.3)', 
    width: '240px', 
    border: `1px solid ${palette.border}`
  },
  menuItem: {
    width: '100%', 
    padding: '12px', 
    textAlign: 'left', 
    background: 'none',
    border: 'none', 
    cursor: 'pointer', 
    fontSize: '13px', 
    borderRadius: '8px', 
    color: palette.textPrimary, 
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px'
  }
};