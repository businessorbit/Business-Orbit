import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load local env variables only during local development (not on Vercel/build)
if (process.env.VERCEL !== '1' && process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' });
}

// Only log database URL issues in development, not during build
if (!process.env.DATABASE_URL && process.env.NODE_ENV === 'development') {
  console.warn('⚠️ DATABASE_URL not set. Database connections will fail at runtime.');
}

const databaseUrl: string | undefined = process.env.DATABASE_URL;
const shouldUseSsl = Boolean(
  databaseUrl && (
    databaseUrl.includes('render.com') ||
    databaseUrl.includes('neon.tech') ||
    databaseUrl.includes('supabase') ||
    databaseUrl.includes('railway') ||
    /[?&]sslmode=require/.test(databaseUrl)
  )
);

// Ensure a single pool instance across HMR/route reloads in Next.js
declare global {
  // eslint-disable-next-line no-var
  var __PG_POOL__: any;
}

// Create pool only if DATABASE_URL is available
const pool = global.__PG_POOL__ ?? (databaseUrl ? new Pool({
  connectionString: databaseUrl,
  ssl: shouldUseSsl || process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Keep dev pool small to avoid exhausting server connection slots during HMR
  max: process.env.NODE_ENV === 'production' ? 20 : 5,
  min: process.env.NODE_ENV === 'production' ? 5 : 0,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 5_000,
  maxUses: 7_500,
  // Add statement timeout to prevent long-running queries
  statement_timeout: 30_000,
  // Keep TCP connection alive to reduce ECONNRESET in some environments
  keepAlive: true,
}) : null);

if (!global.__PG_POOL__) {
  global.__PG_POOL__ = pool;
}

if (pool) {
  pool.on('error', (err: any) => {
    console.error('❌ Database connection error:', err.message);
    console.error('❌ Error code:', err.code);
    console.error('❌ Error detail:', err.detail);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('⚠️  Server will continue without database connection for now');
    }
  });

  pool.on('connect', (client: any) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔗 New database client connected');
    }
  });
}



const testConnection = async (retries = process.env.NODE_ENV === 'production' ? 3 : 1) => {
  if (!pool) {
    console.warn('⚠️ Database pool not initialized - DATABASE_URL not set');
    return;
  }
  
  for (let i = 0; i < retries; i++) {
    try {
      const result = await pool.query('SELECT NOW() as current_time, version() as version');
      console.log('✅ PostgreSQL Connected');
      console.log(`📊 Database version: ${result.rows[0].version.split(' ')[0]}`);
      console.log(`🕐 Connection time: ${result.rows[0].current_time}`);
      return;
    } catch (err: any) {
      console.error(`❌ Failed to connect to PostgreSQL (attempt ${i + 1}/${retries}):`, err.message);
      if (i === retries - 1) {
        console.log('📋 Please ensure PostgreSQL is installed and running');
        console.log('📋 Check your DATABASE_URL in .env.local file');
        // Do not exit the process in dev; let API routes handle runtime errors gracefully
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
};

// Skip eager connection checks during Vercel build or tests
if (process.env.NODE_ENV !== 'test' && process.env.VERCEL !== '1') {
  testConnection();
}

process.on('SIGINT', async () => {
  console.log('🔄 Shutting down database pool...');
  if (pool) {
    await pool.end();
    console.log('✅ Database pool closed');
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 Shutting down database pool...');
  if (pool) {
    await pool.end();
    console.log('✅ Database pool closed');
  }
  process.exit(0);
});

export default pool;
