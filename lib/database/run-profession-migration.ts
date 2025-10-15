import pool from '@/lib/config/database';
import fs from 'fs';
import path from 'path';

async function runProfessionMigration() {
  try {
    console.log('🔄 Starting profession column migration...');
    
    // Check if pool is available
    if (!pool) {
      console.error('❌ Database pool not available. Please check DATABASE_URL.');
      process.exit(1);
    }

    // Read the SQL migration file
    const sqlPath = path.join(process.cwd(), 'lib/database/add-profession-column.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 Executing migration SQL...');
    
    // Execute the migration
    const result = await pool.query(sqlContent);
    
    console.log('✅ Migration completed successfully!');
    console.log('📊 Migration result:', result);
    
    // Verify the column exists
    const verifyResult = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'profession'
    `);
    
    if (verifyResult.rows.length > 0) {
      console.log('✅ Profession column verified:', verifyResult.rows[0]);
    } else {
      console.error('❌ Profession column not found after migration');
    }
    
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    console.error('Error details:', {
      code: error.code,
      detail: error.detail,
      hint: error.hint
    });
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Run the migration
runProfessionMigration();
