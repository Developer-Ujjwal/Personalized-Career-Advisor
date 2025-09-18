"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Brain, MessageSquare, Map, User } from "lucide-react"

export function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/personality-entry", label: "Personality", icon: Brain },
    { href: "/career-agent", label: "Career Agent", icon: MessageSquare },
    { href: "/career-roadmap", label: "Roadmap", icon: Map },
  ]

  if (pathname === "/") return null

  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-card/80 backdrop-blur-sm border rounded-full px-2 py-2 shadow-lg">
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={`rounded-full px-3 ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
          <div className="w-px h-6 bg-border mx-2" />
          <Button variant="ghost" size="sm" className="rounded-full px-3 text-muted-foreground hover:text-foreground">
            <User className="w-4 h-4 mr-2" />
            Profile
          </Button>
        </div>
      </div>
    </nav>
  )
}
