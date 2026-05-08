import React from 'react';

export const MasterWorkload = ({ allOrders, workers }) => {
  return (
    <div style={styles.workloadCard}>
      <div style={styles.title}>МОНІТОРИНГ ЗАВАНТАЖЕНОСТІ</div>
      <div style={styles.badgeContainer}>
        {workers.map(worker => {
          // Рахуємо замовлення за ID майстра та системним статусом IN_WORK
          const activeCount = allOrders.filter(o => 
            o.masterId === worker.id && o.status === 'IN_WORK'
          ).length;
          
          let statusColor = '#4ADE80'; 
          if (activeCount >= 2) statusColor = '#FBBF24'; 
          if (activeCount >= 4) statusColor = '#F87171'; 

          return (
            <div key={worker.id} style={styles.workerBadge}>
              <div style={{...styles.dot, backgroundColor: statusColor}}></div>
              <span style={styles.workerName}>
                {worker.name}: <b style={{color: statusColor}}>{activeCount}</b>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  workloadCard: { padding: '15px', backgroundColor: '#1E293B', borderRadius: '16px', border: '1px solid #334155', marginBottom: '20px' },
  title: { fontSize: '11px', fontWeight: 'bold', color: '#94A3B8', marginBottom: '10px', letterSpacing: '0.5px' },
  badgeContainer: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
  workerBadge: { display: 'flex', alignItems: 'center', gap: '8px', background: '#0F172A', padding: '6px 12px', borderRadius: '10px', border: '1px solid #334155' },
  dot: { width: '8px', height: '8px', borderRadius: '50%' },
  workerName: { fontSize: '13px', fontWeight: '500', color: '#F1F5F9' }
};