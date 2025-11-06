import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/config/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = (searchParams.get('q') || '').trim()
    const limitParam = parseInt(searchParams.get('limit') || '5')
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 25) : 5

    if (!q) {
      return NextResponse.json({
        success: true,
        query: q,
        chapters: [],
        people: [],
        events: []
      })
    }

    const client = await pool.connect()
    try {
      // Chapters by location/name
      const chaptersQuery = `
        SELECT id, name, location_city
        FROM chapters
        WHERE name ILIKE $1 OR location_city ILIKE $1
        ORDER BY location_city, name
        LIMIT $2
      `
      const chaptersResult = await client.query(chaptersQuery, [
        `%${q}%`,
        limit
      ])

      // People (users) by name/profession
      const peopleQuery = `
        SELECT id, name, profession, profile_photo_url
        FROM users
        WHERE name ILIKE $1 OR profession ILIKE $1
        ORDER BY name
        LIMIT $2
      `
      const peopleResult = await client.query(peopleQuery, [
        `%${q}%`,
        limit
      ])

      // People who belong to chapters matching the query (by chapter name or location)
      const peopleByChapterQuery = `
        SELECT DISTINCT u.id, u.name, u.profession, u.profile_photo_url
        FROM users u
        JOIN chapter_memberships cm ON cm.user_id = u.id
        JOIN chapters c ON c.id = cm.chapter_id
        WHERE c.name ILIKE $1 OR c.location_city ILIKE $1
        ORDER BY u.name
        LIMIT $2
      `
      const peopleByChapterResult = await client.query(peopleByChapterQuery, [
        `%${q}%`,
        limit
      ])

      // Events by title/venue
      const eventsQuery = `
        SELECT id, title, date, event_type, venue_address
        FROM events
        WHERE title ILIKE $1 OR COALESCE(venue_address, '') ILIKE $1
        ORDER BY date DESC
        LIMIT $2
      `
      const eventsResult = await client.query(eventsQuery, [
        `%${q}%`,
        limit
      ])

      // Merge people from name/profession and from matched chapters, deduplicate by id
      const peopleMap = new Map<number, any>()
      for (const row of peopleResult.rows) {
        peopleMap.set(row.id, row)
      }
      for (const row of peopleByChapterResult.rows) {
        if (!peopleMap.has(row.id)) {
          peopleMap.set(row.id, row)
        }
      }

      // Also pull chapters for the matched people (so person queries show their chapters)
      const matchedPeopleIds = Array.from(peopleMap.keys())
      let chaptersByPeople: any[] = []
      if (matchedPeopleIds.length > 0) {
        const chaptersByPeopleQuery = `
          SELECT DISTINCT c.id, c.name, c.location_city
          FROM chapter_memberships cm
          JOIN chapters c ON c.id = cm.chapter_id
          WHERE cm.user_id = ANY($1::int[])
          ORDER BY c.location_city, c.name
        `
        const chaptersByPeopleResult = await client.query(chaptersByPeopleQuery, [matchedPeopleIds])
        chaptersByPeople = chaptersByPeopleResult.rows
      }

      // Merge chapters from direct chapter query and from matched people's memberships
      const chaptersMap = new Map<string, any>()
      for (const row of chaptersResult.rows) {
        chaptersMap.set(String(row.id), row)
      }
      for (const row of chaptersByPeople) {
        const key = String(row.id)
        if (!chaptersMap.has(key)) {
          chaptersMap.set(key, row)
        }
      }

      return NextResponse.json({
        success: true,
        query: q,
        chapters: Array.from(chaptersMap.values()),
        people: Array.from(peopleMap.values()),
        events: eventsResult.rows
      })
    } finally {
      client.release()
    }
  } catch {
    return NextResponse.json({ success: false, error: 'Search failed' }, { status: 500 })
  }
}


