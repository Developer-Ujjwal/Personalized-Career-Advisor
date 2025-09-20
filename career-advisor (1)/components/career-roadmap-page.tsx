"use client"
import { useState, useRef, useEffect, useCallback } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { MapPin, CheckCircle, Clock, ExternalLink, BookOpen, Play, Award, Target, ArrowLeft, Move } from "lucide-react"
import type { JSX } from "react/jsx-runtime"

interface RoadmapNode {
  id: string
  title: string
  description: string
  type: "skill" | "milestone" | "achievement"
  status: "completed" | "available" | "locked"
  estimatedTime: string
  resources: Resource[]
  prerequisites: string[]
  x: number
  y: number
  connections: string[]
}

interface Resource {
  title: string
  type: "course" | "tutorial" | "book" | "practice"
  url: string
  duration?: string
}

const candyCrushRoadmapData: RoadmapNode[] = [
  {
    id: "1",
    title: "HTML",
    description: "Master HTML fundamentals, semantic markup, and web accessibility.",
    type: "skill",
    status: "available",
    estimatedTime: "2-3 weeks",
    resources: [
      { title: "HTML Fundamentals", type: "course", url: "#", duration: "8 hours" },
      { title: "Semantic HTML Guide", type: "tutorial", url: "#", duration: "3 hours" },
      { title: "Accessibility Basics", type: "book", url: "#" },
    ],
    prerequisites: [],
    x: 300,
    y: 650, // Start from bottom
    connections: ["2", "6"], // HTML connects to both Angular and React
  },
  {
    id: "2",
    title: "Angular",
    description: "Learn Angular framework, TypeScript, and component-based architecture.",
    type: "skill",
    status: "available",
    estimatedTime: "6-8 weeks",
    resources: [
      { title: "Angular Complete Guide", type: "course", url: "#", duration: "40 hours" },
      { title: "TypeScript Essentials", type: "tutorial", url: "#", duration: "8 hours" },
      { title: "Angular Best Practices", type: "practice", url: "#" },
    ],
    prerequisites: ["1"],
    x: 150, // Left branch
    y: 450,
    connections: ["4"], // Angular connects to Backend
  },
  {
    id: "6",
    title: "React",
    description: "Master React, JSX, hooks, and modern React patterns.",
    type: "skill",
    status: "available",
    estimatedTime: "6-8 weeks",
    resources: [
      { title: "React Complete Course", type: "course", url: "#", duration: "35 hours" },
      { title: "React Hooks Deep Dive", type: "tutorial", url: "#", duration: "6 hours" },
      { title: "React Projects", type: "practice", url: "#" },
    ],
    prerequisites: ["1"],
    x: 450, // Right branch
    y: 450,
    connections: ["4"], // React connects to Backend
  },
  {
    id: "4",
    title: "Backend",
    description: "Learn server-side development, APIs, databases, and authentication.",
    type: "milestone",
    status: "available",
    estimatedTime: "8-10 weeks",
    resources: [
      { title: "Node.js & Express", type: "course", url: "#", duration: "25 hours" },
      { title: "Database Design", type: "tutorial", url: "#", duration: "8 hours" },
      { title: "API Development", type: "practice", url: "#" },
    ],
    prerequisites: ["2", "6"], // Backend requires EITHER Angular OR React (not both)
    x: 300, // Center - convergence point
    y: 300,
    connections: ["3"], // Backend connects to Full Stack
  },
  {
    id: "3",
    title: "Full Stack",
    description: "Integrate frontend and backend, deployment, and DevOps basics.",
    type: "milestone",
    status: "available",
    estimatedTime: "4-6 weeks",
    resources: [
      { title: "Full Stack Integration", type: "course", url: "#", duration: "20 hours" },
      { title: "Deployment Guide", type: "tutorial", url: "#", duration: "5 hours" },
      { title: "DevOps Basics", type: "book", url: "#" },
    ],
    prerequisites: ["4"],
    x: 300,
    y: 150,
    connections: ["5"], // Full Stack connects to Job Ready
  },
  {
    id: "5",
    title: "Job Ready",
    description: "Portfolio development, interview preparation, and job search strategies.",
    type: "achievement",
    status: "available",
    estimatedTime: "2-3 weeks",
    resources: [
      { title: "Portfolio Building", type: "course", url: "#", duration: "10 hours" },
      { title: "Interview Prep", type: "tutorial", url: "#", duration: "4 hours" },
      { title: "Job Search Strategy", type: "book", url: "#" },
    ],
    prerequisites: ["3"],
    x: 300,
    y: 50, // Top achievement
    connections: [],
  },
]

export function CareerRoadmapPage() {
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null)
  const [completedNodes, setCompletedNodes] = useState<Set<string>>(new Set())
  const [viewportCenter, setViewportCenter] = useState({ x: 300, y: 400 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [visibleNodes, setVisibleNodes] = useState<string[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsDragging(true)
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStart.x
        const deltaY = e.clientY - dragStart.y

        setViewportCenter((prev) => ({
          x: Math.max(50, Math.min(550, prev.x - deltaX * 0.5)),
          y: Math.max(50, Math.min(700, prev.y - deltaY * 0.5)),
        }))

        setDragStart({ x: e.clientX, y: e.clientY })
      }
    },
    [isDragging, dragStart],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    const updateVisibleNodes = () => {
      const viewportRadius = 250
      const visible = candyCrushRoadmapData
        .filter((node) => {
          const distance = Math.sqrt(Math.pow(node.x - viewportCenter.x, 2) + Math.pow(node.y - viewportCenter.y, 2))
          return distance <= viewportRadius
        })
        .map((node) => node.id)

      setVisibleNodes(visible.slice(0, 3)) // Limit to 3 nodes max
    }

    updateVisibleNodes()
  }, [viewportCenter])

  const handleNodeClick = (node: RoadmapNode) => {
    setSelectedNode(node)
  }

  const handleCompleteNode = (nodeId: string) => {
    setCompletedNodes((prev) => new Set([...prev, nodeId]))
    setSelectedNode(null)
  }

  const getNodeStatus = (node: RoadmapNode): "completed" | "available" | "locked" => {
    if (completedNodes.has(node.id)) return "completed"
    // All nodes unlocked as requested
    return "available"
  }

  const getNodeIcon = (node: RoadmapNode) => {
    const status = getNodeStatus(node)
    if (status === "completed") return <CheckCircle className="w-8 h-8" />
    if (node.type === "achievement") return <Award className="w-8 h-8" />
    if (node.type === "milestone") return <Target className="w-8 h-8" />
    return <MapPin className="w-8 h-8" />
  }

  const renderCurvedPath = () => {
    const paths: JSX.Element[] = []

    candyCrushRoadmapData.forEach((node) => {
      node.connections.forEach((connectionId) => {
        const targetNode = candyCrushRoadmapData.find((n) => n.id === connectionId)
        if (targetNode) {
          const startX = node.x + 40
          const startY = node.y + 40
          const endX = targetNode.x + 40
          const endY = targetNode.y + 40

          // Create more organic, flowing curves
          const controlPoint1X = startX + (endX - startX) * 0.3 + (Math.random() - 0.5) * 80
          const controlPoint1Y = startY + (endY - startY) * 0.3 + (Math.random() - 0.5) * 60
          const controlPoint2X = startX + (endX - startX) * 0.7 + (Math.random() - 0.5) * 80
          const controlPoint2Y = startY + (endY - startY) * 0.7 + (Math.random() - 0.5) * 60

          const pathData = `M ${startX} ${startY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${endX} ${endY}`

          paths.push(
            <path
              key={`${node.id}-${connectionId}`}
              d={pathData}
              stroke="url(#pathGradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-lg"
              filter="url(#glow)"
            />,
          )
        }
      })
    })

    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
        <defs>
          <linearGradient id="pathGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgb(147, 51, 234)" />
            <stop offset="30%" stopColor="rgb(168, 85, 247)" />
            <stop offset="70%" stopColor="rgb(196, 181, 253)" />
            <stop offset="100%" stopColor="rgb(221, 214, 254)" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {paths}
      </svg>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Career Roadmap
                </h1>
                <p className="text-sm text-gray-600">HTML → (Angular/React) → Backend → Full Stack</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Move className="w-4 h-4" />
              <span>Drag to explore</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Roadmap Area */}
      <div className="flex-1 relative overflow-hidden">
        <div
          ref={containerRef}
          className={`w-full h-full flex items-center justify-center ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            className="relative transition-all duration-300 ease-out"
            style={{
              width: "600px",
              height: "700px",
              transform: `translate(${300 - viewportCenter.x}px, ${350 - viewportCenter.y}px)`,
            }}
          >
            {renderCurvedPath()}

            {candyCrushRoadmapData.map((node) => {
              const isVisible = visibleNodes.includes(node.id)
              const status = getNodeStatus(node)

              return (
                <div
                  key={node.id}
                  className={`absolute transition-all duration-500 ${
                    isVisible ? "opacity-100 scale-100" : "opacity-40 scale-80"
                  }`}
                  style={{
                    left: node.x,
                    top: node.y,
                    zIndex: isVisible ? 10 : 2,
                  }}
                >
                  <div
                    className={`w-20 h-20 rounded-full border-4 flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-2xl ${
                      status === "completed"
                        ? "bg-gradient-to-br from-green-400 to-green-500 text-white border-green-300 shadow-lg"
                        : node.type === "achievement"
                          ? "bg-gradient-to-br from-yellow-400 to-orange-400 text-white border-yellow-300 shadow-lg"
                          : node.type === "milestone"
                            ? "bg-gradient-to-br from-purple-500 to-indigo-500 text-white border-purple-300 shadow-lg"
                            : "bg-gradient-to-br from-white to-purple-50 text-purple-600 border-purple-300 shadow-lg"
                    } ${isVisible ? "animate-pulse" : ""}`}
                    onClick={() => handleNodeClick(node)}
                    style={{ filter: isVisible ? "drop-shadow(0 0 15px rgba(147, 51, 234, 0.4))" : "none" }}
                  >
                    <div className="text-2xl font-bold">{node.id}</div>
                  </div>

                  {isVisible && (
                    <div className="mt-3 text-center max-w-20 animate-fade-in">
                      <p className="text-xs font-semibold text-gray-700 leading-tight">{node.title}</p>
                      {status === "completed" && (
                        <Badge variant="secondary" className="mt-1 text-xs bg-green-100 text-green-700">
                          Done
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 border shadow-lg">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium text-gray-700">
              Progress: {completedNodes.size}/{candyCrushRoadmapData.length}
            </div>
            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                style={{ width: `${(completedNodes.size / candyCrushRoadmapData.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Node Detail Sheet */}
      <Sheet open={!!selectedNode} onOpenChange={() => setSelectedNode(null)}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          {selectedNode && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-3">
                  {getNodeIcon(selectedNode)}
                  <div>
                    <SheetTitle>{selectedNode.title}</SheetTitle>
                    <SheetDescription>{selectedNode.description}</SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Status and Time */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{selectedNode.estimatedTime}</span>
                  </div>
                  <Badge variant={getNodeStatus(selectedNode) === "completed" ? "default" : "secondary"}>
                    {getNodeStatus(selectedNode)}
                  </Badge>
                </div>

                {/* Resources */}
                <div>
                  <h3 className="font-semibold mb-3">Learning Resources</h3>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {selectedNode.resources.map((resource, index) => (
                        <Card key={index} className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {resource.type === "course" && <BookOpen className="w-4 h-4 text-blue-500" />}
                                {resource.type === "tutorial" && <Play className="w-4 h-4 text-green-500" />}
                                {resource.type === "book" && <BookOpen className="w-4 h-4 text-purple-500" />}
                                {resource.type === "practice" && <Target className="w-4 h-4 text-orange-500" />}
                                <span className="font-medium text-sm">{resource.title}</span>
                              </div>
                              {resource.duration && <p className="text-xs text-gray-500">{resource.duration}</p>}
                            </div>
                            <Button size="sm" variant="ghost">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Action Button */}
                {getNodeStatus(selectedNode) !== "completed" && (
                  <Button
                    onClick={() => handleCompleteNode(selectedNode.id)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Mark as Complete
                  </Button>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
