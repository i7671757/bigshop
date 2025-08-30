/**
 * =============================================================================
 * HTTP API КЛИЕНТ ДЛЯ FRONTEND
 * =============================================================================
 * Этот файл содержит типобезопасный HTTP клиент для взаимодействия с backend API.
 * Все методы возвращают Promise с типизированными данными.
 */

import { Product, ProductQueryParams, ProductsResponse, ApiError } from '@/types';

// URL backend API из переменных окружения или localhost для разработки
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

/**
 * Класс для выполнения HTTP запросов к API.
 * Обеспечивает единообразную обработку ошибок и автоматическую типизацию ответов.
 */
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Универсальный метод для выполнения HTTP запросов.
   * 
   * Функционал:
   * - Автоматическое добавление заголовков
   * - Обработка JSON и текстовых ответов
   * - Детальная обработка ошибок с логированием
   * - Типобезопасность через generics
   * 
   * @param endpoint - путь к API endpoint (например, '/products')
   * @param options - дополнительные параметры fetch
   * @returns Promise с типизированными данными
   */
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Настройки запроса по умолчанию
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json', // Указываем что отправляем JSON
        ...options?.headers, // Объединяем с пользовательскими заголовками
      },
      ...options, // Объединяем остальные параметры запроса
    };

    try {
      // Выполняем HTTP запрос
      const response = await fetch(url, config);
      
      // Проверяем статус ответа
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Определяем тип контента и парсим ответ соответственно
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json(); // Парсим JSON ответ
      }
      
      return await response.text() as T; // Возвращаем текстовый ответ
      
    } catch (error) {
      // Логируем ошибку для отладки
      console.error(`API Error (${endpoint}):`, error);
      throw error; // Пробрасываем ошибку дальше
    }
  }

  // ==========================================================================
  // МЕТОДЫ ДЛЯ РАБОТЫ С ПРОДУКТАМИ
  // ==========================================================================

  /**
   * Получение списка продуктов с фильтрацией и пагинацией.
   * 
   * @param params - параметры фильтрации (категория, поиск, цены, сортировка)
   * @returns Promise с массивом продуктов и метаданными пагинации
   */
  async getProducts(params?: ProductQueryParams): Promise<ProductsResponse> {
    // Создаем URL параметры для GET запроса
    const searchParams = new URLSearchParams();
    
    // Добавляем только определенные параметры в query string
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    // Формируем endpoint с параметрами
    const endpoint = `/products${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request<ProductsResponse>(endpoint);
  }

  /**
   * Получение детальной информации о конкретном продукте.
   * 
   * @param id - UUID идентификатор продукта
   * @returns Promise с полной информацией о продукте
   */
  async getProduct(id: string): Promise<Product> {
    return this.request<Product>(`/products/${id}`);
  }

  // ==========================================================================
  // МЕТОДЫ ДЛЯ РАБОТЫ С КАТЕГОРИЯМИ
  // ==========================================================================

  /**
   * Получение списка всех категорий товаров.
   * 
   * @returns Promise с массивом категорий
   */
  async getCategories() {
    return this.request('/categories');
  }

  // ==========================================================================
  // МЕТОДЫ ДЛЯ РАБОТЫ С КОРЗИНОЙ
  // ==========================================================================

  /**
   * Получение содержимого корзины пользователя.
   * 
   * @param userId - ID пользователя из Clerk
   * @returns Promise с содержимым корзины
   */
  async getCart(userId: string) {
    return this.request(`/cart/${userId}`);
  }

  /**
   * Добавление товара в корзину.
   * 
   * @param userId - ID пользователя из Clerk  
   * @param data - объект с productId и quantity
   * @returns Promise с результатом добавления
   */
  async addToCart(userId: string, data: { productId: string; quantity: number }) {
    return this.request(`/cart/${userId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Обновление количества товара в корзине.
   * 
   * @param userId - ID пользователя из Clerk
   * @param itemId - ID записи в корзине
   * @param data - объект с новым quantity
   * @returns Promise с результатом обновления
   */
  async updateCartItem(userId: string, itemId: string, data: { quantity: number }) {
    return this.request(`/cart/${userId}/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Удаление товара из корзины.
   * 
   * @param userId - ID пользователя из Clerk
   * @param itemId - ID записи в корзине
   * @returns Promise с подтверждением удаления
   */
  async removeFromCart(userId: string, itemId: string) {
    return this.request(`/cart/${userId}/items/${itemId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Очистка всей корзины пользователя.
   * 
   * @param userId - ID пользователя из Clerk
   * @returns Promise с подтверждением очистки
   */
  async clearCart(userId: string) {
    return this.request(`/cart/${userId}`, {
      method: 'DELETE',
    });
  }

  // ==========================================================================
  // СЛУЖЕБНЫЕ МЕТОДЫ
  // ==========================================================================

  /**
   * Проверка работоспособности API.
   * Используется для мониторинга и диагностики.
   * 
   * @returns Promise с информацией о статусе API
   */
  async healthCheck() {
    // Health endpoint находится на корневом уровне API, не в /api/v1 группе
    const healthURL = this.baseURL.replace('/api/v1', '') + '/health';
    
    try {
      const response = await fetch(healthURL);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json() as { status: string; timestamp: string; database: string };
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }
}

// Создаем singleton экземпляр клиента для использования во всем приложении
export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;