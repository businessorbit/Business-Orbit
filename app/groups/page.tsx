"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PostCard } from "@/components/post-card"
import { Lock, Users, Crown, Plus, Hash, Settings } from "lucide-react"

const userGroups = [
  {
    id: "ai-ml",
    name: "AI/ML Enthusiasts",
    members: 89,
    unread: 3,
    active: true,
    pattern:
      "data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fillOpacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E",
  },
  {
    id: "startup-founders",
    name: "Startup Founders",
    members: 156,
    unread: 0,
    active: false,
    pattern:
      "data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fillOpacity='0.1'%3E%3Cpath d='M0 0h20v20H0V0zm20 20h20v20H20V20z'/%3E%3C/g%3E%3C/svg%3E",
  },
  {
    id: "women-tech",
    name: "Women in Tech",
    members: 234,
    unread: 1,
    active: false,
    pattern:
      "data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fillOpacity='0.1'%3E%3Cpath d='M20 0l20 20-20 20L0 20z'/%3E%3C/g%3E%3C/svg%3E",
  },
]

const activeGroupData = {
  id: "ai-ml",
  name: "AI/ML Enthusiasts",
  description: "Discussing the latest in artificial intelligence and machine learning",
  members: 89,
  admins: ["Sarah Chen", "Michael Rodriguez"],
}
const groupPosts = [
  {
    author: {
      name: "David Kim",
      role: "ML Engineer",
      avatar: "DK",
      rewardScore: 91,
    },
    content:
      "Just published a paper on transformer architectures for time series forecasting. The results are promising - 15% improvement over traditional LSTM approaches. Would love to get feedback from the community!",
    timestamp: "2h ago",
    engagement: {
      likes: 28,
      comments: 12,
      shares: 5,
    },
  },
  {
    author: {
      name: "Lisa Zhang",
      role: "Data Scientist",
      avatar: "LZ",
      rewardScore: 87,
    },
    content:
      "Question for the group: What's your preferred approach for handling imbalanced datasets in production? I've been experimenting with SMOTE vs focal loss and curious about your experiences.",
    timestamp: "5h ago",
    engagement: {
      likes: 19,
      comments: 8,
      shares: 2,
    },
  },
]

const suggestedGroups = [
  { name: "Deep Learning Research", members: 67, description: "Latest research in deep learning" },
  { name: "Computer Vision", members: 123, description: "CV applications and techniques" },
  { name: "NLP Community", members: 98, description: "Natural language processing discussions" },
]

export default function GroupsPage() {
  const [activeGroup, setActiveGroup] = useState("ai-ml")
  const [sidebarExpanded, setSidebarExpanded] = useState(true)

  const currentGroup = userGroups.find((g) => g.id === activeGroup) || userGroups[0]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6 pb-20 lg:pb-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Left Sidebar - Groups List */}
          <div className="w-full lg:w-64">
            <Card className="p-3 lg:p-4">
              <div className="flex items-center justify-between mb-3 lg:mb-4">
                <h3 className="font-semibold text-sm lg:text-base">Secret Groups</h3>
                <Button size="sm" variant="ghost">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
                {userGroups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => setActiveGroup(group.id)}
                    className={`flex-shrink-0 lg:flex-shrink lg:w-full flex items-center space-x-2 lg:space-x-3 p-2 lg:p-3 rounded-lg transition-colors min-w-[200px] lg:min-w-0 ${
                      activeGroup === group.id ? "bg-accent" : "hover:bg-accent/50"
                    }`}
                  >
                    <div
                      className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundImage: `url("${group.pattern}")` }}
                    >
                      <Lock className="w-4 h-4 lg:w-5 lg:h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-xs lg:text-sm font-medium">{group.name}</p>
                      <p className="text-xs text-muted-foreground">{group.members} members</p>
                    </div>
                    {group.unread > 0 && (
                      <Badge className="bg-foreground text-background text-xs flex-shrink-0">{group.unread}</Badge>
                    )}
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Main Feed */}
          <div className="flex-1 space-y-4 lg:space-y-6">
            {/* Group Header */}
            <Card className="p-4 lg:p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex items-center space-x-3 lg:space-x-4">
                  <div
                    className="w-12 h-12 lg:w-16 lg:h-16 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundImage: `url("${currentGroup.pattern}")` }}
                  >
                    <Lock className="w-6 h-6 lg:w-8 lg:h-8" />
                  </div>
                  <div>
                    <h1 className="text-xl lg:text-2xl font-bold mb-1">{activeGroupData.name}</h1>
                    <p className="text-muted-foreground mb-2 text-sm lg:text-base">{activeGroupData.description}</p>
                    <div className="flex flex-wrap items-center gap-2 lg:gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {activeGroupData.members} members
                      </div>
                      <div className="flex items-center">
                        <Crown className="w-4 h-4 mr-1" />
                        {activeGroupData.admins.length} admins
                      </div>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full lg:w-auto bg-transparent">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </Card>

            {/* Create Post */}
            <Card className="p-3 lg:p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-muted rounded-full flex items-center justify-center font-semibold text-xs lg:text-sm">
                  JD
                </div>
                <Button
                  variant="outline"
                  className="flex-1 justify-start text-muted-foreground hover:bg-accent bg-transparent text-sm lg:text-base"
                >
                  <Hash className="w-4 h-4 mr-2" />
                  <span className="truncate">Share with {activeGroupData.name}...</span>
                </Button>
                <Button size="sm">Post</Button>
              </div>
            </Card>

            {/* Group Posts */}
            <div className="space-y-4">
              {groupPosts.map((post, index) => (
                <PostCard key={index} {...post} />
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-full lg:w-80 space-y-4 lg:space-y-6">
            {/* Group Admins */}
            <Card className="p-4 lg:p-6">
              <h3 className="font-semibold mb-4 flex items-center text-sm lg:text-base">
                <Crown className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                Group Admins
              </h3>
              <div className="space-y-3">
                {activeGroupData.admins.map((admin, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-xs font-semibold">
                      {admin
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{admin}</p>
                      <p className="text-xs text-muted-foreground">Admin</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Suggested Groups */}
            <Card className="p-4 lg:p-6">
              <h3 className="font-semibold mb-4 text-sm lg:text-base">Suggested Groups</h3>
              <div className="space-y-4">
                {suggestedGroups.map((group, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{group.name}</h4>
                      <Button size="sm" variant="outline" className="h-6 px-2 text-xs bg-transparent">
                        Join
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">{group.description}</p>
                    <p className="text-xs text-muted-foreground">{group.members} members</p>
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

