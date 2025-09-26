const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  statement_timeout: 30000
});

const sampleEvents = [
  {
    title: "AI in Product Development Workshop",
    description: "Learn how to integrate AI into your product development process. This workshop covers practical applications, case studies, and hands-on exercises.",
    date: new Date('2024-12-28T18:00:00Z'),
    event_type: 'physical',
    status: 'approved',
    venue_address: 'WeWork BKC, Mumbai',
    meeting_link: null
  },
  {
    title: "Startup Pitch Night",
    description: "Join us for an exciting evening of startup pitches. Network with entrepreneurs, investors, and industry experts.",
    date: new Date('2025-01-05T19:00:00Z'),
    event_type: 'physical',
    status: 'approved',
    venue_address: '91springboard Koramangala, Bangalore',
    meeting_link: null
  },
  {
    title: "Tech Leaders Roundtable",
    description: "Exclusive roundtable discussion for tech leaders. Share insights, challenges, and best practices in technology leadership.",
    date: new Date('2025-01-15T17:00:00Z'),
    event_type: 'online',
    status: 'approved',
    venue_address: null,
    meeting_link: 'https://meet.google.com/abc-defg-hij'
  },
  {
    title: "Design Thinking Workshop",
    description: "Master the design thinking process with hands-on exercises and real-world case studies. Perfect for product managers and designers.",
    date: new Date('2025-01-20T14:00:00Z'),
    event_type: 'physical',
    status: 'approved',
    venue_address: 'Design Studio, Delhi',
    meeting_link: null
  }
];

async function seedEvents() {
  try {
    console.log('🌱 Seeding events...');
    
    for (const event of sampleEvents) {
      const result = await pool.query(`
        INSERT INTO events (title, description, date, event_type, status, venue_address, meeting_link)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT DO NOTHING
      `, [
        event.title,
        event.description,
        event.date,
        event.event_type,
        event.status,
        event.venue_address,
        event.meeting_link
      ]);
      
      if (result.rowCount > 0) {
        console.log(`✅ Added event: ${event.title}`);
      } else {
        console.log(`⏭️  Event already exists: ${event.title}`);
      }
    }
    
    console.log('🎉 Events seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding events:', error);
  } finally {
    await pool.end();
  }
}

seedEvents();


