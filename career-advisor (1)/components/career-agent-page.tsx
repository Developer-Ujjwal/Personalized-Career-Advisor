"use client"

import type React from "react"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, Send, User, TrendingUp, ExternalLink } from "lucide-react"

interface Message {
  id: string
  type: "user" | "agent"
  content: string
  timestamp: Date
}

interface CareerOption {
  id: string
  title: string
  description: string
  demandLevel: "High" | "Medium" | "Low"
  demandColor: string
  matchPercentage: number
}

const sampleCareerOptions: CareerOption[] = [
  {
    id: "1",
    title: "UX/UI Designer",
    description:
      "Create intuitive and visually appealing user interfaces for digital products, focusing on user experience and design systems.",
    demandLevel: "High",
    demandColor: "text-green-600",
    matchPercentage: 92,
  },
  {
    id: "2",
    title: "Product Manager",
    description:
      "Lead product development from conception to launch, working with cross-functional teams to deliver user-centered solutions.",
    demandLevel: "High",
    demandColor: "text-green-600",
    matchPercentage: 88,
  },
  {
    id: "3",
    title: "Data Scientist",
    description:
      "Analyze complex datasets to extract insights and build predictive models that drive business decisions and innovation.",
    demandLevel: "High",
    demandColor: "text-green-600",
    matchPercentage: 85,
  },
  {
    id: "4",
    title: "Marketing Strategist",
    description:
      "Develop comprehensive marketing campaigns and strategies to promote products and build brand awareness across multiple channels.",
    demandLevel: "Medium",
    demandColor: "text-yellow-600",
    matchPercentage: 78,
  },
  {
    id: "5",
    title: "Software Engineer",
    description:
      "Design and develop software applications, working with modern technologies to solve complex technical challenges.",
    demandLevel: "High",
    demandColor: "text-green-600",
    matchPercentage: 82,
  },
]

const agentQuestions = [
  "Hi! I'm your AI Career Agent. Let's find your perfect career path! First, could you tell me about your personality type or what you learned from the quiz?",
  "Great! Now, what activities or subjects do you find most engaging? What makes you lose track of time?",
  "Interesting! What kind of work environment do you thrive in? Do you prefer collaborative teams, independent work, or a mix of both?",
  "Perfect! What are your long-term career goals? Are you looking for leadership opportunities, creative expression, or technical expertise?",
  "Excellent! One final question - what industries or fields have always fascinated you, even if you haven't worked in them?",
]

export function CareerAgentPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "agent",
      content: agentQuestions[0],
      timestamp: new Date(),
    },
  ])
  const [currentInput, setCurrentInput] = useState("")
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [showCareerOptions, setShowCareerOptions] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleSendMessage = () => {
    if (!currentInput.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: currentInput,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setCurrentInput("")
    setIsTyping(true)

    // Simulate agent typing delay
    setTimeout(() => {
      setIsTyping(false)
      const nextQuestionIndex = currentQuestionIndex + 1

      if (nextQuestionIndex < agentQuestions.length) {
        const agentMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "agent",
          content: agentQuestions[nextQuestionIndex],
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, agentMessage])
        setCurrentQuestionIndex(nextQuestionIndex)
      } else {
        // Show final message and career options
        const finalMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "agent",
          content:
            "Thank you for sharing! Based on our conversation, I've analyzed your personality, interests, and preferences. Here are the top career paths that match your profile:",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, finalMessage])
        setTimeout(() => setShowCareerOptions(true), 1000)
      }
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleViewRoadmap = (careerId: string) => {
    window.location.href = `/career-roadmap?career=${careerId}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10 flex flex-col">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary rounded-2xl animate-pulse-glow">
              <Bot className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Career Agent
              </h1>
              <p className="text-sm text-muted-foreground">Your AI-powered career discovery assistant</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
        <div className="h-full flex flex-col">
          <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.type === "agent" && (
                    <Avatar className="w-10 h-10 bg-primary">
                      <AvatarFallback>
                        <Bot className="w-5 h-5 text-primary-foreground" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.type === "user"
                        ? "bg-primary text-primary-foreground ml-auto"
                        : "bg-card border shadow-sm"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {message.type === "user" && (
                    <Avatar className="w-10 h-10 bg-accent">
                      <AvatarFallback>
                        <User className="w-5 h-5 text-accent-foreground" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="w-10 h-10 bg-primary">
                    <AvatarFallback>
                      <Bot className="w-5 h-5 text-primary-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-card border shadow-sm rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Career Options */}
              {showCareerOptions && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Your Career Matches</h2>
                    <p className="text-muted-foreground">Based on your personality and preferences</p>
                  </div>
                  <div className="grid gap-4">
                    {sampleCareerOptions.map((career) => (
                      <Card
                        key={career.id}
                        className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm bg-card/80 border-2"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg mb-1">{career.title}</CardTitle>
                              <CardDescription className="text-sm leading-relaxed">
                                {career.description}
                              </CardDescription>
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-2xl font-bold text-primary mb-1">{career.matchPercentage}%</div>
                              <div className="text-xs text-muted-foreground">Match</div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <TrendingUp className="w-4 h-4" />
                                <span className="text-sm">Demand:</span>
                                <Badge variant="outline" className={career.demandColor}>
                                  {career.demandLevel}
                                </Badge>
                              </div>
                            </div>
                            <Link href={`/career-roadmap?career=${career.id}`}>
                              <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300">
                                View Roadmap
                                <ExternalLink className="w-4 h-4 ml-2" />
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          {!showCareerOptions && (
            <div className="mt-6 flex gap-3">
              <Input
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your response..."
                className="flex-1 h-12 bg-card/50 backdrop-blur-sm"
                disabled={isTyping}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!currentInput.trim() || isTyping}
                className="h-12 px-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
