/**
 * =============================================================================
 * КОНТРОЛЛЕРЫ ДЛЯ РАБОТЫ С ПРОДУКТАМИ
 * =============================================================================
 * Этот файл содержит бизнес-логику для работы с товарами в каталоге.
 * Все функции принимают валидированные данные и возвращают JSON ответы.
 */

import { db, products, categories } from '../db/index';
import { eq, and, gte, lte, ilike, desc, asc, count } from 'drizzle-orm';
import { productQuerySchema } from '../validation/schemas';

/**
 * Получение списка продуктов с фильтрацией, поиском и пагинацией.
 * 
 * Функционал:
 * - Поиск по названию (нечувствительный к регистру)
 * - Фильтрация по категории, цене, статусу "рекомендуемый"
 * - Сортировка по различным полям (название, цена, дата создания)
 * - Пагинация с подсчетом общего количества
 * - Показывает только активные товары (isActive = true)
 * 
 * @param query - объект с параметрами фильтрации из URL
 * @returns объект с массивом товаров и метаданными пагинации
 */
export const getProducts = async ({ query }: { query: any }) => {
  try {
    // Валидация и преобразование входящих параметров
    // productQuerySchema автоматически конвертирует строки в числа/boolean
    const {
      category,     // UUID категории для фильтрации
      search,       // Строка поиска по названию товара
      minPrice,     // Минимальная цена (число)
      maxPrice,     // Максимальная цена (число)
      featured,     // Показывать только рекомендуемые товары (boolean)
      sortBy,       // Поле для сортировки
      sortOrder,    // Направление сортировки (asc/desc)
      limit,        // Количество товаров на странице
      offset,       // Смещение для пагинации
    } = productQuerySchema.parse(query);

    // Массив условий для WHERE clause
    const conditions = [];

    // Базовое условие: показываем только активные товары
    conditions.push(eq(products.isActive, true));

    // Фильтрация по категории
    if (category) {
      conditions.push(eq(products.categoryId, category));
    }

    // Поиск по названию товара (нечувствительный к регистру)
    if (search) {
      conditions.push(ilike(products.name, `%${search}%`));
    }

    // Фильтрация по минимальной цене
    // Цены хранятся как строки (decimal), поэтому конвертируем число в строку
    if (minPrice !== undefined) {
      conditions.push(gte(products.price, minPrice.toString()));
    }

    // Фильтрация по максимальной цене
    if (maxPrice !== undefined) {
      conditions.push(lte(products.price, maxPrice.toString()));
    }

    // Фильтрация по статусу "рекомендуемый"
    if (featured !== undefined) {
      conditions.push(eq(products.isFeatured, featured));
    }

    // Объединяем все условия через AND
    const whereClause = conditions.length ? and(...conditions) : undefined;

    // Определяем сортировку на основе параметров
    let orderByClause;
    switch (sortBy) {
      case 'name':
        orderByClause = sortOrder === 'asc' ? asc(products.name) : desc(products.name);
        break;
      case 'price':
        orderByClause = sortOrder === 'asc' ? asc(products.price) : desc(products.price);
        break;
      case 'featured':
        orderByClause = sortOrder === 'asc' ? asc(products.isFeatured) : desc(products.isFeatured);
        break;
      case 'created':
      default:
        orderByClause = sortOrder === 'asc' ? asc(products.createdAt) : desc(products.createdAt);
        break;
    }

    // Основной запрос для получения товаров
    const rows = await db
      .select()
      .from(products)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    // Отдельный запрос для подсчета общего количества товаров (для пагинации)
    const [totalResult] = await db
      .select({ count: count() })
      .from(products)
      .where(whereClause);

    // Возвращаем данные в стандартном формате для пагинации
    return {
      data: rows,                                           // Массив товаров
      total: Number(totalResult.count),                     // Общее количество товаров
      limit,                                               // Лимит на страницу
      offset,                                              // Текущее смещение
      hasMore: offset + limit < Number(totalResult.count)  // Есть ли еще страницы
    };

  } catch (e) {
    console.error('Error getting products:', e);
    throw new Error('Failed to get products');
  }
};

/**
 * Получение детальной информации о конкретном продукте по его ID.
 * 
 * Функционал:
 * - Возвращает полную информацию о товаре
 * - Включает данные о категории товара (через LEFT JOIN)
 * - Показывает только активные товары
 * - Обрабатывает случай, когда товар не найден
 * 
 * @param params - объект с параметрами URL, содержащий id товара
 * @returns объект с полной информацией о товаре и его категории
 * @throws Error если товар не найден или неактивен
 */
export const getProductById = async ({ params }: { params: { id: string } }) => {
  try {
    // Выполняем запрос с JOIN для получения информации о категории
    // Используем explicit select для контроля возвращаемых полей
    const product = await db
      .select({
        // Поля товара
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        shortDescription: products.shortDescription,
        sku: products.sku,
        price: products.price,
        comparePrice: products.comparePrice,
        inventory: products.inventory,
        weight: products.weight,
        dimensions: products.dimensions,
        images: products.images,
        tags: products.tags,
        metaTitle: products.metaTitle,
        metaDescription: products.metaDescription,
        isActive: products.isActive,
        isFeatured: products.isFeatured,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        // Вложенный объект с информацией о категории
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          description: categories.description,
        }
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id)) // Подключаем категорию
      .where(and(
        eq(products.id, params.id),      // Поиск по ID
        eq(products.isActive, true)      // Только активные товары
      ))
      .limit(1); // Ограничиваем результат одним товаром

    // Проверяем, найден ли товар
    if (!product || product.length === 0) {
      throw new Error('Product not found');
    }

    return product[0]; // Возвращаем первый (единственный) найденный товар
    
  } catch (e) {
    console.error('Error getting product by id:', e);
    // Проверяем тип ошибки для возврата корректного сообщения
    throw new Error(e instanceof Error && e.message === 'Product not found' 
      ? 'Product not found' 
      : 'Failed to get product');
  }
};