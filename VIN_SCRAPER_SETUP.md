# 🚀 Інструкція з запуску VIN скрапера

## 1️⃣ Встановлення залежностей

```bash
cd /Users/shuurkaaaa/Desktop/sto-app/sto-backend

# Встановити Cheerio та Axios (якщо ще не встановлені)
npm install axios cheerio
```

## 2️⃣ Структура файлів

```
sto-backend/
├── services/
│   ├── vinScraper.js       ← Головний скрапер
│   ├── cacheService.js     ← Кеш система
│   └── vinService.js       ← Валідація/декодування
├── routes/
│   └── vinRoutes.js        ← API endpoints
├── cache/                  ← Кеш директорія (створюється автоматично)
└── test-scraper.js        ← Тестовий скрипт
```

## 3️⃣ Запуск сервера

```bash
# Від кореня проекту
cd /Users/shuurkaaaa/Desktop/sto-app

# Запустити backend
cd sto-backend
npm start

# Повинен бути запущений на port 5000
# ✅ Server running on port 5000
```

## 4️⃣ Тестування скрапера

### Варіант 1: Node.js тест

```bash
cd /Users/shuurkaaaa/Desktop/sto-app/sto-backend
node test-scraper.js

# Результат: Тестування 5 різних VIN-кодів
# ✅ WBAEB53442VJ88386 (BMW)
# ✅ 2HGCV51667H004352 (Honda)
# ✅ LFVNCLF30LP078915 (Lexus)
# ✅ KMHLN4AJ1EU546837 (Hyundai)
# ✅ VFBVK0070AE000001 (Peugeot)
```

### Варіант 2: curl запити

```bash
# Тест скрапера (без авторизації)
curl -X POST http://localhost:5000/api/vin/scrape-test \
  -H "Content-Type: application/json" \
  -d '{"vin":"WBAEB53442VJ88386"}'

# Запит з авторизацією (потребує JWT токена)
curl -X POST http://localhost:5000/api/vin/check \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"vin":"WBAEB53442VJ88386"}'

# Перевірка статистики кешу
curl http://localhost:5000/api/vin/cache-stats
```

### Варіант 3: Frontend (React)

1. Відкрити браузер на `http://localhost:3000`
2. Перейти на сторінку з VIN (якщо реалізована)
3. Введити VIN у форму
4. Нажати "Перевірити"
5. Бачити результати в модальному вікні

## 5️⃣ Приклади VIN-кодів для тестування

```
Європа:
- WBAEB53442VJ88386  (BMW 2002)
- VFBVK0070AE000001  (Peugeot)

США/Канада:
- 2HGCV51667H004352  (Honda)
- 1GTG6BE30F1265936  (General Motors)

Японія:
- LFVNCLF30LP078915  (Lexus)
- JTDLE46K520051234  (Toyota)

Південна Корея:
- KMHLN4AJ1EU546837  (Hyundai)
- KNADN5AU12P123456  (Kia)

Китай:
- LSRJ1U84XES000001  (Li Auto)
```

## 6️⃣ Логування та монітринг

### Перегляд логів backend

```bash
# Дивись логи в реальному часі
tail -f /tmp/backend.log

# Або якщо backend запущений через npm start:
# Логи виводяться прямо в консоль
```

### Приклади логів

```
[autoRIA] Пошук VIN: WBAEB53442VJ88386
[autoRIA] Запит до: https://auto.ria.com/search/?parameters[vin]=...
[autoRIA] ✓ Знайдено: BMW 2002 2000...
[Accident] Аналіз даних про ДТП для: WBAEB53442VJ88386
[Service] Пошук історії ремонту для: WBAEB53442VJ88386
[Cache] ✓ Зберено в кеш: vin-history-WBAEB53442VJ88386
========== СКРАПІНГ ЗАВЕРШЕНО ==========
```

## 7️⃣ Перевірка кешу

```bash
# Переглянути файли кешу
ls -la /Users/shuurkaaaa/Desktop/sto-app/sto-backend/cache/

# Перевірити розмір кешу
du -sh /Users/shuurkaaaa/Desktop/sto-app/sto-backend/cache/

# Отримати статистику через API
curl http://localhost:5000/api/vin/cache-stats | jq .

# Очистити кеш вручну
rm -rf /Users/shuurkaaaa/Desktop/sto-app/sto-backend/cache/*
```

## 8️⃣ Розв'язання проблем

### Проблема: "Cannot find module 'cheerio'"
```bash
npm install cheerio
```

### Проблема: "ECONNREFUSED" (сервер не відповідає)
```bash
# Перевірити, чи запущений backend
lsof -i :5000

# Якщо не запущений, запустити:
cd sto-backend && npm start
```

### Проблема: "Request timeout"
```bash
# autoRIA.com може бути повільною
# Спробуйте пізніше або збільште timeout в vinScraper.js:
timeout: 15000  // змініть з 10000 на 15000
```

### Проблема: Кеш займає забагато місця
```bash
# Очистити весь кеш
rm -rf cache/

# Або зменшити TTL з 7 днів на 3:
const CACHE_DURATION = 3 * 24 * 60 * 60 * 1000; // 3 дні
```

## 9️⃣ Оптимізація та продуктивність

### Поточні налаштування
- Timeout: 10 сек
- Delay між запитами: 1 сек
- Паралельні запити: 4 одночасно
- Кеш TTL: 7 днів
- Максимальний розмір кешу: 500 MB

### Як прискорити
```javascript
// Зменшити timeout
timeout: 5000  // замість 10000

// Збільшити паралельні запити (обережно!)
Promise.all([...]) // додати ще джерел

// Зменшити TTL
const CACHE_DURATION = 1 * 24 * 60 * 60 * 1000; // 1 день
```

## 🔟 Поточні обмеження

1. **autoRIA.com може блокувати запити**
   - Рішення: Додати proxy або змінити User-Agent

2. **Державні реєстри недоступні**
   - Рішення: Інтеграція з MVS.gov.ua потребує спеціального доступу

3. **Історія сервісу не публічна**
   - Рішення: Потрібна інтеграція з базами СТО

## 📞 Контакти для розширення

- Для інтеграції з autoRIA API: `api@auto.ria.com`
- Для доступу до реєстрів: МВС України
- Для страхових даних: страхові компанії України

---

**Останнє оновлення**: 11 травня 2026 р.
**Версія системи**: 1.0.0
**Статус**: ✅ Готово до запуску
