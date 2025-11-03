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

      <div className="w-full max-w-4xl relative z-10">
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

        {/* Assessment Types Section */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-center mb-6">Choose Your Assessment Path</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* HEXACO Assessment */}
            <Card className="group transition-all duration-300 hover:shadow-xl backdrop-blur-sm bg-card/80 border-2 hover:border-primary/50">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Brain className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">HEXACO Personality</CardTitle>
                <CardDescription className="text-base">
                  Assess your personality across six key dimensions: Honesty-Humility, Emotionality, Extraversion, Agreeableness, Conscientiousness, and Openness to Experience.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Link href="/personality-quiz">
                    <Button
                      variant="outline"
                      className="w-full h-12 text-base border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 group bg-transparent"
                    >
                      Take HEXACO Quiz
                      <Brain className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/hexaco-entry">
                    <Button className="w-full h-12 text-base bg-primary hover:bg-primary/90 transition-all duration-300 group text-white shadow-lg">
                      I Know My Scores
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Holland RIASEC Assessment */}
            <Card className="group transition-all duration-300 hover:shadow-xl backdrop-blur-sm bg-card/80 border-2 hover:border-accent/50">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 transition-colors">
                  <Sparkles className="w-8 h-8 text-accent" />
                </div>
                <CardTitle className="text-xl">Holland RIASEC</CardTitle>
                <CardDescription className="text-base">
                  Discover your career interests with the Holland Code: Realistic, Investigative, Artistic, Social, Enterprising, and Conventional.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Link href="/holland-riasec">
                    <Button
                      variant="outline"
                      className="w-full h-12 text-base border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-all duration-300 group bg-transparent"
                    >
                      Take RIASEC Quiz
                      <HelpCircle className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/holland-entry">
                    <Button className="w-full h-12 text-base bg-accent hover:bg-accent/90 transition-all duration-300 group text-white shadow-lg">
                      I Know My Scores
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Career Agent Section */}
        <div className="mt-12">
          <Card className="group transition-all duration-300 hover:shadow-xl backdrop-blur-sm bg-card/80 border-2 hover:border-purple-500/50">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-500/20 transition-colors">
                <Sparkles className="w-8 h-8 text-purple-500" />
              </div>
              <CardTitle className="text-xl">Career Guidance Agent</CardTitle>
              <CardDescription className="text-base">
                Ready to explore career paths? Our AI agent will use your personality assessments to provide personalized recommendations.
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
                  For best results, complete both personality assessments before using the Career Agent
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            All assessments lead to personalized career recommendations tailored specifically for you. The more assessments you complete, the more accurate your recommendations will be.
          </p>
        </div>
      </div>
    </div>
  )
}
