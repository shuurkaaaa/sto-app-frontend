import React, { useMemo, useState } from 'react';
import { apiClient } from '../../services/apiClient';
import { exportDeficitToExcel, printDeficit } from './ExportLogic';

const minOf = (item) => Number(item.minimum ?? item.min ?? 0);
const curOf = (item) => Number(item.current ?? 0);
const suggestedQty = (item) => Math.max(1, minOf(item) - curOf(item));

const buildInvoiceText = (rows, comment, supplier) => {
  const dateStr = new Date().toLocaleDateString('uk-UA');
  const lines = [`НАКЛАДНА НА ЗАКУПІВЛЮ (${dateStr})`, ''];

  if (supplier?.name?.trim()) {
    lines.push(`Постачальник: ${supplier.name.trim()}`);
  }
  if (supplier?.contact?.trim()) {
    lines.push(`Контакт: ${supplier.contact.trim()}`);
  }
  if (supplier?.name?.trim() || supplier?.contact?.trim()) {
    lines.push('');
  }

  rows.forEach((r, idx) => {
    const sku = r.sku || '—';
    lines.push(`${idx + 1}. ${r.name}`);
    lines.push(`   Артикул: ${sku}`);
    lines.push(`   Замовити: ${r.qty} шт. (на складі: ${r.current}, мін.: ${r.minimum})`);
    if (r.supplier) lines.push(`   Постачальник: ${r.supplier}`);
    if (r.note) lines.push(`   Примітка: ${r.note}`);
    lines.push('');
  });
  lines.push(`Всього позицій: ${rows.length}`);
  const totalQty = rows.reduce((s, r) => s + Number(r.qty || 0), 0);
  lines.push(`Загальна кількість: ${totalQty} шт.`);
  if (comment?.trim()) {
    lines.push('');
    lines.push(`Коментар: ${comment.trim()}`);
  }
  return lines.join('\n');
};

const sanitizeTelegramHandle = (raw) => {
  if (!raw) return '';
  let v = String(raw).trim();
  if (!v) return '';
  v = v.replace(/^https?:\/\/t\.me\//i, '');
  v = v.replace(/^@/, '');
  v = v.split('?')[0].split('/')[0];
  return v.replace(/[^A-Za-z0-9_]/g, '');
};

const sanitizeViberPhone = (raw) => {
  if (!raw) return '';
  const digits = String(raw).replace(/[^\d+]/g, '');
  if (!digits) return '';
  return digits.startsWith('+') ? digits : `+${digits.replace(/^0+/, '')}`;
};

const openDeepLink = (url) => {
  const a = document.createElement('a');
  a.href = url;
  a.rel = 'noopener noreferrer';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    if (a.parentNode) a.parentNode.removeChild(a);
  }, 1000);
};

const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return true;
  } catch {
    return false;
  }
};

export const PurchaseOrderModal = ({ items, onClose }) => {
  const deficitItems = useMemo(
    () => (Array.isArray(items) ? items : []).filter(i => curOf(i) <= minOf(i)),
    [items]
  );

  const [rows, setRows] = useState(() =>
    deficitItems.map(i => ({
      id: i.id,
      name: i.name,
      sku: i.stockKeepingUnit || i.sku || '',
      current: curOf(i),
      minimum: minOf(i),
      supplier: i.supplier || '',
      price: Number(i.price || 0),
      qty: suggestedQty(i),
      note: '',
      include: true,
    }))
  );
  const [supplier, setSupplier] = useState(() => {
    const first = deficitItems.find(i => i.supplier)?.supplier || '';
    return { name: first, contact: '' };
  });
  const [channel, setChannel] = useState('telegram');
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [hint, setHint] = useState('');
  const [previewText, setPreviewText] = useState('');

  const updateRow = (id, patch) => {
    setRows(prev => prev.map(r => (r.id === id ? { ...r, ...patch } : r)));
  };

  const activeRows = rows.filter(r => r.include && Number(r.qty) > 0);

  const totalSum = activeRows.reduce((s, r) => s + Number(r.qty) * Number(r.price || 0), 0);

  const saveOrderToDb = async () => {
    if (activeRows.length === 0) return null;
    const payloadItems = activeRows.map(r => ({
      name: r.name,
      stockKeepingUnit: r.sku,
      minimum: Number(r.qty) + Number(r.current),
      current: Number(r.current),
      price: Number(r.price || 0),
    }));
    try {
      setSaving(true);
      const calculatedTotal = activeRows.reduce(
        (sum, r) => sum + Number(r.qty) * Number(r.price || 0),
        0
      );
      const res = await apiClient.post('/purchase/create', {
        items: payloadItems,
        totalPrice: calculatedTotal,
        status: 'Надіслано',
      });
      return res.data;
    } catch (e) {
      console.error('Помилка БД:', e?.response?.data || e.message);
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async (selectedChannel) => {
    if (activeRows.length === 0) {
      setHint('Спочатку вкажіть хоча б одну позицію з кількістю > 0.');
      return;
    }
    const text = buildInvoiceText(activeRows, comment, supplier);
    const encoded = encodeURIComponent(text);

    const copied = await copyToClipboard(text);

    await saveOrderToDb();

    setPreviewText(text);

    if (selectedChannel === 'telegram') {
      const handle = sanitizeTelegramHandle(supplier.contact);
      if (handle) {
        window.location.href = `tg://resolve?domain=${handle}&text=${encoded}`;
        setTimeout(() => {
          openDeepLink(`https://t.me/${handle}`);
        }, 700);
        setHint(
          `Текст уже у буфері. Telegram має відкритися на чаті з @${handle}. Якщо чернетка не з'явилася (Telegram Web або старий клієнт) — натисніть ⌘V у полі повідомлення.`
        );
      } else {
        window.location.href = 'tg://msg';
        setTimeout(() => {
          openDeepLink(`https://t.me/share/url?url=${encodeURIComponent('Накладна на закупівлю')}&text=${encoded}`);
        }, 700);
        setHint(
          'Текст уже у буфері. Telegram відкрито — оберіть чат і натисніть ⌘V (або скористайтеся share-діалогом, що відкрився як запасний).'
        );
      }
      return;
    }

    if (selectedChannel === 'viber') {
      const phone = sanitizeViberPhone(supplier.contact);
      openDeepLink(`viber://forward?text=${encoded}`);
      setHint(
        phone
          ? `Текст у буфері. Viber відкрив пересилання — оберіть контакт ${phone} зі списку.`
          : 'Текст у буфері. Viber відкрив пересилання — оберіть отримувача зі списку контактів.'
      );
    }
  };

  const handleCopyAgain = async () => {
    if (!previewText) {
      const text = buildInvoiceText(activeRows, comment, supplier);
      setPreviewText(text);
      await copyToClipboard(text);
    } else {
      await copyToClipboard(previewText);
    }
    setHint('Текст замовлення скопійовано в буфер. Натисніть ⌘V у полі повідомлення Telegram/Viber.');
  };

  const handleExcel = async () => {
    if (activeRows.length === 0) {
      setHint('Спочатку вкажіть хоча б одну позицію з кількістю > 0.');
      return;
    }
    exportDeficitToExcel(activeRows, comment, supplier);
    await saveOrderToDb();
    setHint('Excel-файл сформовано та збережено.');
  };

  const handlePrint = async () => {
    if (activeRows.length === 0) {
      setHint('Спочатку вкажіть хоча б одну позицію з кількістю > 0.');
      return;
    }
    printDeficit(activeRows, comment, supplier);
    await saveOrderToDb();
  };

  const contactPlaceholder =
    channel === 'telegram'
      ? '@username або https://t.me/username'
      : '+380501234567';
  const contactLabel = channel === 'telegram' ? 'Telegram-нік' : 'Viber-телефон';

  return (
    <div className="sto-modal-overlay" onClick={onClose}>
      <div
        className="sto-modal sto-modal-lg"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 900 }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="m-0">Замовлення дефіцитних позицій</h4>
          <button
            onClick={onClose}
            className="sto-btn sto-btn-secondary"
            style={{ padding: '6px 12px' }}
          >
            ×
          </button>
        </div>

        {deficitItems.length === 0 ? (
          <div className="sto-text-muted">
            Немає товарів у дефіциті — список замовлення порожній.
          </div>
        ) : (
          <>
            <div className="sto-text-muted small mb-2">
              Позицій у дефіциті: <b className="text-light">{deficitItems.length}</b>.
              Перевірте та задайте фактичну кількість, яку потрібно замовити.
            </div>

            <div
              className="p-3 mb-3"
              style={{
                background: 'var(--sto-bg)',
                border: '1px solid var(--sto-border)',
                borderRadius: 12,
              }}
            >
              <div className="sto-text-muted small mb-2">Постачальник</div>
              <div className="d-flex gap-2 flex-wrap">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Назва постачальника"
                  value={supplier.name}
                  onChange={(e) => setSupplier(s => ({ ...s, name: e.target.value }))}
                  style={{ flex: '1 1 220px' }}
                />
                <div className="d-flex gap-2" style={{ flex: '1 1 280px' }}>
                  <select
                    className="form-select"
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    style={{ maxWidth: 130 }}
                  >
                    <option value="telegram">Telegram</option>
                    <option value="viber">Viber</option>
                  </select>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={contactPlaceholder}
                    value={supplier.contact}
                    onChange={(e) => setSupplier(s => ({ ...s, contact: e.target.value }))}
                    title={contactLabel}
                  />
                </div>
              </div>
              <div className="sto-text-muted small mt-2">
                {channel === 'telegram'
                  ? 'Вкажіть @username постачальника — Telegram відкриє саме цей чат із чернеткою (готовим текстом замовлення). Залишиться натиснути «Надіслати». Без @username відкриється загальний share-діалог.'
                  : 'Кнопка відкриє Viber у режимі пересилання з готовим текстом замовлення. Оберіть постачальника зі списку контактів.'}
              </div>
            </div>

            <div style={{ maxHeight: '45vh', overflowY: 'auto', borderRadius: 12 }}>
              <table className="table table-sm align-middle mb-0">
                <thead>
                  <tr className="sto-text-muted small">
                    <th style={{ width: 32 }}></th>
                    <th>Товар</th>
                    <th style={{ width: 110 }}>Артикул</th>
                    <th style={{ width: 90 }}>На складі</th>
                    <th style={{ width: 90 }}>Мін.</th>
                    <th style={{ width: 110 }}>Кількість</th>
                    <th>Примітка</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => (
                    <tr key={r.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={r.include}
                          onChange={(e) => updateRow(r.id, { include: e.target.checked })}
                        />
                      </td>
                      <td>
                        <div className="fw-semibold">{r.name}</div>
                        {r.supplier && (
                          <div className="sto-text-muted small">Постач.: {r.supplier}</div>
                        )}
                      </td>
                      <td className="sto-text-muted small">{r.sku || '—'}</td>
                      <td>{r.current}</td>
                      <td>{r.minimum}</td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          className="form-control form-control-sm"
                          value={r.qty}
                          onChange={(e) =>
                            updateRow(r.id, { qty: Math.max(0, Number(e.target.value) || 0) })
                          }
                          style={{ width: 90 }}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="опц."
                          value={r.note}
                          onChange={(e) => updateRow(r.id, { note: e.target.value })}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3">
              <label className="sto-text-muted small d-block mb-1">
                Загальний коментар (опційно)
              </label>
              <textarea
                className="form-control"
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Напр.: терміново, доставка до п'ятниці, оплата по факту..."
              />
            </div>

            <div className="d-flex justify-content-between align-items-center mt-3 small sto-text-muted">
              <div>
                Активних позицій: <b className="text-light">{activeRows.length}</b>
              </div>
              <div>
                Орієнтовна сума:{' '}
                <b className="sto-text-success">{totalSum.toLocaleString('uk-UA')} грн</b>
              </div>
            </div>

            {hint && (
              <div
                className="mt-2 p-2 small"
                style={{
                  background: 'var(--sto-bg)',
                  border: '1px solid var(--sto-border)',
                  borderRadius: 8,
                }}
              >
                {hint}
              </div>
            )}

            {previewText && (
              <div
                className="mt-2 p-2"
                style={{
                  background: 'var(--sto-bg)',
                  border: '1px solid var(--sto-border)',
                  borderRadius: 8,
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="sto-text-muted small">Текст замовлення (готовий до вставки):</span>
                  <button
                    type="button"
                    className="sto-btn sto-btn-secondary"
                    style={{ padding: '4px 10px', fontSize: 12 }}
                    onClick={handleCopyAgain}
                  >
                    Скопіювати
                  </button>
                </div>
                <pre
                  style={{
                    margin: 0,
                    maxHeight: 160,
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    fontSize: 11,
                    color: 'var(--sto-text-muted)',
                  }}
                >
                  {previewText}
                </pre>
              </div>
            )}

            <div className="sto-modal-footer mt-3 flex-wrap gap-2">
              <button
                onClick={onClose}
                className="sto-btn sto-btn-secondary"
                disabled={saving}
              >
                Скасувати
              </button>
              <div className="d-flex gap-2 flex-wrap">
                <button
                  onClick={() => handleSend(channel)}
                  className="sto-btn sto-btn-primary"
                  disabled={saving || activeRows.length === 0}
                  style={{
                    background: channel === 'telegram' ? '#0088cc' : '#7360F2',
                    borderColor: 'transparent',
                  }}
                >
                  {channel === 'telegram' ? 'Надіслати у Telegram' : 'Надіслати у Viber'}
                </button>
                <button
                  onClick={handleExcel}
                  className="sto-btn sto-btn-secondary"
                  disabled={saving || activeRows.length === 0}
                  style={{ color: '#34d399' }}
                >
                  Експорт Excel
                </button>
                <button
                  onClick={handlePrint}
                  className="sto-btn sto-btn-secondary"
                  disabled={saving || activeRows.length === 0}
                >
                  Друк PDF
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PurchaseOrderModal;
