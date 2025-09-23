"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Users, 
  Clock, 
  TrendingUp, 
  BarChart3, 
  Activity,
  Calendar,
  Zap,
  Target,
  Globe
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface ChatAnalytics {
  totalMessages: number;
  activeConversations: number;
  peakUsage: Array<{ hour: number; count: number }>;
  messagesPerChapter: Array<{
    chapterName: string;
    location: string;
    messageCount: number;
    uniqueSenders: number;
  }>;
  userEngagement: Array<{
    userName: string;
    email: string;
    messageCount: number;
    chaptersActive: number;
  }>;
  dailyActivity: Array<{
    date: string;
    messageCount: number;
    uniqueUsers: number;
    activeChapters: number;
  }>;
  performance: {
    totalMessages: number;
    totalUsers: number;
    totalChapters: number;
    avgMessageLength: number;
  };
}

export default function ChatManagementDashboard() {
  const [analytics, setAnalytics] = useState<ChatAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async (days: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/chat-analytics?days=${days}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.data);
      } else {
        const errorData = await response.json();
        console.error('Analytics fetch error:', errorData);
        setError(`Failed to load analytics: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setError('Network error: Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(timeRange);
  }, [timeRange]);

  const timeRangeOptions = [
    { label: 'Last 7 days', value: 7 },
    { label: 'Last 30 days', value: 30 },
    { label: 'Last 90 days', value: 90 }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Chat Management</h1>
          <div className="animate-pulse bg-gray-200 h-10 w-32 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 h-24 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Chat Management</h1>
        </div>
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex items-center space-x-2 text-red-700">
            <MessageSquare className="w-6 h-6" />
            <h3 className="text-lg font-semibold">Error Loading Analytics</h3>
          </div>
          <p className="mt-2 text-red-600">{error}</p>
          <div className="mt-4 space-x-2">
            <Button onClick={() => fetchAnalytics(timeRange)} variant="outline">
              Retry
            </Button>
            <Button onClick={() => window.open('/api/admin/test', '_blank')} variant="outline">
              Test Connection
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
        <p className="mt-1 text-sm text-gray-500">Unable to load chat analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        
        <div className="flex gap-2">
          {timeRangeOptions.map((option) => (
            <Button
              key={option.value}
              variant={timeRange === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Messages</p>
              <p className="text-3xl font-bold text-foreground">{analytics.totalMessages.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Last {timeRange} days</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Conversations</p>
              <p className="text-3xl font-bold text-foreground">{analytics.activeConversations}</p>
              <p className="text-xs text-muted-foreground mt-1">Chapters with activity</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Peak Hour</p>
              <p className="text-3xl font-bold text-foreground">
                {analytics.peakUsage.length > 0 
                  ? `${analytics.peakUsage.reduce((max, curr) => curr.count > max.count ? curr : max).hour}:00`
                  : 'N/A'
                }
              </p>
              <p className="text-xs text-muted-foreground mt-1">Most active time</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg Message Length</p>
              <p className="text-3xl font-bold text-foreground">{Math.round(analytics.performance.avgMessageLength)}</p>
              <p className="text-xs text-muted-foreground mt-1">Characters per message</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Usage Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Peak Usage Times</h3>
            <BarChart3 className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.peakUsage.slice(0, 12)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="hour" 
                  tickFormatter={(value) => `${value}:00`}
                  fontSize={12}
                />
                <YAxis fontSize={12} />
                <Tooltip 
                  labelFormatter={(value) => `Hour: ${value}:00`}
                  formatter={(value) => [value, 'Messages']}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Daily Activity Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Daily Activity</h3>
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.dailyActivity.slice(-14)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  fontSize={12}
                />
                <YAxis fontSize={12} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                  formatter={(value, name) => [value, name === 'messageCount' ? 'Messages' : name]}
                />
                <Area 
                  type="monotone" 
                  dataKey="messageCount" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Messages per Chapter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chapter Distribution Pie Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Chapter Distribution</h3>
            <Globe className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.messagesPerChapter.slice(0, 6).map((chapter, index) => ({
                    name: chapter.chapterName.length > 15 
                      ? chapter.chapterName.substring(0, 15) + '...' 
                      : chapter.chapterName,
                    value: chapter.messageCount,
                    fullName: chapter.chapterName
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.messagesPerChapter.slice(0, 6).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [
                    value, 
                    props.payload.fullName
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chapter Activity Bar Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Chapter Activity</h3>
            <BarChart3 className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={analytics.messagesPerChapter?.slice(0, 8).map(chapter => ({
                  name: chapter?.chapterName?.length > 12 
                    ? chapter.chapterName.substring(0, 12) + '...' 
                    : chapter?.chapterName || 'Unknown Chapter',
                  messages: chapter?.messageCount || 0,
                  users: chapter?.uniqueSenders || 0,
                  fullName: chapter?.chapterName || 'Unknown Chapter'
                })) || []}
                layout="horizontal"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" fontSize={12} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  fontSize={12}
                  width={100}
                />
                <Tooltip 
                  labelFormatter={(value) => 'Chapter Details'}
                  formatter={(value, name) => [
                    value, 
                    name === 'messages' ? 'Messages' : 'Users'
                  ]}
                />
                <Bar dataKey="messages" fill="#3b82f6" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Detailed Chapter List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Chapter Details</h3>
          <Globe className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="space-y-3">
          {analytics.messagesPerChapter.slice(0, 10).map((chapter, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium">{chapter.chapterName}</h4>
                  <Badge variant="secondary">{chapter.location}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {chapter.uniqueSenders} active users
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold">{chapter.messageCount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">messages</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* User Engagement Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Activity Line Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">User Activity Trends</h3>
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.dailyActivity.slice(-14).map(day => ({
                date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                users: day.uniqueUsers,
                messages: day.messageCount,
                fullDate: day.date
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  fontSize={12}
                />
                <YAxis fontSize={12} />
                <Tooltip 
                  labelFormatter={(value) => 'Daily Activity'}
                  formatter={(value, name) => [
                    value, 
                    name === 'users' ? 'Active Users' : 'Messages'
                  ]}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="messages" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Users Bar Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Top Active Users</h3>
            <Activity className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={analytics.userEngagement?.slice(0, 8).map(user => ({
                  name: user?.userName?.length > 10 
                    ? user.userName.substring(0, 10) + '...' 
                    : user?.userName || 'Unknown User',
                  messages: user?.messageCount || 0,
                  chapters: user?.chaptersActive || 0,
                  fullName: user?.userName || 'Unknown User'
                })) || []}
                layout="horizontal"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" fontSize={12} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  fontSize={12}
                  width={80}
                />
                <Tooltip 
                  labelFormatter={(value) => 'User Activity'}
                  formatter={(value, name) => [
                    value, 
                    name === 'messages' ? 'Messages' : 'Chapters'
                  ]}
                />
                <Bar dataKey="messages" fill="#10b981" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Detailed User List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">User Engagement Details</h3>
          <Activity className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="space-y-3">
          {analytics.userEngagement.slice(0, 10).map((user, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium">{user.userName}</h4>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground">
                  Active in {user.chaptersActive} chapters
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold">{user.messageCount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">messages</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold text-foreground">{analytics.performance.totalUsers}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Chapters</p>
              <p className="text-2xl font-bold text-foreground">{analytics.performance.totalChapters}</p>
            </div>
            <Globe className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Connection Status</p>
              <p className="text-2xl font-bold text-green-600">Active</p>
            </div>
            <Zap className="w-8 h-8 text-green-600" />
          </div>
        </Card>
      </div>
    </div>
  );
}
