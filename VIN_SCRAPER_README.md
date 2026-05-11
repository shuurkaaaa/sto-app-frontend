# 🌐 Веб-скрапінг для VIN-історії

## Опис

Система автоматичного збору даних про машини, ДТП та історію ремонту по VIN-коду. Використовує HTTP запити та Cheerio для швидкої обробки без необхідності в браузері.

## 🚀 Архітектура

### Компоненти системи

1. **vinScraper.js** - Головний скрапер
   - `scrapeVINHistory(vin)` - Агрегація даних з усіх джерел
   - `scrapeAutoRIA(vin)` - Пошук авто на autoRIA.com
   - `scrapeAccidentHistory(vin)` - Аналіз ДТП
   - `scrapeServiceHistory(vin)` - Рекомендації по сервісу
   - `searchRepairReviews(vin)` - Посилання на сервісні центри

2. **cacheService.js** - Кеш система
   - Зберігання в пам'яті та на диску
   - TTL 7 днів
   - Автоматичне видалення застарілих даних

3. **vinRoutes.js** - API endpoints
   - `GET /api/vin/cache-stats` - Статистика кешу
   - `POST /api/vin/scrape-test` - Тест скрапера (без авторизації)
   - `POST /api/vin/check` - Повна перевірка VIN (з авторизацією)
   - `GET /api/vin/history/:vin` - Отримати історію з кешу

## 📊 Джерела даних

### AutoRIA.com
- ✅ HTTP запити до API та веб-парсинг
- Информація: марка, модель, рік, ціна, пробіг
- Кеш: 7 днів

### Реєстр ДТП
- ✅ Аналіз VIN для визначення країни виробництва
- ⚠️ Державні реєстри (обмежено доступні)
- Попередження для проблемних ринків

### Історія сервісу
- ✅ Рекомендації по ТО
- ✅ Посилання на оригінальні сервісні записи
- 📋 Переліки обов'язкових перевірок

### Сервісні центри
- ✅ Посилання на Google Maps, Яндекс.Карти, 2GIS
- ✅ Форуми власників AutoRIA
- ⭐ Відгуки та рейтинги

## 🔧 Технічні параметри

```javascript
// Axios конфігурація
const axiosInstance = axios.create({
  timeout: 10000,              // 10 сек максимум
  headers: {
    'User-Agent': '...',       // Маскування браузера
    'Accept-Language': 'uk-UA',// Українська мова
  }
});

// Кеш
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 днів
const CACHE_DIR = '/path/to/cache'; // Персистентне зберігання
```

## 📝 Приклади використання

### Frontend (React)

```javascript
// Запит до скрапера
const response = await axios.post('/api/vin/scrape-test', {
  vin: 'WBAEB53442VJ88386'
}, {
  headers: { Authorization: `Bearer ${token}` }
});

// Результат
{
  success: true,
  data: {
    vin: 'WBAEB53442VJ88386',
    timestamp: '2026-05-10T...',
    sources: {
      autoRIA: { found: true, brand: 'BMW', ... },
      accidents: { accidents: [...], warnings: null },
      services: { recommendations: [...] },
      reviews: { searchLinks: [...] }
    },
    summary: '🚗 Машина: BMW...\n📋 Джерела...'
  }
}
```

### Backend (Node.js)

```javascript
const { scrapeVINHistory } = require('./services/vinScraper');

const result = await scrapeVINHistory('WBAEB53442VJ88386');

// Результат включає:
result.vin                    // Нормалізований VIN
result.timestamp              // Час скрапінгу
result.sources.autoRIA        // Дані про авто
result.sources.accidents      // Інформація про ДТП
result.sources.services       // Рекомендації по сервісу
result.sources.reviews        // Посилання на центри
result.summary                // Текстовий опис
```

## ⚙️ Встановлення залежностей

```bash
npm install axios cheerio

# Вже встановлено:
npm list puppeteer cheerio axios
```

## 🧪 Тестування

### Запуск тестів

```bash
# Локальне тестування (Node.js)
node sto-backend/test-scraper.js

# Результат: Тестування 5 різних VIN-кодів
✓ BMW 2002 (Європа)
✓ Honda 2007 (США)
✓ Lexus 2020 (Японія)
✓ Hyundai (Південна Корея)
✓ Peugeot (Франція)
```

### Curl тести

```bash
# Тест скрапера без авторизації
curl -X POST http://localhost:5000/api/vin/scrape-test \
  -H "Content-Type: application/json" \
  -d '{"vin":"WBAEB53442VJ88386"}'

# Результат: JSON з усіма данними

# Статистика кешу
curl http://localhost:5000/api/vin/cache-stats

# Результат:
{
  "success": true,
  "cacheStats": {
    "memoryCacheSize": 2,
    "diskCacheFiles": 2,
    "diskCacheSizeKB": "45.32"
  }
}
```

## 🚀 Продуктивність

| VIN | Перший запит | З кешу | Переважний час |
|-----|-------------|--------|----------------|
| Перший | ~3-5 сек | <100 мс | 50-100x швидше |
| Дублікат | Скипнуто | <100 мс | Миттєво |
| Список 10 | ~15-30 сек | ~1 сек | 15-30x швидше |

## 📈 Оптимізація

### Кешування
- ✅ В пам'яті (Map)
- ✅ На диску (JSON)
- ✅ TTL 7 днів
- ✅ Автоматична очистка

### Паралельні запити
```javascript
// Всі скрапери запускаються одночасно
const [autoRIA, accidents, services, reviews] = await Promise.all([
  scrapeAutoRIA(vin),
  scrapeAccidentHistory(vin),
  scrapeServiceHistory(vin),
  searchRepairReviews(vin)
]);
// Час: мінімальний (найдовший запит)
```

### Обробка помилок
- ✅ Timeout: 10 сек
- ✅ Fallback: якщо API не доступна
- ✅ Partial data: повертаємо, що вдалося отримати
- ✅ Graceful degradation: система не падає

## 🔒 Безпека

### Маскування браузера
```javascript
'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...'
'Accept-Language': 'uk-UA,uk;q=0.9,en;q=0.8'
```

### Rate limiting
- ✅ Delay між запитами: 1000 мс
- ✅ Timeout на запит: 10000 мс
- ✅ Максимум одночасних: 4 запити

### Валідація
```javascript
if (!vin || vin.length < 10) {
  throw new Error('Невалідний VIN-код');
}
```

## 📚 Структура результатів

```javascript
{
  vin: 'WBAEB53442VJ88386',
  timestamp: '2026-05-10T14:30:00.000Z',
  status: 'success',
  sources: {
    autoRIA: {
      source: 'autoRIA.com',
      found: true,
      brand: 'BMW',
      model: '2002',
      year: 2000,
      price: 15000,
      mileage: 250000,
      description: 'BMW 2002 2000...',
      url: 'https://auto.ria.com/...'
    },
    accidents: {
      source: 'accident-registry',
      found: false,
      accidents: [],
      warnings: '⚠️ Німецький автомобіль...',
      repairs: [
        { type: 'Діагностика', priority: 'HIGH', ... },
        { type: 'Перевірка документів', priority: 'HIGH', ... }
      ]
    },
    services: {
      source: 'service-registry',
      found: false,
      recommendations: [
        { text: 'Сервісна книжка', priority: 'HIGH' },
        { text: 'Гарантійні запечатки', priority: 'MEDIUM' }
      ]
    },
    reviews: {
      source: 'service-reviews',
      found: false,
      searchLinks: [
        { name: 'Google Maps', url: 'https://maps.google.com', ... },
        { name: 'Яндекс.Карти', url: 'https://maps.yandex.ua', ... }
      ]
    }
  },
  summary: '🚗 Машина: BMW 2002 2000...\n...'
}
```

## 🔜 Розширення в майбутньому

1. **Інтеграція з українськими реєстрами**
   - MVS.gov.ua (МВС)
   - EDRSR (ЄДРСР)
   - Місцеві реєстри

2. **API сервісів**
   - NHTSA (США)
   - DVLA (Великобританія)
   - RDW (Нідерланди)

3. **Аналіз машинного навчання**
   - Прогноз надійності
   - Ціна на вторинному ринку
   - Рівень ризику ДТП

4. **Інтеграція з страховими компаніями**
   - Історія страховиків
   - Клеймо лимона
   - Клеймо при затопленні

## 📞 Підтримка

Для питань та улучшень: [GitHub Issues](https://github.com/...)

---

**Розробка**: Система веб-скрапінгу для СТО
**Останнє оновлення**: 11 травня 2026 р.
**Версія**: 1.0.0
