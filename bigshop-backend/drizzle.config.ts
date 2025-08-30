/**
 * =============================================================================
 * КОНФИГУРАЦИЯ DRIZZLE KIT (МИГРАЦИИ И СХЕМА БД)
 * =============================================================================
 * Этот файл настраивает Drizzle Kit для работы с миграциями базы данных,
 * генерации SQL схем и синхронизации структуры БД.
 * 
 * Используется командами:
 * - bun run db:generate - создание миграций при изменении схемы
 * - bun run db:migrate - применение миграций к БД
 * - bun run db:push - прямая синхронизация схемы с БД (для разработки)
 */

import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  // Путь к файлу схемы БД с определениями таблиц
  schema: './src/db/schema.ts',
  
  // Директория для хранения сгенерированных SQL миграций
  out: './src/db/migrations',
  
  // Тип базы данных (PostgreSQL)
  dialect: 'postgresql',
  
  // Параметры подключения к БД для выполнения миграций
  dbCredentials: {
    host: process.env.DB_HOST || '127.0.0.1', // Supabase локальный хост
    port: Number(process.env.DB_PORT) || 54322, // Supabase локальный порт
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'postgres',
    ssl: false, // Отключено для локальной разработки, включить в продакшене
  },
  
  // Подробное логирование операций миграций
  verbose: true,
  
  // Строгая проверка схем и миграций
  strict: true,
});