/**
 * =============================================================================
 * MOCK ИИ-АССИСТЕНТ ДЛЯ ДЕМОНСТРАЦИИ
 * =============================================================================
 * Временная реализация для тестирования без OpenAI API ключа
 */

import { z } from 'zod';
import { db, products, cartItems } from '../db/index';
import { eq, and, ilike } from 'drizzle-orm';

const chatMessageSchema = z.object({
  message: z.string().min(1).max(1000),
  conversationId: z.string().optional(),
});

/**
 * Mock версия ИИ-ассистента для демонстрации
 */
export const chatWithAssistant = async ({ body, userId }: { body: any; userId: string }) => {
  try {
    const { message } = chatMessageSchema.parse(body);
    const lowerMessage = message.toLowerCase();
    
    // Простая логика обработки запросов
    let response = '';
    let functionResults = [];
    
    // Поиск продуктов
    if (lowerMessage.includes('найди') || lowerMessage.includes('покажи') || lowerMessage.includes('поиск')) {
      const searchResults = await mockSearchProducts(lowerMessage);
      functionResults.push({
        function: 'search_products',
        result: searchResults
      });
      
      if (searchResults.products.length > 0) {
        const productList = searchResults.products
          .map((p: any) => `• ${p.name} - $${p.price}`)
          .join('\n');
        response = `🛒 Вот что я нашел:\n\n${productList}\n\nХотите добавить что-то в корзину?`;
      } else {
        response = '😔 К сожалению, не нашел подходящих товаров. Попробуйте другой запрос!';
      }
    }
    
    // Информация о корзине
    else if (lowerMessage.includes('корзин') || lowerMessage.includes('что у меня')) {
      const cartInfo = await mockGetCartInfo(userId);
      functionResults.push({
        function: 'get_cart_info',
        result: cartInfo
      });
      
      if (cartInfo.totalItems > 0) {
        const itemsList = cartInfo.items
          .map((item: any) => `• ${item.name} x${item.quantity} - $${item.price}`)
          .join('\n');
        response = `🛒 В вашей корзине:\n\n${itemsList}\n\nИтого: ${cartInfo.totalItems} товар(ов) на $${cartInfo.totalAmount}`;
      } else {
        response = '🛒 Ваша корзина пока пуста. Хотите что-нибудь добавить?';
      }
    }
    
    // Добавление в корзину
    else if (lowerMessage.includes('добавь') || lowerMessage.includes('хочу купить')) {
      // Ищем название продукта в сообщении
      const foundProduct = await findProductFromMessage(lowerMessage);
      
      if (foundProduct) {
        const addResult = await mockAddToCart(foundProduct.id, 1, userId);
        functionResults.push({
          function: 'add_to_cart',
          result: addResult
        });
        
        if (addResult.success) {
          response = `✅ ${addResult.message} 🛒`;
        } else {
          response = `❌ ${addResult.message}`;
        }
      } else {
        response = '🤔 Не могу понять, какой товар вы хотите добавить. Уточните, пожалуйста!';
      }
    }
    
    // Рекомендации
    else if (lowerMessage.includes('посоветуй') || lowerMessage.includes('рекомендуй') || lowerMessage.includes('завтрак')) {
      const recommendations = await mockGetRecommendations(lowerMessage);
      functionResults.push({
        function: 'search_products',
        result: recommendations
      });
      
      const productList = recommendations.products
        .map((p: any) => `• ${p.name} - $${p.price} (${p.shortDescription})`)
        .join('\n');
      response = `✨ Рекомендую для вас:\n\n${productList}\n\nХотите добавить что-то в корзину?`;
    }
    
    // Общие вопросы
    else {
      response = `🤖 Привет! Я ваш помощник по покупкам в BigShop. 

Я могу помочь вам:
🔍 Найти нужные продукты
🛒 Добавить товары в корзину  
📋 Показать содержимое корзины
💡 Дать рекомендации

Попробуйте спросить: "Найди молочные продукты" или "Что посоветуешь на завтрак?"`;
    }
    
    return {
      message: response,
      functionResults,
      timestamp: new Date().toISOString(),
      model: 'mock-assistant',
      usage: { total_tokens: 100 }, // Mock usage
    };
    
  } catch (error) {
    console.error('Mock AI assistant error:', error);
    throw new Error('Failed to process AI request');
  }
};

// Вспомогательные mock функции
async function mockSearchProducts(query: string) {
  const conditions = [eq(products.isActive, true)];
  
  if (query.includes('молоч')) {
    // Ищем молочные продукты
    conditions.push(ilike(products.name, '%молоко%'));
  } else if (query.includes('фрукт') || query.includes('яблок') || query.includes('банан')) {
    conditions.push(ilike(products.name, '%яблок%'));
  } else if (query.includes('хлеб')) {
    conditions.push(ilike(products.name, '%хлеб%'));
  }
  
  const foundProducts = await db
    .select({
      id: products.id,
      name: products.name,
      shortDescription: products.shortDescription,
      price: products.price,
      inventory: products.inventory,
    })
    .from(products)
    .where(and(...conditions))
    .limit(5);
    
  return {
    products: foundProducts,
    count: foundProducts.length
  };
}

async function mockGetCartInfo(userId: string) {
  const items = await db
    .select({
      id: cartItems.id,
      quantity: cartItems.quantity,
      product: {
        name: products.name,
        price: products.price,
      }
    })
    .from(cartItems)
    .leftJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.userId, userId));
    
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => {
    if (item.product) {
      return sum + (parseFloat(item.product.price) * item.quantity);
    }
    return sum;
  }, 0);
  
  return {
    items: items.map(item => ({
      name: item.product?.name || 'Неизвестный товар',
      quantity: item.quantity,
      price: item.product?.price || '0'
    })),
    totalItems,
    totalAmount: totalAmount.toFixed(2)
  };
}

async function findProductFromMessage(message: string) {
  // Простой поиск ключевых слов
  if (message.includes('яблок')) {
    const product = await db.select().from(products).where(ilike(products.name, '%яблок%')).limit(1);
    return product[0] || null;
  }
  if (message.includes('банан')) {
    const product = await db.select().from(products).where(ilike(products.name, '%банан%')).limit(1);
    return product[0] || null;
  }
  if (message.includes('молоко')) {
    const product = await db.select().from(products).where(ilike(products.name, '%молоко%')).limit(1);
    return product[0] || null;
  }
  
  return null;
}

async function mockAddToCart(productId: string, quantity: number, userId: string) {
  try {
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);
      
    if (!product || product.length === 0) {
      return { success: false, message: 'Товар не найден' };
    }
    
    const [productData] = product;
    
    const existingItem = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)))
      .limit(1);
      
    if (existingItem && existingItem.length > 0) {
      await db
        .update(cartItems)
        .set({ 
          quantity: existingItem[0].quantity + quantity,
          updatedAt: new Date() 
        })
        .where(eq(cartItems.id, existingItem[0].id));
        
      return { 
        success: true, 
        message: `"${productData.name}" добавлен в корзину` 
      };
    } else {
      await db
        .insert(cartItems)
        .values({
          userId,
          productId,
          quantity,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        
      return { 
        success: true, 
        message: `"${productData.name}" добавлен в корзину` 
      };
    }
  } catch (error) {
    return { success: false, message: 'Ошибка при добавлении' };
  }
}

async function mockGetRecommendations(query: string) {
  // Рекомендации на завтрак
  if (query.includes('завтрак')) {
    const breakfast = await db
      .select({
        id: products.id,
        name: products.name,
        shortDescription: products.shortDescription,
        price: products.price,
        inventory: products.inventory,
      })
      .from(products)
      .where(and(
        eq(products.isActive, true),
        ilike(products.name, '%хлеб%')
      ))
      .limit(3);
      
    return { products: breakfast, count: breakfast.length };
  }
  
  // Общие рекомендации
  const featured = await db
    .select({
      id: products.id,
      name: products.name,
      shortDescription: products.shortDescription,
      price: products.price,
      inventory: products.inventory,
    })
    .from(products)
    .where(and(eq(products.isActive, true), eq(products.isFeatured, true)))
    .limit(3);
    
  return { products: featured, count: featured.length };
}