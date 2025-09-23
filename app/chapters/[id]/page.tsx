"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PostCard } from "@/components/post-card"
import { Users, Calendar, Trophy, MapPin, Plus, Loader2, ArrowLeft, Smile, Paperclip, Send, Copy, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { io, Socket } from "socket.io-client"
import { useAuth } from "@/contexts/AuthContext"
import { safeApiCall } from "@/lib/utils/api"
import { toast } from "sonner"

interface ChapterData {
  id: string
  name: string
  location_city: string
  member_count: number
  description?: string
  joined_at?: string
}

interface ChapterMember {
  id: number
  name: string
  email: string
  profile_photo_url?: string
}

interface ChapterPost {
  author: {
    name: string
    role: string
    avatar: string
    rewardScore: number
  }
  content: string
  timestamp: string
  engagement: {
    likes: number
    comments: number
    shares: number
  }
}

interface ChapterEvent {
  title: string
  date: string
  time: string
  attendees: number
}

interface TopContributor {
  name: string
  role: string
  score: number
  avatar: string
}

export default function ChapterPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [chapterData, setChapterData] = useState<ChapterData | null>(null)
  const [chapterMembers, setChapterMembers] = useState<ChapterMember[]>([])
  const [loading, setLoading] = useState(true)
  const [membersLoading, setMembersLoading] = useState(false)
  // Chat state
  type ChatMessage = {
    id: string
    chapterId: string
    senderId: string
    senderName: string
    senderAvatarUrl?: string | null
    content: string
    timestamp: string
  }
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState<boolean>(false)
  const messagesContainerRef = (globalThis as any).__messagesContainerRef as { current: HTMLDivElement | null } || { current: null }
  ;(globalThis as any).__messagesContainerRef = messagesContainerRef
  const [input, setInput] = useState<string>("")
  const [connecting, setConnecting] = useState<boolean>(true)
  const [connectionError, setConnectionError] = useState<string>("")
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false)
  const fileInputRef = (globalThis as any).__chapterFileInputRef as { current: HTMLInputElement | null } || { current: null }
  ;(globalThis as any).__chapterFileInputRef = fileInputRef
  const socketRef = (globalThis as any).__chapterSocketRef as { current: Socket | null } || { current: null }
  ;(globalThis as any).__chapterSocketRef = socketRef
  
  const fetchingMembersRef = (globalThis as any).__fetchingMembersRef as { current: boolean } || { current: false }
  ;(globalThis as any).__fetchingMembersRef = fetchingMembersRef
  // Chat server endpoints: separate HTTP base and WS base
  const CHAT_HTTP_URL = process.env.NEXT_PUBLIC_CHAT_SOCKET_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4000')
  const CHAT_WS_URL = CHAT_HTTP_URL.replace(/^http/, 'ws')
  const [onlineCount, setOnlineCount] = useState<number>(0)
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())

  // Mock data for posts, events, and contributors (can be replaced with real APIs later)
  const chapterPosts: ChapterPost[] = [
  {
    author: {
      name: "Rajesh Kumar",
      role: "Tech Lead",
      avatar: "RK",
      rewardScore: 88,
    },
      content: "Excited to announce our upcoming AI workshop next week! We'll be covering practical applications of machine learning in product development. Who's interested in joining?",
    timestamp: "3h ago",
    engagement: {
      likes: 15,
      comments: 8,
      shares: 2,
    },
  },
  {
    author: {
      name: "Priya Sharma",
      role: "Product Manager",
      avatar: "PS",
      rewardScore: 92,
    },
      content: "Great networking session yesterday! Connected with some amazing founders working on fintech solutions. The startup ecosystem is truly thriving.",
    timestamp: "1d ago",
    engagement: {
      likes: 23,
      comments: 6,
      shares: 4,
    },
  },
]

  const upcomingEvents: ChapterEvent[] = [
  {
    title: "AI Workshop",
    date: "Dec 28",
    time: "6:00 PM",
    attendees: 32,
  },
  {
    title: "Startup Pitch Night",
    date: "Jan 5",
    time: "7:00 PM",
    attendees: 67,
  },
  {
    title: "Tech Talk: Blockchain",
    date: "Jan 12",
    time: "6:30 PM",
    attendees: 28,
  },
]

  const topContributors: TopContributor[] = [
  { name: "Sarah Chen", role: "Product Manager", score: 95, avatar: "SC" },
  { name: "Michael Rodriguez", role: "Tech Lead", score: 88, avatar: "MR" },
  { name: "Priya Sharma", role: "Marketing Director", score: 92, avatar: "PS" },
  { name: "Alex Thompson", role: "UX Designer", score: 85, avatar: "AT" },
]

  // Fetch chapter data
  const fetchChapterData = async () => {
    if (!params.id) return

    setLoading(true)
    try {
      // First, get all chapters to find the one with matching ID
      const chaptersResult = await safeApiCall(
        () => fetch('/api/chapters', { credentials: 'include' }),
        'Failed to fetch chapters'
      )

      if (chaptersResult.success && chaptersResult.data && typeof chaptersResult.data === 'object' && chaptersResult.data !== null) {
        const data = chaptersResult.data as any
        const chapters = data.chapters || []
        const chapter = chapters.find((c: any) => c.id === params.id)
        
        if (chapter) {
          setChapterData({
            id: chapter.id,
            name: chapter.name,
            location_city: chapter.location_city,
            member_count: 0, // Will be updated when we fetch members
            description: `A community of professionals and innovators in ${chapter.location_city}`,
            joined_at: "Member since Jan 2024" // This could be fetched from user's membership
          })
        } else {
          toast.error('Chapter not found')
          router.push('/chapters')
          return
        }
      } else {
        toast.error('Failed to load chapter data')
        router.push('/chapters')
        return
      }
    } catch (error) {
      console.error('Error fetching chapter data:', error)
      toast.error('Failed to load chapter data')
      router.push('/chapters')
    } finally {
      setLoading(false)
    }
  }

  // Fetch chapter members
  const fetchChapterMembers = async () => {
    if (!params.id || membersLoading || fetchingMembersRef.current) return

    fetchingMembersRef.current = true
    setMembersLoading(true)
    try {
      console.log('Fetching chapter members for:', params.id)
      const result = await safeApiCall(
        () => fetch(`/api/chapters/${params.id}/members`, { credentials: 'include' }),
        'Failed to fetch chapter members'
      )

      console.log('Chapter members API result:', result)

      if (result.success && result.data && typeof result.data === 'object' && result.data !== null) {
        const data = result.data as any
        const members = data.members || []
        console.log('Setting chapter members:', members.length, 'members')
        setChapterMembers(members)
        
        // Member count will be displayed separately, no need to update chapterData
      } else {
        console.error('API call failed or returned no data:', result)
        if (result.error) {
          console.error('Error fetching chapter members:', result.error)
          toast.error('Failed to load chapter members')
        }
      }
    } catch (error) {
      console.error('Exception in fetchChapterMembers:', error)
      toast.error('Failed to load chapter members')
    } finally {
      setMembersLoading(false)
      fetchingMembersRef.current = false
    }
  }

  useEffect(() => {
    if (!authLoading && user) {
      console.log('Fetching chapter data for ID:', params.id);
      fetchChapterData()
    }
  }, [params.id, authLoading, user])

  useEffect(() => {
    if (chapterData && params.id) {
      console.log('Fetching chapter members for:', chapterData.id);
      // Add a small delay to prevent rapid successive calls
      const timeoutId = setTimeout(() => {
        fetchChapterMembers()
      }, 100)
      
      return () => clearTimeout(timeoutId)
    }
  }, [chapterData?.id]) // Only depend on chapterData.id to avoid infinite loops

  // Load initial messages
  useEffect(() => {
    async function load() {
      if (!params.id) return
      try {
        // Try app API first (auth-protected, membership aware)
        const res = await fetch(`/api/chat/${params.id}/messages?limit=50`, { credentials: 'include' })
        if (res.ok) {
          const data = await res.json() as { success: boolean; messages: ChatMessage[]; nextCursor?: string | null }
          console.log('Loaded messages from API:', data.messages.length, 'messages')
          if (data.success && data.messages.length) {
            setMessages(data.messages)
            setNextCursor(data.nextCursor || null)
            return
          }
        }
        // Fallback: read directly from chat server history if app API returned none
        const res2 = await fetch(`${CHAT_HTTP_URL}/messages/${params.id}?limit=50`)
        if (res2.ok) {
          const data2 = await res2.json() as { success: boolean; messages: ChatMessage[] }
          if (data2.success) {
            console.log('Loaded messages from ChatServer:', data2.messages.length, 'messages')
            setMessages(data2.messages)
          }
        }
      } catch (e) {
        console.error('Load chat messages error', e)
      }
    }
    load()
    // Also refresh when tab regains focus to ensure latest persisted messages
    const onFocus = () => load()
    window.addEventListener('visibilitychange', onFocus)
    window.addEventListener('focus', onFocus)
    return () => {
      window.removeEventListener('visibilitychange', onFocus)
      window.removeEventListener('focus', onFocus)
    }
  }, [params.id])

  // Connect websocket
  useEffect(() => {
    if (!params.id || authLoading) return
    
    console.log('WebSocket useEffect - User object:', { 
      userId: user?.id, 
      userName: user?.name, 
      userType: typeof user?.id,
      chapterId: params.id,
      authLoading 
    })
    
    if (!socketRef.current) {
      // Test server connectivity first
      console.log('Testing server connectivity to:', CHAT_HTTP_URL)
      fetch(`${CHAT_HTTP_URL}/health`)
        .then(res => res.json())
        .then(data => console.log('Server health check:', data))
        .catch(err => console.error('Server health check failed:', err))
      
      const s = io(CHAT_WS_URL, {
        autoConnect: true,
        withCredentials: true,
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        transports: ['polling', 'websocket'],
        upgrade: true,
        rememberUpgrade: true
      })
      socketRef.current = s
      s.off('connect').on('connect', () => { 
        setConnecting(false); 
        setConnectionError("") 
        console.log('Socket connected successfully')
        // Join room on every successful (re)connect
        const uid = user?.id ? String(user.id) : ''
        if (uid && params.id) {
          s.emit('joinRoom', { chapterId: String(params.id), userId: uid }, (res: any) => {
            if (!res?.ok) {
              console.error('joinRoom denied on connect:', res?.error)
              setConnectionError(res?.error || 'Join denied')
            } else {
              console.log('Successfully joined room after connect')
              setConnectionError("")
            }
          })
        }
      })
      s.off('disconnect').on('disconnect', () => {
        setConnecting(true)
        console.log('Socket disconnected')
      })
      s.off('connect_error').on('connect_error', (error: any) => {
        console.error('Socket connection error:', error)
        console.error('Error details:', {
          message: error.message,
          description: error.description,
          context: error.context,
          type: error.type
        })
        setConnectionError('Connection failed. Retrying...')
      })
      // Deduplicate socket deliveries using a global Set
      ;(globalThis as any).__processedChatMsgIds = (globalThis as any).__processedChatMsgIds || new Set<string>()
      const processed = (globalThis as any).__processedChatMsgIds as Set<string>
      s.off('newMessage').on('newMessage', (msg: ChatMessage) => {
        if (processed.has(msg.id)) return
        processed.add(msg.id)
        console.log('Received new message via socket:', msg.content)
        if (String(msg.chapterId) === String(params.id)) {
          setMessages(prev => {
            const exists = prev.some(m => m.id === msg.id)
            if (exists) return prev
            const optimisticIndex = prev.findIndex(m => 
              m.content === msg.content && 
              m.senderId === msg.senderId && 
              m.id.startsWith('tmp-')
            )
            if (optimisticIndex !== -1) {
              const updated = [...prev]
              updated[optimisticIndex] = msg
              return updated
            }
            return [...prev, msg]
          })
        }
        // Keep processed IDs for the session to avoid any duplicate prints permanently
      })
      s.off('presence').on('presence', (p: { count: number }) => {
        setOnlineCount(p?.count || 0)
      })
      s.off('typing').on('typing', ({ userId }: { userId: string }) => {
        if (String(userId) === String(user?.id)) return
        setTypingUsers(prev => new Set([...prev, String(userId)]))
      })
      s.off('stopTyping').on('stopTyping', ({ userId }: { userId: string }) => {
        setTypingUsers(prev => {
          const newSet = new Set(prev)
          newSet.delete(String(userId))
          return newSet
        })
      })
      // If already connected and we have credentials, attempt initial join once
      const uid = user?.id ? String(user.id) : ''
      if (uid && params.id && s.connected) {
        s.emit('joinRoom', { chapterId: String(params.id), userId: uid }, (res: any) => {
          if (!res?.ok) {
            console.error('joinRoom denied:', res?.error)
            setConnectionError(res?.error || 'Join denied')
          } else {
            console.log('Successfully joined room')
            setConnectionError("")
          }
        })
      }
    }
    // Cleanup: ensure we don't accumulate duplicate listeners across navigations
    return () => {
      const s = socketRef.current
      if (s) {
        s.off('newMessage')
        s.off('presence')
        s.off('typing')
        s.off('stopTyping')
        s.off('connect')
        s.off('disconnect')
        s.off('connect_error')
      }
    }
  }, [params.id, user?.id, authLoading])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || !user?.id || !params.id) return
    
    // Generate a unique ID for this message
    const tempId = `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    
    const msg: ChatMessage = {
      id: tempId,
      chapterId: String(params.id),
      senderId: String(user.id),
      senderName: user.name || 'You',
      senderAvatarUrl: (user as any)?.avatar_url || null,
      content: text,
      timestamp: new Date().toISOString()
    }
    
    setInput("")
    console.log('Sending message:', msg.content)
    
    // Optimistic update
    setMessages(prev => [...prev, msg])
    // Try WebSocket with ack; if no ack in 2s, force HTTP persist
    try {
      if (socketRef.current?.connected) {
        let acked = false
        const wsPromise = new Promise<void>((resolve) => {
          socketRef.current!.emit('sendMessage', msg, (ack?: { ok: boolean; message?: ChatMessage; error?: string }) => {
            acked = true
            if (!ack?.ok || !ack.message) {
              console.error('WS send ack error:', ack?.error)
              // remove optimistic and surface error; HTTP retry below will handle
              setMessages(prev => prev.filter(m => m.id !== tempId))
              toast.error(ack?.error || 'Failed to send message')
              resolve()
              return
            }
            setMessages(prev => prev.map(m => (m.id === tempId ? ack.message! : m)))
            resolve()
          })
        })

        const timeout = new Promise<void>((resolve) => setTimeout(resolve, 2000))
        await Promise.race([wsPromise, timeout])

        if (!acked) {
          // No ack received, persist via HTTP
          const response = await fetch(`${CHAT_HTTP_URL}/messages/${params.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...msg, userId: String(user.id) })
          })
          if (response.ok) {
            const data = await response.json()
            if (data?.message) {
              setMessages(prev => prev.map((m: any) => (m.id === tempId ? data.message : m)))
            }
          } else {
            setMessages(prev => prev.filter(m => m.id !== tempId))
            toast.error('Failed to send message')
          }
        }
      } else {
        // Not connected: HTTP persist
        const response = await fetch(`${CHAT_HTTP_URL}/messages/${params.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...msg, userId: String(user.id) })
        })
        if (response.ok) {
          const data = await response.json()
          if (data?.message) {
            setMessages(prev => prev.map((m: any) => (m.id === tempId ? data.message : m)))
          }
        } else {
          setMessages(prev => prev.filter(m => m.id !== tempId))
          toast.error('Failed to send message')
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => prev.filter(m => m.id !== tempId))
      toast.error('Failed to send message')
    }
  }

  // Typing emit (throttled)
  useEffect(() => {
    if (!socketRef.current) return
    let lastEmit = 0
    let typing = false
    const inputEl = document.getElementById('chapter-chat-input') as HTMLInputElement | null
    if (!inputEl) return
    const onInput = () => {
      const now = Date.now()
      if (!typing) {
        typing = true
        socketRef.current?.emit('typing')
      }
      if (now - lastEmit > 1500) {
        lastEmit = now
        socketRef.current?.emit('typing')
      }
      // Stop typing after idle
      clearTimeout((onInput as any)._t)
      ;(onInput as any)._t = setTimeout(() => {
        typing = false
        socketRef.current?.emit('stopTyping')
      }, 2000)
    }
    inputEl.addEventListener('input', onInput)
    return () => {
      inputEl.removeEventListener('input', onInput)
      clearTimeout((onInput as any)._t)
    }
  }, [socketRef.current, user?.id])

  // Infinite scroll: load older when reaching top
  useEffect(() => {
    const container = document.querySelector('.flex-1.overflow-y-auto.px-4.py-4.space-y-3.bg-muted\\/20') as HTMLDivElement | null
    messagesContainerRef.current = container
    if (!container) return
    const handler = async () => {
      if (container.scrollTop <= 0 && !loadingMore && nextCursor && params.id) {
        setLoadingMore(true)
        const prevHeight = container.scrollHeight
        try {
          const res = await fetch(`/api/chat/${params.id}/messages?limit=50&cursor=${encodeURIComponent(nextCursor)}`, { credentials: 'include' })
          if (res.ok) {
            const data = await res.json() as { success: boolean; messages: ChatMessage[]; nextCursor?: string | null }
            if (data.success && data.messages.length) {
              setMessages(prev => [...data.messages, ...prev])
              setNextCursor(data.nextCursor || null)
              // Maintain scroll position after prepending
              setTimeout(() => {
                const newHeight = container.scrollHeight
                container.scrollTop = newHeight - prevHeight
              }, 0)
            } else if (data.success) {
              setNextCursor(null)
            }
          }
        } catch (e) {
          console.error('Load older messages failed', e)
        } finally {
          setLoadingMore(false)
        }
      }
    }
    container.addEventListener('scroll', handler, { passive: true })
    return () => container.removeEventListener('scroll', handler)
  }, [nextCursor, loadingMore, params.id])

  const appendEmoji = (emoji: string) => {
    setInput((prev) => `${prev}${emoji}`)
  }

  const handleAttachClick = () => {
    // Placeholder behavior: open file picker and send a message with file name
    if (!fileInputRef.current) {
      const inputEl = document.createElement('input')
      inputEl.type = 'file'
      inputEl.accept = '*/*'
      inputEl.style.display = 'none'
      document.body.appendChild(inputEl)
      fileInputRef.current = inputEl
      inputEl.addEventListener('change', () => {
        const file = inputEl.files?.[0]
        if (file && user?.id && params.id) {
          const msgText = `📎 ${file.name}`
          const msg: ChatMessage = {
            id: `tmp-${Date.now()}`,
            chapterId: String(params.id),
            senderId: String(user.id),
            senderName: user.name || 'You',
            senderAvatarUrl: (user as any)?.avatar_url || null,
            content: msgText,
            timestamp: new Date().toISOString()
          }
          setMessages(prev => [...prev, msg])
          try { socketRef.current?.emit('sendMessage', msg) } catch (e) { console.error(e) }
        }
        inputEl.value = ''
      })
    }
    fileInputRef.current?.click()
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6 pb-20 lg:pb-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading chapter...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6 pb-20 lg:pb-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground mb-4">Please sign in to view this chapter.</p>
            <Button onClick={() => router.push('/auth')}>
              Sign In
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!chapterData) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6 pb-20 lg:pb-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Chapter Not Found</h2>
            <p className="text-muted-foreground mb-4">The chapter you're looking for doesn't exist.</p>
            <Button onClick={() => router.push('/chapters')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Chapters
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6 pb-20 lg:pb-6">
        {/* Chapter Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 space-y-4 lg:space-y-0">
            <div>
              <div className="flex items-center mb-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => router.push('/chapters')}
                  className="mr-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <h1 className="text-2xl lg:text-3xl font-bold">{chapterData.name}</h1>
              </div>
              <div className="flex flex-wrap items-center gap-2 lg:gap-4 text-muted-foreground text-sm lg:text-base">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {chapterData.member_count} members
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {chapterData.location_city}
                </div>
                <Badge variant="secondary" className="text-xs lg:text-sm">
                  {chapterData.joined_at}
                </Badge>
              </div>
            </div>
            <Button className="w-full lg:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Create Post
            </Button>
          </div>
          <p className="text-muted-foreground text-sm lg:text-base">{chapterData.description}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Left: Chat Interface (70%) */}
          <div className="flex-1">
            <Card className="h-[calc(100vh-280px)] flex flex-col">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <div className="font-semibold">Chapter Chat</div>
                <div className="text-xs flex items-center gap-2">
                  <span className={`${connecting ? 'text-muted-foreground' : 'text-green-600'}`}>{connecting ? 'Connecting...' : 'Live'}</span>
                  <span className="text-muted-foreground">· {onlineCount} online</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-muted/20">
                {typingUsers.size > 0 && (
                  <div className="text-xs text-muted-foreground">Someone is typing…</div>
                )}
                {messages.map(m => {
                  const own = String(m.senderId) === String(user?.id || '')
                  return (
                    <div key={m.id} className={`flex ${own ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] flex items-end gap-2 ${own ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold">
                          {(m.senderName || 'U').slice(0,2).toUpperCase()}
                        </div>
                        <div className={`rounded-2xl px-3 py-2 shadow-sm ${own ? 'bg-primary text-primary-foreground' : 'bg-white'}`}>
                          <div className="text-[11px] opacity-80 mb-0.5">{own ? 'You' : m.senderName}</div>
                          <div className="whitespace-pre-wrap break-words text-sm">{m.content}</div>
                          <div className="flex items-center justify-between mt-1">
                            <div className="text-[10px] opacity-70">{new Date(m.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                            
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="border-t p-3">
                <div className="flex items-center gap-2 relative">
                  {/* Emoji button + lightweight picker */}
                  <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={() => setShowEmojiPicker(v => !v)}>
                    <Smile className="h-5 w-5" />
                  </Button>
                  {showEmojiPicker && (
                    <div className="absolute bottom-12 left-0 z-20 bg-white border rounded-lg shadow-md p-2 w-56 grid grid-cols-8 gap-1">
                      {['😀','😁','😂','🤣','😊','😍','😎','😇','😉','🙃','🤔','🤩','😢','😭','😡','👍','🙏','👏','🎉','🔥','💡','✨','✅','❌','❤️','💪','🤝','🚀','🌟','📎','📣'].map(e => (
                        <button key={e} className="text-xl hover:scale-110 transition" onClick={() => { appendEmoji(e); setShowEmojiPicker(false) }} aria-label={`emoji ${e}`}>
                          {e}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Attachment button (placeholder send filename) */}
                  <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={handleAttachClick}>
                    <Paperclip className="h-5 w-5" />
                  </Button>
                <Input
                  id="chapter-chat-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                />
                  <Button type="button" onClick={sendMessage} disabled={!input.trim()} className="shrink-0">
                    <Send className="h-4 w-4 mr-1" />
                    Send
                  </Button>
                </div>
                {!!connectionError && (
                  <div className="text-xs text-red-600 mt-2">{connectionError}</div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Sidebar - Stack below main content on mobile */}
          <div className="w-full lg:w-80 space-y-4 lg:space-y-6">
            {/* Chapter Members */}
            <Card className="p-4 lg:p-6">
              <h3 className="font-semibold mb-4 flex items-center text-sm lg:text-base">
                <Users className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                Chapter Members
                {membersLoading && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {chapterMembers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No members found.</p>
                ) : (
                  chapterMembers.map((member) => (
                    <div key={member.id} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-xs font-semibold">
                        {member.profile_photo_url ? (
                          <img 
                            src={member.profile_photo_url} 
                            alt={member.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          member.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Upcoming Events */}
            <Card className="p-4 lg:p-6">
              <h3 className="font-semibold mb-4 flex items-center text-sm lg:text-base">
                <Calendar className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                Upcoming Events
              </h3>
              <div className="space-y-3 lg:space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="border-l-2 border-muted pl-3 lg:pl-4">
                    <h4 className="font-medium text-sm">{event.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {event.date} at {event.time}
                    </p>
                    <p className="text-xs text-muted-foreground">{event.attendees} attending</p>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4 bg-transparent text-sm lg:text-base">
                View All Events
              </Button>
            </Card>

            {/* Top Contributors */}
            <Card className="p-4 lg:p-6">
              <h3 className="font-semibold mb-4 flex items-center text-sm lg:text-base">
                <Trophy className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                Top Contributors
              </h3>
              <div className="space-y-3">
                {topContributors.map((contributor, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-xs font-semibold">
                      {contributor.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{contributor.name}</p>
                      <p className="text-xs text-muted-foreground">{contributor.role}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {contributor.score}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}