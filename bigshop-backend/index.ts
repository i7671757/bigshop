import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
// TODO(human): Switch to real controllers and add error handling
// Временно используем mock контроллер для тестирования
import { getProducts, getProductById } from './src/controllers/products-mock';

const app = new Elysia()
  .use(cors({
    origin: true,
    credentials: true,
  }))
  .use(swagger({
    documentation: {
      info: {
        title: 'BigShop API',
        version: '1.0.0',
        description: 'API для интернет-магазина продуктов питания'
      },
      tags: [
        { name: 'products', description: 'Продукты' },
        { name: 'categories', description: 'Категории' },
        { name: 'cart', description: 'Корзина' },
        { name: 'orders', description: 'Заказы' },
        { name: 'users', description: 'Пользователи' }
      ]
    }
  }))
  .get('/health', () => ({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: 'connected' 
  }))
  .group('/api/v1', (app) =>
    app
      // Products endpoints
      .get('/products', getProducts, {
        detail: {
          tags: ['products'],
          summary: 'Получить список продуктов',
          description: 'Получить список продуктов с фильтрацией и пагинацией'
        }
      })
      .get('/products/:id', getProductById, {
        detail: {
          tags: ['products'],
          summary: 'Получить продукт по ID',
          description: 'Получить детальную информацию о продукте с категорией'
        }
      })
      .post('/products', () => ({ message: 'Create product endpoint - coming soon' }))
      
      // Categories endpoints  
      .get('/categories', () => ({ message: 'Categories endpoint - coming soon' }))
      
      // Cart endpoints
      .get('/cart', () => ({ message: 'Get cart endpoint - coming soon' }))
      .post('/cart', () => ({ message: 'Add to cart endpoint - coming soon' }))
      
      // Orders endpoints
      .get('/orders', () => ({ message: 'Orders endpoint - coming soon' }))
      .post('/orders', () => ({ message: 'Create order endpoint - coming soon' }))
  )
  .listen(process.env.PORT || 3001);

console.log(`🚀 BigShop API running at http://${app.server?.hostname}:${app.server?.port}`);
console.log(`📚 Swagger documentation: http://${app.server?.hostname}:${app.server?.port}/swagger`);