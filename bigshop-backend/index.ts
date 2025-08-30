import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { db, products } from './src/db/index';
// ✅ Переключились на реальные контроллеры с обработкой ошибок
import { getProducts, getProductById } from './src/controllers/products';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from './src/controllers/cart';
// ✅ Переключаемся на настоящий OpenAI ассистент
import { chatWithAssistant } from './src/controllers/ai-assistant';
// import { chatWithAssistant } from './src/controllers/ai-assistant-mock';

// import { getProducts, getProductById } from './src/controllers/products-mock';

const app = new Elysia()
  // Проверка подключения к базе данных
  .derive(async ({ set }) => {
    try {
      // Выполняем простой запрос для проверки связи с БД
      await db.select().from(products).limit(1);
      return {}; // Если успешно - продолжаем
    } catch (error) {
      console.error('Database connection failed:', error);
      set.status = 503;
      throw new Error('Database connection failed');
    }
  })
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
  .onError(({ code, error, set }) => {
    console.error('API Error:', error);

    // Обработка разных типов ошибок
    switch (code) {
      case 'VALIDATION':
        set.status = 400;
        return {
          error: 'Validation Error',
          message: 'Invalid request parameters',
          details: error.message
        };

      case 'NOT_FOUND':
        set.status = 404;
        return {
          error: 'Not Found',
          message: 'Resource not found'
        };

      case 'INTERNAL_SERVER_ERROR':
      default:
        set.status = 500;
        return {
          error: 'Internal Server Error',
          message: process.env.NODE_ENV === 'development'
            ? (error as Error).message
            : 'Something went wrong'
        };
    }
  })
  .get('/health', () => ({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: 'connected' 
  }))

  .group('/api/v1', (app) =>
    app
      // Products endpoints с обработкой ошибок
      .get('/products', async ({ query, set }) => {
        try {
          return await getProducts({ query });
        } catch (error) {
          console.error('Products endpoint error:', error);
          throw error; // Пусть onError обработает
        }
      }, {
        detail: {
          tags: ['products'],
          summary: 'Получить список продуктов',
          description: 'Получить список продуктов с фильтрацией и пагинацией'
        }
      })
      .get('/products/:id', async ({ params, set }) => {
        try {
          return await getProductById({ params });
        } catch (error) {
          console.error('Product by ID endpoint error:', error);
          throw error; // Пусть onError обработает
        }
      }, {
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
      .get('/cart/:userId', async ({ params, set }) => {
        try {
          return await getCart({ userId: params.userId });
        } catch (error) {
          console.error('Cart get endpoint error:', error);
          throw error;
        }
      }, {
        detail: {
          tags: ['cart'],
          summary: 'Получить содержимое корзины',
          description: 'Получить все товары в корзине пользователя с расчетом общей стоимости'
        }
      })
      .post('/cart/:userId', async ({ params, body, set }) => {
        try {
          return await addToCart({ body, userId: params.userId });
        } catch (error) {
          console.error('Cart add endpoint error:', error);
          throw error;
        }
      }, {
        detail: {
          tags: ['cart'],
          summary: 'Добавить товар в корзину',
          description: 'Добавить товар в корзину или увеличить количество существующего'
        }
      })
      .put('/cart/:userId/items/:itemId', async ({ params, body, set }) => {
        try {
          return await updateCartItem({ 
            params: { itemId: params.itemId }, 
            body, 
            userId: params.userId 
          });
        } catch (error) {
          console.error('Cart update endpoint error:', error);
          throw error;
        }
      }, {
        detail: {
          tags: ['cart'],
          summary: 'Обновить количество товара в корзине',
          description: 'Изменить количество товара в корзине или удалить при quantity = 0'
        }
      })
      .delete('/cart/:userId/items/:itemId', async ({ params, set }) => {
        try {
          return await removeFromCart({ 
            params: { itemId: params.itemId }, 
            userId: params.userId 
          });
        } catch (error) {
          console.error('Cart remove endpoint error:', error);
          throw error;
        }
      }, {
        detail: {
          tags: ['cart'],
          summary: 'Удалить товар из корзины',
          description: 'Полностью удалить товар из корзины пользователя'
        }
      })
      .delete('/cart/:userId', async ({ params, set }) => {
        try {
          return await clearCart({ userId: params.userId });
        } catch (error) {
          console.error('Cart clear endpoint error:', error);
          throw error;
        }
      }, {
        detail: {
          tags: ['cart'],
          summary: 'Очистить корзину',
          description: 'Удалить все товары из корзины пользователя'
        }
      })
      
      // Orders endpoints
      .get('/orders', () => ({ message: 'Orders endpoint - coming soon' }))
      .post('/orders', () => ({ message: 'Create order endpoint - coming soon' }))
      
      // AI Assistant endpoints
      .post('/ai/chat/:userId', async ({ params, body, set }) => {
        try {
          return await chatWithAssistant({ body, userId: params.userId });
        } catch (error) {
          console.error('AI chat endpoint error:', error);
          throw error;
        }
      }, {
        detail: {
          tags: ['ai'],
          summary: 'Чат с ИИ-ассистентом',
          description: 'Отправить сообщение ИИ-ассистенту и получить ответ с возможными действиями'
        }
      })
  )
  .listen(process.env.PORT || 3001);

console.log(`🚀 BigShop API running at http://${app.server?.hostname}:${app.server?.port}`);
console.log(`📚 Swagger documentation: http://${app.server?.hostname}:${app.server?.port}/swagger`);