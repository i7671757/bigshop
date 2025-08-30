/**
 * =============================================================================
 * ИИ-АССИСТЕНТ ДЛЯ ИНТЕРНЕТ-МАГАЗИНА
 * =============================================================================
 * Этот файл содержит логику работы с OpenAI GPT-4 для создания умного
 * ассистента, который помогает пользователям находить и покупать продукты.
 */

import OpenAI from 'openai';
import { z } from 'zod';
import { db, products, cartItems } from '../db/index';
import { eq, and, ilike, lte, gte } from 'drizzle-orm';

// Инициализация OpenAI клиента
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Схема валидации для сообщений чата
const chatMessageSchema = z.object({
  message: z.string().min(1, 'Сообщение не может быть пустым').max(1000, 'Сообщение слишком длинное'),
  conversationId: z.string().optional(),
});

// Определение доступных функций для ИИ
const availableFunctions = [
  {
    type: "function" as const,
    function: {
      name: "search_products",
      description: "Поиск продуктов в каталоге по категории, названию или цене",
      parameters: {
        type: "object",
        properties: {
          query: { 
            type: "string", 
            description: "Поисковый запрос по названию продукта" 
          },
          category: { 
            type: "string", 
            description: "Категория продуктов (фрукты, молочные, мясо, хлеб)" 
          },
          maxPrice: { 
            type: "number", 
            description: "Максимальная цена в долларах" 
          },
          minPrice: { 
            type: "number", 
            description: "Минимальная цена в долларах" 
          }
        }
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "search_and_add_to_cart",
      description: "Найти товар по названию и автоматически добавить в корзину",
      parameters: {
        type: "object",
        properties: {
          productName: { 
            type: "string", 
            description: "Название товара для поиска и добавления (например: 'бананы', 'молоко', 'хлеб')" 
          },
          quantity: { 
            type: "number", 
            description: "Количество товара для добавления", 
            minimum: 1, 
            maximum: 10,
            default: 1
          }
        },
        required: ["productName"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "get_cart_info",
      description: "Получить текущее содержимое корзины пользователя",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  }
];

/**
 * Функции, которые ИИ может вызывать для взаимодействия с системой
 */
const aiAssistantFunctions = {
  /**
   * Поиск товара и автоматическое добавление в корзину
   */
  search_and_add_to_cart: async (args: any, userId: string) => {
    const { productName, quantity = 1 } = args;
    
    try {
      // Ищем товар по названию
      const foundProducts = await db
        .select()
        .from(products)
        .where(and(
          eq(products.isActive, true),
          ilike(products.name, `%${productName}%`)
        ))
        .limit(1);
        
      if (!foundProducts || foundProducts.length === 0) {
        return {
          success: false,
          message: `Товар "${productName}" не найден. Попробуйте другое название.`
        };
      }
      
      const product = foundProducts[0];
      
      // Проверяем наличие
      if (product.inventory < quantity) {
        return {
          success: false,
          message: `Недостаточно товара "${product.name}" на складе. Доступно: ${product.inventory} шт.`
        };
      }
      
      // Добавляем в корзину
      const existingItem = await db
        .select()
        .from(cartItems)
        .where(and(
          eq(cartItems.userId, userId),
          eq(cartItems.productId, product.id)
        ))
        .limit(1);
        
      if (existingItem && existingItem.length > 0) {
        // Обновляем количество
        const newQuantity = existingItem[0].quantity + quantity;
        
        if (product.inventory < newQuantity) {
          return {
            success: false,
            message: `Недостаточно товара на складе. Доступно: ${product.inventory}, в корзине: ${existingItem[0].quantity}`
          };
        }
        
        await db
          .update(cartItems)
          .set({ 
            quantity: newQuantity,
            updatedAt: new Date() 
          })
          .where(eq(cartItems.id, existingItem[0].id));
          
        return {
          success: true,
          message: `"${product.name}" добавлен в корзину! Теперь у вас ${newQuantity} шт.`,
          product: product.name,
          quantity: newQuantity,
          price: product.price
        };
      } else {
        // Добавляем новый товар
        await db
          .insert(cartItems)
          .values({
            userId,
            productId: product.id,
            quantity,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          
        return {
          success: true,
          message: `"${product.name}" добавлен в корзину! (${quantity} шт. по $${product.price})`,
          product: product.name,
          quantity,
          price: product.price
        };
      }
      
    } catch (error) {
      console.error('Error in search_and_add_to_cart:', error);
      return {
        success: false,
        message: 'Ошибка при добавлении товара в корзину'
      };
    }
  },

  /**
   * Поиск продуктов по различным критериям
   */
  search_products: async (args: any) => {
    const { query, category, maxPrice, minPrice } = args;
    
    try {
      const conditions = [];
      
      // Базовое условие - только активные товары
      conditions.push(eq(products.isActive, true));
      
      // Поиск по названию
      if (query) {
        conditions.push(ilike(products.name, `%${query}%`));
      }
      
      // Фильтрация по цене
      if (maxPrice !== undefined) {
        conditions.push(lte(products.price, maxPrice.toString()));
      }
      
      if (minPrice !== undefined) {
        conditions.push(gte(products.price, minPrice.toString()));
      }
      
      // TODO: Добавить фильтрацию по категории когда categories API будет готов
      
      const foundProducts = await db
        .select({
          id: products.id,
          name: products.name,
          description: products.description,
          shortDescription: products.shortDescription,
          price: products.price,
          comparePrice: products.comparePrice,
          inventory: products.inventory,
          images: products.images,
          tags: products.tags,
        })
        .from(products)
        .where(conditions.length ? and(...conditions) : undefined)
        .limit(10);
        
      return {
        products: foundProducts,
        count: foundProducts.length,
        message: foundProducts.length > 0 
          ? `Найдено ${foundProducts.length} товар(ов)` 
          : 'Товары по вашему запросу не найдены'
      };
      
    } catch (error) {
      console.error('Error searching products:', error);
      return {
        products: [],
        count: 0,
        message: 'Ошибка при поиске товаров'
      };
    }
  },

  /**
   * Добавление товара в корзину через ИИ
   */
  add_to_cart: async (args: any, userId: string) => {
    const { productId, quantity } = args;
    
    try {
      // Проверяем существование товара
      const product = await db
        .select()
        .from(products)
        .where(and(eq(products.id, productId), eq(products.isActive, true)))
        .limit(1);
        
      if (!product || product.length === 0) {
        return {
          success: false,
          message: 'Товар не найден или недоступен'
        };
      }
      
      const [productData] = product;
      
      // Проверяем наличие на складе
      if (productData.inventory < quantity) {
        return {
          success: false,
          message: `Недостаточно товара на складе. Доступно: ${productData.inventory} шт.`
        };
      }
      
      // Проверяем, есть ли товар уже в корзине
      const existingItem = await db
        .select()
        .from(cartItems)
        .where(and(
          eq(cartItems.userId, userId),
          eq(cartItems.productId, productId)
        ))
        .limit(1);
        
      if (existingItem && existingItem.length > 0) {
        // Обновляем количество
        const newQuantity = existingItem[0].quantity + quantity;
        
        if (productData.inventory < newQuantity) {
          return {
            success: false,
            message: `Недостаточно товара на складе. Доступно: ${productData.inventory} шт., в корзине: ${existingItem[0].quantity} шт.`
          };
        }
        
        await db
          .update(cartItems)
          .set({ 
            quantity: newQuantity,
            updatedAt: new Date() 
          })
          .where(eq(cartItems.id, existingItem[0].id));
          
        return {
          success: true,
          message: `Количество "${productData.name}" обновлено до ${newQuantity} шт.`,
          product: productData.name,
          quantity: newQuantity
        };
      } else {
        // Добавляем новый товар
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
          message: `"${productData.name}" добавлен в корзину (${quantity} шт.)`,
          product: productData.name,
          quantity
        };
      }
      
    } catch (error) {
      console.error('Error adding to cart via AI:', error);
      return {
        success: false,
        message: 'Ошибка при добавлении товара в корзину'
      };
    }
  },

  /**
   * Получение информации о корзине пользователя
   */
  get_cart_info: async (userId: string) => {
    try {
      const items = await db
        .select({
          id: cartItems.id,
          quantity: cartItems.quantity,
          product: {
            id: products.id,
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
        totalAmount: totalAmount.toFixed(2),
        message: totalItems > 0 
          ? `В корзине ${totalItems} товар(ов) на сумму $${totalAmount.toFixed(2)}` 
          : 'Корзина пуста'
      };
      
    } catch (error) {
      console.error('Error getting cart info:', error);
      return {
        items: [],
        totalItems: 0,
        totalAmount: '0.00',
        message: 'Ошибка при получении информации о корзине'
      };
    }
  }
};

/**
 * Основная функция для обработки сообщений ИИ-ассистента.
 * 
 * @param body - тело запроса с сообщением пользователя
 * @param userId - ID пользователя из Clerk
 * @returns ответ ИИ-ассистента с возможными действиями
 */
export const chatWithAssistant = async ({ body, userId }: { body: any; userId: string }) => {
  try {
    const { message, conversationId } = chatMessageSchema.parse(body);
    
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }
    
    // Создаем запрос к OpenAI с функциями
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `Ты - ИИ-ассистент интернет-магазина продуктов питания BigShop. 

ВАЖНО: Когда пользователь просит ДОБАВИТЬ товар в корзину, ты ОБЯЗАТЕЛЬНО должен:
1. Сначала найти товар через search_products
2. Затем добавить его в корзину через add_to_cart используя productId из результата поиска

ТВОЯ РОЛЬ:
- Помогай пользователям найти нужные продукты
- ОБЯЗАТЕЛЬНО добавляй товары в корзину когда пользователь просит
- Отвечай на вопросы о составе, пользе продуктов  
- Рекомендуй товары и помогай с выбором
- Будь дружелюбным и полезным

ПРАВИЛА ИСПОЛЬЗОВАНИЯ ФУНКЦИЙ:
- "Найди молочные продукты" → search_products
- "Добавь бананы в корзину" → search_and_add_to_cart с productName: "бананы"
- "Что у меня в корзине?" → get_cart_info
- "Добавь 2 литра молока" → search_and_add_to_cart с productName: "молоко", quantity: 2

ВСЕГДА отвечай на русском языке с эмодзи.`
        },
        {
          role: "user",
          content: message
        }
      ],
      tools: availableFunctions,
      tool_choice: "auto", // ИИ сам решает, когда использовать функции
      temperature: 0.7, // Баланс между креативностью и точностью
      max_tokens: 1000, // Ограничение на длину ответа
    });
    
    return await processAssistantResponse(completion, userId);
    
  } catch (error) {
    console.error('Error in AI assistant:', error);
    
    if (error instanceof Error && error.message.includes('API key')) {
      throw new Error('AI assistant temporarily unavailable');
    }
    
    throw new Error('Failed to process AI request');
  }
};

/**
 * Обработка ответа от OpenAI и выполнение функций
 */
async function processAssistantResponse(completion: any, userId: string) {
  const choice = completion.choices[0];
  
  if (!choice) {
    throw new Error('No response from AI');
  }
  
  let assistantMessage = choice.message.content || '';
  const functionCalls = choice.message.tool_calls || [];
  
  // Выполняем функции, если ИИ их вызвал
  const functionResults = [];
  
  for (const functionCall of functionCalls) {
    const functionName = functionCall.function.name;
    const functionArgs = JSON.parse(functionCall.function.arguments);
    
    console.log(`AI calling function: ${functionName}`, functionArgs);
    
    let result;
    
    switch (functionName) {
      case 'search_products':
        result = await aiAssistantFunctions.search_products(functionArgs);
        break;
      case 'search_and_add_to_cart':
        result = await aiAssistantFunctions.search_and_add_to_cart(functionArgs, userId);
        break;
      case 'add_to_cart':
        result = await aiAssistantFunctions.add_to_cart(functionArgs, userId);
        break;
      case 'get_cart_info':
        result = await aiAssistantFunctions.get_cart_info(userId);
        break;
      default:
        result = { error: 'Unknown function' };
    }
    
    functionResults.push({
      function: functionName,
      args: functionArgs,
      result
    });
  }
  
  // Если были вызваны функции, создаем повторный запрос с результатами
  if (functionResults.length > 0) {
    // Проверяем, был ли это запрос на добавление в корзину
    const originalMessage = choice.message.content || '';
    const searchResult = functionResults.find(r => r.function === 'search_products');
    
    // Если найден продукт и оригинальное сообщение содержит "добавь", автоматически добавляем в корзину
    if (searchResult && 
        searchResult.result && 
        'products' in searchResult.result &&
        searchResult.result.products &&
        searchResult.result.products.length > 0 &&
        originalMessage.toLowerCase().includes('добавь')) {
      
      const product = searchResult.result.products[0];
      const addResult = await aiAssistantFunctions.add_to_cart(
        { productId: product.id, quantity: 1 }, 
        userId
      );
      
      functionResults.push({
        function: 'add_to_cart',
        args: { productId: product.id, quantity: 1 },
        result: addResult
      });
    }
    
    const followUpCompletion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `Ты - ИИ-ассистент BigShop. Проанализируй результаты выполненных функций и дай полезный ответ пользователю. 
          
          Если товар был найден И добавлен в корзину - радостно сообщи об этом!
          Если товар найден но НЕ добавлен - предложи добавить.
          Если ничего не найдено - предложи альтернативы.`
        },
        {
          role: "user", 
          content: `Изначальный запрос: "${choice.message.content}"
          
Результаты выполнения функций: ${JSON.stringify(functionResults, null, 2)}`
        }
      ],
      temperature: 0.7,
      max_tokens: 800,
    });
    
    assistantMessage = followUpCompletion.choices[0]?.message?.content || assistantMessage;
  }
  
  return {
    message: assistantMessage,
    functionResults,
    timestamp: new Date().toISOString(),
    model: completion.model,
    usage: completion.usage,
  };
}