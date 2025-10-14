"use client";

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Navigation } from "@/components/navigation"
import { EventCard } from "@/components/post-card"
import PostCard from "@/components/PostCard"
import FeedPost from "@/components/FeedPost"
import ProfileCard from "@/components/ProfileCard"
import ChaptersCard from "@/components/ChaptersCard"
import SecretGroupsCard from "@/components/SecretGroupsCard"
import IncomingRequestsCard from "@/components/IncomingRequestsCard"
import SuggestedConnectionsCard from "@/components/SuggestedConnectionsCard"
import UpcomingEventsCard from "@/components/UpcomingEventsCard"
import DynamicEventsFeed from "@/components/DynamicEventsFeed"
import { safeApiCall } from "@/lib/utils/api"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

interface Post {
  id: string;
  content: string;
  published_at: string;
  created_at: string;
  user_id: number;
  user_name: string;
  profile_photo_url?: string;
  likes: number;
  comments: number;
  shares: number;
  media: Array<{
    id: string;
    media_type: string;
    cloudinary_url: string;
    file_name: string;
  }>;
}

export default function FeedPage() {
  const { user, loading, onboardingCompleted, inviteSent, isNewUser, isAdmin } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/product/auth'
    } else if (!loading && user) {
      // User is authenticated, check user type and flow
      if (isAdmin) {
        // Admin user: can access admin panel directly
        // No redirect needed, they can stay here or go to /admin
      } else if (isNewUser) {
        // New regular user: follow full flow
        if (!inviteSent) {
          window.location.href = '/product/invite';
        } else if (!onboardingCompleted) {
          window.location.href = '/product/onboarding';
        } else {
          // New user completed flow, can stay on main page
        }
      } else {
        // Existing regular user: go directly to profile/main page
        // No redirect needed, they can stay here
      }
    }
  }, [user, loading, onboardingCompleted, inviteSent, isNewUser, isAdmin])

  const fetchPosts = async (pageNum: number = 1, append: boolean = false) => {
    try {
      setLoadingPosts(true)
      const result = await safeApiCall(
        () => fetch(`/api/posts?page=${pageNum}&limit=10`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        }),
        'Failed to fetch posts'
      )

      if (result.success && result.data) {
        const responseData = result.data as any
        const newPosts = responseData.data || responseData
        if (append) {
          setPosts(prev => [...prev, ...newPosts])
        } else {
          setPosts(newPosts)
        }
        setHasMore(responseData.pagination ? responseData.pagination.page < responseData.pagination.totalPages : false)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoadingPosts(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchPosts(1, false)
    }
  }, [user])

  const handlePostCreated = () => {
    // Refresh posts when a new post is created
    fetchPosts(1, false)
  }

  const handleEngagementChange = () => {
    // Refresh posts when engagement changes
    fetchPosts(1, false)
  }

  const handlePostDeleted = () => {
    // Refresh posts when a post is deleted
    fetchPosts(1, false)
  }

  const loadMorePosts = () => {
    if (!loadingPosts && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchPosts(nextPage, true)
    }
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

  // Redirect to auth if not authenticated
  if (!user) {
    return null
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
          <div className="hidden lg:block w-64 space-y-4">
            <ProfileCard />
            <ChaptersCard />
            <SecretGroupsCard />
          </div>

          {/* Main Content */}
          <div className="flex-1 lg:max-w-2xl space-y-4 lg:space-y-6">
            {/* Post Creation Card */}
            <PostCard onPostCreated={handlePostCreated} />

            {/* Trending heading */}
            <div className="flex items-center space-x-2 px-1">
              <Sparkles className="w-4 h-4 lg:w-5 lg:h-5 text-foreground" />
              <h2 className="text-base lg:text-lg font-bold text-foreground">
                Trending in Your Network
              </h2>
            </div>

            {/* Feed */}
            <div className="space-y-4 lg:space-y-6">
              {loadingPosts && posts.length === 0 ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  {posts.map((post) => (
                    <FeedPost 
                      key={post.id} 
                      post={post} 
                      onEngagementChange={handleEngagementChange}
                      onPostDeleted={handlePostDeleted}
                    />
                  ))}
                  
                  <DynamicEventsFeed />
                </>
              )}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="flex justify-center pt-4 lg:pt-6">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={loadMorePosts}
                  disabled={loadingPosts}
                  className="font-semibold px-6 lg:px-8 py-2 lg:py-3 hover:bg-accent/50 border-border/50 bg-transparent"
                >
                  {loadingPosts ? "Loading..." : "Load More Posts"}
                </Button>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block w-64 space-y-4">
            <IncomingRequestsCard />
            <SuggestedConnectionsCard />
            <UpcomingEventsCard />
          </div>
        </div>
      </div>
    </div>
  )
}
