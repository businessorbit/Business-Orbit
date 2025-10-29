"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, X } from "lucide-react"

interface SearchResult {
  chapters: Array<{ id: string; name: string; location_city: string }>
  people: Array<{ id: number; name: string; profession: string | null; profile_photo_url: string | null }>
  events: Array<{ id: number; title: string; date: string; event_type: string; venue_address: string | null }>
}

interface SearchModalProps {
  open: boolean
  onClose: () => void
}

export default function SearchModal({ open, onClose }: SearchModalProps) {
  const [q, setQ] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<SearchResult | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!open) {
      setQ("")
      setData(null)
      setError(null)
      setLoading(false)
    }
  }, [open])

  useEffect(() => {
    if (open && inputRef.current) {
      // Focus input when modal opens for immediate typing
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [open])

  const runSearch = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=5`, { credentials: 'include' })
      const json = await res.json()
      if (!res.ok || json.success === false) throw new Error(json.error || 'Search failed')
      setData(json)
    } catch (e: any) {
      setError(e.message || 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-4">
      <Card className="w-full max-w-3xl bg-background border shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            <span className="text-base font-semibold">Search</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close search">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
            <Input
              ref={inputRef}
              aria-label="Search"
              placeholder="Type to search chapters (by location), people, and events"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runSearch()}
              className="pl-12 h-12 text-base placeholder:text-muted-foreground ring-1 ring-border focus-visible:ring-2 focus-visible:ring-foreground/30"
            />
          </div>

          <div className="mt-3">
            <Button onClick={runSearch} disabled={!q.trim() || loading} className="w-full sm:w-auto">
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {error && (
            <div className="mt-3 text-sm text-red-600">{error}</div>
          )}

          {!loading && data && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-semibold mb-2">Chapters</h3>
                <div className="space-y-2">
                  {data.chapters.length === 0 && <p className="text-sm text-muted-foreground">No chapters</p>}
                  {data.chapters.map((c) => (
                    <Card key={c.id} className="p-3 hover:bg-accent/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium">{c.name}</div>
                          <div className="text-xs text-muted-foreground">{c.location_city}</div>
                        </div>
                        <Badge variant="outline">Chapter</Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-2">People</h3>
                <div className="space-y-2">
                  {data.people.length === 0 && <p className="text-sm text-muted-foreground">No people</p>}
                  {data.people.map((p) => (
                    <Card key={p.id} className="p-3 hover:bg-accent/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium">{p.name}</div>
                          <div className="text-xs text-muted-foreground">{p.profession || 'Professional'}</div>
                        </div>
                        <Badge variant="outline">Person</Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-2">Events</h3>
                <div className="space-y-2">
                  {data.events.length === 0 && <p className="text-sm text-muted-foreground">No events</p>}
                  {data.events.map((e) => (
                    <Card key={e.id} className="p-3 hover:bg-accent/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium">{e.title}</div>
                          <div className="text-xs text-muted-foreground">{new Date(e.date).toLocaleString()}</div>
                        </div>
                        <Badge variant="outline">{e.event_type}</Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!loading && !data && (
            <div className="mt-6 text-sm text-muted-foreground">
              Start typing above to search chapters, people, and events.
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}


