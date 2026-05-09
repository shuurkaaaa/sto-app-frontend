import React from 'react';

export const ServiceExport = ({ services }) => {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head><title>Прайс-лист СТО</title></head>
        <body style="font-family: sans-serif; padding: 40px;">
          <h1 style="text-align: center;">Прайс-лист послуг СТО</h1>
          <table border="1" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f4f4f4;">
                <th style="padding: 10px;">Назва послуги</th>
                <th style="padding: 10px;">Категорія</th>
                <th style="padding: 10px;">Ціна</th>
              </tr>
            </thead>
            <tbody>
              ${services.map(s => `
                <tr>
                  <td style="padding: 10px;">${s.name}</td>
                  <td style="padding: 10px;">${s.category}</td>
                  <td style="padding: 10px;">${s.price} грн</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <button onClick={handlePrint} className="sto-btn sto-btn-secondary">
      Друкувати прайс
    </button>
  );
};
