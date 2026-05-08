import React from 'react';

export const ServiceSuggestions = ({ serviceName }) => {
  const suggestionsMap = {
    "Заміна мастила": ["Мастильний фільтр", "Прокладка пробки"],
    "Діагностика ходової": ["Сайлентблоки", "Шарові опори"],
    "Заміна ГРМ": ["Помпа", "Антифриз"]
  };

  const hints = suggestionsMap[serviceName];
  if (!hints) return null;

  return (
    <div style={{ fontSize: '11px', color: '#4ADE80', marginTop: '4px' }}>
      Рекомендуємо запропонувати: {hints.join(', ')}
    </div>
  );
};