const font = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const staffStyles = {
  container: { 
    padding: '30px 40px 30px 60px', 
    background: '#0F172A', 
    minHeight: '100vh', 
    color: '#F1F5F9',
    fontFamily: font,
    width: '100%',
    boxSizing: 'border-box'
  },
  grid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(4, 1fr)', 
    gap: '20px',
    marginTop: '20px',
    width: '100%',
    boxSizing: 'border-box'
  },
  card: { 
    background: '#1E293B', 
    padding: '20px', 
    borderRadius: '16px', 
    border: '1px solid #334155', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '10px',
    width: '100%',
    boxSizing: 'border-box'
  },
  name: { margin: 0, fontSize: '18px', fontWeight: '700', color: '#F1F5F9', fontFamily: font },
  info: { color: '#94A3B8', margin: 0, fontSize: '13px', fontFamily: font },
  editBtn: { 
    cursor: 'pointer', border: '1px solid #334155', background: '#0F172A', 
    padding: '5px 10px', borderRadius: '5px', color: '#F1F5F9', fontSize: '12px' 
  },
  deleteBtn: { 
    cursor: 'pointer', border: '1px solid #334155', background: 'transparent', 
    padding: '5px 10px', borderRadius: '6px', color: '#94A3B8', fontSize: '12px' 
  },
  restoreBtn: { 
    cursor: 'pointer', border: 'none', background: '#4ADE80', 
    padding: '5px 10px', borderRadius: '5px', color: '#0F172A', fontWeight: 'bold' 
  },
  statusBadge: (isFree) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '10px', 
    padding: '8px 12px', 
    borderRadius: '10px', 
    fontSize: '12px', 
    fontWeight: '600',
    background: isFree ? 'rgba(74, 222, 128, 0.1)' : 'rgba(251, 191, 36, 0.1)',
    color: isFree ? '#4ADE80' : '#FBBF24',
    border: `1px solid ${isFree ? 'rgba(74, 222, 128, 0.2)' : 'rgba(251, 191, 36, 0.2)'}`
  }),
  toggleBtn: (isFree) => ({ 
    background: isFree ? '#10B981' : '#334155', 
    border: isFree ? 'none' : '1px solid #475569', 
    padding: '5px 12px', 
    borderRadius: '6px', 
    cursor: 'pointer', 
    fontSize: '11px', 
    color: '#FFFFFF',
    fontWeight: '600',
    transition: 'all 0.2s ease'
  })
};

export default staffStyles;