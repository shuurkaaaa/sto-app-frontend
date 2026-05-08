const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CRM API (Дипломний проект)',
      version: '1.0.0',
      description: 'Документація API для управління персоналом СТО',
    },
    servers: [{ url: 'http://localhost:5000' }],
    // Додаємо схеми об'єктів
    components: {
      schemas: {
        Staff: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            role: { type: 'string' },
            exp: { type: 'integer' },
            categoryId: { type: 'integer' },
            status: { type: 'string' }
          }
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js'], 
};

module.exports = swaggerJsdoc(options);