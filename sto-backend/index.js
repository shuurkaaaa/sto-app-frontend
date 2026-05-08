require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger'); 
const { jsonParser, urlEncodedParser } = require('./middlewares/uploadConfig');
const prisma = require('./lib/prisma');

const app = express();

// --- 1. ТОТАЛЬНИЙ CORS (Дозволяємо все для стабільної роботи в Safari та Chrome) ---
app.use(cors({
  origin: true, 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

// Додатковий middleware для обробки складних запитів (Preflight)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// --- 2. ПАРСЕРИ ТА СТАТИКА ---
app.use(jsonParser);
app.use(urlEncodedParser);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Логування запитів у реальному часі (допомагає бачити активність фронтенду)
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// --- 3. ІМПОРТ РОУТІВ ---
const authRoutes = require('./auth/authRoutes');
const staffRoutes = require('./routes/staffRoutes');
const staffCategoryRoutes = require('./routes/staffCategoryRoutes'); 
const categoryRoutes = require('./routes/categoryRoutes'); 
const customerRoutes = require('./routes/customerRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const carRoutes = require('./routes/carRoutes');
const inventoryActions = require('./routes/inventoryActions'); 
const purchaseRoutes = require('./routes/purchaseRoutes');
const priceCategoryRoutes = require('./routes/priceCategoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// --- 4. ПІДКЛЮЧЕННЯ ЕНДПОЇНТІВ ---
app.use('/api/auth', authRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/staff-categories', staffCategoryRoutes); 
app.use('/api/categories', categoryRoutes); 
app.use('/api/customers', customerRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/cars', carRoutes);

// Подвійне підключення для сумісності з різними частинами фронтенду
app.use('/api/inventory', inventoryActions);
app.use('/api/inventory-actions', inventoryActions);

app.use('/api/purchase', purchaseRoutes);
app.use('/api/price-categories', priceCategoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/analytics', analyticsRoutes);

// Роути сповіщень
app.use('/api/notifications', notificationRoutes);

// --- 5. SWAGGER ТА ПОМИЛКИ ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Глобальний обробник помилок для всього застосунку
app.use((err, req, res, next) => {
  console.error('❌ ПОМИЛКА ЗАПИТУ:', err.message);
  res.status(500).json({ 
    error: 'Внутрішня помилка сервера', 
    message: err.message 
  });
});

// --- 6. ЗАПУСК СЕРВЕРА З КОНТРОЛЕМ ПОРТІВ ---
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n=========================================`);
  console.log(`🚀 Сервер OneWayLogistic ПРАЦЮЄ!`);
  console.log(`📡 Адреса: http://localhost:${PORT}`);
  console.log(`🔓 CORS налаштовано для Safari та Chrome`);
  console.log(`=========================================\n`);
  console.log(`Чекаю на запити від фронтенду...`);
});

// Захист від конфліктів портів (наприклад, з AirPlay на macOS)
server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`\n❌ ПОМИЛКА: Порт ${PORT} вже зайнятий!`);
    console.error(`💡 Порада: Якщо ти на Mac, вимкни 'AirPlay Receiver' у Системних налаштуваннях.\n`);
  } else {
    console.error(`\n❌ КРИТИЧНА ПОМИЛКА ЗАПУСКУ:`, e);
  }
});

// Коректне завершення роботи бази даних та сервера
process.on('SIGINT', async () => {
  console.log('\nЗавершення роботи сервера...');
  try {
    await prisma.$disconnect();
    server.close(() => {
      console.log('Процес Node.js зупинено.');
      process.exit(0);
    });
  } catch (err) {
    console.error('Помилка при відключенні Prisma:', err);
    process.exit(1);
  }
});