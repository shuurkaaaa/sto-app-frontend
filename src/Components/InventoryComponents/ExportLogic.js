const escapeHtml = (value) => {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

const formatDate = () => new Date().toLocaleDateString('uk-UA');
const fileStamp = () => new Date().toISOString().slice(0, 10);

const buildDeficitRows = (items) => {
  return (items || []).map((i, idx) => {
    const current = Number(i.current ?? 0);
    const minimum = Number(i.minimum ?? i.min ?? 0);
    const qty = i.qty !== undefined ? Number(i.qty) : Math.max(1, minimum - current);
    const price = Number(i.price || 0);
    const sum = qty * price;
    return {
      idx: idx + 1,
      name: i.name || '',
      sku: i.stockKeepingUnit || i.sku || '—',
      current,
      minimum,
      qty,
      price,
      sum,
      supplier: i.supplier || '—',
      note: i.note || '',
    };
  });
};

export const exportDeficitToExcel = (items, comment = '', supplier = null) => {
  const rows = buildDeficitRows(items);
  if (rows.length === 0) {
    alert('Список порожній. Немає товарів у дефіциті.');
    return;
  }

  const totalQty = rows.reduce((s, r) => s + r.qty, 0);
  const totalSum = rows.reduce((s, r) => s + r.sum, 0);

  const styles = `
    <style>
      table { border-collapse: collapse; font-family: Arial, sans-serif; font-size: 12px; }
      th, td { border: 1px solid #999; padding: 6px 10px; }
      th { background: #1e293b; color: #ffffff; font-weight: bold; }
      td.num { mso-number-format: '\\#\\,\\#\\#0'; text-align: right; }
      td.money { mso-number-format: '\\#\\,\\#\\#0\\.00'; text-align: right; }
      tr.total td { background: #f1f5f9; font-weight: bold; }
    </style>
  `;

  const supplierLine = supplier && (supplier.name || supplier.contact)
    ? `<p>Постачальник: <b>${escapeHtml(supplier.name || '')}</b>${
        supplier.contact ? ` &nbsp; Контакт: ${escapeHtml(supplier.contact)}` : ''
      }</p>`
    : '';

  const headerHtml = `
    <p><b>Накладна на закупівлю</b> &nbsp; <span>Дата: ${formatDate()}</span></p>
    ${supplierLine}
    ${comment ? `<p>Коментар: ${escapeHtml(comment)}</p>` : ''}
  `;

  const tableHtml = `
    <table>
      <thead>
        <tr>
          <th>№</th>
          <th>Товар</th>
          <th>Артикул</th>
          <th>На складі</th>
          <th>Мін.</th>
          <th>Замовити</th>
          <th>Ціна</th>
          <th>Сума</th>
          <th>Постачальник</th>
          <th>Примітка</th>
        </tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (r) => `
            <tr>
              <td>${r.idx}</td>
              <td>${escapeHtml(r.name)}</td>
              <td>${escapeHtml(r.sku)}</td>
              <td class="num">${r.current}</td>
              <td class="num">${r.minimum}</td>
              <td class="num">${r.qty}</td>
              <td class="money">${r.price.toFixed(2)}</td>
              <td class="money">${r.sum.toFixed(2)}</td>
              <td>${escapeHtml(r.supplier)}</td>
              <td>${escapeHtml(r.note)}</td>
            </tr>
          `
          )
          .join('')}
        <tr class="total">
          <td colspan="5">Разом</td>
          <td class="num">${totalQty}</td>
          <td></td>
          <td class="money">${totalSum.toFixed(2)}</td>
          <td colspan="2"></td>
        </tr>
      </tbody>
    </table>
  `;

  const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns="http://www.w3.org/TR/REC-html40">
  <head>
    <meta charset="UTF-8" />
    <!--[if gte mso 9]>
    <xml>
      <x:ExcelWorkbook>
        <x:ExcelWorksheets>
          <x:ExcelWorksheet>
            <x:Name>Дефіцит</x:Name>
            <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
          </x:ExcelWorksheet>
        </x:ExcelWorksheets>
      </x:ExcelWorkbook>
    </xml>
    <![endif]-->
    ${styles}
  </head>
  <body>
    ${headerHtml}
    ${tableHtml}
  </body>
</html>`;

  const blob = new Blob(['\uFEFF', html], {
    type: 'application/vnd.ms-excel;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Закупівля_СТО_${fileStamp()}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const printDeficit = (items, comment = '', supplier = null) => {
  const rows = buildDeficitRows(items);
  if (rows.length === 0) {
    alert('Список порожній. Немає товарів у дефіциті.');
    return;
  }

  const totalQty = rows.reduce((s, r) => s + r.qty, 0);
  const totalSum = rows.reduce((s, r) => s + r.sum, 0);

  const supplierBlock =
    supplier && (supplier.name || supplier.contact)
      ? `<div class="supplier"><b>Постачальник:</b> ${escapeHtml(supplier.name || '—')}${
          supplier.contact ? ` &nbsp;|&nbsp; Контакт: ${escapeHtml(supplier.contact)}` : ''
        }</div>`
      : '';

  const html = `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8" />
  <title>Накладна на закупівлю — ${formatDate()}</title>
  <style>
    @page { size: A4; margin: 18mm; }
    * { box-sizing: border-box; }
    body { font-family: -apple-system, "Helvetica Neue", Arial, sans-serif; color: #0f172a; margin: 0; }
    .doc { max-width: 800px; margin: 0 auto; padding: 16px; }
    h1 { font-size: 22px; margin: 0 0 4px; letter-spacing: 0.5px; }
    .meta { display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 12px; color: #475569; }
    .comment { padding: 8px 12px; background: #f1f5f9; border-left: 3px solid #64748b; margin-bottom: 14px; font-size: 12px; }
    .supplier { padding: 8px 12px; background: #fef3c7; border-left: 3px solid #d97706; margin-bottom: 14px; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border: 1px solid #cbd5e1; padding: 6px 8px; vertical-align: top; }
    th { background: #0f172a; color: #ffffff; text-align: left; font-weight: 600; }
    td.num { text-align: right; white-space: nowrap; }
    tr.total td { background: #e2e8f0; font-weight: 700; }
    .footer { margin-top: 18px; font-size: 11px; color: #64748b; display: flex; justify-content: space-between; }
    .sign { margin-top: 36px; display: flex; justify-content: space-between; font-size: 12px; }
    .sign span { border-top: 1px solid #475569; padding-top: 4px; width: 220px; text-align: center; color: #475569; }
    @media print { .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="doc">
    <h1>Накладна на закупівлю</h1>
    <div class="meta">
      <div>Дата: <b>${formatDate()}</b></div>
      <div>Позицій: <b>${rows.length}</b></div>
    </div>
    ${supplierBlock}
    ${comment ? `<div class="comment">${escapeHtml(comment)}</div>` : ''}
    <table>
      <thead>
        <tr>
          <th style="width:32px;">№</th>
          <th>Товар</th>
          <th style="width:90px;">Артикул</th>
          <th style="width:60px;">Склад</th>
          <th style="width:60px;">Мін.</th>
          <th style="width:70px;">Замовити</th>
          <th style="width:80px;">Ціна</th>
          <th style="width:90px;">Сума</th>
          <th style="width:110px;">Постачальник</th>
        </tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (r) => `
            <tr>
              <td class="num">${r.idx}</td>
              <td>${escapeHtml(r.name)}${r.note ? `<div style="color:#64748b;font-size:11px;">${escapeHtml(r.note)}</div>` : ''}</td>
              <td>${escapeHtml(r.sku)}</td>
              <td class="num">${r.current}</td>
              <td class="num">${r.minimum}</td>
              <td class="num">${r.qty}</td>
              <td class="num">${r.price.toFixed(2)}</td>
              <td class="num">${r.sum.toFixed(2)}</td>
              <td>${escapeHtml(r.supplier)}</td>
            </tr>
          `
          )
          .join('')}
        <tr class="total">
          <td colspan="5">Разом</td>
          <td class="num">${totalQty}</td>
          <td></td>
          <td class="num">${totalSum.toFixed(2)}</td>
          <td></td>
        </tr>
      </tbody>
    </table>

    <div class="sign">
      <span>Підпис відповідального</span>
      <span>Підпис постачальника</span>
    </div>

    <div class="footer">
      <div>Згенеровано: ${new Date().toLocaleString('uk-UA')}</div>
      <div>СТО — внутрішній документ</div>
    </div>

    <div class="no-print" style="margin-top:24px; text-align:center;">
      <button onclick="window.print()" style="padding:8px 18px; background:#0f172a; color:#fff; border:none; border-radius:6px; cursor:pointer;">
        Надрукувати / Зберегти PDF
      </button>
    </div>
  </div>
  <script>
    window.addEventListener('load', () => {
      setTimeout(() => window.print(), 250);
    });
  </script>
</body>
</html>`;

  const printWindow = window.open('', '_blank', 'width=900,height=1100');
  if (!printWindow) {
    alert('Не вдалося відкрити вікно друку. Дозвольте спливаючі вікна для цього сайту.');
    return;
  }
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
};

export const exportToExcel = exportDeficitToExcel;
