# 🛒 План разработки MVP интернет-магазина продуктов питания (10 дней)

## 📋 Обзор проекта

**Цель:** Создать готовый к продакшену MVP интернет-магазин для продажи продуктов питания за 10 дней (8-10 часов/день)

### 🛠 Технологический стек

**Frontend:**
- Next.js 14+ (SSR/SSG, App Router)
- Clerk (аутентификация)
- TanStack Query (кеширование данных)
- Tailwind CSS (стилизация)
- Framer Motion (анимации)
- TypeScript (типобезопасность)

**Backend:**
- Elysia.js (API на Bun.js)
- Drizzle ORM (типобезопасные запросы)
- Zod (валидация схем)
- Bun.js (рантайм)

**База данных и сервисы:**
- PostgreSQL через Supabase
- Stripe (платежи)
- Supabase Storage (изображения)

**Развертывание:**
- Frontend: Vercel
- Backend: Vercel Serverless Functions
- База данных: Supabase

---

## 📅 Детальный план по дням

### 🚀 День 1: Настройка инфраструктуры и базовый проект
**Время: 8-10 часов**

#### Утро (4 часа)
- [ ] **Настройка проектов (1.5ч)**
  ```bash
  # Frontend
  npx create-next-app@latest bigshop-frontend --typescript --tailwind --app
  
  # Backend
  mkdir bigshop-backend
  cd bigshop-backend
  bun init
  bun add elysia @elysiajs/cors @elysiajs/swagger
  ```

- [ ] **Настройка Supabase (1ч)**
  - Создать проект в Supabase
  - Настроить переменные окружения
  - Создать базовые таблицы

- [ ] **Настройка Clerk (1.5ч)**
  - Интеграция в Next.js
  - Настройка провайдеров аутентификации
  - Создание middleware для защищенных маршрутов

#### Вечер (4-6 часов)
- [ ] **Схема базы данных с Drizzle (2ч)**
  ```typescript
  // schema/users.ts
  export const users = pgTable('users', {
    id: text('id').primaryKey(),
    email: text('email').notNull().unique(),
    name: text('name'),
    role: text('role').default('customer'),
    createdAt: timestamp('created_at').defaultNow(),
  });

  // schema/products.ts
  export const products = pgTable('products', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    category: text('category').notNull(),
    imageUrl: text('image_url'),
    stock: integer('stock').default(0),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
  });
  ```

- [ ] **Базовая структура API (Elysia) (2ч)**
  ```typescript
  // index.ts
  import { Elysia } from 'elysia'
  import { cors } from '@elysiajs/cors'
  import { swagger } from '@elysiajs/swagger'
  
  const app = new Elysia()
    .use(cors())
    .use(swagger())
    .get('/health', () => ({ status: 'ok' }))
    .group('/api/v1', (app) =>
      app
        .get('/products', getProducts)
        .post('/products', createProduct)
    )
    .listen(3001)
  ```

- [ ] **Настройка TanStack Query в Next.js (1ч)**

**Milestone Day 1:** ✅ Базовая инфраструктура готова, API работает, аутентификация настроена

---

### 🏗 День 2: Основные модели данных и API endpoints
**Время: 8-10 часов**

#### Утро (4 часа)
- [ ] **Завершение схемы БД (2ч)**
  ```typescript
  // schema/orders.ts
  export const orders = pgTable('orders', {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull(),
    status: text('status').default('pending'),
    totalAmount: decimal('total_amount', { precision: 10, scale: 2 }),
    stripeSessionId: text('stripe_session_id'),
    shippingAddress: json('shipping_address'),
    createdAt: timestamp('created_at').defaultNow(),
  });

  // schema/orderItems.ts
  export const orderItems = pgTable('order_items', {
    id: serial('id').primaryKey(),
    orderId: integer('order_id').references(() => orders.id),
    productId: integer('product_id').references(() => products.id),
    quantity: integer('quantity').notNull(),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  });

  // schema/cart.ts
  export const cartItems = pgTable('cart_items', {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull(),
    productId: integer('product_id').references(() => products.id),
    quantity: integer('quantity').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
  });
  ```

- [ ] **Миграции и seeding (2ч)**
  - Создать и запустить миграции
  - Заполнить тестовыми продуктами

#### Вечер (4-6 часов)
- [ ] **API endpoints для продуктов (2ч)**
  ```typescript
  // controllers/products.ts
  export const getProducts = async ({ query }: { query: any }) => {
    const { category, search, limit = 20, offset = 0 } = query;
    // Логика фильтрации и пагинации
  };

  export const getProduct = async ({ params }: { params: { id: string } }) => {
    // Получение одного продукта
  };
  ```

- [ ] **API endpoints для корзины (2ч)**
  ```typescript
  // controllers/cart.ts
  export const getCart = async ({ userId }: { userId: string }) => {
    // Получение корзины пользователя
  };

  export const addToCart = async ({ body, userId }: any) => {
    // Добавление в корзину с валидацией
  };
  ```

- [ ] **Zod схемы валидации (1ч)**
  ```typescript
  // schemas/product.ts
  export const createProductSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    price: z.number().positive(),
    category: z.string(),
    stock: z.number().int().min(0),
  });
  ```

**Milestone Day 2:** ✅ API endpoints готовы, схемы валидации настроены, тестовые данные загружены

---

### 🎨 День 3: Frontend - Каталог и детали продукта
**Время: 8-10 часов**

#### Утро (4 часа)
- [ ] **Базовый layout и навигация (2ч)**
  ```typescript
  // app/layout.tsx
  export default function RootLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <ClerkProvider>
        <html lang="ru">
          <body className="min-h-screen bg-gray-50">
            <QueryProvider>
              <Header />
              <main className="container mx-auto px-4 py-8">
                {children}
              </main>
              <Footer />
            </QueryProvider>
          </body>
        </html>
      </ClerkProvider>
    )
  }
  ```

- [ ] **Компонент каталога продуктов (2ч)**
  ```typescript
  // components/ProductGrid.tsx
  export function ProductGrid() {
    const { data: products, isLoading } = useQuery({
      queryKey: ['products'],
      queryFn: fetchProducts,
    });

    if (isLoading) return <ProductGridSkeleton />;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products?.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  }
  ```

#### Вечер (4-6 часов)
- [ ] **Компонент карточки продукта (2ч)**
  ```typescript
  // components/ProductCard.tsx
  export function ProductCard({ product }: { product: Product }) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-white rounded-lg shadow-md overflow-hidden"
      >
        <Image
          src={product.imageUrl || '/placeholder.jpg'}
          alt={product.name}
          width={300}
          height={200}
          className="w-full h-48 object-cover"
        />
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
          <p className="text-gray-600 mb-3 text-sm">{product.description}</p>
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-green-600">
              ${product.price}
            </span>
            <AddToCartButton productId={product.id} />
          </div>
        </div>
      </motion.div>
    );
  }
  ```

- [ ] **Страница детального просмотра продукта (2ч)**
  - Галерея изображений
  - Детальное описание
  - Выбор количества
  - Кнопка "В корзину"

- [ ] **Фильтры и поиск (1ч)**

**Milestone Day 3:** ✅ Каталог продуктов готов, страница продукта работает, базовая навигация

---

### 🛒 День 4: Корзина и логика покупок
**Время: 8-10 часов**

#### Утро (4 часа)
- [ ] **Контекст корзины и хуки (2ч)**
  ```typescript
  // hooks/useCart.ts
  export function useCart() {
    const { user } = useUser();
    
    const { data: cartItems, refetch } = useQuery({
      queryKey: ['cart', user?.id],
      queryFn: () => fetchCart(user?.id),
      enabled: !!user?.id,
    });

    const addToCartMutation = useMutation({
      mutationFn: addToCart,
      onSuccess: () => refetch(),
    });

    return {
      items: cartItems || [],
      addItem: addToCartMutation.mutate,
      isLoading: addToCartMutation.isPending,
    };
  }
  ```

- [ ] **Компонент корзины (2ч)**
  ```typescript
  // components/Cart/CartDrawer.tsx
  export function CartDrawer() {
    const { items, updateQuantity, removeItem } = useCart();
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Корзина</h2>
          {items.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between text-xl font-bold">
              <span>Итого: ${total.toFixed(2)}</span>
            </div>
            <CheckoutButton />
          </div>
        </div>
      </div>
    );
  }
  ```

#### Вечер (4-6 часов)
- [ ] **Логика изменения корзины (2ч)**
  - Увеличение/уменьшение количества
  - Удаление товаров
  - Валидация остатков

- [ ] **Анимации корзины с Framer Motion (1.5ч)**
  ```typescript
  // components/AddToCartButton.tsx
  export function AddToCartButton({ productId }: { productId: number }) {
    const [isAdding, setIsAdding] = useState(false);
    const { addItem } = useCart();

    const handleAdd = async () => {
      setIsAdding(true);
      await addItem({ productId, quantity: 1 });
      
      // Анимация успешного добавления
      setTimeout(() => setIsAdding(false), 1000);
    };

    return (
      <motion.button
        whileTap={{ scale: 0.95 }}
        className={`px-4 py-2 rounded-lg ${
          isAdding ? 'bg-green-500' : 'bg-blue-500'
        } text-white font-medium`}
        onClick={handleAdd}
        disabled={isAdding}
      >
        <AnimatePresence mode="wait">
          {isAdding ? (
            <motion.span
              key="adding"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              ✓ Добавлено
            </motion.span>
          ) : (
            <motion.span key="add">В корзину</motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    );
  }
  ```

- [ ] **Страница корзины (1.5ч)**
- [ ] **Мобильная адаптация корзины (1ч)**

**Milestone Day 4:** ✅ Полностью функциональная корзина, анимации, адаптивность

---

### 💳 День 5: Интеграция Stripe и процесс оплаты
**Время: 8-10 часов**

#### Утро (4 часа)
- [ ] **Настройка Stripe (1.5ч)**
  ```bash
  # Frontend
  bun add @stripe/stripe-js @stripe/react-stripe-js
  
  # Backend
  bun add stripe
  ```

- [ ] **API endpoint для создания платежной сессии (2.5ч)**
  ```typescript
  // controllers/checkout.ts
  import Stripe from 'stripe';
  
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  
  export const createCheckoutSession = async ({ body, userId }: any) => {
    const { items } = body;
    
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.product.name,
          images: [item.product.imageUrl],
        },
        unit_amount: Math.round(item.product.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cart`,
      metadata: {
        userId,
      },
    });

    return { sessionId: session.id };
  };
  ```

#### Вечер (4-6 часов)
- [ ] **Компонент оформления заказа (3ч)**
  ```typescript
  // app/checkout/page.tsx
  'use client';
  
  import { loadStripe } from '@stripe/stripe-js';
  import { Elements } from '@stripe/react-stripe-js';
  
  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  
  export default function CheckoutPage() {
    const { items } = useCart();
    const [isProcessing, setIsProcessing] = useState(false);
    
    const handleCheckout = async () => {
      setIsProcessing(true);
      
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      
      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      
      await stripe?.redirectToCheckout({ sessionId });
    };
    
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Оформление заказа</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <OrderSummary items={items} />
          <PaymentForm onSubmit={handleCheckout} isProcessing={isProcessing} />
        </div>
      </div>
    );
  }
  ```

- [ ] **Webhook для обработки платежей (2ч)**
  ```typescript
  // controllers/webhooks.ts
  export const handleStripeWebhook = async ({ body, headers }: any) => {
    const sig = headers['stripe-signature'];
    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err) {
      throw new Error(`Webhook signature verification failed`);
    }
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      await createOrderFromSession(session);
    }
    
    return { received: true };
  };
  ```

- [ ] **Страницы успеха и отмены (1ч)**

**Milestone Day 5:** ✅ Stripe интегрирован, платежи работают, вебхуки настроены

---

### 👤 День 6: Профиль пользователя и управление заказами
**Время: 8-10 часов**

#### Утро (4 часа)
- [ ] **API endpoints для заказов (2ч)**
  ```typescript
  // controllers/orders.ts
  export const getUserOrders = async ({ userId, query }: any) => {
    const { limit = 10, offset = 0 } = query;
    
    return await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(orders.createdAt));
  };

  export const getOrderDetails = async ({ params, userId }: any) => {
    const order = await db
      .select()
      .from(orders)
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(and(eq(orders.id, params.id), eq(orders.userId, userId)));
      
    return formatOrderWithItems(order);
  };
  ```

- [ ] **Страница профиля пользователя (2ч)**
  ```typescript
  // app/profile/page.tsx
  export default function ProfilePage() {
    const { user } = useUser();
    const { data: orders } = useQuery({
      queryKey: ['orders', user?.id],
      queryFn: () => fetchUserOrders(user?.id),
      enabled: !!user?.id,
    });

    return (
      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <ProfileSidebar user={user} />
          <div className="md:col-span-2">
            <OrdersHistory orders={orders} />
          </div>
        </div>
      </div>
    );
  }
  ```

#### Вечер (4-6 часов)
- [ ] **Компонент истории заказов (2ч)**
  ```typescript
  // components/Profile/OrdersHistory.tsx
  export function OrdersHistory({ orders }: { orders: Order[] }) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">История заказов</h2>
        {orders?.map((order) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <OrderCard order={order} />
          </motion.div>
        ))}
      </div>
    );
  }
  ```

- [ ] **Детальная страница заказа (2ч)**
- [ ] **Статусы заказов и их отображение (1ч)**
- [ ] **Возможность повторного заказа (1ч)**

**Milestone Day 6:** ✅ Профиль пользователя готов, история заказов, детали заказов

---

### ⚙️ День 7: Админ-панель (базовая)
**Время: 8-10 часов**

#### Утро (4 часа)
- [ ] **Middleware для админов (1ч)**
  ```typescript
  // middleware/adminAuth.ts
  export const adminAuthMiddleware = (handler: NextApiHandler) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      const { userId } = getAuth(req);
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const user = await db.select().from(users).where(eq(users.id, userId)).get();
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }
      
      return handler(req, res);
    };
  };
  ```

- [ ] **API endpoints для админов (3ч)**
  ```typescript
  // controllers/admin/products.ts
  export const adminCreateProduct = async ({ body }: any) => {
    const validatedData = createProductSchema.parse(body);
    
    return await db.insert(products).values({
      ...validatedData,
      createdAt: new Date(),
    }).returning();
  };

  export const adminUpdateProduct = async ({ params, body }: any) => {
    const validatedData = updateProductSchema.parse(body);
    
    return await db
      .update(products)
      .set(validatedData)
      .where(eq(products.id, params.id))
      .returning();
  };
  ```

#### Вечер (4-6 часов)
- [ ] **Админ dashboard (3ч)**
  ```typescript
  // app/admin/page.tsx
  export default function AdminDashboard() {
    const { data: stats } = useQuery({
      queryKey: ['admin-stats'],
      queryFn: fetchAdminStats,
    });

    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Админ панель</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard title="Заказы сегодня" value={stats?.todayOrders} />
          <StatCard title="Выручка" value={`$${stats?.revenue}`} />
          <StatCard title="Продукты" value={stats?.totalProducts} />
          <StatCard title="Пользователи" value={stats?.totalUsers} />
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <RecentOrders />
          <QuickActions />
        </div>
      </div>
    );
  }
  ```

- [ ] **Управление продуктами (2ч)**
  - Список продуктов с фильтрами
  - Добавление/редактирование
  - Загрузка изображений в Supabase Storage

- [ ] **Управление заказами (1ч)**
  - Изменение статусов
  - Просмотр деталей

**Milestone Day 7:** ✅ Базовая админ-панель готова, управление продуктами и заказами

---

### 🧪 День 8: Тестирование и оптимизация
**Время: 8-10 часов**

#### Утро (4 часа)
- [ ] **Настройка Vitest (1ч)**
  ```bash
  bun add -d vitest @testing-library/react @testing-library/jest-dom
  ```

- [ ] **Unit тесты для API (2ч)**
  ```typescript
  // tests/api/products.test.ts
  import { describe, it, expect, beforeEach } from 'vitest';
  import { app } from '../src/index';

  describe('Products API', () => {
    it('should fetch products', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/v1/products')
      );
      
      expect(response.status).toBe(200);
      const products = await response.json();
      expect(Array.isArray(products)).toBe(true);
    });

    it('should create product with valid data', async () => {
      const productData = {
        name: 'Test Product',
        price: 9.99,
        category: 'test',
        stock: 10
      };
      
      const response = await app.handle(
        new Request('http://localhost/api/v1/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        })
      );
      
      expect(response.status).toBe(201);
    });
  });
  ```

- [ ] **Component тесты (1ч)**

#### Вечер (4-6 часов)
- [ ] **E2E тесты основных сценариев (2ч)**
  - Регистрация/авторизация
  - Добавление в корзину
  - Оформление заказа

- [ ] **Оптимизация производительности (3ч)**
  ```typescript
  // Lazy loading компонентов
  const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
  const ProductDetails = lazy(() => import('./components/ProductDetails'));
  
  // Оптимизация изображений
  // next.config.js
  module.exports = {
    images: {
      domains: ['supabase-storage-url'],
      formats: ['image/webp', 'image/avif'],
    },
  };
  
  // Кеширование запросов
  export const getStaticProps: GetStaticProps = async () => {
    const products = await fetchProducts();
    
    return {
      props: { products },
      revalidate: 3600, // Revalidate every hour
    };
  };
  ```

- [ ] **Аудит безопасности (1ч)**
  - Проверка CORS настроек
  - Валидация всех входящих данных
  - Проверка аутентификации на всех защищенных эндпоинтах

**Milestone Day 8:** ✅ Тесты написаны, производительность оптимизирована, безопасность проверена

---

### 📈 День 9: SEO, аналитика и финальные доработки
**Время: 8-10 часов**

#### Утро (4 часа)
- [ ] **SEO оптимизация (2.5ч)**
  ```typescript
  // app/products/[slug]/page.tsx
  export async function generateMetadata({ params }: any): Promise<Metadata> {
    const product = await fetchProduct(params.slug);
    
    return {
      title: `${product.name} | BigShop`,
      description: product.description,
      openGraph: {
        title: product.name,
        description: product.description,
        images: [product.imageUrl],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name,
        description: product.description,
        images: [product.imageUrl],
      },
    };
  }

  // Структурированные данные
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.imageUrl,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'USD',
      availability: product.stock > 0 ? 'InStock' : 'OutOfStock',
    },
  };
  ```

- [ ] **Sitemap и robots.txt (1.5ч)**
  ```typescript
  // app/sitemap.ts
  export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const products = await fetchAllProducts();
    
    const productUrls = products.map((product) => ({
      url: `https://bigshop.com/products/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
    
    return [
      {
        url: 'https://bigshop.com',
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: 'https://bigshop.com/products',
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      ...productUrls,
    ];
  }
  ```

#### Вечер (4-6 часов)
- [ ] **Аналитика (Google Analytics/Plausible) (1.5ч)**
  ```typescript
  // lib/analytics.ts
  export const trackPurchase = (orderId: string, value: number, items: any[]) => {
    gtag('event', 'purchase', {
      transaction_id: orderId,
      value,
      currency: 'USD',
      items: items.map(item => ({
        item_id: item.productId,
        item_name: item.product.name,
        category: item.product.category,
        quantity: item.quantity,
        price: item.price,
      })),
    });
  };
  ```

- [ ] **Мониторинг ошибок (Sentry) (1ч)**
- [ ] **PWA настройка (1.5ч)**
  ```typescript
  // next.config.js
  const withPWA = require('next-pwa')({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
  });
  
  module.exports = withPWA({
    // your next config
  });
  
  // public/manifest.json
  {
    "name": "BigShop - Продукты питания",
    "short_name": "BigShop",
    "description": "Интернет-магазин продуктов питания",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#22c55e",
    "icons": [
      {
        "src": "/icons/icon-192x192.png",
        "sizes": "192x192",
        "type": "image/png"
      }
    ]
  }
  ```

- [ ] **Финальная оптимизация и багфиксы (2ч)**
  - Исправление мелких багов
  - Оптимизация запросов к БД
  - Улучшение UX

**Milestone Day 9:** ✅ SEO готово, аналитика настроена, PWA работает

---

### 🚀 День 10: Развертывание в продакшн
**Время: 8-10 часов**

#### Утро (4 часа)
- [ ] **Подготовка к деплою (1.5ч)**
  ```bash
  # Переменные окружения для продакшна
  # .env.production
  DATABASE_URL=your-supabase-db-url
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-key
  CLERK_SECRET_KEY=your-clerk-secret
  STRIPE_SECRET_KEY=your-stripe-secret
  STRIPE_PUBLISHABLE_KEY=your-stripe-publishable
  STRIPE_WEBHOOK_SECRET=your-webhook-secret
  NEXTAUTH_SECRET=your-secret
  NEXTAUTH_URL=https://your-domain.com
  ```

- [ ] **Деплой backend на Vercel (1ч)**
  ```typescript
  // api/index.ts (для Vercel Edge Runtime)
  import { Elysia } from 'elysia';
  import { handle } from 'elysia/adapter/vercel';
  
  const app = new Elysia()
    .get('/health', () => ({ status: 'ok' }))
    .group('/api/v1', setupApiRoutes);
  
  export const GET = handle(app);
  export const POST = handle(app);
  export const PUT = handle(app);
  export const DELETE = handle(app);
  
  export const runtime = 'edge';
  ```

- [ ] **Деплой frontend на Vercel (1.5ч)**
  ```json
  // vercel.json
  {
    "buildCommand": "bun run build",
    "devCommand": "bun run dev",
    "installCommand": "bun install",
    "framework": "nextjs"
  }
  ```

#### Вечер (4-6 часов)
- [ ] **Настройка домена и SSL (1ч)**
- [ ] **Настройка CD/CI (GitHub Actions) (2ч)**
  ```yaml
  # .github/workflows/deploy.yml
  name: Deploy to Production
  
  on:
    push:
      branches: [main]
  
  jobs:
    deploy:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: oven-sh/setup-bun@v1
        
        - name: Install dependencies
          run: bun install
          
        - name: Run tests
          run: bun test
          
        - name: Build
          run: bun run build
          
        - name: Deploy to Vercel
          uses: amondnet/vercel-action@v25
          with:
            vercel-token: ${{ secrets.VERCEL_TOKEN }}
            vercel-org-id: ${{ secrets.ORG_ID }}
            vercel-project-id: ${{ secrets.PROJECT_ID }}
            vercel-args: '--prod'
  ```

- [ ] **Настройка мониторинга (1.5ч)**
  - Uptime monitoring
  - Performance monitoring
  - Error tracking

- [ ] **Финальное тестирование в продакшене (1.5ч)**
  - Проверка всех функций
  - Тестирование платежей
  - Проверка email уведомлений

- [ ] **Документация и README (1ч)**

**Milestone Day 10:** ✅ MVP развернут в продакшене, мониторинг настроен, документация готова

---

## 🚨 Потенциальные риски и митигация

### Технические риски:

1. **Совместимость Bun.js**
   - **Риск:** Некоторые npm пакеты могут не работать с Bun
   - **Митигация:** Тестирование ключевых пакетов на ранней стадии, fallback на Node.js

2. **Лимиты Supabase**
   - **Риск:** Превышение лимитов базового плана
   - **Митигация:** Мониторинг использования, оптимизация запросов

3. **Интеграция Stripe**
   - **Риск:** Сложности с webhooks и тестовыми платежами
   - **Митигация:** Детальное тестирование, использование Stripe CLI

### Временные риски:

1. **Недооценка сложности**
   - **Митигация:** 20% буфер времени на каждый день
   - Приоритизация MVP функций над "nice-to-have"

2. **Debugging и интеграции**
   - **Митигация:** Начинать каждую интеграцию с минимального примера

---

## ✅ Чек-лист финального MVP

### Пользовательские функции:
- [ ] ✅ Регистрация/вход через email и социальные сети
- [ ] ✅ Просмотр каталога продуктов с фильтрами
- [ ] ✅ Добавление в корзину
- [ ] ✅ Оформление заказа с оплатой через Stripe
- [ ] ✅ Просмотр истории заказов
- [ ] ✅ Мобильная адаптивность

### Админ функции:
- [ ] ✅ Управление продуктами (CRUD)
- [ ] ✅ Просмотр заказов и изменение статусов
- [ ] ✅ Базовая аналитика

### Техническое качество:
- [ ] ✅ Типобезопасность (TypeScript)
- [ ] ✅ Валидация данных (Zod)
- [ ] ✅ Обработка ошибок
- [ ] ✅ Базовые тесты
- [ ] ✅ SEO оптимизация
- [ ] ✅ Безопасность (аутентификация, авторизация)

### Развертывание:
- [ ] ✅ Продакшн деплой
- [ ] ✅ Мониторинг
- [ ] ✅ Бэкапы БД
- [ ] ✅ SSL сертификат

---

## 📊 Ожидаемые результаты

По завершении 10 дней у вас будет:

1. **Полностью функциональный MVP** интернет-магазина
2. **Производительное** приложение с оптимизированной загрузкой
3. **Безопасная** система с правильной аутентификацией
4. **SEO-оптимизированный** сайт для поисковых систем
5. **Мобильно-адаптивный** интерфейс
6. **Готовность к масштабированию** архитектура

### Примерные метрики готового MVP:
- **Время загрузки главной страницы:** < 2 сек
- **Core Web Vitals:** Все зеленые показатели
- **Покрытие тестами:** > 70%
- **TypeScript покрытие:** 100%
- **Мобильная адаптивность:** 100%

---

*Этот план рассчитан на опытного разработчика. При возникновении блокеров, всегда приоритизируйте MVP функции над дополнительными фичами.*