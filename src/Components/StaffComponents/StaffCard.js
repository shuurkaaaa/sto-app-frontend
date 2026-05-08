import React from 'react';
import staffStyles from './StaffStyles';

export const StaffCard = ({ worker, onToggleStatus, onEdit, onDelete, onRestore, isArchived }) => {
  const isFree = worker.status === 'Вільний';

  return (
    <div style={{ ...staffStyles.card, opacity: isArchived ? 0.7 : 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={staffStyles.name}>{worker.name}</h3>
          <div style={{ fontSize: '12px', color: '#818CF8', fontWeight: 'bold', marginBottom: '4px' }}>
            {/* Відображаємо назву з об'єкта staffCategory, який підтягує Prisma */}
            {worker.staffCategory?.name || 'Без категорії'}
          </div>
          <p style={staffStyles.info}>{worker.role} • {worker.exp} р. досвіду</p>
          
          {!isArchived && !isFree && worker.currentCar && (
             <p style={{ fontSize: '11px', color: '#F87171', marginTop: '5px' }}>
               Обслуговує: <br/> {worker.currentCar}
             </p>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '5px' }}>
          {!isArchived ? (
            <>
              <button onClick={() => onEdit(worker)} style={staffStyles.editBtn}>Ред.</button>
              <button onClick={() => onDelete(worker.id)} style={staffStyles.deleteBtn}>Вид.</button>
            </>
          ) : (
            <button onClick={() => onRestore(worker.id)} style={staffStyles.restoreBtn}>Відновити</button>
          )}
        </div>
      </div>
      
      {!isArchived && (
        <div style={staffStyles.statusBadge(isFree)}>
          <span style={{ fontWeight: 'bold', color: isFree ? '#4ADE80' : '#FBBF24' }}>
            {isFree ? 'Вільний' : 'Зайнятий'}
          </span>
          
          <button 
            style={staffStyles.toggleBtn(isFree)} 
            onClick={() => onToggleStatus(worker.id)}
          >
            {isFree ? 'Взяти' : 'Завершити'}
          </button>
        </div>
      )}
      
      <div style={{ marginTop: '15px', fontSize: '12px', color: '#4ADE80', borderTop: '1px solid #334155', pt: '10px' }}>
        Зароблено (10%): <strong>{worker.earnings?.toFixed(2)} грн</strong>
      </div>
    </div>
  );
};