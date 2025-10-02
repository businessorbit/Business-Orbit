"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Calendar, Trophy, MessageSquare, Users, Lock, Plus, MapPin, Loader2, Trash2, RefreshCw } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { safeApiCall } from "@/lib/utils/api";
import { toast } from "sonner";
import Link from "next/link";

interface UserChapter {
  id: string;
  name: string;
  location_city: string;
  member_count: number;
}

interface ChapterEvent {
  id: number;
  title: string;
  description?: string;
  date: string;
  time: string;
  attendees: number;
  is_registered: boolean;
  event_type: string;
  venue_address?: string;
  chapter?: string;
}

interface TopPerformer {
  chapter: string;
  name: string;
  score: number;
}

interface ThankYouNote {
  id: number;
  chapter: string;
  from: string;
  message: string;
}

export default function ChapterDashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [userChapters, setUserChapters] = useState<UserChapter[]>([]);
  const [isAddChapterOpen, setIsAddChapterOpen] = useState(false);
  const [availableChapters, setAvailableChapters] = useState<string[]>([]);
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [chaptersLoading, setChaptersLoading] = useState(true);
  const [deletingChapterId, setDeletingChapterId] = useState<string | null>(null);

  // Events state
  const [events, setEvents] = useState<ChapterEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [lastEventsUpdate, setLastEventsUpdate] = useState<Date | null>(null);

  const topPerformers: TopPerformer[] = [
    { chapter: "Bengaluru Tech Chapter", name: "Rajesh Kumar", score: 95 },
    { chapter: "Delhi Founders Hub", name: "Ananya Gupta", score: 90 },
  ];

  const thankYouNotes: ThankYouNote[] = [
    { id: 1, chapter: "Bengaluru Tech Chapter", from: "Sarah Chen", message: "Thanks for your help with the workshop!" },
    { id: 2, chapter: "Delhi Founders Hub", from: "Michael Rodriguez", message: "Appreciate your feedback on my pitch." },
  ];

  // Fetch user's joined chapters
  const fetchUserChapters = async () => {
    if (!user) return;
    
    setChaptersLoading(true);
    try {
      console.log('Fetching chapters for user:', user.id);
      
      const result = await safeApiCall(
        () => fetch(`/api/users/${user.id}/chapters`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        }),
        'Failed to fetch user chapters'
      );
      
      console.log('API response:', result);
      
      if (result.success && result.data && typeof result.data === 'object' && result.data !== null) {
        const data = result.data as any;
        if (data.success && Array.isArray(data.chapters)) {
          console.log('Found chapters:', data.chapters);
          setUserChapters(data.chapters);
        } else {
          console.log('No chapters found for user, data:', data);
          setUserChapters([]);
        }
      } else {
        console.error('Error fetching user chapters:', result.error);
        toast.error('Failed to load chapters');
        setUserChapters([]);
      }
    } catch (error) {
      console.error('Error fetching user chapters:', error);
      toast.error('Failed to load chapters');
      setUserChapters([]);
    } finally {
      setChaptersLoading(false);
    }
  };

  // Fetch available locations (cities) for adding chapters
  const fetchAvailableOptions = async () => {
    const result = await safeApiCall(
      () => fetch('/api/chapters', {
        credentials: 'include',
      }),
      'Failed to fetch available chapters'
    );
    
    if (result.success && result.data && typeof result.data === 'object' && result.data !== null) {
      const data = result.data as any;
      const chapters: Array<{ location_city: string }> = Array.isArray(data.chapters) ? data.chapters : [];
      // Get unique cities from all chapters
      const uniqueCities = Array.from(new Set(chapters.map((c) => String(c.location_city)))) as string[];
      setAvailableChapters(uniqueCities);
    }
  };

  // Handle adding new chapters
  const handleAddChapters = async () => {
    if (selectedChapters.length === 0) {
      toast.error('Please select at least one location');
      return;
    }

    console.log('Adding chapters for locations:', selectedChapters);
    setIsAdding(true);
    try {
      const result = await safeApiCall(
        () => fetch('/api/chapters/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            locations: selectedChapters
          }),
        }),
        'Failed to add chapters'
      );

      console.log('Add chapters API response:', result);

      if (result.success) {
        const memberships = (result.data as any)?.memberships ?? 0;
        toast.success(`Successfully joined ${memberships} chapters!`);
        setIsAddChapterOpen(false);
        setSelectedChapters([]);
        // Refresh user chapters
        await fetchUserChapters();
      } else if (result.error) {
        console.error('Add chapters error:', result.error);
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Error adding chapters:', error);
      toast.error('Failed to add chapters');
    } finally {
      setIsAdding(false);
    }
  };

  // Handle deleting a chapter membership
  const handleDeleteChapter = async (chapterId: string, chapterName: string) => {
    console.log('=== DELETE CHAPTER DEBUG ===');
    console.log('Chapter ID:', chapterId);
    console.log('Chapter Name:', chapterName);
    console.log('User object:', user);
    console.log('User ID:', user?.id);
    console.log('Loading state:', loading);
    
    setDeletingChapterId(chapterId);
    try {
      if (!user?.id) {
        console.error('No user ID found!');
        toast.error('User not found. Please refresh the page and try again.');
        setDeletingChapterId(null);
        return;
      }
      
      const result = await safeApiCall(
        () => fetch(`/api/chapters/${chapterId}/membership`, {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.id }),
        }),
        'Failed to leave chapter'
      );

      console.log('Delete chapter API response:', result);

      if (result.success) {
        toast.success(`Successfully left "${chapterName}"`);
        // Refresh user chapters
        await fetchUserChapters();
      } else if (result.error) {
        console.error('Delete chapter error:', result.error);
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Error deleting chapter:', error);
      toast.error('Failed to leave chapter');
    } finally {
      setDeletingChapterId(null);
    }
  };

  useEffect(() => {
    console.log('Chapters page - User state:', { user, loading });
    if (user && !loading) {
      fetchUserChapters();
      fetchUpcomingEvents();
    }
  }, [user, loading]);

  // Auto-refresh events every 3 minutes for dashboard
  useEffect(() => {
    if (!user || loading) return;

    const interval = setInterval(() => {
      fetchUpcomingEvents(false); // Silent refresh
    }, 180000); // Refresh every 3 minutes

    return () => clearInterval(interval);
  }, [user, loading]);

  // Refresh events when page regains focus
  useEffect(() => {
    if (!user || loading) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchUpcomingEvents(false); // Silent refresh when tab regains focus
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, loading]);

  // Handle location selection
  const handleChapterSelection = (location: string) => {
    setSelectedChapters(prev => 
      prev.includes(location) 
        ? prev.filter(l => l !== location)
        : [...prev, location]
    );
  };

  // Fetch upcoming events dynamically
  const fetchUpcomingEvents = async (forceRefresh = false) => {
    if (eventsLoading && !forceRefresh) return;
    
    setEventsLoading(true);
    try {
      console.log('Fetching upcoming events for chapters dashboard...');
      
      const url = user?.id ? `/api/events?userId=${user.id}&limit=6` : '/api/events?limit=6';
      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Cache-Control': forceRefresh ? 'no-cache' : 'default'
        }
      });
      
      if (response.ok) {
        const eventsData = await response.json();
        console.log('Events API response:', eventsData);
        
        // Filter upcoming events and format them
        const now = new Date();
        const upcomingEvents = eventsData
          .filter((event: any) => {
            if (!event.date) return false;
            try {
              const eventDate = new Date(event.date);
              return eventDate >= now && event.status === 'approved';
            } catch (error) {
              console.error('Error filtering event date:', event.date, error);
              return false;
            }
          })
          .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 4) // Show top 4 upcoming events for dashboard
          .map((event: any) => {
            const eventDate = new Date(event.date);
            return {
              id: event.id,
              title: event.title,
              description: event.description,
              date: eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              time: eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
              attendees: event.rsvp_count || 0,
              is_registered: event.is_registered || false,
              event_type: event.event_type,
              venue_address: event.venue_address
            };
          });
        
        console.log('Processed upcoming events for dashboard:', upcomingEvents);
        setEvents(upcomingEvents);
        setLastEventsUpdate(new Date());
        
        if (forceRefresh) {
          toast.success(`Events updated - ${upcomingEvents.length} upcoming event${upcomingEvents.length === 1 ? '' : 's'} found`);
        }
      } else {
        const errorData = await response.json();
        console.error('Events API error:', errorData);
        toast.error('Failed to load events: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setEventsLoading(false);
    }
  };

  // Manual refresh function for events
  const handleRefreshEvents = () => {
    fetchUpcomingEvents(true);
  };

  // Handle event RSVP functionality for dashboard
  const handleEventRSVP = async (eventId: number, eventTitle: string) => {
    if (!user) {
      toast.error('Please sign in to RSVP to events');
      return;
    }

    try {
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          userName: user.name
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Successfully RSVP'd to ${eventTitle}`);
        // Refresh events to update RSVP status
        setTimeout(() => fetchUpcomingEvents(true), 1000);
      } else {
        toast.error(data.message || 'Failed to RSVP to event');
      }
    } catch (error) {
      console.error('Error RSVPing to event:', error);
      toast.error('Failed to RSVP to event');
    }
  };

  // Handle reply to thank you notes
  const handleReply = (noteId: number, reply: string) => {
    if (!reply.trim()) return;
    console.log(`Reply to note ${noteId}: ${reply}`);
    toast.success('Reply sent!');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      {loading ? (
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </main>
      ) : !user ? (
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-10">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground mb-4">Please sign in to view your chapters.</p>
            <Button onClick={() => router.push('/product/auth')}>
              Sign In
            </Button>
          </div>
        </main>
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-10">
        
        {/* Dashboard Grid */}
        <div className="grid gap-10 md:grid-cols-2">
          
          {/* My Chapters */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Users className="h-5 w-5 text-primary" /> My Chapters
              </h2>
              <Dialog open={isAddChapterOpen} onOpenChange={setIsAddChapterOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      fetchAvailableOptions();
                      setSelectedChapters([]);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Chapter
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Chapters</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    {/* Locations Selection */}
                    <div>
                      <h3 className="font-semibold mb-3">Select Locations</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Choose locations to join all chapters in those cities
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {availableChapters.map((location) => (
                          <button
                            key={location}
                            onClick={() => handleChapterSelection(location)}
                            className={`p-2 rounded-lg border-2 transition-all duration-200 text-sm font-medium cursor-pointer ${
                              selectedChapters.includes(location)
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                            }`}
                          >
                            {location}
                          </button>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Selected: {selectedChapters.length} locations
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsAddChapterOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleAddChapters}
                        disabled={isAdding || selectedChapters.length === 0}
                      >
                        {isAdding ? 'Adding...' : 'Add Chapters'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {loading ? (
              <Card className="p-4 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading user data...</span>
                    </div>
                  </Card>
            ) : !user ? (
              <Card className="p-4 text-center">
                <h3 className="text-lg font-semibold mb-2">Please log in</h3>
                <p className="text-muted-foreground mb-4">You need to be logged in to view your chapters.</p>
                <Button onClick={() => router.push('/product/auth')}>
                  Go to Login
                </Button>
              </Card>
            ) : chaptersLoading ? (
              <Card className="p-4 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading chapters...</span>
                    </div>
                  </Card>
            ) : userChapters.length === 0 ? (
              <Card className="p-4 text-center">
                <p className="text-muted-foreground">No chapters joined yet.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Use the "Add Chapter" button to join chapters and secret groups.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userChapters.map((chapter) => (
                  <Card key={chapter.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <Link href={`/product/chapters/${chapter.id}`} className="flex-1 cursor-pointer">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{chapter.name}</h3>
                          <div className="flex items-center text-sm text-muted-foreground mb-2">
                            <MapPin className="w-4 h-4 mr-1" />
                            {chapter.location_city}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Users className="w-4 h-4 mr-1" />
                            {chapter.member_count} members
                          </div>
                        </div>
                      </Link>
                      <div className="flex items-center space-x-2 ml-2">
                        <Badge variant="secondary">
                          Active
                        </Badge>
                        {user?.id && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                disabled={deletingChapterId === chapter.id}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                              >
                                {deletingChapterId === chapter.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Leave Chapter</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to leave "{chapter.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteChapter(chapter.id, chapter.name)}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  Leave Chapter
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Upcoming Events */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <Calendar className="h-5 w-5 text-primary" /> 
                  Upcoming Events
                  {eventsLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                </h2>
                {lastEventsUpdate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Last updated: {lastEventsUpdate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefreshEvents}
                disabled={eventsLoading}
                className="text-xs px-2"
              >
                <RefreshCw className={`w-3 h-3 ${eventsLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <div className="space-y-3">
              {eventsLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Loading events...</p>
                </div>
              ) : events.length === 0 ? (
                <Card className="p-6 text-center">
                  <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No upcoming events found.</p>
                  <p className="text-xs text-muted-foreground mt-1">Check back later for new events!</p>
                </Card>
              ) : (
                events.map((event) => (
                  <Card key={event.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h3 className="font-medium text-sm">{event.title}</h3>
                        <div className="flex items-center gap-1">
                          {event.is_registered && (
                            <Badge variant="secondary" className="text-xs">
                              Registered
                            </Badge>
                          )}
                          {event.event_type === 'online' && (
                            <span className="text-xs text-blue-600 font-medium">🌐</span>
                          )}
                          
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {event.date} • {event.time}
                          </span>
                          <span className="flex items-center">
                            <Users className="w-3 h-3 mr-1" />
                            {event.attendees} attending
                          </span>
                        </div>
                        
                        {event.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {event.description}
                          </p>
                        )}
                        
                        {event.venue_address && event.event_type === 'physical' && (
                          <div className="flex items-start text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{event.venue_address}</span>
                          </div>
                        )}
                        
                        {user && !event.is_registered && (
                          <Button
                            size="sm"
                            className="text-xs h-6 mt-2 w-full"
                            onClick={() => handleEventRSVP(event.id, event.title)}
                          >
                            RSVP Now
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
            {events.length > 0 && (
              <Button 
                variant="outline" 
                className="w-full text-sm"
                onClick={() => router.push('/events')}
              >
                View All Events
              </Button>
            )}
          </section>

          {/* Top Performers */}
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Trophy className="h-5 w-5 text-primary" /> Top Performers
            </h2>
            <div className="space-y-3">
              {topPerformers.map((p, idx) => (
                <Card key={idx} className="p-4">
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm text-muted-foreground">{p.chapter}</p>
                  <Badge className="mt-2">{p.score} pts</Badge>
                </Card>
              ))}
            </div>
          </section>

          {/* Thank You Notes */}
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <MessageSquare className="h-5 w-5 text-primary" /> Thank You Notes
            </h2>
            <div className="space-y-3">
              {thankYouNotes.map((note) => (
                <Card key={note.id} className="p-4 space-y-3">
                  <div>
                    <p className="font-medium">{note.from}</p>
                    <p className="text-xs text-muted-foreground">{note.chapter}</p>
                  </div>
                  <p className="text-sm">{note.message}</p>
                  <div className="flex gap-2">
                    <input
                      id={`reply-${note.id}`}
                      type="text"
                      placeholder="Reply..."
                      className="flex-1 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleReply(note.id, (e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = "";
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        const input = document.getElementById(`reply-${note.id}`) as HTMLInputElement;
                        if (input) {
                          handleReply(note.id, input.value);
                          input.value = "";
                        }
                      }}
                    >
                      Send
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>

        </div>
      </main>
      )}
    </div>
  );
}
