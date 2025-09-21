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

interface CareerRecommendation {
  career_name: string;
  fit_explanation: string;
  required_skills_education: string;
  potential_growth: string;
}

// const sampleCareerOptions: CareerOption[] = [
//   {
//     id: "1",
//     title: "UX/UI Designer",
//     description:\
//       "Create intuitive and visually appealing user interfaces for digital products, focusing on user experience and design systems.",
//     demandLevel: "High",
//     demandColor: "text-green-600",
//     matchPercentage: 92,
//   },
//   {
//     id: "2",
//     title: "Product Manager",
//     description:\
//       "Lead product development from conception to launch, working with cross-functional teams to deliver user-centered solutions.",
//     demandLevel: "High",
//     demandColor: "text-green-600",
//     matchPercentage: 88,
//   },
//   {
//     id: "3",
//     title: "Data Scientist",
//     description:\
//       "Analyze complex datasets to extract insights and build predictive models that drive business decisions and innovation.",
//     demandLevel: "High",
//     demandColor: "text-green-600",
//     matchPercentage: 85,
//   },
//   {
//     id: "4",
//     title: "Marketing Strategist",
//     description:\
//       "Develop comprehensive marketing campaigns and strategies to promote products and build brand awareness across multiple channels.",
//     demandLevel: "Medium",
//     demandColor: "text-yellow-600",
//     matchPercentage: 78,
//   },
//   {
//     id: "5",
//     title: "Software Engineer",
//     description:\
//       "Design and develop software applications, working with modern technologies to solve complex technical challenges.",
//     demandLevel: "High",
//     demandColor: "text-green-600",
//     matchPercentage: 82,
//   },
// ]

// const agentQuestions = [
//   "Hi! I'm your AI Career Agent. Let's find your perfect career path! First, could you tell me about your HEXACO personality type or what you learned from the quiz?",
//   "Great! Now, what activities or subjects do you find most engaging? What makes you lose track of time?",
//   "Interesting! What kind of work environment do you thrive in? Do you prefer collaborative teams, independent work, or a mix of both?",
//   "Perfect! What are your long-term career goals? Are you looking for leadership opportunities, creative expression, or technical expertise?",
//   "Excellent! One final question - what industries or fields have always fascinated you, even if you haven't worked in them?",
// ]

export function CareerAgentPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentInput, setCurrentInput] = useState("")
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [showCareerOptions, setShowCareerOptions] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [careerRecommendations, setCareerRecommendations] = useState<CareerRecommendation[]>([]);
  const [additionalAdvice, setAdditionalAdvice] = useState<string>("");
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages, isTyping])

  useEffect(() => {
    const fetchInitialQuestion = async () => {
      setIsTyping(true)
      try {
        const response = await fetch("http://localhost:8000/question", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        })
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        if (data.recommendations) {
          // Handle recommendations
          const finalMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: "agent",
            content:
              "Thank you for sharing! Based on our conversation, I've analyzed your personality, interests, and preferences. Here are the top career paths that match your profile:",
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, finalMessage])
          setCareerRecommendations(data.recommendations);
          setAdditionalAdvice(data.additional_advice || "");
          setTimeout(() => setShowCareerOptions(true), 1000)
        } else if (data.question) {
          // Handle next question
          const agentMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: "agent",
            content: data.question,
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, agentMessage])
        } else {
          throw new Error("Unexpected response from backend")
        }
      } catch (error) {
        console.error("Error sending message or getting response:", error)
        const errorMessage: Message = {
          id: Date.now().toString(),
          type: "agent",
          content: "I'm sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])
      } finally {
        setIsTyping(false)
      }
    }
    fetchInitialQuestion()
  }, [])

  const handleSendMessage = async () => {
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

    try {
      const response = await fetch("http://localhost:8000/answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ answer: userMessage.content }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.recommendations) {
        // Handle recommendations
        const finalMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "agent",
          content:
            "Thank you for sharing! Based on our conversation, I've analyzed your personality, interests, and preferences. Here are the top career paths that match your profile:",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, finalMessage])
        setCareerRecommendations(data.recommendations);
        setAdditionalAdvice(data.additional_advice || "");
        setTimeout(() => setShowCareerOptions(true), 1000)
      } else if (data.question) {
        // Handle next question
        const agentMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "agent",
          content: data.question,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, agentMessage])
      } else {
        throw new Error("Unexpected response from backend")
      }
    } catch (error) {
      console.error("Error sending message or getting response:", error)
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: "agent",
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleViewRoadmap = async (careerName: string) => {
    try {
      const response = await fetch("http://localhost:8000/roadmap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ career_goal: careerName }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const roadmapData = await response.json();
      // Store roadmapData in local storage or a global state management for the roadmap page to access
      localStorage.setItem("current_roadmap", JSON.stringify(roadmapData));
      window.location.href = `/career-roadmap?career=${encodeURIComponent(careerName)}`;
    } catch (error) {
      console.error("Error generating roadmap:", error);
      // Optionally, display an error message to the user
    }
  };

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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Career Agent
              </h1>
              <p className="text-base text-muted-foreground">Your AI-powered career discovery assistant</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 container mx-auto px-4 py-6 max-w-5xl">
        <div className="h-full flex flex-col">
          <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.type === "agent" && (
                    <Avatar className="w-12 h-12 bg-primary">
                      <AvatarFallback>
                        <Bot className="w-6 h-6 text-primary-foreground" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-lg ${
                      message.type === "user"
                        ? "bg-primary text-primary-foreground ml-auto"
                        : "bg-card border"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {message.type === "user" && (
                    <Avatar className="w-12 h-12 bg-accent">
                      <AvatarFallback>
                        <User className="w-6 h-6 text-accent-foreground" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="w-12 h-12 bg-primary">
                    <AvatarFallback>
                      <Bot className="w-6 h-6 text-primary-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-card border shadow-lg rounded-2xl px-4 py-3">
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
                    <h2 className="text-3xl font-bold mb-2">Your Career Matches</h2>
                    <p className="text-muted-foreground">Based on your personality and preferences</p>
                    {additionalAdvice && <p className="text-sm text-muted-foreground mt-2">{additionalAdvice}</p>}
                  </div>
                  <div className="grid gap-6">
                    {careerRecommendations.map((career, index) => (
                      <div
                        key={index}
                        className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.05] backdrop-blur-md bg-card/90 border-2 rounded-lg p-4"
                      >
                        <div className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-xl mb-1 font-bold">{career.career_name}</h3>
                              <p className="text-sm leading-relaxed whitespace-normal max-w-full break-words">
                                {career.fit_explanation}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="pt-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-wrap">
                              <div className="flex items-center gap-1">
                                <TrendingUp className="w-5 h-5" />
                                <span className="text-sm">Required Skills/Education:</span>
                                <span className="whitespace-normal max-w-full break-words bg-gray-200 px-2 py-1 rounded">
                                  {career.required_skills_education}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <TrendingUp className="w-5 h-5" />
                                <span className="text-sm">Potential Growth:</span>
                                <span className="whitespace-normal max-w-full break-words bg-gray-200 px-2 py-1 rounded">
                                  {career.potential_growth}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 text-right">
                              <Link href={`/career-roadmap?career=${career.career_name}`}>
                                <button
                                  className="bg-primary text-white px-6 py-3 rounded-md shadow-md hover:shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center gap-2"
                                >
                                  View Roadmap
                                  <ExternalLink className="w-5 h-5 ml-2" />
                                </button>
                              </Link>
                            </div>
                        </div>
                      </div>
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
                className="flex-1 h-12 bg-card/50 backdrop-blur-md"
                disabled={isTyping}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!currentInput.trim() || isTyping}
                className="h-12 px-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300"
              >
                <Send className="w-6 h-6" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
