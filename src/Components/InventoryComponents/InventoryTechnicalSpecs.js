import React from 'react';

const normalizeList = (specs) => {
  if (!Array.isArray(specs)) return [];
  return specs.filter((s) => {
    const p = String(s?.parameter ?? s?.key ?? '').trim();
    const v = String(s?.value ?? '').trim();
    return p && v;
  });
};

export const InventoryTechnicalSpecs = ({ technicalData }) => {
  const list = normalizeList(technicalData);
  if (!list.length) {
    return (
      <span className="sto-text-muted" style={{ fontSize: '12px' }}>
        —
      </span>
    );
  }
  return (
    <ul className="list-unstyled mb-0" style={{ maxWidth: '260px', fontSize: '11px', lineHeight: 1.4 }}>
      {list.map((s, i) => (
        <li key={s.id ?? `${s.parameter}-${i}`} className="text-light">
          <span className="sto-text-accent">{String(s.parameter ?? s.key).trim()}</span>
          <span className="sto-text-muted"> · </span>
          <span>{String(s.value).trim()}</span>
        </li>
      ))}
    </ul>
  );
};
