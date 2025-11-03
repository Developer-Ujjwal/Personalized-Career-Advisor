"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Brain, MessageSquare, Map, User, Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import { useIsMobile } from "@/hooks/use-mobile"

export function Navigation() {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/personality-entry", label: "Personality", icon: Brain },
    { href: "/career-agent", label: "Career Agent", icon: MessageSquare },
    { href: "/career-roadmap", label: "Roadmap", icon: Map },
  ]

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  if (pathname === "/") return null

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 hidden md:block">
        <div className="px-2 py-2 bg-card/95 backdrop-blur shadow-lg rounded-full">
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
            <Link href="/profile">
              <Button
                variant={pathname === "/profile" ? "default" : "ghost"}
                size="sm"
                className={`rounded-full px-3 ${
                  pathname === "/profile"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-t shadow-lg">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex flex-col items-center justify-center rounded-lg p-2 ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs mt-1">{item.label}</span>
                </Button>
              </Link>
            )
          })}
          <Link href="/profile">
            <Button
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center justify-center rounded-lg p-2 ${
                pathname === "/profile"
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-xs mt-1">Profile</span>
            </Button>
          </Link>
        </div>
      </div>
    </>
  )
}
