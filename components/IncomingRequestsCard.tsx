"use client"

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, X, Clock } from 'lucide-react'
import { safeApiCall } from '@/lib/utils/api'
import { toast } from 'sonner'

interface IncomingRequest {
  id: number
  requesterId: number
  requesterName: string
  requesterPhoto?: string
  status: 'pending' | 'accepted' | 'declined'
  createdAt: string
}

interface IncomingRequestsCardProps {
  className?: string
}

export default function IncomingRequestsCard({ className = "" }: IncomingRequestsCardProps) {
  const [requests, setRequests] = useState<IncomingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState<Set<number>>(new Set())

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true)
        setError(null)

        const result = await safeApiCall(
          () => fetch('/api/follow-requests?type=received', {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            }
          }),
          'Failed to fetch incoming requests'
        )

        if (result.success && result.data && typeof result.data === 'object' && result.data !== null) {
          const data = result.data as any
          if (data.success && Array.isArray(data.requests)) {
            setRequests(data.requests)
          } else {
            setError('Failed to load requests')
          }
        } else {
          setError('Failed to load requests')
        }
      } catch (error) {
        console.error('Error fetching incoming requests:', error)
        setError('Failed to load requests')
      } finally {
        setLoading(false)
      }
    }

    fetchRequests()
  }, [])

  const handleRequestAction = async (requestId: number, action: 'accept' | 'decline', requesterName: string) => {
    try {
      setProcessing(prev => new Set(prev).add(requestId))
      
      const result = await safeApiCall(
        () => fetch(`/api/follow-requests/${requestId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ action })
        }),
        `Failed to ${action} request`
      )
      
      if (result.success) {
        // Remove the request from the list
        setRequests(prev => prev.filter(req => req.id !== requestId))
        toast.success(`Request ${action === 'accept' ? 'accepted' : 'declined'} successfully`)
      } else {
        toast.error(result.error || `Failed to ${action} request`)
      }
    } catch (error) {
      console.error(`Error ${action}ing request:`, error)
      toast.error(`Failed to ${action} request`)
    } finally {
      setProcessing(prev => {
        const newSet = new Set(prev)
        newSet.delete(requestId)
        return newSet
      })
    }
  }

  const formatRequestDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) {
      return 'yesterday'
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  if (loading) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-32 mb-3"></div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-3 bg-muted rounded w-20"></div>
                  <div className="h-3 bg-muted rounded w-16"></div>
                </div>
                <div className="flex space-x-1">
                  <div className="w-6 h-6 bg-muted rounded"></div>
                  <div className="w-6 h-6 bg-muted rounded"></div>
                </div>
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
      <h3 className="font-semibold text-sm mb-3">Incoming Requests</h3>
      <div className="space-y-3">
        {requests.length === 0 ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-2">
              <Clock className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">No pending requests</p>
          </div>
        ) : (
          requests.map((request) => (
            <div key={request.id} className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                {request.requesterPhoto ? (
                  <img
                    src={request.requesterPhoto}
                    alt={request.requesterName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-semibold">
                    {request.requesterName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium">{request.requesterName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatRequestDate(request.createdAt)}
                </p>
              </div>

              {request.status === 'pending' ? (
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    className="h-6 px-2 text-xs bg-black hover:bg-gray-800 text-white cursor-pointer"
                    onClick={() => handleRequestAction(request.id, 'accept', request.requesterName)}
                    disabled={processing.has(request.id)}
                  >
                    {processing.has(request.id) ? (
                      <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Check className="w-3 h-3" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-xs bg-transparent cursor-pointer"
                    onClick={() => handleRequestAction(request.id, 'decline', request.requesterName)}
                    disabled={processing.has(request.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <p
                  className={`text-xs font-semibold ${
                    request.status === 'accepted'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {request.status === 'accepted' ? 'Accepted' : 'Declined'}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  )
}


