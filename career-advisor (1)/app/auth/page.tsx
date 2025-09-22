"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Sparkles, Target, Users } from "lucide-react"

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const authEndpoint = isSignUp ? "/register" : "/token"
    const body = isSignUp
      ? JSON.stringify({ email, password, username: email })
      : `username=${email}&password=${password}`
    const headers = isSignUp
      ? { "Content-Type": "application/json" }
      : { "Content-Type": "application/x-www-form-urlencoded" }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
        method: "POST",
        headers,
        body,
      })
      console.log("Auth Request:", { authEndpoint, headers, body })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token)
        window.location.href = "/personality-entry"
      } else if (isSignUp) {
        // If it's a signup and no access_token, it means registration was successful, now log in
        const loginResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/token`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `username=${email}&password=${password}`,
        })

        if (!loginResponse.ok) {
          const errorData = await loginResponse.json()
          throw new Error(errorData.detail || `HTTP error! status: ${loginResponse.status}`)
        }
        const loginData = await loginResponse.json()
        localStorage.setItem("access_token", loginData.access_token)
        window.location.href = "/personality-entry"
      }
    } catch (error) {
      console.error("Authentication error:", error)
      alert(`Authentication failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const handleOAuthSignIn = (provider: string) => {
    // TODO: Implement OAuth logic
    console.log(`${provider} OAuth sign in`)
    window.location.href = "/personality-entry"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10 flex items-center justify-center p-4">
      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary/10 rounded-full animate-float" />
        <div
          className="absolute top-40 right-32 w-24 h-24 bg-accent/10 rounded-full animate-float"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-32 left-1/3 w-20 h-20 bg-secondary/10 rounded-full animate-float"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-3 bg-primary rounded-2xl animate-pulse-glow">
              <Target className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              CareerPath
            </h1>
          </div>
          <p className="text-muted-foreground text-balance">Discover your perfect career with AI-powered guidance</p>
        </div>

        {/* Auth Card */}
        <Card className="backdrop-blur-sm bg-card/80 border-2 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{isSignUp ? "Create Account" : "Welcome Back"}</CardTitle>
            <CardDescription>
              {isSignUp ? "Start your career discovery journey" : "Continue your career exploration"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12"
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                {isSignUp ? "Start My Journey" : "Continue Journey"}
              </Button>
            </form>

            {/* Toggle Sign Up/Sign In */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">Personality Quiz</p>
          </div>
          <div className="space-y-2">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6 text-accent" />
            </div>
            <p className="text-xs text-muted-foreground">AI Career Agent</p>
          </div>
          <div className="space-y-2">
            <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto">
              <Target className="w-6 h-6 text-secondary" />
            </div>
            <p className="text-xs text-muted-foreground">Career Roadmap</p>
          </div>
        </div>
      </div>
    </div>
  )
}
