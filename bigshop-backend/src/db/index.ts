import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Connection string from environment variables
const connectionString = process.env.DATABASE_URL || 
  `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'postgres'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'postgres'}`;

// Disable prefetch as it is not supported for "Transaction" pool mode 
const client = postgres(connectionString, { 
  prepare: false,
  ssl: false // Disable SSL for local development
});

// Create drizzle db instance
export const db = drizzle(client, { schema });

// Export all schema for use in other files
export * from './schema';