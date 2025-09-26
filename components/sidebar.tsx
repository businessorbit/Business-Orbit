"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Users, Lock } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

// Types for requests
type RequestStatus = "pending" | "accepted" | "rejected";

export function LeftSidebar() {
  const router = useRouter();
  const [chaptersExpanded, setChaptersExpanded] = useState(false);
  const [groupsExpanded, setGroupsExpanded] = useState(false);

  return (
    <div className="w-64 space-y-4">
      {/* Mini Profile Card */}
      <Card className="p-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
            <span className="text-lg font-semibold">JD</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">John Doe</h3>
            <p className="text-xs text-muted-foreground">Product Manager</p>
            <Badge variant="secondary" className="text-xs mt-1">
              Score: 85
            </Badge>
          </div>
        </div>
      </Card>

      {/* Quick Links */}
      <Card className="p-4">
        <div className="space-y-3">
          <div>
            <Button
              variant="ghost"
              className="w-full justify-between p-2 h-auto"
              onClick={() => setChaptersExpanded(!chaptersExpanded)}
            >
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                <span className="text-sm">Chapters</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  chaptersExpanded ? "rotate-180" : ""
                }`}
              />
            </Button>
            {chaptersExpanded && (
              <div className="ml-6 mt-2 space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start p-1 h-auto text-xs"
                  onClick={() => router.push(`/chapters/1`)}
                >
                  Bengaluru Chapter
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start p-1 h-auto text-xs"
                  onClick={() => router.push("/chapters/[id]/2")}
                >
                  Mumbai Chapter
                </Button>
              </div>
            )}
          </div>

          <div>
            <Button
              variant="ghost"
              className="w-full justify-between p-2 h-auto"
              onClick={() => setGroupsExpanded(!groupsExpanded)}
            >
              <div className="flex items-center">
                <Lock className="w-4 h-4 mr-2" />
                <span className="text-sm">Secret Groups</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  groupsExpanded ? "rotate-180" : ""
                }`}
              />
            </Button>
            {groupsExpanded && (
              <div className="ml-6 mt-2 space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start p-1 h-auto text-xs"
                >
                  Tech Leaders
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start p-1 h-auto text-xs"
                >
                  Startup Founders
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export function RightSidebar() {
  // State for Incoming Requests
  const [requests, setRequests] = useState([
    {
      id: 1,
      name: "Alex Smith",
      role: "Designer",
      status: "pending" as RequestStatus,
    },
    {
      id: 2,
      name: "Alex Smith",
      role: "Designer",
      status: "pending" as RequestStatus,
    },
  ]);

  const handleAction = (id: number, newStatus: RequestStatus) => {
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req))
    );
  };

  // State for Suggested Connections modal
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");

  const handleConnectClick = (userName: string) => {
    setSelectedUser(userName);
    setIsDialogOpen(true);
  };

  const generateAiMessage = () => {
    // Placeholder — replace with call to your AI backend
    setMessage(
      `Hello ${selectedUser}, ${aiPrompt}. It would be great to connect!`
    );
  };

  return (
    <div className="w-64 space-y-4">
      {/* Incoming Requests */}
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3">Incoming Requests</h3>
        <div className="space-y-3">
          {requests.map((req) => (
            <div key={req.id} className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <span className="text-xs">A{req.id}</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium">{req.name}</p>
                <p className="text-xs text-muted-foreground">{req.role}</p>
              </div>

              {req.status === "pending" ? (
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => handleAction(req.id, "accepted")}
                  >
                    ✓
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-xs bg-transparent"
                    onClick={() => handleAction(req.id, "rejected")}
                  >
                    ✗
                  </Button>
                </div>
              ) : (
                <p
                  className={`text-xs font-semibold ${
                    req.status === "accepted"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {req.status === "accepted" ? "Accepted" : "Rejected"}
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Suggested Professionals */}
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3">Suggested Connections</h3>
        <div className="space-y-3">
          {[
            { name: "Sarah Johnson", score: 92 },
            { name: "John Carter", score: 88 },
          ].map((person, i) => (
            <div key={i} className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <span className="text-xs">S{i + 1}</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium">{person.name}</p>
                <p className="text-xs text-muted-foreground">
                  Score: {person.score}
                </p>
              </div>
              <Button
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => handleConnectClick(person.name)}
              >
                Connect
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Upcoming Events */}
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3">Upcoming Events</h3>
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="text-xs">
              <p className="font-medium">Tech Meetup #{i}</p>
              <p className="text-muted-foreground">Dec {20 + i}, 6:00 PM</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Connect Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Message to {selectedUser}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea
              placeholder="Write your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Describe your message..."
                className="border rounded px-2 py-1 text-sm flex-1"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
              <Button
                onClick={generateAiMessage}
                size="sm"
                className="text-xs whitespace-nowrap"
              >
                AI Message
              </Button>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setIsDialogOpen(false)}>Send</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
