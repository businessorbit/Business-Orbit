import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load local env variables only during local development (not on Vercel/build)
if (process.env.VERCEL !== '1' && process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' });
}

if (!process.env.DATABASE_URL) {
  // Avoid crashing builds in environments where the DB is not needed at build step
  if (process.env.VERCEL === '1' || process.env.NEXT_RUNTIME === 'edge') {
    // Defer error to runtime when the route actually uses the DB
    console.warn('⚠️ DATABASE_URL not set at build time. DB connections will fail at runtime.');
  } else {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.log('📋 Please create a .env.local file with your database configuration');
    console.log('📋 Example: DATABASE_URL=postgresql://username:password@localhost:5432/database_name');
  }
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: process.env.NODE_ENV === 'production' ? 20 : 10, 
  min: process.env.NODE_ENV === 'production' ? 5 : 2,  
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  maxUses: 7500, 
});

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



const testConnection = async (retries = 3) => {
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
        if (process.env.NODE_ENV === 'production') {
          process.exit(1);
        }
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
  await pool.end();
  console.log('✅ Database pool closed');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 Shutting down database pool...');
  await pool.end();
  console.log('✅ Database pool closed');
  process.exit(0);
});

export default pool;
