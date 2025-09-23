import { setupDatabase, checkDatabaseConnection, checkTablesExist } from './setup'

async function main() {
  try {
    console.log('🔍 Checking database connection...')
    const connected = await checkDatabaseConnection()
    
    if (!connected) {
      console.log('❌ Cannot connect to database. Please check your DATABASE_URL in .env.local')
      process.exit(1)
    }
    
    console.log('🔍 Checking if tables exist...')
    const tablesExist = await checkTablesExist()
    
    if (!tablesExist) {
      console.log('🔧 Setting up database tables...')
      await setupDatabase()
    } else {
      console.log('✅ All tables already exist')
    }
    
    console.log('🎉 Database is ready!')
    process.exit(0)
  } catch (error) {
    console.error('💥 Setup failed:', error)
    process.exit(1)
  }
}

main()




