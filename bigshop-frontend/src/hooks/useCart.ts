/**
 * =============================================================================
 * REACT HOOKS ДЛЯ РАБОТЫ С КОРЗИНОЙ
 * =============================================================================
 * Этот файл содержит React хуки для управления корзиной с использованием
 * TanStack Query для кеширования и синхронизации состояния.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@clerk/nextjs';
import { apiClient } from '@/api/client';
import { CartItem } from '@/types';

/**
 * Хук для работы с корзиной пользователя.
 * 
 * Функционал:
 * - Автоматическое получение корзины при авторизации
 * - Реактивное обновление при изменениях
 * - Оптимистичные обновления UI
 * - Обработка ошибок и loading состояний
 * 
 * @returns объект с данными корзины и методами управления
 */
export function useCart() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  
  // Получение содержимого корзины
  const { data: cartData, isLoading, error, refetch } = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: () => apiClient.getCart(user?.id!),
    enabled: !!user?.id, // Запрос выполняется только для авторизованных пользователей
    staleTime: 1000 * 60 * 2, // 2 минуты до повторного запроса
    gcTime: 1000 * 60 * 10, // 10 минут в кеше
  });

  // Мутация для добавления товара в корзину
  const addToCartMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      apiClient.addToCart(user?.id!, { productId, quantity }),
    onSuccess: () => {
      // Обновляем кеш корзины после успешного добавления
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
    },
    onError: (error) => {
      console.error('Failed to add to cart:', error);
    },
  });

  // Мутация для обновления количества товара
  const updateQuantityMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      apiClient.updateCartItem(user?.id!, itemId, { quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
    },
    onError: (error) => {
      console.error('Failed to update cart item:', error);
    },
  });

  // Мутация для удаления товара из корзины
  const removeFromCartMutation = useMutation({
    mutationFn: (itemId: string) =>
      apiClient.removeFromCart(user?.id!, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
    },
    onError: (error) => {
      console.error('Failed to remove from cart:', error);
    },
  });

  // Мутация для очистки корзины
  const clearCartMutation = useMutation({
    mutationFn: () => apiClient.clearCart(user?.id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
    },
    onError: (error) => {
      console.error('Failed to clear cart:', error);
    },
  });

  // Вычисляемые значения
  const items = cartData?.items || [];
  const totalItems = cartData?.totalItems || 0;
  const totalAmount = parseFloat(cartData?.totalAmount || '0');
  const isEmpty = items.length === 0;

  // Проверка, есть ли товар в корзине
  const isInCart = (productId: string) => {
    return items.some(item => item.product?.id === productId);
  };

  // Получение количества конкретного товара в корзине
  const getItemQuantity = (productId: string) => {
    const item = items.find(item => item.product?.id === productId);
    return item?.quantity || 0;
  };

  return {
    // Данные корзины
    items,
    totalItems,
    totalAmount,
    isEmpty,
    
    // Состояния загрузки
    isLoading,
    error,
    
    // Методы для управления корзиной
    addItem: addToCartMutation.mutate,
    updateQuantity: updateQuantityMutation.mutate,
    removeItem: removeFromCartMutation.mutate,
    clearCart: clearCartMutation.mutate,
    refetch,
    
    // Вспомогательные методы
    isInCart,
    getItemQuantity,
    
    // Состояния мутаций
    isAdding: addToCartMutation.isPending,
    isUpdating: updateQuantityMutation.isPending,
    isRemoving: removeFromCartMutation.isPending,
    isClearing: clearCartMutation.isPending,
    
    // Ошибки мутаций
    addError: addToCartMutation.error,
    updateError: updateQuantityMutation.error,
    removeError: removeFromCartMutation.error,
    clearError: clearCartMutation.error,
  };
}