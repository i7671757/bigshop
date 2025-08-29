/**
 * =============================================================================
 * MOCK КОНТРОЛЛЕР ДЛЯ ПРОДУКТОВ (временный для тестирования)
 * =============================================================================
 * Этот файл содержит временную реализацию с mock данными для тестирования
 * frontend'а пока не настроена база данных.
 */

import { productQuerySchema } from '../validation/schemas';

// Mock данные продуктов для тестирования
const mockProducts = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Свежие бананы',
    slug: 'fresh-bananas',
    description: 'Спелые желтые бананы из Эквадора. Богаты калием и витаминами.',
    shortDescription: 'Спелые желтые бананы из Эквадора',
    sku: 'FRUIT-BAN-001',
    price: '2.99',
    comparePrice: '3.49',
    categoryId: '550e8400-e29b-41d4-a716-446655440010',
    inventory: 50,
    weight: 0.15,
    dimensions: null,
    images: ['/placeholder-product.jpg'],
    tags: ['фрукты', 'бананы', 'свежие'],
    metaTitle: 'Свежие бананы - купить в BigShop',
    metaDescription: 'Качественные бананы с доставкой. Низкие цены в BigShop.',
    isActive: true,
    isFeatured: true,
    createdAt: new Date('2024-08-01T10:00:00Z'),
    updatedAt: new Date('2024-08-20T15:30:00Z'),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Хлеб белый классический',
    slug: 'white-bread-classic',
    description: 'Мягкий белый хлеб из пшеничной муки высшего сорта. Идеально для завтраков и бутербродов.',
    shortDescription: 'Мягкий белый хлеб из пшеничной муки',
    sku: 'BREAD-WHT-001',
    price: '1.49',
    comparePrice: null,
    categoryId: '550e8400-e29b-41d4-a716-446655440011',
    inventory: 25,
    weight: 0.4,
    dimensions: { length: 25, width: 12, height: 8 },
    images: ['/placeholder-product.jpg'],
    tags: ['хлеб', 'выпечка', 'завтрак'],
    metaTitle: 'Белый хлеб классический - BigShop',
    metaDescription: 'Свежий белый хлеб каждый день. Заказать с доставкой.',
    isActive: true,
    isFeatured: false,
    createdAt: new Date('2024-08-05T09:15:00Z'),
    updatedAt: new Date('2024-08-25T11:45:00Z'),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Молоко 3.2% 1л',
    slug: 'milk-32-1l',
    description: 'Натуральное коровье молоко жирностью 3.2%. Пастеризованное, без консервантов.',
    shortDescription: 'Натуральное коровье молоко 3.2%',
    sku: 'DAIRY-MLK-001',
    price: '1.89',
    comparePrice: '2.19',
    categoryId: '550e8400-e29b-41d4-a716-446655440012',
    inventory: 40,
    weight: 1.0,
    dimensions: { length: 20, width: 6, height: 6 },
    images: ['/placeholder-product.jpg'],
    tags: ['молочные', 'молоко', 'напитки'],
    metaTitle: 'Молоко 3.2% 1л - свежее молоко BigShop',
    metaDescription: 'Свежее натуральное молоко с доставкой на дом.',
    isActive: true,
    isFeatured: true,
    createdAt: new Date('2024-08-03T14:20:00Z'),
    updatedAt: new Date('2024-08-28T16:10:00Z'),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    name: 'Яблоки красные 1кг',
    slug: 'red-apples-1kg',
    description: 'Сладкие красные яблоки сорта Ред Делишес. Выращены в экологически чистых садах.',
    shortDescription: 'Сладкие красные яблоки Ред Делишес',
    sku: 'FRUIT-APP-001',
    price: '3.99',
    comparePrice: null,
    categoryId: '550e8400-e29b-41d4-a716-446655440010',
    inventory: 30,
    weight: 1.0,
    dimensions: null,
    images: ['/placeholder-product.jpg'],
    tags: ['фрукты', 'яблоки', 'красные', '1кг'],
    metaTitle: 'Красные яблоки 1кг - BigShop',
    metaDescription: 'Свежие красные яблоки с доставкой. Качество гарантировано.',
    isActive: true,
    isFeatured: false,
    createdAt: new Date('2024-08-07T11:30:00Z'),
    updatedAt: new Date('2024-08-27T09:25:00Z'),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    name: 'Мясо говядина премиум 500г',
    slug: 'beef-premium-500g',
    description: 'Премиальная говядина высшего сорта. Мраморное мясо для стейков и жарки.',
    shortDescription: 'Премиальная говядина для стейков',
    sku: 'MEAT-BEEF-001',
    price: '12.99',
    comparePrice: '14.99',
    categoryId: '550e8400-e29b-41d4-a716-446655440013',
    inventory: 15,
    weight: 0.5,
    dimensions: null,
    images: ['/placeholder-product.jpg'],
    tags: ['мясо', 'говядина', 'премиум', 'стейк'],
    metaTitle: 'Говядина премиум 500г - BigShop',
    metaDescription: 'Премиальная говядина для гурманов. Доставка в день заказа.',
    isActive: true,
    isFeatured: true,
    createdAt: new Date('2024-08-10T16:45:00Z'),
    updatedAt: new Date('2024-08-29T10:15:00Z'),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    name: 'Сыр российский 200г',
    slug: 'russian-cheese-200g',
    description: 'Классический российский сыр твердых сортов. Нарезка для бутербродов и закусок.',
    shortDescription: 'Классический российский сыр твердый',
    sku: 'DAIRY-CHZ-001',
    price: '4.49',
    comparePrice: null,
    categoryId: '550e8400-e29b-41d4-a716-446655440012',
    inventory: 20,
    weight: 0.2,
    dimensions: { length: 15, width: 10, height: 2 },
    images: ['/placeholder-product.jpg'],
    tags: ['молочные', 'сыр', 'российский'],
    metaTitle: 'Сыр российский 200г - BigShop',
    metaDescription: 'Качественный российский сыр. Заказать онлайн с доставкой.',
    isActive: true,
    isFeatured: false,
    createdAt: new Date('2024-08-12T13:00:00Z'),
    updatedAt: new Date('2024-08-26T17:30:00Z'),
  }
];

/**
 * Mock версия получения списка продуктов с имитацией фильтрации и пагинации
 */
export const getProducts = async ({ query }: { query: any }) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      featured,
      sortBy,
      sortOrder,
      limit,
      offset,
    } = productQuerySchema.parse(query);

    let filteredProducts = [...mockProducts];

    // Имитация фильтрации по поиску
    if (search) {
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Имитация фильтрации по цене
    if (minPrice !== undefined) {
      filteredProducts = filteredProducts.filter(product =>
        parseFloat(product.price) >= minPrice
      );
    }

    if (maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter(product =>
        parseFloat(product.price) <= maxPrice
      );
    }

    // Имитация фильтрации по featured
    if (featured !== undefined) {
      filteredProducts = filteredProducts.filter(product =>
        product.isFeatured === featured
      );
    }

    // Имитация сортировки
    filteredProducts.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = parseFloat(a.price) - parseFloat(b.price);
          break;
        case 'featured':
          comparison = Number(b.isFeatured) - Number(a.isFeatured);
          break;
        case 'created':
        default:
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    // Имитация пагинации
    const total = filteredProducts.length;
    const paginatedProducts = filteredProducts.slice(offset, offset + limit);

    return {
      data: paginatedProducts,
      total,
      limit,
      offset,
      hasMore: offset + limit < total
    };

  } catch (e) {
    console.error('Error getting products:', e);
    throw new Error('Failed to get products');
  }
};

/**
 * Mock версия получения продукта по ID
 */
export const getProductById = async ({ params }: { params: { id: string } }) => {
  try {
    const product = mockProducts.find(p => p.id === params.id);
    
    if (!product) {
      throw new Error('Product not found');
    }

    // Добавляем mock категорию
    const productWithCategory = {
      ...product,
      category: {
        id: product.categoryId,
        name: getCategoryName(product.categoryId),
        slug: 'mock-category',
        description: 'Mock category description'
      }
    };

    return productWithCategory;
    
  } catch (e) {
    console.error('Error getting product by id:', e);
    throw new Error(e instanceof Error && e.message === 'Product not found' 
      ? 'Product not found' 
      : 'Failed to get product');
  }
};

// Вспомогательная функция для mock категорий
function getCategoryName(categoryId: string): string {
  const categories: Record<string, string> = {
    '550e8400-e29b-41d4-a716-446655440010': 'Фрукты',
    '550e8400-e29b-41d4-a716-446655440011': 'Хлеб и выпечка',
    '550e8400-e29b-41d4-a716-446655440012': 'Молочные продукты',
    '550e8400-e29b-41d4-a716-446655440013': 'Мясо и птица',
  };
  
  return categories[categoryId] || 'Другое';
}