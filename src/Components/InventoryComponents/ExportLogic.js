export const exportToExcel = (items) => {
  const deficit = items.filter(i => Number(i.current) <= Number(i.min));
  
  if (deficit.length === 0) {
    alert("Список порожній. Немає товарів у дефіциті.");
    return;
  }

  const headers = ["Товар", "SKU", "На складі", "Мін. залишок", "До закупівлі", "Ціна", "Постачальник"];
  const rows = deficit.map(i => [
    i.name, i.sku, i.current, i.min, 
    Number(i.min) - Number(i.current), 
    i.price, i.supplier || "—"
  ]);

  // Формуємо CSV (з підтримкою кирилиці для Excel)
  const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(";")).join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `Закупівля_СТО_${new Date().toLocaleDateString()}.csv`;
  link.click();
};