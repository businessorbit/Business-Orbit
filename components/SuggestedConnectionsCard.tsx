"use client"

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserPlus, Users } from 'lucide-react'
import { safeApiCall } from '@/lib/utils/api'
import { toast } from 'sonner'

interface SuggestedConnection {
  id: number
  name: string
  profile_photo_url?: string
  role?: string
  score: number
  mutual_connections?: number
}

interface SuggestedConnectionsCardProps {
  className?: string
}

export default function SuggestedConnectionsCard({ className = "" }: SuggestedConnectionsCardProps) {
  const [suggestions, setSuggestions] = useState<SuggestedConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connecting, setConnecting] = useState<Set<number>>(new Set())

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoading(true)
        setError(null)

        // For now, use mock data since we don't have a suggestions API yet
        // In the future, replace with actual API call
        const mockSuggestions: SuggestedConnection[] = [
          {
            id: 1,
            name: 'Sarah Johnson',
            role: 'Product Manager',
            score: 92,
            mutual_connections: 5
          },
          {
            id: 2,
            name: 'John Carter',
            role: 'Tech Lead',
            score: 88,
            mutual_connections: 3
          },
          {
            id: 3,
            name: 'Emily Davis',
            role: 'Designer',
            score: 85,
            mutual_connections: 7
          }
        ]

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500))
        setSuggestions(mockSuggestions)

        // TODO: Replace with actual API call when available
        // const result = await safeApiCall(
        //   () => fetch('/api/suggested-connections', {
        //     credentials: 'include',
        //     headers: {
        //       'Content-Type': 'application/json',
        //     }
        //   }),
        //   'Failed to fetch suggested connections'
        // )

      } catch (error) {
        console.error('Error fetching suggested connections:', error)
        setError('Failed to load suggestions')
      } finally {
        setLoading(false)
      }
    }

    fetchSuggestions()
  }, [])

  const handleConnect = async (userId: number, userName: string) => {
    try {
      setConnecting(prev => new Set(prev).add(userId))
      
      // For now, simulate the connection request
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Remove the suggestion from the list
      setSuggestions(prev => prev.filter(suggestion => suggestion.id !== userId))
      toast.success(`Connection request sent to ${userName}`)
      
      // TODO: Replace with actual API call when available
      // const result = await safeApiCall(
      //   () => fetch('/api/follow', {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json',
      //     },
      //     credentials: 'include',
      //     body: JSON.stringify({
      //       targetUserId: userId,
      //       action: 'follow'
      //     })
      //   }),
      //   'Failed to send connection request'
      // )

    } catch (error) {
      console.error('Error connecting:', error)
      toast.error('Failed to send connection request')
    } finally {
      setConnecting(prev => {
        const newSet = new Set(prev)
        newSet.delete(userId)
        return newSet
      })
    }
  }

  if (loading) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-40 mb-3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-3 bg-muted rounded w-24"></div>
                  <div className="h-3 bg-muted rounded w-16"></div>
                </div>
                <div className="w-16 h-6 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="text-center text-sm text-muted-foreground">
          {error}
        </div>
      </Card>
    )
  }

  return (
    <Card className={`p-4 ${className}`}>
      <h3 className="font-semibold text-sm mb-3">Suggested Connections</h3>
      <div className="space-y-3">
        {suggestions.length === 0 ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">No suggestions available</p>
          </div>
        ) : (
          suggestions.map((suggestion) => (
            <div key={suggestion.id} className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                {suggestion.profile_photo_url ? (
                  <img
                    src={suggestion.profile_photo_url}
                    alt={suggestion.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-semibold">
                    {suggestion.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium">{suggestion.name}</p>
                <p className="text-xs text-muted-foreground">
                  Score: {suggestion.score}
                  {suggestion.mutual_connections && (
                    <span className="ml-1">• {suggestion.mutual_connections} mutual</span>
                  )}
                </p>
              </div>
              <Button
                size="sm"
                className="h-6 px-2 text-xs cursor-pointer"
                onClick={() => handleConnect(suggestion.id, suggestion.name)}
                disabled={connecting.has(suggestion.id)}
              >
                {connecting.has(suggestion.id) ? (
                  <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-3 h-3 mr-1" />
                    Connect
                  </>
                )}
              </Button>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}


