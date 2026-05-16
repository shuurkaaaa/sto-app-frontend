import React, { useMemo, useState } from 'react';
import { PurchaseOrderModal } from './PurchaseOrderModal';

const minOf = (item) => Number(item.minimum ?? item.min ?? 0);
const curOf = (item) => Number(item.current ?? 0);

export const PurchaseOrderBtn = ({ items }) => {
  const [open, setOpen] = useState(false);

  const deficitCount = useMemo(
    () => (Array.isArray(items) ? items : []).filter(i => curOf(i) <= minOf(i)).length,
    [items]
  );

  const disabled = deficitCount === 0;

  return (
    <>
      <button
        className="sto-btn sto-btn-secondary d-flex align-items-center"
        style={{ opacity: disabled ? 0.6 : 1 }}
        onClick={() => !disabled && setOpen(true)}
        disabled={disabled}
        title={disabled ? 'Немає позицій у дефіциті' : 'Сформувати замовлення на дефіцитні позиції'}
      >
        ЗАМОВИТИ
        {deficitCount > 0 && (
          <span
            className="ms-2 px-2 py-1 rounded-3 text-white"
            style={{ background: '#EF4444', fontSize: '11px' }}
          >
            {deficitCount}
          </span>
        )}
      </button>

      {open && (
        <PurchaseOrderModal items={items} onClose={() => setOpen(false)} />
      )}
    </>
  );
};
