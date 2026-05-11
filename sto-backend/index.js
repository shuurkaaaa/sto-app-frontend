// Load env reliably regardless of where node is started from.
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const { jsonParser, urlEncodedParser } = require('./middlewares/uploadConfig');
const prisma = require('./lib/prisma');

const app = express();


app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));


app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});


app.use(jsonParser);
app.use(urlEncodedParser);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});


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
const vinRoutes = require('./routes/vinRoutes');


app.use('/api/auth', authRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/staff-categories', staffCategoryRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/cars', carRoutes);


app.use('/api/inventory', inventoryActions);
app.use('/api/inventory-actions', inventoryActions);

app.use('/api/purchase', purchaseRoutes);
app.use('/api/price-categories', priceCategoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/analytics', analyticsRoutes);


app.use('/api/notifications', notificationRoutes);
app.use('/api/vin', vinRoutes);


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.use((err, req, res, next) => {
  console.error('REQUEST ERROR:', err.message);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});


const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});


server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  } else {
    console.error(`Server startup error:`, e);
  }
});


process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  try {
    await prisma.$disconnect();
    server.close(() => {
      console.log('Server stopped.');
      process.exit(0);
    });
  } catch (err) {
    console.error('Prisma disconnect error:', err);
    process.exit(1);
  }
});