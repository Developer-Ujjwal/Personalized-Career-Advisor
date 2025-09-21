"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, HelpCircle, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"

export function PersonalityEntryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10 flex items-center justify-center p-4">
      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 right-20 w-28 h-28 bg-primary/10 rounded-full animate-float" />
        <div
          className="absolute bottom-40 left-16 w-36 h-36 bg-accent/10 rounded-full animate-float"
          style={{ animationDelay: "1.5s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-20 h-20 bg-secondary/10 rounded-full animate-float"
          style={{ animationDelay: "0.5s" }}
        />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-4 bg-primary rounded-2xl animate-pulse-glow">
              <Brain className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Know Yourself
            </h1>
          </div>
          <p className="text-xl text-muted-foreground text-balance max-w-lg mx-auto">
            Understanding your personality is the first step to finding your perfect career path
          </p>
        </div>

        {/* Choice Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* I Know My Personality */}
          <Card className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl backdrop-blur-sm bg-card/80 border-2 hover:border-primary/50">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl">I Know My Type</CardTitle>
              <CardDescription className="text-base">
                Already familiar with your personality type? Let's jump straight to career exploration.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Link href="/career-agent">
                <Button className="w-full h-12 text-base bg-purple-600 hover:bg-purple-700 transition-all duration-300 group text-white shadow-lg">
                  Continue to Career Agent
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Perfect for those who know their HEXACO, Enneagram, or other personality types
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Take Personality Quiz */}
          <Card className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl backdrop-blur-sm bg-card/80 border-2 hover:border-accent/50">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 transition-colors">
                <HelpCircle className="w-8 h-8 text-accent" />
              </div>
              <CardTitle className="text-xl">Discover My Type</CardTitle>
              <CardDescription className="text-base">
                Not sure about your personality? Take our quick assessment to discover your unique traits.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Link href="/personality-quiz">
                <Button
                  variant="outline"
                  className="w-full h-12 text-base border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-all duration-300 group bg-transparent"
                >
                  Take Personality Quiz
                  <Brain className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
                </Button>
              </Link>
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">5-minute interactive quiz • Science-based results</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Both paths lead to personalized career recommendations tailored specifically for you. Choose the option that
            feels most comfortable.
          </p>
        </div>
      </div>
    </div>
  )
}
