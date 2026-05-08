export const analyticsStyles = {
  section: {
    background: '#1E293B',
    padding: '25px',
    borderRadius: '20px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.3)',
    border: '1px solid #334155'
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: '20px',
    fontSize: '18px',
    color: '#F1F5F9',
    borderBottom: '1px solid #334155',
    paddingBottom: '10px'
  },
  card: {
    background: '#1E293B',
    padding: '20px',
    borderRadius: '15px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    flex: 1,
    minWidth: '200px',
    border: '1px solid #334155'
  },
  cardLabel: {
    color: '#94A3B8',
    margin: '0 0 10px 0',
    fontSize: '14px',
    fontWeight: '600'
  },
  leaderItem: (isFirst) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px',
    background: isFirst ? '#0F172A' : '#0F172A',
    borderRadius: '12px',
    borderLeft: `4px solid ${isFirst ? '#818CF8' : '#334155'}`,
    marginBottom: '10px'
  }),
  progressBar: {
    width: '100%',
    height: '8px',
    background: '#0F172A',
    borderRadius: '4px',
    overflow: 'hidden',
    marginTop: '5px'
  },
  progressFill: (percent) => ({
    width: `${percent}%`,
    height: '100%',
    background: '#818CF8',
    borderRadius: '4px',
    transition: 'width 0.5s ease-in-out'
  })
};