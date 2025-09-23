"use client"

import { UserProfile, UserGroup } from "@/lib/types/profile"
import { safeApiCall, generateRandomMemberCount } from "@/lib/utils/api"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, MessageCircle, UserPlus, Calendar, Star, Award, Users, Lock, DollarSign, Clock, Edit, Settings, LogOut, Heart, Share2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import ImageManager from "@/components/ImageManager"
import { toast } from "sonner"

// Default activity data
const defaultActivityPosts = [
  {
    author: {
      name: "You",
      role: "Professional",
      avatar: "U",
      rewardScore: 85,
    },
    content: "Just launched our new AI-powered analytics dashboard! The response from beta users has been incredible. Looking for feedback from fellow product managers - what metrics do you prioritize when measuring user engagement?",
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
      name: "You",
      role: "Professional", 
      avatar: "U",
      rewardScore: 85,
    },
    content: "Reflecting on the importance of user empathy in product development. Sometimes the best insights come from simply listening to your users' frustrations and pain points.",
    timestamp: "1d ago",
    engagement: {
      likes: 18,
      comments: 5,
      shares: 2,
    },
    isLiked: true,
  },
]

// Default groups data
const defaultGroups: UserGroup[] = [
  { name: "Product Leaders SF", type: "chapter", members: 245 },
  { name: "AI/ML Enthusiasts", type: "secret", members: 89 },
  { name: "Startup Founders Network", type: "secret", members: 156 },
  { name: "Women in Tech", type: "chapter", members: 1200 },
]

export default function ProfilePage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("about")
  const [isEditing, setIsEditing] = useState(false)
  const [userGroups, setUserGroups] = useState<UserGroup[]>(defaultGroups)
  const [userPosts] = useState(defaultActivityPosts)

  // Fetch user's joined chapters via memberships
  useEffect(() => {
    const fetchUserChapters = async () => {
      if (!user) return
      
      try {
        console.log('Profile: Fetching chapters for user:', user.id);
        
        const result = await safeApiCall(
          () => fetch(`/api/users/${user.id}/chapters`, { 
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            }
          }),
          'Failed to fetch user chapters'
        )
        
        console.log('Profile: API response:', result);
        
        if (result.success && result.data && typeof result.data === 'object' && result.data !== null) {
          const data = result.data as any
          if (data.success && Array.isArray(data.chapters)) {
            console.log('Profile: Found chapters:', data.chapters);
            const actualGroups: UserGroup[] = data.chapters.map((c: any) => ({
              name: c.name,
              type: 'chapter' as const,
              members: Number(c.member_count || 0)
            }))
            setUserGroups(actualGroups)
          } else {
            console.log('Profile: No chapters found for user, data:', data)
            setUserGroups([])
          }
        } else {
          console.error('Error fetching user chapters:', result.error)
          setUserGroups([])
        }
      } catch (error) {
        console.error('Error fetching user chapters:', error)
        setUserGroups([])
      }
    }

    fetchUserChapters()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view your profile</h1>
          <Button onClick={() => window.location.href = '/auth'}>
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  const handleEditToggle = () => {
    setIsEditing(!isEditing)
  }

  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out?')) {
      try {
        await logout()
        router.push('/auth')
      } catch (error) {
        console.error('Logout error:', error)
        toast.error('Failed to logout')
      }
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navigation />

      <div className="max-w-4xl mx-auto">
        {/* Cover Banner with Pattern */}
        <div
          className="h-32 md:h-48 bg-muted relative overflow-hidden"
          style={{ 
            backgroundImage: user.bannerUrl ? `url("${user.bannerUrl}")` : `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23000000' fillOpacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent"></div>
        </div>

        {/* Profile Header */}
        <div className="px-4 md:px-6 pb-6">
          <div className="flex flex-col space-y-4 -mt-12 md:-mt-16 relative z-10">
            {/* Profile Picture and Basic Info */}
            <div className="flex flex-col items-center md:items-start">
              <div className="relative">
                {user.profilePhotoUrl ? (
                  <img
                    src={user.profilePhotoUrl}
                    alt="Profile"
                    className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-background shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-300 rounded-full border-4 border-background shadow-lg flex items-center justify-center text-2xl md:text-4xl font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="text-center md:text-left space-y-2 bg-background/80 backdrop-blur-sm rounded-lg p-4 md:bg-transparent md:backdrop-blur-none md:p-0">
                <h1 className="text-2xl md:text-3xl font-bold">{user.name}</h1>
                <p className="text-base md:text-lg text-muted-foreground">{(user as any).title || "Professional"}</p>

                <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4 text-sm text-muted-foreground">
                  {(user as any).location && (
                    <div className="flex items-center justify-center md:justify-start">
                      <MapPin className="w-4 h-4 mr-1" />
                      {(user as any).location}
                    </div>
                  )}
                  <Badge variant="secondary" className="flex items-center justify-center w-fit mx-auto md:mx-0">
                    <Award className="w-3 h-3 mr-1" />
                    Score: {(user as any).rewardScore || 85}
                  </Badge>
                  <div className="flex items-center justify-center md:justify-start">
                    <Users className="w-4 h-4 mr-1" />
                    {(user as any).mutualConnections || 12} mutual connections
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={handleEditToggle}
                className="w-full md:w-auto cursor-pointer"
              >
                <Edit className="w-4 h-4 mr-2" />
                {isEditing ? "Cancel Edit" : "Edit Profile"}
              </Button>
              <Button variant="outline" className="w-full md:w-auto bg-transparent cursor-pointer">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleLogout}
                className="w-full md:w-auto cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="px-4 md:px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="overflow-x-auto">
              <TabsList className="grid w-full grid-cols-4 min-w-max md:min-w-0">
                <TabsTrigger value="about" className="whitespace-nowrap cursor-pointer">
                  About
                </TabsTrigger>
                <TabsTrigger value="activity" className="whitespace-nowrap cursor-pointer">
                  Activity
                </TabsTrigger>
                <TabsTrigger value="groups" className="whitespace-nowrap cursor-pointer">
                  Groups
                </TabsTrigger>
                <TabsTrigger value="consultation" className="whitespace-nowrap cursor-pointer">
                  Consultation
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="about" className="space-y-6 mt-6">
              <Card className="p-4 md:p-6">
                <h3 className="font-semibold mb-3">About</h3>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                  {user.description || "Passionate professional with experience in building innovative solutions. I love connecting with fellow entrepreneurs and sharing insights about strategy, research, and leadership."}
                </p>
              </Card>

              <Card className="p-4 md:p-6">
                <h3 className="font-semibold mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {user.skills && user.skills.length > 0 ? (
                    user.skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs md:text-sm">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <>
                      <Badge variant="outline" className="text-xs md:text-sm">Product Strategy</Badge>
                      <Badge variant="outline" className="text-xs md:text-sm">AI/ML</Badge>
                      <Badge variant="outline" className="text-xs md:text-sm">User Research</Badge>
                      <Badge variant="outline" className="text-xs md:text-sm">Team Leadership</Badge>
                      <Badge variant="outline" className="text-xs md:text-sm">Data Analytics</Badge>
                      <Badge variant="outline" className="text-xs md:text-sm">Agile Methodologies</Badge>
                    </>
                  )}
                </div>
              </Card>

              <Card className="p-4 md:p-6">
                <h3 className="font-semibold mb-3">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs md:text-sm">Artificial Intelligence</Badge>
                  <Badge variant="secondary" className="text-xs md:text-sm">Startup Ecosystem</Badge>
                  <Badge variant="secondary" className="text-xs md:text-sm">Design Thinking</Badge>
                  <Badge variant="secondary" className="text-xs md:text-sm">Mentoring</Badge>
                  <Badge variant="secondary" className="text-xs md:text-sm">Tech Innovation</Badge>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Recent Activity</h3>
                <Badge variant="outline">{userPosts.length} posts</Badge>
              </div>
              {userPosts.map((post, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-sm font-bold text-white">
                      {post.author.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold">{post.author.name}</span>
                        <Badge variant="outline" className="text-xs">{post.author.rewardScore}</Badge>
                        <span className="text-sm text-muted-foreground">{post.author.role}</span>
                        <span className="text-sm text-muted-foreground">{post.timestamp}</span>
                      </div>
                      <p className="text-sm mb-3">{post.content}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <button className="flex items-center space-x-1 hover:text-red-500 cursor-pointer">
                          <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                          <span>{post.engagement.likes}</span>
                        </button>
                        <button className="flex items-center space-x-1 hover:text-blue-500 cursor-pointer">
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.engagement.comments}</span>
                        </button>
                        <button className="flex items-center space-x-1 hover:text-green-500 cursor-pointer">
                          <Share2 className="w-4 h-4" />
                          <span>{post.engagement.shares}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="groups" className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Groups & Chapters</h3>
                <Badge variant="outline">{userGroups.length} groups</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userGroups.map((group) => (
                  <Card key={group.name} className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        {group.type === "chapter" ? <Users className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{group.name}</h4>
                        <p className="text-sm text-muted-foreground">{group.members} members</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {group.type === "chapter" ? "Chapter" : "Secret Group"}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="consultation" className="space-y-6 mt-6">
              <Card className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Consultation Services</h3>
                  <Badge className="bg-green-100 text-green-800 text-xs">Available</Badge>
                </div>
                <p className="text-muted-foreground mb-6 text-sm md:text-base">
                  Book a consultation session to discuss product strategy, team leadership, or AI implementation.
                </p>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center space-x-3">
                      <DollarSign className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium">$150/hour</p>
                        <p className="text-sm text-muted-foreground">Rate set by Reward System</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium">30-60 min sessions</p>
                        <p className="text-sm text-muted-foreground">Flexible duration</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Star className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                      <div>
                        <p className="font-medium">4.9/5 rating</p>
                        <p className="text-sm text-muted-foreground">Based on 23 sessions</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button className="w-full cursor-pointer">
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Now
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent cursor-pointer">
                      View Available Slots
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-4 md:p-6">
                <h4 className="font-semibold mb-3">Expertise Areas</h4>
                <div className="space-y-3">
                  {[
                    "Product Strategy & Roadmapping",
                    "AI/ML Product Development",
                    "Team Leadership & Management",
                    "User Research & Analytics",
                  ].map((area) => (
                    <div key={area} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-foreground rounded-full"></div>
                      <span className="text-sm">{area}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
