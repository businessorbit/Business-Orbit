"use client";

import React, { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin-sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MessageSquare, Calendar, Users, Settings, MapPinned } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface AdminStat {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface AdminAction {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export default function AdminDashboard(): React.JSX.Element | null {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const [chatStats, setChatStats] = useState({
    totalMessages: 0,
    activeConversations: 0,
    totalUsers: 0,
    totalChapters: 0
  });
  const [loading, setLoading] = useState(true);

  // Check admin authentication
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        // Redirect to auth page if not authenticated
        router.push('/product/auth?admin=true');
        return;
      }
      if (user && !isAdmin) {
        // If user is logged in but not admin, redirect to profile
        router.push('/product/profile');
        return;
      }
    }
  }, [user, isAdmin, authLoading, router]);

  useEffect(() => {
    const fetchChatStats = async () => {
      try {
        const response = await fetch('/api/admin/chat-analytics?days=30', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setChatStats({
            totalMessages: data.data.totalMessages,
            activeConversations: data.data.activeConversations,
            totalUsers: data.data.performance.totalUsers,
            totalChapters: data.data.performance.totalChapters
          });
        } else {
          const errorData = await response.json();
          console.error('Failed to fetch chat stats:', errorData);
          // Set default values when not authorized
          setChatStats({
            totalMessages: 0,
            activeConversations: 0,
            totalUsers: 0,
            totalChapters: 0
          });
        }
      } catch (error) {
        console.error('Failed to fetch chat stats:', error);
        setChatStats({
          totalMessages: 0,
          activeConversations: 0,
          totalUsers: 0,
          totalChapters: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchChatStats();
  }, []);

  const adminStats: AdminStat[] = [
    { label: "Total Members", value: "1,234", icon: Users },
    { label: "Pending Approvals", value: "23", icon: Users },
    { label: "Active Events", value: "8", icon: Calendar },
    { 
      label: "Chat Messages", 
      value: loading ? "..." : chatStats.totalMessages.toLocaleString(), 
      icon: MessageSquare 
    },
  ];

  const adminActions: AdminAction[] = [
    {
      title: "Manage Chapters",
      description: "Create and manage chapters",
      href: "/product/admin/chapters",
      icon: MapPinned,
      color: "bg-black",
    },
    {
      title: "Chat Management",
      description: "Monitor and manage chat analytics",
      href: "/product/admin/chat",
      icon: MessageSquare,
      color: "bg-black",
    },
    {
      title: "Create Event",
      description: "Create and manage events",
      href: "/product/admin/events",
      icon: Calendar,
      color: "bg-black",
    },
    {
      title: "Review Members",
      description: "Approve and manage members",
      href: "/product/admin/members",
      icon: Users,
      color: "bg-black",
    },
    {
      title: "Platform Settings",
      description: "Configure platform settings",
      href: "/product/admin/settings",
      icon: Settings,
      color: "bg-black",
    },
  ];

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      <div className="flex-1 ml-20">
        <div className="px-4 sm:px-6 lg:px-8 lg:-ml-10 py-4 sm:py-8 pb-20 lg:pb-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your Business Orbit Admin platform</p>
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {adminStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-6 shadow-elevated border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className="p-3 bg-accent rounded-full">
                    <Icon className="w-6 h-6 text-foreground" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {adminActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.title} href={action.href}>
                <Card className="p-6 shadow-elevated border-border/50 hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className={`p-4 rounded-full ${action.color}`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Chat Analytics Overview */}
        <Card className="mt-8 p-6 shadow-elevated border-border/50">
          <h2 className="text-xl font-semibold text-foreground mb-4">Chat Analytics Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-600">Active Conversations</p>
              <p className="text-2xl font-bold text-blue-900">
                {loading ? "..." : chatStats.activeConversations}
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-green-600">Chat Users</p>
              <p className="text-2xl font-bold text-green-900">
                {loading ? "..." : chatStats.totalUsers}
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm font-medium text-purple-600">Active Chapters</p>
              <p className="text-2xl font-bold text-purple-900">
                {loading ? "..." : chatStats.totalChapters}
              </p>
            </div>
          </div>
        </Card>

        
        <Card className="mt-8 p-6 shadow-elevated border-border/50">
          <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Button asChild className="h-auto p-4 flex flex-col items-center space-y-2">
              <Link href="/product/admin/chapters">
                <MapPinned className="w-6 h-6 text-black" />
                <span>Manage Chapters</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Link href="/product/admin/chat">
                <MessageSquare className="w-6 h-6 text-black" />
                <span>Chat Management</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Link href="/product/admin/events">
                <Calendar className="w-6 h-6 text-black" />
                <span>Create Event</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Link href="/product/admin/members">
                <Users className="w-6 h-6 text-black" />
                <span>Review Members</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Link href="/product/admin/settings">
                <Settings className="w-6 h-6 text-black" />
                <span>Platform Settings</span>
              </Link>
            </Button>
          </div>
        </Card>
        </div>
      </div>
    </div>
  );
}
