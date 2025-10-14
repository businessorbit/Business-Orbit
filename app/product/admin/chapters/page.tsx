"use client";

import { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin-sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, MapPin, Plus, Database, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Chapter { 
  id: string; 
  name: string; 
  location_city: string; 
  member_count?: number;
  created_at?: string;
}

interface ChapterMember {
  id: number;
  name: string;
  email: string;
  profile_photo_url?: string;
}

export default function AdminChaptersPage() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [members, setMembers] = useState<ChapterMember[]>([]);
  const [seeding, setSeeding] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [stats, setStats] = useState<{
    total_chapters: number; 
    unique_cities: number; 
    total_memberships: number;
  } | null>(null);

  const loadChapters = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/chapters', { 
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log('Chapters loaded:', data);
        setChapters(data.chapters || []);
      } else {
        const errorData = await res.json();
        console.error('Failed to load chapters:', errorData);
        toast.error(errorData.message || 'Failed to load chapters');
      }
    } catch (error) {
      console.error('Error loading chapters:', error);
      toast.error('Failed to load chapters');
    } finally {
      setLoading(false);
    }
  };

  const createChapter = async () => {
    if (!name.trim() || !city.trim()) {
      toast.error('Please fill in both chapter name and location');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/chapters', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          name: name.trim(), 
          location_city: city.trim() 
        })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        toast.success('Chapter created successfully!');
        setName("");
        setCity("");
        await loadChapters();
        await loadStats();
      } else {
        console.error('Failed to create chapter:', data);
        toast.error(data.message || 'Failed to create chapter');
      }
    } catch (error) {
      console.error('Error creating chapter:', error);
      toast.error('Failed to create chapter');
    } finally {
      setCreating(false);
    }
  };

  const loadMembers = async (chapter: Chapter) => {
    setSelectedChapter(chapter);
    try {
      const res = await fetch(`/api/chapters/${chapter.id}/members`, { 
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log('Members loaded:', data);
        setMembers(data.members || []);
        
        // Refresh chapters to update member counts
        await loadChapters();
      } else {
        const errorData = await res.json();
        console.error('Failed to load members:', errorData);
        toast.error(errorData.message || 'Failed to load members');
        setMembers([]);
      }
    } catch (error) {
      console.error('Error loading members:', error);
      toast.error('Failed to load members');
      setMembers([]);
    }
  };

  const seedChapters = async () => {
    setSeeding(true);
    try {
      const res = await fetch('/api/admin/seed-chapters', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await res.json();
      console.log('Seed response:', data);
      
      if (res.ok && data.success) {
        toast.success(data.message || 'Successfully seeded 20 chapters!');
        await loadChapters();
        await loadStats();
      } else {
        console.error('Failed to seed chapters:', data);
        toast.error(data.message || 'Failed to seed chapters');
      }
    } catch (error) {
      console.error('Error seeding chapters:', error);
      toast.error('Failed to seed chapters');
    } finally {
      setSeeding(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await fetch('/api/admin/seed-chapters', { 
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
        }
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const addTestMembers = async () => {
    setTesting(true);
    try {
      const res = await fetch('/api/admin/test-members', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        toast.success(data.message || 'Test members added successfully!');
        await loadChapters();
        await loadStats();
      } else {
        console.error('Failed to add test members:', data);
        toast.error(data.error || 'Failed to add test members');
      }
    } catch (error) {
      console.error('Error adding test members:', error);
      toast.error('Failed to add test members');
    } finally {
      setTesting(false);
    }
  };

  const deleteChapter = async (chapterId: string) => {
    setDeleting(chapterId);
    try {
      const res = await fetch(`/api/chapters/${chapterId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await res.json();
      console.log('Delete response:', data);
      
      if (res.ok && data.success) {
        toast.success(data.message || 'Chapter deleted successfully!');
        await loadChapters();
        await loadStats();
        
        // If the deleted chapter was selected, clear the selection
        if (selectedChapter?.id === chapterId) {
          setSelectedChapter(null);
          setMembers([]);
        }
      } else {
        console.error('Failed to delete chapter:', data);
        toast.error(data.message || 'Failed to delete chapter');
      }
    } catch (error) {
      console.error('Error deleting chapter:', error);
      toast.error('Failed to delete chapter');
    } finally {
      setDeleting(null);
    }
  };

  useEffect(() => { 
    loadChapters(); 
    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      <div className="flex-1 lg:ml-0">
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-8 pb-20 lg:pb-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold">Manage Chapters</h1>
                <p className="text-muted-foreground">
                  Create chapters by location. Users will see these chapters when they select matching locations during onboarding.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                {stats && (
                  <div className="text-sm text-muted-foreground">
                    <div>Total: {stats.total_chapters} chapters</div>
                    <div>Cities: {stats.unique_cities}</div>
                    <div>Memberships: {stats.total_memberships}</div>
                  </div>
                )}
                <Button 
                  onClick={loadChapters} 
                  disabled={loading} 
                  variant="outline"
                  className="cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Database className="w-4 h-4 mr-2 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4 mr-2" />
                      Refresh
                    </>
                  )}
                </Button>
                <Button 
                  onClick={addTestMembers} 
                  disabled={testing} 
                  variant="outline"
                  className="cursor-pointer"
                >
                  {testing ? (
                    <>
                      <Users className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4 mr-2" />
                      Add Test Members
                    </>
                  )}
                </Button>
                <Button 
                  onClick={seedChapters} 
                  disabled={seeding} 
                  variant="outline"
                  className="cursor-pointer"
                >
                  {seeding ? (
                    <>
                      <Database className="w-4 h-4 mr-2 animate-spin" />
                      Seeding...
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4 mr-2" />
                      Seed 20 Chapters
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Create Chapter */}
          <Card className="p-6 mb-8 shadow-elevated border-border/50">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Create New Chapter</h2>
                <p className="text-sm text-muted-foreground">
                  Add a new chapter to expand your network coverage
                </p>
              </div>
              <div className="p-3 bg-accent rounded-full">
                <Plus className="w-6 h-6 text-foreground" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="chapterName" className="text-sm font-medium text-foreground">
                  Chapter Name
                </Label>
                <Input 
                  id="chapterName" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="e.g. Mumbai Tech Innovators" 
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm font-medium text-foreground">
                  Location City
                </Label>
                <Input 
                  id="city" 
                  value={city} 
                  onChange={e => setCity(e.target.value)} 
                  placeholder="e.g. Mumbai" 
                  className="w-full"
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={createChapter} 
                  disabled={creating || !name.trim() || !city.trim()} 
                  className="w-full h-10 cursor-pointer"
                  size="default"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {creating ? 'Creating...' : 'Create Chapter'}
                </Button>
              </div>
            </div>
          </Card>

          {/* Chapters list */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">All Chapters</h2>
                <p className="text-sm text-muted-foreground">
                  Manage existing chapters and view member details
                </p>
              </div>
              <div className="p-3 bg-accent rounded-full">
                <Database className="w-6 h-6 text-foreground" />
              </div>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Database className="w-6 h-6 animate-spin mr-2" />
                <span>Loading chapters...</span>
              </div>
            ) : chapters.length === 0 ? (
              <Card className="p-8 text-center">
                <Database className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No chapters found</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first chapter or seed 20 predefined chapters to get started.
                </p>
                <Button onClick={seedChapters} disabled={seeding}>
                  <Database className="w-4 h-4 mr-2" />
                  Seed 20 Chapters
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {chapters.map((chapter) => (
                  <Card 
                    key={chapter.id} 
                    className="p-6 hover:shadow-lg transition-all duration-200 hover:scale-105 shadow-elevated border-border/50" 
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div 
                        className="flex-1 cursor-pointer" 
                        onClick={() => loadMembers(chapter)}
                      >
                        <h3 className="font-semibold text-lg mb-2 text-foreground">{chapter.name}</h3>
                        <div className="flex items-center text-sm text-muted-foreground mb-3">
                          <MapPin className="w-4 h-4 mr-2" /> 
                          {chapter.location_city}
                        </div>
                        <div className="flex items-center text-sm font-medium text-black">
                          <Users className="w-4 h-4 mr-2" />
                          {chapter.member_count || 0} member{(chapter.member_count || 0) !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="ml-3 flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                              disabled={deleting === chapter.id}
                            >
                              {deleting === chapter.id ? (
                                <Database className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Chapter</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{chapter.name}" from {chapter.location_city}? 
                                This action will permanently delete the chapter and remove all {chapter.member_count || 0} members from it.
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteChapter(chapter.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete Chapter
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Members section */}
          {selectedChapter && (
            <Card className="p-6 shadow-elevated border-border/50">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Members in {selectedChapter.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {members.length} member{members.length !== 1 ? 's' : ''} in this chapter
                  </p>
                </div>
                <div className="p-3 bg-accent rounded-full">
                  <Users className="w-6 h-6 text-foreground" />
                </div>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {members.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      No members found. Users will appear here when they select "{selectedChapter.location_city}" during onboarding.
                    </p>
                  </div>
                ) : (
                  members.map(member => (
                    <div key={member.id} className="flex items-center justify-between border border-border/50 rounded-lg px-4 py-3 hover:bg-accent/50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-sm font-semibold">
                          {member.profile_photo_url ? (
                            <img 
                              src={member.profile_photo_url} 
                              alt={member.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            member.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}