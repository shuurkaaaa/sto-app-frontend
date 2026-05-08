export const dashboardStyles = {
  container: {
    padding: '40px',
    background: '#0F172A',
    minHeight: '100vh',
    color: '#F1F5F9'
  },
  title: {
    margin: '0 0 20px 0', 
    fontSize: '24px',
    color: '#F8FAFC', 
    fontWeight: '600'
  },
  tableCard: {
    background: '#1E293B',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    overflow: 'hidden',
    border: '1px solid #334155'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    background: '#0F172A',
    padding: '16px',
    borderBottom: '2px solid #334155',
    color: '#94A3B8',
    fontSize: '14px',
  },
  tr: {
    borderBottom: '1px solid #334155',
    color: '#F1F5F9'
  },
  td: {
    padding: '16px',
    verticalAlign: 'middle',
  },
  label: {
    color: '#94A3B8', 
    fontSize: '13px', 
    marginBottom: '6px', 
    marginTop: 0,
    textTransform: 'uppercase',
    fontWeight: '600'
  },
  input: (hasError) => ({
    width: '100%', 
    padding: '12px', 
    borderRadius: '8px',
    background: '#0F172A', 
    border: '1px solid',
    borderColor: hasError ? '#ef4444' : '#334155', 
    color: '#F1F5F9',
    boxSizing: 'border-box',
    outline: 'none',
    fontSize: '14px'
  }),
  statusPending: { 
    padding: '6px 10px', 
    borderRadius: '8px', 
    backgroundColor: '#334155', 
    color: '#94A3B8', 
    border: 'none', 
    outline: 'none' 
  },
  statusInWork: { 
    padding: '6px 10px', 
    borderRadius: '8px', 
    backgroundColor: '#1E293B', 
    color: '#FBBF24', 
    border: '1px solid #FBBF24', 
    outline: 'none' 
  },
  statusReady: { 
    padding: '6px 10px', 
    borderRadius: '8px', 
    backgroundColor: '#064E3B', 
    color: '#4ADE80', 
    border: 'none', 
    outline: 'none' 
  },
  statusDone: { 
    padding: '6px 10px', 
    borderRadius: '8px', 
    backgroundColor: '#0F172A', 
    color: '#64748B', 
    border: 'none', 
    opacity: 0.6, 
    outline: 'none' 
  },
  modal: {
    overlay: {
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    },
    container: {
      background: '#1E293B', 
      width: '95%', 
      maxWidth: '600px',
      borderRadius: '20px', 
      padding: '30px', 
      color: '#f1f5f9',
      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
      border: '1px solid #334155'
    },
    tabs: {
      display: 'flex', 
      gap: '12px', 
      borderBottom: '1px solid #334155', 
      paddingBottom: '20px', 
      marginBottom: '25px'
    },
    tabActive: {
      background: '#3b82f6', 
      color: '#FFFFFF', 
      border: 'none', 
      padding: '12px 24px', 
      borderRadius: '10px', 
      cursor: 'pointer', 
      fontWeight: '600', 
      fontSize: '14px'
    },
    tabInactive: {
      background: 'transparent', 
      color: '#94A3B8', 
      border: '1px solid #334155', 
      padding: '12px 24px', 
      borderRadius: '10px', 
      cursor: 'pointer', 
      fontWeight: '600', 
      fontSize: '14px'
    },
    content: { 
      minHeight: '350px' 
    },
    footer: {
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      borderTop: '1px solid #334155', 
      paddingTop: '25px', 
      marginTop: '15px'
    },
    totalSum: { 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '4px' 
    },
    buttonGroup: { 
      display: 'flex', 
      gap: '12px' 
    },
    cancelBtn: {
      padding: '12px 26px', 
      background: 'transparent', 
      color: '#94A3B8',
      border: '1px solid #334155', 
      borderRadius: '10px', 
      cursor: 'pointer', 
      fontWeight: '600'
    },
    submitBtnActive: {
      padding: '12px 26px', 
      background: '#3b82f6', 
      color: '#FFFFFF', 
      border: 'none', 
      borderRadius: '10px', 
      cursor: 'pointer', 
      fontWeight: 'bold', 
      fontSize: '15px'
    },
    submitBtnDisabled: {
      padding: '12px 26px', 
      background: '#1e293b', 
      color: '#475569', 
      border: '1px solid #334155', 
      borderRadius: '10px', 
      cursor: 'not-allowed', 
      fontWeight: 'bold', 
      fontSize: '15px'
    }
  }
};