/**
 * =============================================================================
 * КОНТРОЛЛЕРЫ ДЛЯ РАБОТЫ С КОРЗИНОЙ
 * =============================================================================
 * Этот файл содержит бизнес-логику для управления корзиной покупок.
 * Все функции принимают валидированные данные и возвращают JSON ответы.
 */

import { db, cartItems, products } from '../db/index';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

// Схемы валидации для корзины
const addToCartSchema = z.object({
  productId: z.string().uuid('Некорректный ID продукта'),
  quantity: z.number().int().positive('Количество должно быть положительным числом'),
});

const updateCartSchema = z.object({
  quantity: z.number().int().min(0, 'Количество не может быть отрицательным'),
});

/**
 * Получение содержимого корзины пользователя.
 * 
 * Функционал:
 * - Возвращает все товары в корзине с полной информацией о продуктах
 * - Включает данные о продуктах через JOIN
 * - Подсчитывает общую стоимость
 * 
 * @param userId - ID пользователя из Clerk
 * @returns объект с товарами корзины и общей информацией
 */
export const getCart = async ({ userId }: { userId: string }) => {
  try {
    // Получаем все товары корзины с информацией о продуктах
    const items = await db
      .select({
        id: cartItems.id,
        quantity: cartItems.quantity,
        createdAt: cartItems.createdAt,
        product: {
          id: products.id,
          name: products.name,
          price: products.price,
          comparePrice: products.comparePrice,
          images: products.images,
          inventory: products.inventory,
          isActive: products.isActive,
        }
      })
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, userId));

    // Фильтруем только активные продукты
    const activeItems = items.filter(item => item.product?.isActive);

    // Подсчитываем общую стоимость
    const totalAmount = activeItems.reduce((sum, item) => {
      if (item.product) {
        return sum + (parseFloat(item.product.price) * item.quantity);
      }
      return sum;
    }, 0);

    return {
      items: activeItems,
      totalItems: activeItems.reduce((sum, item) => sum + item.quantity, 0),
      totalAmount: totalAmount.toFixed(2),
    };
    
  } catch (error) {
    console.error('Error getting cart:', error);
    throw new Error('Failed to get cart');
  }
};

/**
 * Добавление товара в корзину.
 * 
 * Функционал:
 * - Проверяет наличие товара на складе
 * - Если товар уже в корзине - увеличивает количество
 * - Если товара нет - создает новую запись
 * - Валидирует доступность товара
 * 
 * @param body - данные запроса с productId и quantity
 * @param userId - ID пользователя из Clerk
 * @returns обновленная информация о добавленном товаре
 */
export const addToCart = async ({ body, userId }: { body: any; userId: string }) => {
  try {
    const { productId, quantity } = addToCartSchema.parse(body);

    // Проверяем существование и доступность товара
    const product = await db
      .select()
      .from(products)
      .where(and(eq(products.id, productId), eq(products.isActive, true)))
      .limit(1);

    if (!product || product.length === 0) {
      throw new Error('Product not found or inactive');
    }

    const [productData] = product;

    // Проверяем наличие на складе
    if (productData.inventory < quantity) {
      throw new Error(`Insufficient stock. Available: ${productData.inventory}`);
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
      // Товар уже в корзине - обновляем количество
      const newQuantity = existingItem[0].quantity + quantity;
      
      // Проверяем общее количество на складе
      if (productData.inventory < newQuantity) {
        throw new Error(`Insufficient stock. Available: ${productData.inventory}, requested: ${newQuantity}`);
      }

      const updatedItem = await db
        .update(cartItems)
        .set({
          quantity: newQuantity,
          updatedAt: new Date(),
        })
        .where(eq(cartItems.id, existingItem[0].id))
        .returning();

      return {
        item: updatedItem[0],
        product: productData,
        message: 'Cart updated successfully',
      };
    } else {
      // Добавляем новый товар в корзину
      const newItem = await db
        .insert(cartItems)
        .values({
          userId,
          productId,
          quantity,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return {
        item: newItem[0],
        product: productData,
        message: 'Product added to cart successfully',
      };
    }
    
  } catch (error) {
    console.error('Error adding to cart:', error);
    if (error instanceof Error) {
      throw error; // Пробрасываем ошибки валидации и бизнес-логики
    }
    throw new Error('Failed to add product to cart');
  }
};

/**
 * Обновление количества товара в корзине.
 * 
 * Функционал:
 * - Обновляет количество существующего товара
 * - Если quantity = 0, удаляет товар из корзины
 * - Проверяет наличие на складе
 * 
 * @param params - параметры URL с itemId
 * @param body - данные с новым количеством
 * @param userId - ID пользователя из Clerk
 * @returns обновленная информация о товаре
 */
export const updateCartItem = async ({ 
  params, 
  body, 
  userId 
}: { 
  params: { itemId: string }; 
  body: any; 
  userId: string;
}) => {
  try {
    const { quantity } = updateCartSchema.parse(body);
    const { itemId } = params;

    // Проверяем, принадлежит ли товар пользователю
    const existingItem = await db
      .select({
        cartItem: cartItems,
        product: products,
      })
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .where(and(
        eq(cartItems.id, itemId),
        eq(cartItems.userId, userId)
      ))
      .limit(1);

    if (!existingItem || existingItem.length === 0) {
      throw new Error('Cart item not found');
    }

    const [itemData] = existingItem;

    // Если quantity = 0, удаляем товар из корзины
    if (quantity === 0) {
      await db
        .delete(cartItems)
        .where(eq(cartItems.id, itemId));

      return {
        message: 'Product removed from cart successfully',
        deleted: true,
      };
    }

    // Проверяем наличие на складе
    if (itemData.product && itemData.product.inventory < quantity) {
      throw new Error(`Insufficient stock. Available: ${itemData.product.inventory}`);
    }

    // Обновляем количество
    const updatedItem = await db
      .update(cartItems)
      .set({
        quantity,
        updatedAt: new Date(),
      })
      .where(eq(cartItems.id, itemId))
      .returning();

    return {
      item: updatedItem[0],
      product: itemData.product,
      message: 'Cart item updated successfully',
    };
    
  } catch (error) {
    console.error('Error updating cart item:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to update cart item');
  }
};

/**
 * Удаление товара из корзины.
 * 
 * @param params - параметры URL с itemId
 * @param userId - ID пользователя из Clerk
 * @returns подтверждение удаления
 */
export const removeFromCart = async ({ 
  params, 
  userId 
}: { 
  params: { itemId: string }; 
  userId: string;
}) => {
  try {
    const { itemId } = params;

    // Проверяем и удаляем товар из корзины пользователя
    const deletedItem = await db
      .delete(cartItems)
      .where(and(
        eq(cartItems.id, itemId),
        eq(cartItems.userId, userId)
      ))
      .returning();

    if (!deletedItem || deletedItem.length === 0) {
      throw new Error('Cart item not found');
    }

    return {
      message: 'Product removed from cart successfully',
      deletedItem: deletedItem[0],
    };
    
  } catch (error) {
    console.error('Error removing from cart:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to remove product from cart');
  }
};

/**
 * Очистка всей корзины пользователя.
 * 
 * @param userId - ID пользователя из Clerk
 * @returns подтверждение очистки корзины
 */
export const clearCart = async ({ userId }: { userId: string }) => {
  try {
    const deletedItems = await db
      .delete(cartItems)
      .where(eq(cartItems.userId, userId))
      .returning();

    return {
      message: 'Cart cleared successfully',
      deletedCount: deletedItems.length,
    };
    
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw new Error('Failed to clear cart');
  }
};