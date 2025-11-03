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
import { Bot, Send, User, TrendingUp, ExternalLink, Plus, MessageSquare, Loader2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface Message {
  id: string
  type: "user" | "agent"
  content: string
  timestamp: string | Date
}

interface CareerRecommendation {
  career_name: string;
  fit_explanation: string;
  required_skills_education: string;
  potential_growth: string;
}

interface InfluenceBreakdown {
  HEXACO?: number;
  Holland?: number;
  Interests?: number;
}

interface Conversation {
  id: string
  title: string
  created_at?: string
  updated_at?: string
}

interface ConversationData {
  id: string
  user_id: string
  title: string
  messages: Message[]
  conversation_history: any[]
  user_profile: any
  career_recommendations: CareerRecommendation[]
  additional_advice: string
  influence_breakdown: InfluenceBreakdown
  created_at?: string
  updated_at?: string
}

export function CareerAgentPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentInput, setCurrentInput] = useState("")
  const [showCareerOptions, setShowCareerOptions] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [careerRecommendations, setCareerRecommendations] = useState<CareerRecommendation[]>([]);
  const [additionalAdvice, setAdditionalAdvice] = useState<string>("");
  const [influenceBreakdown, setInfluenceBreakdown] = useState<InfluenceBreakdown | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages, isTyping])

  // Load conversations on mount
  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    setIsLoadingConversations(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/conversations`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setConversations(data)
        // If no conversation is selected and we have conversations, select the most recent one
        if (!currentConversationId && data.length > 0) {
          loadConversation(data[0].id)
        } else if (data.length === 0) {
          // Create a new conversation if none exist
          createNewConversation()
        }
      }
    } catch (error) {
      console.error("Error loading conversations:", error)
      // Create a new conversation if loading fails
      createNewConversation()
    } finally {
      setIsLoadingConversations(false)
    }
  }

  const createNewConversation = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ title: "New Chat" }),
      })
      if (response.ok) {
        const newConversation = await response.json()
        setConversations((prev) => [newConversation, ...prev])
        setCurrentConversationId(newConversation.id)
        setMessages([])
        setShowCareerOptions(false)
        setCareerRecommendations([])
        setAdditionalAdvice("")
        setInfluenceBreakdown(null)
        // Fetch initial question for new conversation after a small delay
        setTimeout(() => {
          fetchInitialQuestion(newConversation.id)
        }, 100)
      }
    } catch (error) {
      console.error("Error creating conversation:", error)
    }
  }

  const loadConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/conversations/${conversationId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })
      if (response.ok) {
        const data: ConversationData = await response.json()
        setCurrentConversationId(data.id)
        
        // Convert messages from conversation history
        const convertedMessages: Message[] = []
        if (data.messages && data.messages.length > 0) {
          // Use messages if available
          convertedMessages.push(...data.messages.map((msg: any) => ({
            id: msg.id || Date.now().toString(),
            type: msg.type,
            content: msg.content,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
          })))
        } else if (data.conversation_history && data.conversation_history.length > 0) {
          // Convert conversation history to messages
          let msgId = 1
          for (const item of data.conversation_history) {
            if (item.role === "user" || item.role === "assistant") {
              const role = item.role === "assistant" ? "system" : "user"
              const content = item.parts?.[0] || ""
              if (content && role !== "system") {
                convertedMessages.push({
                  id: (msgId++).toString(),
                  type: role as "user" | "agent",
                  content: content,
                  timestamp: new Date(),
                })
              }
            }
          }
        }
        setMessages(convertedMessages)
        
        // Load recommendations if they exist
        if (data.career_recommendations && data.career_recommendations.length > 0) {
          setCareerRecommendations(data.career_recommendations)
          setAdditionalAdvice(data.additional_advice || "")
          setInfluenceBreakdown(data.influence_breakdown || null)
          setShowCareerOptions(true)
        } else {
          setShowCareerOptions(false)
          setCareerRecommendations([])
          setAdditionalAdvice("")
          setInfluenceBreakdown(null)
        }
      }
    } catch (error) {
      console.error("Error loading conversation:", error)
    }
  }

  const fetchInitialQuestion = async (conversationId: string) => {
    if (!conversationId) return
    
    setIsTyping(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/question?conversation_id=${conversationId}`, {
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

      if (data.question) {
        const agentMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "agent",
          content: data.question,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, agentMessage])
      }
    } catch (error) {
      console.error("Error fetching initial question:", error)
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

  // Fetch initial question when a new conversation is selected
  useEffect(() => {
    if (currentConversationId && messages.length === 0 && !showCareerOptions) {
      fetchInitialQuestion(currentConversationId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentConversationId])

  const handleSendMessage = async () => {
    if (!currentInput.trim() || !currentConversationId) return

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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ 
          answer: userMessage.content,
          conversation_id: currentConversationId
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.question) {
        const agentMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "agent",
          content: data.question,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, agentMessage])
      }
      
      // Reload conversations to update timestamps
      loadConversations()
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

  const handleGenerateRecommendations = async () => {
    if (!currentConversationId) return
    
    setIsGeneratingRecommendations(true)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/conversations/${currentConversationId}/generate-recommendations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.recommendations) {
        const finalMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "agent",
          content: "Thank you for sharing! Based on our conversation, I've analyzed your personality, interests, and preferences. Here are the top career paths that match your profile:",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, finalMessage])
        setCareerRecommendations(data.recommendations)
        setAdditionalAdvice(data.additional_advice || "")
        setInfluenceBreakdown(data.influence_breakdown || null)
        setTimeout(() => setShowCareerOptions(true), 1000)
      }
    } catch (error) {
      console.error("Error generating recommendations:", error)
    } finally {
      setIsGeneratingRecommendations(false)
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/roadmap`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ career_goal: careerName }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const roadmapData = await response.json()
      localStorage.setItem("current_roadmap", JSON.stringify(roadmapData))
      window.location.href = `/career-roadmap?career=${encodeURIComponent(careerName)}`
    } catch (error) {
      console.error("Error generating roadmap:", error)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return "Today"
    if (diffDays === 2) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)] bg-gradient-to-br from-background via-muted/20 to-accent/10 flex overflow-hidden">
      {/* Sidebar - hidden by default on mobile */}
      <div className={`${sidebarOpen ? "lg:w-64 w-full fixed lg:relative inset-0 z-30" : "w-0"} transition-all duration-300 border-r bg-card/50 backdrop-blur-sm overflow-hidden flex flex-col`}>
        <div className="p-4">
          <Button
            onClick={createNewConversation}
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>
        
        <Separator />
        
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            {isLoadingConversations ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}

                  onClick={(e) => {
                    loadConversation(conv.id);
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    currentConversationId === conv.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{conv.title}</p>
                      <p className="text-xs opacity-70">{formatDate(conv.updated_at)}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
  {/* Main Content */}
  <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-3 justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden"
                >
                  <MessageSquare className="w-5 h-5" />
                </Button>
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
              {!showCareerOptions && currentConversationId && (
                <Button
                  onClick={handleGenerateRecommendations}
                  disabled={isGeneratingRecommendations}
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-sm lg:text-base px-2 lg:px-4"
                >
                  {isGeneratingRecommendations ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      <span className="hidden sm:inline">Generating...</span>
                      <span className="sm:hidden">Gen...</span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Generate Recommendations</span>
                      <span className="sm:hidden">Recommend</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 container mx-auto px-4 py-4 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 pr-4 overflow-auto" ref={scrollAreaRef}>
            <div className="space-y-6">
              {messages.length === 0 && !isTyping && (
                <div className="text-center py-12">
                  <Bot className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h2 className="text-2xl font-bold mb-2">Start a Conversation</h2>
                  <p className="text-muted-foreground">Ask me anything about your career journey!</p>
                </div>
              )}
              
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
                      {message.timestamp instanceof Date
                        ? message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
                <div className="flex gap-2 sm:gap-3 justify-start">
                  <Avatar className="w-8 h-8 sm:w-12 sm:h-12 bg-primary">
                    <AvatarFallback>
                      <Bot className="w-4 h-4 sm:w-6 sm:h-6 text-primary-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-card border shadow-lg rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div
                        className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted-foreground rounded-full animate-bounce"
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
                    {influenceBreakdown && (
                      <div className="mt-4 flex flex-col items-center">
                        <h3 className="text-lg font-semibold mb-2">Influence Breakdown</h3>
                        <div className="flex gap-4 flex-wrap">
                          <div className="flex flex-col items-center">
                            <span className="font-medium">HEXACO</span>
                            <span className="text-primary font-bold">{influenceBreakdown.HEXACO ?? 0}%</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="font-medium">Holland</span>
                            <span className="text-accent font-bold">{influenceBreakdown.Holland ?? 0}%</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="font-medium">Interests</span>
                            <span className="text-green-600 font-bold">{influenceBreakdown.Interests ?? 0}%</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="grid gap-6">
                    {careerRecommendations.map((career, index) => (
                      <div
                        key={index}
                        className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] backdrop-blur-md bg-card/90 border-2 rounded-lg p-4"
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
                          <div className="mt-3 pt-3 border-t border-border">
                            <div className="font-medium mb-1">Personality Match</div>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className="bg-primary/10 hover:bg-primary/20">HEXACO Profile</Badge>
                              <Badge variant="outline" className="bg-accent/10 hover:bg-accent/20">Holland RIASEC</Badge>
                            </div>
                          </div>
                          <div className="mt-4 text-right">
                            <button
                              onClick={() => handleViewRoadmap(career.career_name)}
                              className="bg-primary text-white px-6 py-3 rounded-md shadow-md hover:shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center gap-2"
                            >
                              View Roadmap
                              <ExternalLink className="w-5 h-5 ml-2" />
                            </button>
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
            <div className="mt-4 flex gap-3 items-end" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
              <Input
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your response..."
                className="flex-1 h-12 bg-card/50 backdrop-blur-md mb-4"
                disabled={isTyping || !currentConversationId}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!currentInput.trim() || isTyping || !currentConversationId}
                className="h-12 px-4 mb-4 lg:px-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300"
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