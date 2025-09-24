"use client";

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Navigation } from "@/components/navigation"
import { LeftSidebar, RightSidebar } from "@/components/sidebar"
import { PostCard, EventCard } from "@/components/post-card"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { PlusCircle, Sparkles } from "lucide-react"
import LandingPage from "@/components/LandingPage"

const samplePosts = [
  {
    author: {
      name: "Sarah Chen",
      role: "Product Manager",
      avatar: "SC",
      rewardScore: 92,
    },
    content:
      "Just launched our new AI-powered analytics dashboard! The response from beta users has been incredible. Looking for feedback from fellow product managers - what metrics do you prioritize when measuring user engagement?",
    timestamp: "2h ago",
    engagement: {
      likes: 24,
      comments: 8,
      shares: 3,
    },
    isLiked: false,
  },
  {
    author: {
      name: "Michael Rodriguez",
      role: "Startup Founder",
      avatar: "MR",
      rewardScore: 87,
    },
    content:
      "Reflecting on our journey from idea to Series A. The biggest lesson: building relationships before you need them. This community has been instrumental in connecting me with the right investors and advisors.",
    timestamp: "4h ago",
    engagement: {
      likes: 45,
      comments: 12,
      shares: 7,
    },
    isLiked: true,
  },
]

const sampleEvents = [
  {
    title: "AI in Product Development Workshop",
    host: "Tech Leaders Mumbai",
    date: "Dec 28, 2024",
    time: "6:00 PM",
    location: "WeWork BKC, Mumbai",
    attendees: 47,
    isJoined: false,
  },
  {
    title: "Startup Pitch Night",
    host: "Bangalore Entrepreneurs",
    date: "Jan 5, 2025",
    time: "7:00 PM",
    location: "91springboard Koramangala",
    attendees: 89,
    isJoined: true,
  },
]

export default function HomePage() {
  const { user, loading, onboardingCompleted, inviteSent, isNewUser, isAdmin } = useAuth()
  const [thought, setThought] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [video, setVideo] = useState<File | null>(null)
  const [scheduledAt, setScheduledAt] = useState("")
  const [status, setStatus] = useState<"idle" | "review">("idle")
  const [showLanding, setShowLanding] = useState(true)

  useEffect(() => {
    // Show landing page first, then handle authentication
    if (!loading && !user) {
      // User not authenticated - show landing page
      setShowLanding(true)
    } else if (!loading && user) {
      // User is authenticated - hide landing page and show dashboard
      setShowLanding(false)
      
      // User is authenticated, check user type and flow
      if (isAdmin) {
        // Admin user: can access admin panel directly
        // No redirect needed, they can stay here or go to /admin
      } else if (isNewUser) {
        // New regular user: follow full flow
        if (!inviteSent) {
          window.location.href = '/invite';
        } else if (!onboardingCompleted) {
          window.location.href = '/onboarding';
        } else {
          // New user completed flow, can stay on main page
        }
      } else {
        // Existing regular user: go directly to profile/main page
        // No redirect needed, they can stay here
      }
    }
  }, [user, loading, onboardingCompleted, inviteSent, isNewUser, isAdmin])

  const handleSubmit = () => {
    setStatus("review")
  }

  const resetForm = () => {
    setThought("")
    setImage(null)
    setVideo(null)
    setScheduledAt("")
    setStatus("idle")
  }

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show landing page if user is not authenticated
  if (showLanding && !user) {
    return <LandingPage />
  }

  // Show loading if new regular user hasn't completed the flow yet
  if (!isAdmin && isNewUser && (!inviteSent || !onboardingCompleted)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to complete your setup...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 pb-20 lg:pb-8">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Left Sidebar */}
          <div className="hidden lg:block">
            <LeftSidebar />
          </div>

          {/* Main Content */}
          <div className="flex-1 lg:max-w-2xl space-y-4 lg:space-y-6">
            {/* Post Box */}
            <Card className="p-4 lg:p-6 shadow-elevated border-border/50 bg-card/50 backdrop-blur-sm">
              {status === "review" ? (
                <div className="flex flex-col items-center space-y-4">
                  <p className="font-semibold text-lg">Taken for review</p>
                  <Button
                    variant="outline"
                    onClick={resetForm}
                    className="font-medium"
                  >
                    Schedule another post
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Textarea
                    placeholder="Share your thoughts..."
                    value={thought}
                    onChange={(e) => setThought(e.target.value)}
                  />
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                  />
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideo(e.target.files?.[0] || null)}
                  />
                  <Input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      onClick={handleSubmit}
                      className="font-semibold shadow-soft hover:shadow-elevated"
                    >
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Post
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleSubmit}
                    >
                      Schedule
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Trending heading */}
            <div className="flex items-center space-x-2 px-1">
              <Sparkles className="w-4 h-4 lg:w-5 lg:h-5 text-foreground" />
              <h2 className="text-base lg:text-lg font-bold text-foreground">
                Trending in Your Network
              </h2>
            </div>

            {/* Feed */}
            <div className="space-y-4 lg:space-y-6">
              <PostCard {...samplePosts[0]} />
              <EventCard {...sampleEvents[0]} />
              <PostCard {...samplePosts[1]} />
              <EventCard {...sampleEvents[1]} />

              <PostCard
                author={{
                  name: "Alex Thompson",
                  role: "UX Designer",
                  avatar: "AT",
                  rewardScore: 78,
                }}
                content="Design systems are more than just component libraries. They're about creating a shared language between design and development teams. What tools are you using to maintain consistency across your products?"
                timestamp="6h ago"
                engagement={{
                  likes: 18,
                  comments: 6,
                  shares: 2,
                }}
              />

              <PostCard
                author={{
                  name: "Priya Sharma",
                  role: "Marketing Director",
                  avatar: "PS",
                  rewardScore: 95,
                }}
                content="Just wrapped up our Q4 campaign analysis. The power of community-driven marketing is undeniable. Our referral program generated 40% of new signups this quarter. Happy to share insights with fellow marketers!"
                timestamp="8h ago"
                engagement={{
                  likes: 32,
                  comments: 15,
                  shares: 9,
                }}
                isLiked={true}
              />
            </div>

            {/* Load more */}
            <div className="flex justify-center pt-4 lg:pt-6">
              <Button
                variant="outline"
                size="lg"
                className="font-semibold px-6 lg:px-8 py-2 lg:py-3 hover:bg-accent/50 border-border/50 bg-transparent"
              >
                Load More Posts
              </Button>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block">
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  )
}
