"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Share2, MoreHorizontal, Calendar, MapPin, Sparkles } from "lucide-react"
import { useState, useEffect } from "react"

interface PostCardProps {
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
  isLiked?: boolean
}

export function DisplayPostCard({ author, content, timestamp, engagement, isLiked = false }: PostCardProps) {
  const [liked, setLiked] = useState(isLiked)
  const [likeCount, setLikeCount] = useState(engagement.likes)

  const handleLike = () => {
    setLiked(!liked)
    setLikeCount(liked ? likeCount - 1 : likeCount + 1)
  }

  return (
    <Card className="p-6 hover:shadow-elevated transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm group">
      <div className="flex items-start space-x-4">
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-muted to-muted/50 rounded-full flex items-center justify-center font-bold text-foreground shadow-soft border border-border/20">
            {author.avatar}
          </div>
          {author.rewardScore >= 90 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-foreground rounded-full flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-background" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3 flex-wrap">
              <h4 className="font-bold text-base text-foreground">{author.name}</h4>
              <Badge variant="secondary" className="text-xs font-semibold px-2 py-1 bg-accent/80">
                {author.rewardScore}
              </Badge>
              <span className="text-sm text-muted-foreground font-medium">{author.role}</span>
              <span className="text-xs text-muted-foreground/60">•</span>
              <span className="text-xs text-muted-foreground/80 font-medium">{timestamp}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-accent/50 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>

          <p className="text-sm mb-5 leading-relaxed text-foreground/90 text-balance">{content}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                className={`p-2 hover:bg-accent/50 transition-all duration-200 ${
                  liked ? "text-red-500 hover:text-red-600" : "hover:text-red-500"
                }`}
                onClick={handleLike}
              >
                <Heart className={`w-4 h-4 mr-2 transition-all ${liked ? "fill-current scale-110" : ""}`} />
                <span className="text-sm font-medium">{likeCount}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="p-2 hover:bg-accent/50 hover:text-blue-500 transition-all duration-200"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">{engagement.comments}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="p-2 hover:bg-accent/50 hover:text-green-500 transition-all duration-200"
              >
                <Share2 className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">{engagement.shares}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

interface EventCardProps {
  title: string
  host: string
  date: string
  time: string
  location: string
  attendees: number
  isJoined?: boolean
}

export function EventCard({ title, host, date, time, location, attendees, isJoined = false }: EventCardProps) {
  const [joined, setJoined] = useState(isJoined)
  
  // Update local state when prop changes
  useEffect(() => {
    setJoined(isJoined)
  }, [isJoined])

  return (
    <Card className="p-6 border-l-4 border-l-foreground bg-gradient-to-r from-accent/30 to-accent/10 hover:shadow-elevated transition-all duration-300 gradient-border group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-foreground/10 rounded-full flex items-center justify-center">
            <Calendar className="w-5 h-5 text-foreground" />
          </div>
          <Badge variant="outline" className="text-xs font-semibold px-3 py-1 border-foreground/20 bg-background/50">
            Featured Event
          </Badge>
        </div>
        <Button
          variant={joined ? "secondary" : "default"}
          size="sm"
          onClick={() => setJoined(!joined)}
          className={`font-semibold transition-all duration-200 ${
            joined
              ? "bg-accent hover:bg-accent/80"
              : "bg-foreground hover:bg-foreground/90 shadow-soft hover:shadow-elevated"
          }`}
        >
          {joined ? "✓ Registered" : "Join Event"}
        </Button>
      </div>

      <h3 className="font-bold text-lg mb-2 text-foreground text-balance">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4 font-medium">
        Hosted by <span className="text-foreground">{host}</span>
      </p>

      <div className="space-y-2 text-sm">
        <div className="flex items-center space-x-3 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span className="font-medium">
            {date} at {time}
          </span>
        </div>
        <div className="flex items-center space-x-3 text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span className="font-medium">{location}</span>
        </div>
        <div className="pt-2 flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium">
            <span className="text-foreground font-bold">{attendees}</span> people attending
          </span>
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-6 h-6 bg-muted rounded-full border-2 border-background flex items-center justify-center text-xs font-bold"
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
