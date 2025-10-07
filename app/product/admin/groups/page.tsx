"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Pencil, Trash2, ShieldAlert, Search, Loader2 } from "lucide-react"

interface AdminGroup {
  id: string
  name: string
  description?: string
  memberCount: number
  created_at?: string
}

interface AdminMember {
  id: number
  name: string
  email: string
}

export default function AdminGroupsPage() {
  const router = useRouter()
  const [groups, setGroups] = useState<AdminGroup[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")

  // Create/Edit
  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState<AdminGroup | null>(null)
  const [formName, setFormName] = useState("")
  const [formDesc, setFormDesc] = useState("")
  const [saving, setSaving] = useState(false)

  // Delete/Disband
  const [deleteOpen, setDeleteOpen] = useState<{ id: string; name: string } | null>(null)
  const [disbandOpen, setDisbandOpen] = useState<{ id: string; name: string } | null>(null)
  const [actionWorking, setActionWorking] = useState(false)

  // Members
  const [membersOpen, setMembersOpen] = useState<{ id: string; name: string } | null>(null)
  const [members, setMembers] = useState<AdminMember[]>([])
  const [membersLoading, setMembersLoading] = useState(false)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return groups
    return groups.filter(g => g.name.toLowerCase().includes(q) || (g.description || "").toLowerCase().includes(q))
  }, [groups, search])

  const loadGroups = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/secret-groups", { credentials: "include" })
      if (!res.ok) { setGroups([]); return }
      const data = await res.json()
      const list: AdminGroup[] = (data?.groups || []).map((g: any) => ({
        id: String(g.id),
        name: g.name,
        description: g.description,
        memberCount: Number(g.member_count || g.memberCount || 0),
        created_at: g.created_at,
      }))
      setGroups(list)
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditing(null)
    setFormName("")
    setFormDesc("")
    setEditOpen(true)
  }

  const openEdit = (g: AdminGroup) => {
    setEditing(g)
    setFormName(g.name)
    setFormDesc(g.description || "")
    setEditOpen(true)
  }

  const submitEdit = async () => {
    if (!formName.trim()) return
    setSaving(true)
    try {
      const body = JSON.stringify({ name: formName.trim(), description: formDesc.trim() || null })
      let res: Response
      if (editing) {
        res = await fetch(`/api/admin/secret-groups/${encodeURIComponent(editing.id)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body,
        })
      } else {
        res = await fetch("/api/admin/secret-groups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body,
        })
      }
      if (res.ok) {
        setEditOpen(false)
        await loadGroups()
      }
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = (g: AdminGroup) => setDeleteOpen({ id: g.id, name: g.name })
  const confirmDisband = (g: AdminGroup) => setDisbandOpen({ id: g.id, name: g.name })

  const doDelete = async () => {
    if (!deleteOpen) return
    setActionWorking(true)
    try {
      const res = await fetch(`/api/admin/secret-groups/${encodeURIComponent(deleteOpen.id)}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (res.ok) {
        setDeleteOpen(null)
        await loadGroups()
      }
    } finally {
      setActionWorking(false)
    }
  }

  const doDisband = async () => {
    if (!disbandOpen) return
    setActionWorking(true)
    try {
      const res = await fetch(`/api/admin/secret-groups/${encodeURIComponent(disbandOpen.id)}/disband`, {
        method: "POST",
        credentials: "include",
      })
      if (res.ok) {
        setDisbandOpen(null)
        await loadGroups()
      }
    } finally {
      setActionWorking(false)
    }
  }

  const openMembers = async (g: AdminGroup) => {
    setMembersOpen({ id: g.id, name: g.name })
    setMembersLoading(true)
    try {
      const res = await fetch(`/api/admin/secret-groups/${encodeURIComponent(g.id)}/members`, { credentials: "include" })
      if (!res.ok) { setMembers([]); return }
      const data = await res.json()
      setMembers((data?.members || []).map((m: any) => ({ id: Number(m.id), name: m.name, email: m.email })))
    } finally {
      setMembersLoading(false)
    }
  }

  useEffect(() => {
    loadGroups()
  }, [])

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      <div className="flex-1 ml-20">
        <div className="px-4 sm:px-6 lg:px-8 lg:-ml-10 py-4 sm:py-8 pb-20 lg:pb-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">Secret Groups</h1>
              <div className="flex items-center gap-2">
                <div className="relative hidden sm:block">
                  <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search groups..." className="pl-8 w-64" />
                </div>
                <Button onClick={openCreate}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Group
                </Button>
              </div>
            </div>

            <Card className="p-4 lg:p-6">
              {loading ? (
                <div className="py-16 text-center text-sm text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" /> Loading groups...
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-16 text-center text-sm text-muted-foreground">No groups found.</div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((g) => (
                    <div key={g.id} className="flex items-start justify-between border rounded-lg p-4 hover:bg-accent/30 transition">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{g.name}</h3>
                          <Badge variant="secondary" className="text-xs">{g.memberCount} members</Badge>
                        </div>
                        {g.description && <p className="text-sm text-muted-foreground max-w-[60ch]">{g.description}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => openMembers(g)}>
                          <Users className="w-4 h-4 mr-1" /> Members
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openEdit(g)}>
                          <Pencil className="w-4 h-4 mr-1" /> Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => confirmDelete(g)}>
                          <Trash2 className="w-4 h-4 mr-1" /> Delete
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => confirmDisband(g)}>
                          <ShieldAlert className="w-4 h-4 mr-1" /> Disband
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        
      </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Group" : "Create Group"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update the group details and save your changes." : "Provide a name and (optional) description to create a new secret group."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Group Name</Label>
              <Input id="name" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Enter group name" />
            </div>
            <div>
              <Label htmlFor="desc">Description</Label>
              <Input id="desc" value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Optional description" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={submitEdit} disabled={saving}>{saving ? "Saving..." : editing ? "Save Changes" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteOpen} onOpenChange={(o) => !o && setDeleteOpen(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Group</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteOpen?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionWorking}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete} disabled={actionWorking}>{actionWorking ? "Deleting..." : "Delete"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Disband Confirm */}
      <AlertDialog open={!!disbandOpen} onOpenChange={(o) => !o && setDisbandOpen(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disband Group</AlertDialogTitle>
            <AlertDialogDescription>
              Disbanding "{disbandOpen?.name}" will remove the group and notify all members. Proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionWorking}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={doDisband} disabled={actionWorking}>{actionWorking ? "Disbanding..." : "Disband"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Members Dialog */}
      <Dialog open={!!membersOpen} onOpenChange={(o) => !o && setMembersOpen(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Members {membersOpen ? `- ${membersOpen.name}` : ""}</DialogTitle>
            <DialogDescription>
              View the list of members in this group for moderation purposes.
            </DialogDescription>
          </DialogHeader>
          {membersLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" /> Loading members...
            </div>
          ) : members.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">No members found.</div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between border rounded p-2">
                  <div>
                    <div className="text-sm font-medium">{m.name}</div>
                    <div className="text-xs text-muted-foreground">{m.email}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}