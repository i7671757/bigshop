/**
 * =============================================================================
 * КОНФИГУРАЦИЯ БАЗЫ ДАННЫХ И ORM
 * =============================================================================
 * Этот файл настраивает подключение к PostgreSQL базе данных через Drizzle ORM.
 * Используется для всех операций с данными в BigShop приложении.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

/**
 * Строка подключения к базе данных.
 * 
 * Приоритет настроек:
 * 1. DATABASE_URL из переменных окружения (для продакшена и Supabase)
 * 2. Fallback на отдельные переменные DB_USER, DB_PASSWORD, etc. (для разработки)
 * 
 * Формат: postgresql://username:password@hostname:port/database_name
 */
const connectionString = process.env.DATABASE_URL || 
  `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'postgres'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'postgres'}`;

/**
 * Настройка PostgreSQL клиента для Drizzle ORM.
 * 
 * Конфигурация для разработки:
 * - prepare: false - отключает prepared statements для совместимости с Supabase
 * - ssl: false - отключает SSL для локальной разработки
 * 
 * В продакшене нужно будет включить SSL и другие настройки безопасности.
 */
const client = postgres(connectionString, { 
  prepare: false, // Необходимо для работы с Supabase локально
  ssl: false // Отключаем SSL для localhost, в продакшене должно быть true
});

/**
 * Основной экземпляр Drizzle ORM для выполнения SQL запросов.
 * 
 * Этот объект используется во всех контроллерах для:
 * - SELECT запросов (получение данных)
 * - INSERT запросов (создание новых записей) 
 * - UPDATE запросов (изменение существующих записей)
 * - DELETE запросов (удаление записей)
 * 
 * Включает схему БД для типобезопасности запросов.
 */
export const db = drizzle(client, { schema });

/**
 * Экспорт всех таблиц, типов и схем для использования в контроллерах.
 * 
 * Включает:
 * - Таблицы: users, products, categories, orders, orderItems, addresses, cartItems
 * - Relations: связи между таблицами для JOIN запросов
 * - Enums: orderStatusEnum и другие перечисления
 * - Types: автогенерированные TypeScript типы для всех таблиц
 */
export * from './schema';