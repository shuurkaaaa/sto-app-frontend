import React from 'react';

export const ServiceTime = ({ time }) => {
  if (!time) return null;
  return (
    <span
      className="sto-text-muted ms-2 px-2 py-1 rounded-1"
      style={{ background: 'var(--sto-bg)', fontSize: '11px' }}
    >
      {time} хв.
    </span>
  );
};
