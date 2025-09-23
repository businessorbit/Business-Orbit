"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Search, MessageSquare, Calendar, Users, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function AdminNavigation() {
  const pathname = usePathname()

  const adminTabs = [
    { name: "Chat Management", href: "/admin/chat", icon: MessageSquare },
    { name: "Create Event", href: "/admin/events", icon: Calendar },
    { name: "Review Members", href: "/admin/members", icon: Users },
    { name: "Platform Settings", href: "/admin/settings", icon: Settings },
  ]

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border shadow-elevated">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left - Logo */}
            <Link href="/admin" className="flex items-center group">
              <div className="w-9 h-9 rounded-full border-2 border-foreground flex items-center justify-center transition-all group-hover:scale-105 group-hover:shadow-soft">
                <div className="w-4 h-4 rounded-full border-2 border-foreground transition-all group-hover:bg-foreground"></div>
              </div>
              <span className="ml-3 text-xl font-bold tracking-tight">Business Orbit Admin</span>
            </Link>

            {/* Center - Navigation Tabs */}
            <div className="hidden md:flex items-center space-x-1 bg-muted/50 rounded-full p-1">
              {adminTabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <Link
                    key={tab.name}
                    href={tab.href}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 flex items-center space-x-2 ${
                      pathname === tab.href
                        ? "bg-background text-foreground shadow-soft"
                        : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </Link>
                )
              })}
            </div>

            {/* Right - Search and Actions */}
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" className="hidden sm:flex items-center space-x-2 hover:bg-accent/50">
                <Search className="w-4 h-4" />
                <span className="text-sm text-muted-foreground">Search</span>
              </Button>

              <Button variant="ghost" size="sm" className="relative group hover:bg-accent/50">
                <Bell className="w-5 h-5 transition-all group-hover:scale-105" />
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-foreground text-background text-xs font-bold animate-pulse">
                  3
                </Badge>
              </Button>

              <Link href="/">
                <Button variant="ghost" size="sm" className="relative group hover:bg-accent/50">
                  <Settings className="w-5 h-5 transition-all group-hover:scale-105" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border md:hidden">
        <div className="grid grid-cols-4 h-16">
          {adminTabs.map((tab) => {
            const Icon = tab.icon
            const isActive = pathname === tab.href
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`flex flex-col items-center justify-center space-y-1 transition-all duration-200 ${
                  isActive
                    ? "text-foreground bg-accent/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "scale-110" : ""} transition-transform`} />
                <span className="text-xs font-medium text-center px-1">{tab.name}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}

