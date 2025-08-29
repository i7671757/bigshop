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
  // СЛУЖЕБНЫЕ МЕТОДЫ
  // ==========================================================================

  /**
   * Проверка работоспособности API.
   * Используется для мониторинга и диагностики.
   * 
   * @returns Promise с информацией о статусе API
   */
  async healthCheck() {
    return this.request('/health');
  }
}

// Создаем singleton экземпляр клиента для использования во всем приложении
export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;