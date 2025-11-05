"use client"

import React from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Sun, Moon } from "lucide-react"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  // resolvedTheme is the actual theme in use (after system resolution)
  const current = theme === "system" ? resolvedTheme : theme

  const toggle = () => {
    if (current === "dark") setTheme("light")
    else setTheme("dark")
  }

  return (
    <Button size="sm" variant="ghost" onClick={toggle} className="rounded-full px-3">
      {current === "dark" ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
      <span className="hidden sm:inline">{current === "dark" ? "Light" : "Dark"}</span>
    </Button>
  )
}
