"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PostCard } from "@/components/post-card"
import { Lock, Users, Crown, Plus, Hash, Settings, X } from "lucide-react"

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

export default function GroupsSecretPage() {
  const [activeGroup, setActiveGroup] = useState("ai-ml")
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")
  const [inviteEmails, setInviteEmails] = useState("")
  const [chatMessages, setChatMessages] = useState<{ user: string; text: string }[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")

  const currentGroup = userGroups.find((g) => g.id === activeGroup) || userGroups[0]

  const handleCreateGroup = () => {
    console.log("New Group:", newGroupName)
    console.log("Invite Emails:", inviteEmails)
    setNewGroupName("")
    setInviteEmails("")
    setShowCreateGroup(false)
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    setChatMessages([...chatMessages, { user: "You", text: newMessage }])
    setNewMessage("")
  }

  const handleInviteMember = () => {
    if (!inviteEmail.trim()) return
    alert(`Invite sent to: ${inviteEmail}`)
    setInviteEmail("")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6 pb-20 lg:pb-6 flex flex-col lg:flex-row gap-4">

        {/* Left Sidebar */}
        <div className="w-full lg:w-64 space-y-4 flex flex-col">
          {/* Groups List */}
          <Card className="p-3 lg:p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm lg:text-base">Secret Groups</h3>
              <Button size="sm" variant="ghost" onClick={() => setShowCreateGroup(true)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
              {userGroups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => setActiveGroup(group.id)}
                  className={`flex-shrink-0 lg:flex-shrink lg:w-full flex items-center space-x-2 lg:space-x-3 p-2 lg:p-3 rounded-lg transition-colors min-w-[200px] lg:min-w-0 ${activeGroup === group.id ? "bg-accent" : "hover:bg-accent/50"
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

          {/* Chat + Invite stacked */}
          <div className="space-y-4">
            {/* Chat */}
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Chat</h3>
              <div className="border border-muted rounded p-2 h-48 overflow-y-auto mb-2">
                {chatMessages.length === 0 && <p className="text-sm text-muted-foreground">No messages yet.</p>}
                {chatMessages.map((msg, idx) => (
                  <p key={idx}><strong>{msg.user}:</strong> {msg.text}</p>
                ))}
              </div>
              <div className="flex flex-col space-y-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full border p-2 rounded"
                />
                <Button className="w-full" onClick={handleSendMessage}>Send</Button>
              </div>
            </Card>

            {/* Invite Members */}
            <Card className="p-3">
              <h4 className="font-semibold mb-1">Invite Members</h4>
              <div className="flex flex-col space-y-2">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter email..."
                  className="w-full border p-2 rounded"
                />
                <Button className="w-full" onClick={handleInviteMember}>Invite</Button>
              </div>
            </Card>
          </div>
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
                      <Users className="w-4 h-4 mr-1" />{activeGroupData.members} members
                    </div>
                    <div className="flex items-center">
                      <Crown className="w-4 h-4 mr-1" />{activeGroupData.admins.length} admins
                    </div>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full lg:w-auto bg-transparent">
                <Settings className="w-4 h-4 mr-2" />Settings
              </Button>
            </div>
          </Card>

          {/* Create Post */}
          <Card className="p-3 lg:p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-muted rounded-full flex items-center justify-center font-semibold text-xs lg:text-sm">JD</div>
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
            {groupPosts.map((post, index) => <PostCard key={index} {...post} />)}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-80 space-y-4 lg:space-y-6">
          {/* Group Admins */}
          <Card className="p-4 lg:p-6">
            <h3 className="font-semibold mb-4 flex items-center text-sm lg:text-base">
              <Crown className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />Group Admins
            </h3>
            <div className="space-y-3">
              {activeGroupData.admins.map((admin, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-xs font-semibold">
                    {admin.split(" ").map((n) => n[0]).join("")}
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
                    <Button size="sm" variant="outline" className="h-6 px-2 text-xs bg-transparent">Join</Button>
                  </div>
                  <p className="text-xs text-muted-foreground">{group.description}</p>
                  <p className="text-xs text-muted-foreground">{group.members} members</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="p-6 w-full max-w-md relative">
            <X
              className="w-5 h-5 absolute top-4 right-4 cursor-pointer"
              onClick={() => setShowCreateGroup(false)}
            />
            <h2 className="text-xl font-bold mb-4">Create Secret Group</h2>
            <div className="flex flex-col space-y-3">
              <label className="text-sm font-medium">Group Name *</label>
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="border p-2 rounded w-full"
                placeholder="Enter group name"
              />
              <label className="text-sm font-medium">Invite by Email</label>
              <textarea
                value={inviteEmails}
                onChange={(e) => setInviteEmails(e.target.value)}
                className="border p-2 rounded w-full"
                placeholder="Enter email addresses separated by commas"
              />
              <Button onClick={handleCreateGroup} className="mt-2">Create Group</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}




