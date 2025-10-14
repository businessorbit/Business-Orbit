"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, Calendar, MapPin } from "lucide-react";

interface Member {
  id: number;
  name: string;
  email: string;
  profilePhotoUrl?: string;
  userJoinedAt: string;
  chapters: Array<{
    chapter_id: string;
    chapter_name: string;
    location_city: string;
    joined_at: string;
  }>;
}

interface ChapterStats {
  totalMembers: number;
  totalChapters: number;
  membersByChapter: Array<{
    chapterName: string;
    location: string;
    memberCount: number;
  }>;
}

export default function AdminMembers() {
  const [filter, setFilter] = useState<"All" | "Recent" | "ByChapter">("All");
  const [members, setMembers] = useState<Member[]>([]);
  const [stats, setStats] = useState<ChapterStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);

  // Fetch all members with their chapter information
  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/members', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setMembers(data.members || []);
      } else {
        console.error('Failed to fetch members:', await response.json());
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch chapter statistics
  const fetchChapterStats = async () => {
    try {
      const response = await fetch('/api/admin/chapter-stats', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats({
            totalMembers: data.stats.totalMembers,
            totalChapters: data.stats.totalChapters,
            membersByChapter: data.stats.chaptersWithMembers.map((chapter: any) => ({
              chapterName: chapter.chapterName,
              location: chapter.location,
              memberCount: chapter.memberCount
            }))
          });
        }
      } else {
        console.error('Failed to fetch chapter stats:', await response.json());
      }
    } catch (error) {
      console.error('Error fetching chapter stats:', error);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    if (members.length > 0) {
      fetchChapterStats();
    }
  }, [members.length]);

  const filteredMembers = (() => {
    if (filter === "Recent") {
      return members.slice(0, 10); // Show 10 most recent
    } else if (filter === "ByChapter" && selectedChapter) {
      return members.filter(member => 
        member.chapters.some(chapter => chapter.chapter_id === selectedChapter)
      );
    }
    return members;
  })();

  if (loading) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Members</p>
                <p className="text-2xl font-bold">{stats.totalMembers}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Chapters</p>
                <p className="text-2xl font-bold">{stats.totalChapters}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Active Members</p>
                <p className="text-2xl font-bold">{filteredMembers.length}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Chapter-wise Members */}
      {stats && stats.membersByChapter.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Chapter-wise Member Count</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.membersByChapter.map((chapter, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <h4 className="font-medium">{chapter.chapterName}</h4>
                <p className="text-sm text-gray-600">{chapter.location}</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">{chapter.memberCount}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Members Management */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Members Management</h1>
          <div className="flex gap-2">
            {(["All", "Recent", "ByChapter"] as const).map((f) => (
              <Button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1 rounded-full text-sm font-medium transition ${
                  filter === f
                    ? "bg-black text-white"
                    : "bg-gray-200 text-black hover:bg-gray-300"
                }`}
              >
                {f}
              </Button>
            ))}
          </div>
        </div>

        {/* Chapter Filter for ByChapter */}
        {filter === "ByChapter" && stats && (
          <div className="mb-4">
            <select
              value={selectedChapter || ""}
              onChange={(e) => setSelectedChapter(e.target.value || null)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="">Select a chapter</option>
              {stats.membersByChapter.map((chapter, index) => (
                <option key={index} value={chapter.chapterName}>
                  {chapter.chapterName} ({chapter.location})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Members List */}
        <div className="space-y-4">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="flex justify-between items-center border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition"
            >
              {/* Left Side */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  {member.profilePhotoUrl ? (
                    <img
                      src={member.profilePhotoUrl}
                      alt={member.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <Users className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">{member.name}</h2>
                  <p className="text-sm text-gray-500 flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    {member.email}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Joined: {new Date(member.userJoinedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Right Side - Chapter Info */}
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">
                  {member.chapters.length} Chapter{member.chapters.length !== 1 ? 's' : ''}
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {member.chapters.slice(0, 2).map((chapter, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {chapter.chapter_name}
                    </Badge>
                  ))}
                  {member.chapters.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{member.chapters.length - 2} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredMembers.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {filter === "ByChapter" && !selectedChapter
                  ? "Please select a chapter to view members"
                  : `No ${filter.toLowerCase()} members found.`
                }
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
