import React from 'react';

export const StaffCard = ({ worker, onToggleStatus, onEdit, onDelete, onRestore, isArchived }) => {

  const isFree = worker.status === 'Вільний' && !worker.hasActiveOrder;

  return (
    <div className="sto-card sto-card-sm d-flex flex-column gap-2 w-100" style={{ opacity: isArchived ? 0.7 : 1 }}>
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <h3 className="m-0 fw-bold" style={{ fontSize: '18px', color: 'var(--sto-text)' }}>{worker.name}</h3>
          <div className="sto-text-accent fw-bold mb-1" style={{ fontSize: '12px' }}>
            {worker.staffCategory?.name || 'Без категорії'}
          </div>
          <p className="sto-text-muted m-0 small">{worker.role} • {worker.exp} р. досвіду</p>

          {!isArchived && !isFree && worker.currentCar && (
            <p className="sto-text-danger mt-1" style={{ fontSize: '11px' }}>
              Обслуговує: <br/> {worker.currentCar}
            </p>
          )}
        </div>

        <div className="d-flex gap-1">
          {!isArchived ? (
            <>
              <button onClick={() => onEdit(worker)} className="sto-btn-edit-sm">Ред.</button>
              <button onClick={() => onDelete(worker.id)} className="sto-btn-delete-sm">Вид.</button>
            </>
          ) : (
            <button onClick={() => onRestore(worker.id)} className="sto-btn-restore">Відновити</button>
          )}
        </div>
      </div>

      {!isArchived && (
        <div className={`d-flex justify-content-between align-items-center mt-2 px-3 py-2 rounded-3 fw-semibold small ${isFree ? 'sto-status-free' : 'sto-status-busy'}`}>
          <span className="fw-bold">{isFree ? 'Вільний' : 'Зайнятий'}</span>
          <button
            className={`btn btn-sm fw-semibold text-white border-0 ${isFree ? 'sto-btn-success' : 'sto-btn-secondary'}`}
            onClick={() => onToggleStatus(worker.id)}
          >
            {isFree ? 'Взяти' : 'Завершити'}
          </button>
        </div>
      )}

      <div className="sto-text-success border-top mt-3 pt-2" style={{ fontSize: '12px', borderTopColor: 'var(--sto-border)' }}>
        Зароблено ({worker.commissionPercent ?? 10}%): <strong>{worker.earnings?.toFixed(2)} грн</strong>
      </div>
    </div>
  );
};
