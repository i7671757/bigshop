/**
 * =============================================================================
 * REACT QUERY PROVIDER - ГЛОБАЛЬНОЕ СОСТОЯНИЕ КЕШИРОВАНИЯ
 * =============================================================================
 * Этот компонент настраивает TanStack Query для всего приложения.
 * Обеспечивает умное кеширование, синхронизацию данных и optimistic updates.
 */

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactNode, useState } from 'react';

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * Провайдер для TanStack Query, который оборачивает все приложение.
 * 
 * Конфигурация кеширования:
 * - staleTime: 5 минут - данные считаются свежими
 * - gcTime: 10 минут - данные хранятся в кеше
 * - Smart retry policy - не повторяем клиентские ошибки (4xx)
 * - Отключена повторная загрузка при фокусе окна
 * 
 * @param children - дочерние React компоненты
 */
export default function QueryProvider({ children }: QueryProviderProps) {
  // Используем useState для создания singleton экземпляра QueryClient
  // Это гарантирует, что клиент создается только один раз при монтировании
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          // =================================================================
          // НАСТРОЙКИ ДЛЯ QUERIES (запросов на чтение данных)
          // =================================================================
          queries: {
            // Время "свежести" данных - 5 минут
            // В течение этого времени запросы не перевыполняются автоматически
            staleTime: 5 * 60 * 1000, // 5 minutes
            
            // Время хранения в кеше - 10 минут
            // После этого времени данные удаляются из памяти
            gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
            
            // Умная логика повторных попыток при ошибках
            retry: (failureCount, error: any) => {
              // Не повторяем запросы при клиентских ошибках (400-499)
              // Эти ошибки обычно связаны с некорректными данными
              if (error?.response?.status >= 400 && error?.response?.status < 500) {
                return false;
              }
              // Для серверных ошибок (5xx) и сетевых проблем делаем до 3 попыток
              return failureCount < 3;
            },
            
            // Отключаем автоматическую перезагрузку при возврате фокуса на окно
            // Это предотвращает ненужные запросы при переключении между вкладками
            refetchOnWindowFocus: false,
          },
          
          // =================================================================
          // НАСТРОЙКИ ДЛЯ MUTATIONS (запросов на изменение данных)
          // =================================================================
          mutations: {
            // Не повторяем мутации при ошибках
            // Обычно пользователь должен сам решить, повторять ли действие
            retry: false,
            
            // Глобальный обработчик ошибок мутаций
            // Логируем все ошибки для отладки
            onError: (error) => {
              console.error('Mutation error:', error);
              // Здесь можно добавить toast уведомления или Sentry логирование
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools для отладки кеша и состояния запросов */}
      {/* Показывается только в development режиме */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}