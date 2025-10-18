import pool from '@/lib/config/database'

// 20 predefined chapters based on major Indian cities
const PREDEFINED_CHAPTERS = [
  { name: "Mumbai Chapter", location_city: "Mumbai" },
  { name: "Delhi Chapter", location_city: "Delhi" },
  { name: "Bengaluru Chapter", location_city: "Bengaluru" },
  { name: "Chennai Chapter", location_city: "Chennai" },
  { name: "Kolkata Chapter", location_city: "Kolkata" },
  { name: "Hyderabad Chapter", location_city: "Hyderabad" },
  { name: "Pune Chapter", location_city: "Pune" },
  { name: "Ahmedabad Chapter", location_city: "Ahmedabad" },
  { name: "Chandigarh Chapter", location_city: "Chandigarh" },
  { name: "Indore Chapter", location_city: "Indore" },
  { name: "Bhubaneswar Chapter", location_city: "Bhubaneswar" },
  { name: "Noida Chapter", location_city: "Noida" },
  { name: "Gurugram Chapter", location_city: "Gurugram" },
  { name: "Jaipur Chapter", location_city: "Jaipur" },
  { name: "Lucknow Chapter", location_city: "Lucknow" },
  { name: "Kanpur Chapter", location_city: "Kanpur" },
  { name: "Nagpur Chapter", location_city: "Nagpur" },
  { name: "Visakhapatnam Chapter", location_city: "Visakhapatnam" },
  { name: "Surat Chapter", location_city: "Surat" },
  { name: "Vadodara Chapter", location_city: "Vadodara" }
]

export async function seedChapters() {
  try {
    console.log('🌱 Starting chapter seeding...')
    
    // First, clean up any existing chapters to ensure we only have the predefined ones
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      
      // Delete all existing chapters
      await client.query('DELETE FROM chapters')
      console.log('🧹 Cleaned up existing chapters')
      
      // Insert predefined chapters
      for (const chapter of PREDEFINED_CHAPTERS) {
        await client.query(
          'INSERT INTO chapters (name, location_city) VALUES ($1, $2)',
          [chapter.name, chapter.location_city]
        )
      }
      
      await client.query('COMMIT')
      console.log(`✅ Successfully seeded ${PREDEFINED_CHAPTERS.length} chapters`)
      
      return { 
        success: true, 
        message: `Successfully seeded ${PREDEFINED_CHAPTERS.length} chapters`,
        chapters: PREDEFINED_CHAPTERS
      }
    } catch (error: any) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error: any) {
    console.error('❌ Chapter seeding failed:', error.message)
    return { 
      success: false, 
      error: error.message,
      message: 'Failed to seed chapters'
    }
  }
}

export async function getChapterStats() {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_chapters,
        COUNT(DISTINCT location_city) as unique_cities,
        COUNT(cm.user_id) as total_memberships
      FROM chapters c
      LEFT JOIN chapter_memberships cm ON c.id = cm.chapter_id
    `)
    
    const stats = result.rows[0]
    return {
      total_chapters: parseInt(stats.total_chapters),
      unique_cities: parseInt(stats.unique_cities),
      total_memberships: parseInt(stats.total_memberships)
    }
  } catch (error: any) {
    console.error('Error getting chapter stats:', error.message)
    throw error
  }
}

// CLI script
if (require.main === module) {
  async function main() {
    try {
      console.log('🔍 Checking chapter database...')
      const stats = await getChapterStats()
      console.log('📊 Current stats:', stats)
      
      if (stats.total_chapters === 0) {
        console.log('🌱 No chapters found, seeding...')
        const result = await seedChapters()
        if (result.success) {
          console.log('🎉 Chapter seeding completed successfully!')
        } else {
          console.error('💥 Chapter seeding failed:', result.error)
          process.exit(1)
        }
      } else {
        console.log('✅ Chapters already exist, skipping seeding')
      }
      
      // Show final stats
      const finalStats = await getChapterStats()
      console.log('📊 Final stats:', finalStats)
      
      process.exit(0)
    } catch (error) {
      console.error('💥 Script failed:', error)
      process.exit(1)
    }
  }
  
  main()
}




