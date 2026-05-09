import React from 'react';

export const ServiceSuggestions = ({ serviceName }) => {
  const suggestionsMap = {
    'Заміна мастила': ['Мастильний фільтр', 'Прокладка пробки'],
    'Діагностика ходової': ['Сайлентблоки', 'Шарові опори'],
    'Заміна ГРМ': ['Помпа', 'Антифриз'],
  };

  const hints = suggestionsMap[serviceName];
  if (!hints) return null;

  return (
    <div className="sto-text-success small mt-1">
      Рекомендуємо запропонувати: {hints.join(', ')}
    </div>
  );
};
