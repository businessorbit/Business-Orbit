"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";

interface Event {
  id: number;
  title: string;
  description?: string;
  date: string;
  event_type: string;
  status: string;
  rsvp_count: number;
  meeting_link?: string;
  venue_address?: string;
}

interface RSVP {
  id: number;
  name: string;
  email: string;
}

type FormValues = {
  title: string;
  description?: string;
  date: string;
  eventtype: string;
  status: string;
  meetingLink?: string | null;
  venueAddress?: string | null;
}

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const { register, handleSubmit, reset, setValue, watch } = useForm<FormValues>({
    defaultValues: {
      title: '',
      description: '',
      date: '',
      status: 'pending',
      eventtype: 'online',
      meetingLink: '',
      venueAddress: '',
    },
  });
  
  // Watch form values for Select components
  const eventType = watch("eventtype");
  const status = watch("status");

  // Fetch all events
  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/admin/events");
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error("Failed to fetch events", err);
    }
  };

  // Fetch RSVPs for an event
  const fetchRSVPs = async (eventId: number) => {
    try {
      const res = await fetch(`/api/admin/events?id=${eventId}`);
      const data = await res.json();
      setRsvps(data.attendees || []);
    } catch (err) {
      console.error("Failed to fetch RSVPs", err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Edit or prefill event
  const onEdit = (event: Event) => {
    setSelectedEvent(event);
    // Format date for datetime-local input (YYYY-MM-DDTHH:MM)
    const formattedDate = new Date(event.date).toISOString().slice(0, 16);
    reset({
      title: event.title,
      description: event.description || "",
      date: formattedDate,
      eventtype: event.event_type,
      status: event.status,
      meetingLink: event.meeting_link || "",
      venueAddress: event.venue_address || "",
    });
    setShowDialog(true);
  };

  // Save event (create or update)
  const onSubmit = async (formData: any) => {
    console.log("Form submitted with data:", formData);
    
    const payload = {
      title: formData.title,
      description: formData.description || "",
      date: formData.date,
      event_type: formData.eventtype,
      meeting_link: formData.meetingLink || null,
      venue_address: formData.venueAddress || null,
      status: formData.status || 'pending',
    };

    console.log("Payload being sent:", payload);

    try {
      const res = await fetch("/api/admin/events", {
        method: selectedEvent ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: selectedEvent
          ? JSON.stringify({ id: selectedEvent.id, ...payload })
          : JSON.stringify(payload),
      });

      console.log("Response status:", res.status);

      if (res.ok) {
        const savedEvent = await res.json();
        console.log("Event saved successfully:", savedEvent);
        fetchEvents();
        reset();
        setSelectedEvent(null);
        setShowDialog(false);
        setSuccessMessage("Event saved successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        const error = await res.json();
        console.error("API Error:", error);
        alert("Failed to save event: " + (error.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Error saving event:", err);
      alert("Error saving event");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Event Dashboard</h1>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-200 text-green-800 rounded">
          {successMessage}
        </div>
      )}

      {/* Create/Edit Event Button */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogTrigger asChild>
          <Button className="mb-4 bg-black text-white font-semibold px-6 py-2 rounded-lg shadow-lg transform transition-transform duration-300 hover:scale-105 hover:bg-black hover:shadow-xl active:scale-95">
            {selectedEvent ? "Edit Event" : "Create New Event"}
          </Button>
        </DialogTrigger>
        <DialogContent className="p-6">
          <DialogHeader>
            <DialogTitle>{selectedEvent ? "Edit Event" : "Create Event"}</DialogTitle>
          </DialogHeader>
          <form className="space-y-3 mt-4" onSubmit={handleSubmit(onSubmit)}>
            <Input {...register("title", { required: true })} placeholder="Title" />
            <Input {...register("description")} placeholder="Description" />
            <Input {...register("date", { required: true })} type="datetime-local" />
            <Select value={eventType} onValueChange={(value) => setValue("eventtype", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="physical">Physical</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(value) => setValue("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Input {...register("meetingLink")} placeholder="Meeting Link" />
            <Input {...register("venueAddress")} placeholder="Venue Address" />

            <div className="flex justify-end gap-2 mt-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white transition-all duration-300"
              >
                Save
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Events Table */}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Title</th>
            <th className="border px-4 py-2">Date</th>
            <th className="border px-4 py-2">Type</th>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">RSVP Count</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id} className="text-center">
              <td className="border px-4 py-2">{event.title}</td>
              <td className="border px-4 py-2">{new Date(event.date).toLocaleString()}</td>
              <td className="border px-4 py-2">{event.event_type}</td>
              <td className="border px-4 py-2">{event.status}</td>
              <td className="border px-4 py-2">{event.rsvp_count}</td>
              <td className="border px-4 py-2 flex justify-center gap-2">
                <Button size="sm" onClick={() => onEdit(event)}>
                  Edit
                </Button>
                <Button size="sm" onClick={() => fetchRSVPs(event.id)}>
                  View RSVPs
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={async () => {
                    try {
                      if (!confirm('Are you sure you want to cancel this event?')) return;
                      await fetch('/api/admin/events', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: event.id, title: event.title, description: event.description, date: event.date, event_type: event.event_type, meeting_link: event.meeting_link, venue_address: event.venue_address, status: 'cancelled' }),
                      });
                      await fetchEvents();
                      setSuccessMessage('Event cancelled and attendees notified.');
                      setTimeout(() => setSuccessMessage(''), 3000);
                    } catch (e) {
                      console.error(e);
                      alert('Failed to cancel event');
                    }
                  }}
                >
                  Cancel
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* RSVP List */}
      {rsvps.length > 0 && (
        <div className="mt-4 max-h-64 overflow-y-auto border p-2 rounded">
          <h3 className="font-semibold mb-2">RSVP List</h3>
          {rsvps.map((r) => (
            <div key={r.id} className="flex justify-between border-b py-1">
              <span>{r.name}</span>
              <span>{r.email}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
