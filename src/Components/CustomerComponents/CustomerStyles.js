export const customerStyles = {
  wrapper: {
    backgroundColor: '#0F172A',
    minHeight: '100vh',
    width: '100%',
    padding: '40px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    flex: 1
  },
  content: {
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    boxSizing: 'border-box'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%'
  },
  searchBar: {
    width: '100%',
    padding: '16px 20px',
    borderRadius: '14px',
    border: '1px solid #334155',
    backgroundColor: '#1E293B',
    color: '#F1F5F9',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '24px',
    width: '100%',
    boxSizing: 'border-box'
  },
  card: {
    backgroundColor: '#1E293B',
    padding: '24px',
    borderRadius: '20px',
    border: '1px solid #334155',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box'
  },
  formGroup: {
    marginBottom: '15px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  input: {
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid #334155',
    backgroundColor: '#0F172A',
    color: '#F1F5F9',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box'
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  },
  modalContent: {
    background: '#1E293B',
    padding: '35px',
    borderRadius: '24px',
    width: '100%',
    maxWidth: '800px',
    maxHeight: '85vh',
    overflowY: 'auto',
    position: 'relative',
    color: '#F1F5F9',
    boxSizing: 'border-box'
  },
  historyItem: {
    padding: '15px',
    borderLeft: '4px solid #818CF8',
    backgroundColor: '#0F172A',
    marginBottom: '12px',
    borderRadius: '0 12px 12px 0',
    fontSize: '14px'
  },
  statusBadge: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '700',
    display: 'inline-block',
    marginBottom: '10px'
  },
  active: { backgroundColor: '#064E3B', color: '#34D399' },
  sleeping: { backgroundColor: '#78350F', color: '#FCD34D' },
  lost: { backgroundColor: '#7F1D1D', color: '#F87171' },
  bookingBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#818CF8',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    marginTop: '15px'
  },
  maintenanceAlert: {
    padding: '12px 16px',
    backgroundColor: '#450A0A',
    border: '1px solid #7F1D1D',
    borderRadius: '12px',
    color: '#FECACA',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px'
  },
  carBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: '#0F172A',
    borderRadius: '10px',
    marginBottom: '8px',
    border: '1px solid #334155'
  },
  brandIcon: {
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#334155',
    borderRadius: '50%',
    fontSize: '12px',
    color: '#94A3B8'
  },
  addCarDashedBtn: {
    width: '100%',
    padding: '12px',
    border: '1px dashed #818CF8',
    color: '#818CF8',
    background: 'transparent',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginTop: '10px'
  },
  addCarForm: {
    padding: '15px',
    background: '#0F172A',
    borderRadius: '12px',
    border: '1px solid #818CF8',
    marginTop: '10px'
  },
  saveBtn: {
    width: '100%',
    padding: '10px',
    background: '#818CF8',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold'
  }
};