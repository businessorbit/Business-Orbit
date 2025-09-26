"use client"

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, Lock } from 'lucide-react'
import { safeApiCall } from '@/lib/utils/api'

interface SecretGroup {
  id: string
  name: string
  description?: string
  member_count?: number
  is_private: boolean
}

interface SecretGroupsCardProps {
  className?: string
}

export default function SecretGroupsCard({ className = "" }: SecretGroupsCardProps) {
  const [groups, setGroups] = useState<SecretGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const fetchSecretGroups = async () => {
      try {
        setLoading(true)
        setError(null)

        // For now, use mock data since we don't have a secret groups API yet
        // In the future, replace with actual API call
        const mockGroups: SecretGroup[] = [
          {
            id: '1',
            name: 'Tech Leaders',
            description: 'Exclusive group for tech leaders',
            member_count: 25,
            is_private: true
          },
          {
            id: '2',
            name: 'Startup Founders',
            description: 'Network of startup founders',
            member_count: 18,
            is_private: true
          }
        ]

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500))
        setGroups(mockGroups)

        // TODO: Replace with actual API call when available
        // const result = await safeApiCall(
        //   () => fetch('/api/secret-groups', {
        //     credentials: 'include',
        //     headers: {
        //       'Content-Type': 'application/json',
        //     }
        //   }),
        //   'Failed to fetch secret groups'
        // )

      } catch (error) {
        console.error('Error fetching secret groups:', error)
        setError('Failed to load secret groups')
      } finally {
        setLoading(false)
      }
    }

    fetchSecretGroups()
  }, [])

  if (loading) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-24"></div>
            </div>
            <div className="w-4 h-4 bg-muted rounded"></div>
          </div>
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-6 bg-muted rounded"></div>
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
      <div className="space-y-3">
        <Button
          variant="ghost"
          className="w-full justify-between p-2 h-auto"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center">
            <Lock className="w-4 h-4 mr-2" />
            <span className="text-sm">Secret Groups</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </Button>
        
        {expanded && (
          <div className="ml-6 mt-2 space-y-1">
            {groups.length === 0 ? (
              <p className="text-xs text-muted-foreground">No secret groups available</p>
            ) : (
              groups.map((group) => (
                <Button
                  key={group.id}
                  variant="ghost"
                  className="w-full justify-start p-1 h-auto text-xs"
                >
                  {group.name}
                </Button>
              ))
            )}
          </div>
        )}
      </div>
    </Card>
  )
}


