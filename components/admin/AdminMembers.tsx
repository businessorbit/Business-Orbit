"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Member {
  id: number;
  name: string;
  email: string;
  status: "Pending" | "Approved";
}

export default function AdminMembers() {
  const [filter, setFilter] = useState<"All" | "Pending" | "Approved">("All");
  const [members, setMembers] = useState<Member[]>([
    { id: 1, name: "Rahul Sharma", email: "rahul@example.com", status: "Pending" },
    { id: 2, name: "Anjali Verma", email: "anjali@example.com", status: "Approved" },
    { id: 3, name: "Amit Kumar", email: "amit@example.com", status: "Pending" },
  ]);

  const handleApprove = (id: number) => {
    setMembers(
      members.map((m) =>
        m.id === id ? { ...m, status: "Approved" } : m
      )
    );
  };

  const filteredMembers =
    filter === "All" ? members : members.filter((m) => m.status === filter);

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Members Management</h1>
        <div className="flex gap-2">
          {(["All", "Pending", "Approved"] as const).map((f) => (
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

      {/* Members List */}
      <div className="space-y-4">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            className="flex justify-between items-center border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition"
          >
            {/* Left Side */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{member.name}</h2>
              <p className="text-sm text-gray-500">{member.email}</p>
            </div>

            {/* Status + Action */}
            <div className="flex items-center gap-4">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  member.status === "Approved"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {member.status}
              </span>

              {member.status === "Pending" && (
                <Button
                  onClick={() => handleApprove(member.id)}
                  className="bg-black text-white px-4 py-1 rounded hover:bg-gray-700 transition"
                >
                  Approve
                </Button>
              )}
            </div>
          </div>
        ))}

        {filteredMembers.length === 0 && (
          <p className="text-center text-gray-500">No {filter} members found.</p>
        )}
      </div>
    </div>
  );
}
