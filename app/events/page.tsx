"use client";

import Modal from "react-modal";
import axios from "axios";
import { useState, useEffect, useMemo } from "react";
import { Navigation } from "@/components/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, Users, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import toast, { Toaster } from "react-hot-toast";


// Sample data for demonstration - will be replaced with API data
const upcomingEvents = [
  {
    id: 1,
    title: "AI in Product Development Workshop",
    host: "Sarah Chen",
    hostAvatar: "SC",
    date: "Dec 28, 2024",
    time: "6:00 PM - 8:00 PM",
    location: "WeWork BKC, Mumbai",
    attendees: 47,
    maxAttendees: 60,
    price: "Free",
    category: "Workshop",
    description: "Learn how to integrate AI into your product development process",
    eventType: "physical",
    meetingLink: "",
    isJoined: false,
  },
  {
    id: 2,
    title: "Startup Pitch Night",
    host: "Bengaluru Entrepreneurs",
    hostAvatar: "BE",
    date: "Jan 5, 2025",
    time: "7:00 PM - 9:00 PM",
    location: "91springboard Koramangala",
    attendees: 89,
    maxAttendees: 100,
    price: "₹500",
    category: "Networking",
    description: "Present your startup idea to investors and fellow entrepreneurs",
    eventType: "online",
    meetingLink: "https://meet.google.com/abc-defg-hij",
    isJoined: false,
  },
];

export default function EventsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showRSVPDialog, setShowRSVPDialog] = useState(false);
  const [events, setEvents] = useState(upcomingEvents);

  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [proposalData, setProposalData] = useState({
    name: "",
    email: "",
    eventTitle: "",
    eventDate: "",
    mode: "Online",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Set the app element for react-modal
  useEffect(() => {
    Modal.setAppElement(document.body);
  }, []);

  // Fetch events from API with server-side search (debounced)
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.set('search', searchQuery);
        if (searchDate) params.set('date', searchDate);
        if (user?.id) params.set('userId', String(user.id));
        const res = await fetch(`/api/events${params.toString() ? `?${params.toString()}` : ''}`, { signal: controller.signal });
        if (!res.ok) return;
        const data = await res.json();
        const transformedEvents = (data || []).map((event: any) => {
          const eventDate = new Date(event.date);
          return {
            id: event.id,
            title: event.title,
            host: "Event Host",
            hostAvatar: "EH",
            date: eventDate.toLocaleDateString(),
            time: eventDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            location: event.venue_address || "Online Event",
            attendees: Number(event.rsvp_count || 0) || 0,
            maxAttendees: 100,
            price: "Free",
            category: "Professional",
            description: event.description,
            eventType: event.event_type,
            meetingLink: event.meeting_link || "",
            isJoined: Boolean(event.is_registered),
            formattedDate: eventDate.toISOString().slice(0, 16),
            dateMs: eventDate.getTime(),
          };
        });
        setEvents(transformedEvents);
      } catch (error) {
        if ((error as any).name !== 'AbortError') {
          console.error('Failed to fetch events:', error);
        }
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [searchQuery, searchDate, user?.id]);

  
  const filteredEvents = events; // server-side filtered

  // Categorize by date
  const nowMs = Date.now();
  const upcomingEventsList = useMemo(() =>
    filteredEvents
      .filter((e: any) => typeof e.dateMs === 'number' ? e.dateMs >= nowMs : false)
      .sort((a: any, b: any) => (a.dateMs || 0) - (b.dateMs || 0))
  , [filteredEvents, nowMs]);

  const pastEventsList = useMemo(() =>
    filteredEvents
      .filter((e: any) => typeof e.dateMs === 'number' ? e.dateMs < nowMs : false)
      .sort((a: any, b: any) => (b.dateMs || 0) - (a.dateMs || 0))
  , [filteredEvents, nowMs]);

  const handleRSVPClick = (event: any) => {
    setSelectedEvent(event);
    setShowRSVPDialog(true);
  };

  const handleRSVPConfirm = async (event: any) => {
    try {
      if (!user) {
        toast.error("Please log in to RSVP.");
        return;
      }
      const res = await fetch(`/api/events/${event.id}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: String(user.id),
          userEmail: user.email,
          userName: user.name,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        setEvents((prev) =>
          prev.map((ev) =>
            ev.id === event.id ? { ...ev, isJoined: true, attendees: ev.attendees + 1 } : ev
          )
        );
      } else {
        toast.error(data.message);
      }
      setShowRSVPDialog(false);
    } catch (err) {
      console.error(err);
      toast.error("RSVP failed. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Toaster />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Events</h1>
            <p className="text-muted-foreground">Discover and join professional networking events</p>
          </div>
          <div className="flex gap-2">
            <a
              href={`mailto:events@businessorbit.app?subject=${encodeURIComponent('Event Proposal')}&body=${encodeURIComponent('Hi Team,\n\nI would like to propose an event.\n\nTitle: \nDate: \nMode (Online/Physical): \nVenue or Meeting Link: \nDescription: \n\nThanks!')}`}
            >
              <Button className="rounded-full">
                <Plus className="w-4 h-4 mr-2" />
                Propose Event
              </Button>
            </a>
            <Button 
              className="rounded-full"
              onClick={() => setIsModalOpen(true)}
            >
              Use Form
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div>
              <Input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
              />
            </div>
          </div>
        </Card>

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="hosting">Hosting</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEventsList.map((event) => (
                <Card key={event.id} className="p-6 hover:shadow-sm transition-shadow">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <Badge variant="outline" className="text-xs">
                        {event.category}
                      </Badge>
                      <Badge variant={event.price === "Free" ? "secondary" : "default"} className="text-xs">
                        {event.price}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2 line-clamp-2">{event.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{event.description}</p>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {event.date}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        {event.time}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        {event.location}
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        {event.attendees}/{event.maxAttendees} attending
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-semibold">
                          {event.hostAvatar}
                        </div>
                        <span className="text-sm text-muted-foreground">{event.host}</span>
                      </div>
                      <Button
                        size="sm"
                        variant={event.isJoined ? "secondary" : "default"}
                        onClick={() => handleRSVPClick(event)}
                      >
                        {event.isJoined ? "Registered" : "RSVP"}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="hosting" className="space-y-4">
            <div className="text-center py-8">
              <p className="text-muted-foreground">No hosted events yet</p>
              <Button className="mt-4" onClick={() => setIsModalOpen(true)}>
                Propose Your First Event
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEventsList.map((event) => (
                <Card key={event.id} className="p-6 hover:shadow-sm transition-shadow">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <Badge variant="outline" className="text-xs">
                        {event.category}
                      </Badge>
                      <Badge variant={event.price === "Free" ? "secondary" : "default"} className="text-xs">
                        {event.price}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2 line-clamp-2">{event.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{event.description}</p>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {event.date}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        {event.time}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        {event.location}
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        {event.attendees}/{event.maxAttendees} attending
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-semibold">
                          {event.hostAvatar}
                        </div>
                        <span className="text-sm text-muted-foreground">{event.host}</span>
                      </div>
                      <Button size="sm" variant="secondary" disabled>
                        Ended
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* RSVP Confirmation Modal */}
      <Modal
        isOpen={showRSVPDialog}
        onRequestClose={() => setShowRSVPDialog(false)}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        overlayClassName="fixed inset-0"
        ariaHideApp={false}
      >
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h2 className="text-xl font-bold mb-4">Confirm RSVP</h2>
          <p className="mb-4">
            Confirm your RSVP for "{selectedEvent?.title}". A confirmation will be sent to your registered email.
          </p>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowRSVPDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleRSVPConfirm(selectedEvent)}
              className="bg-black hover:bg-black"
            >
              Confirm RSVP
            </Button>
          </div>
        </div>
      </Modal>

      {/* Event Proposal Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        overlayClassName="fixed inset-0"
        ariaHideApp={false}
      >
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Propose an Event</h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              try {
                const res = await fetch("/api/send-proposal", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(proposalData),
                });
                const data = await res.json();
                if (data.success) {
                  setSuccessMessage(data.message);
                  setProposalData({
                    name: "",
                    email: "",
                    eventTitle: "",
                    eventDate: "",
                    mode: "Online",
                    description: "",
                  });
                  setIsModalOpen(false);
                } else {
                  alert("Failed to send proposal: " + data.message);
                }
              } catch (err) {
                console.error(err);
                alert("Failed to send proposal");
              }
              setLoading(false);
            }}
            className="space-y-4"
          >
            <Input
              placeholder="Your Name"
              value={proposalData.name}
              onChange={(e) =>
                setProposalData({ ...proposalData, name: e.target.value })
              }
              required
            />
            <Input
              placeholder="Your Email"
              type="email"
              value={proposalData.email}
              onChange={(e) =>
                setProposalData({ ...proposalData, email: e.target.value })
              }
              required
            />
            <Input
              placeholder="Event Title"
              value={proposalData.eventTitle}
              onChange={(e) =>
                setProposalData({ ...proposalData, eventTitle: e.target.value })
              }
              required
            />
            <Input
              placeholder="Event Date"
              type="datetime-local"
              value={proposalData.eventDate}
              onChange={(e) =>
                setProposalData({ ...proposalData, eventDate: e.target.value })
              }
              required
            />
            <select
              className="w-full p-2 border rounded"
              value={proposalData.mode}
              onChange={(e) =>
                setProposalData({ ...proposalData, mode: e.target.value })
              }
            >
              <option value="Online">Online</option>
              <option value="Physical">Physical</option>
            </select>
            <textarea
              placeholder="Event Description"
              className="w-full p-2 border rounded"
              rows={3}
              value={proposalData.description}
              onChange={(e) =>
                setProposalData({ ...proposalData, description: e.target.value })
              }
              required
            />
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Proposal"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {successMessage}
        </div>
      )}
    </div>
  );
}
