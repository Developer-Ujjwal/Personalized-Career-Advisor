"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Brain, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"

interface QuizQuestion {
  id: number
  statement: string
  category: string
}

interface PersonalityResult {
  type: string
  title: string
  description: string
  traits: string[]
}

const quizQuestions: QuizQuestion[] = [
  { id: 1, statement: "I enjoy being the center of attention at social gatherings", category: "extraversion" },
  { id: 2, statement: "I prefer to work with concrete facts rather than abstract theories", category: "sensing" },
  { id: 3, statement: "I make decisions based on logic rather than emotions", category: "thinking" },
  { id: 4, statement: "I like to have a clear plan and stick to it", category: "judging" },
  { id: 5, statement: "I feel energized after spending time with groups of people", category: "extraversion" },
  { id: 6, statement: "I focus on details and practical applications", category: "sensing" },
  { id: 7, statement: "I value efficiency and objective analysis", category: "thinking" },
  { id: 8, statement: "I prefer structure and organization in my daily life", category: "judging" },
  { id: 9, statement: "I often think out loud and process ideas by talking", category: "extraversion" },
  { id: 10, statement: "I trust my intuition and gut feelings about situations", category: "intuition" },
  { id: 11, statement: "I consider how decisions will affect people's feelings", category: "feeling" },
  { id: 12, statement: "I enjoy keeping my options open and being spontaneous", category: "perceiving" },
  { id: 13, statement: "I prefer one-on-one conversations over group discussions", category: "introversion" },
  { id: 14, statement: "I enjoy exploring possibilities and future potential", category: "intuition" },
  { id: 15, statement: "I prioritize harmony and consider others' perspectives", category: "feeling" },
  { id: 16, statement: "I adapt easily to changing circumstances", category: "perceiving" },
]

const personalityTypes: Record<string, PersonalityResult> = {
  ENTJ: {
    type: "ENTJ",
    title: "The Executive",
    description: "Natural-born leaders who are strategic, organized, and driven to achieve their goals.",
    traits: ["Strategic thinking", "Leadership", "Goal-oriented", "Decisive"],
  },
  ENFJ: {
    type: "ENFJ",
    title: "The Protagonist",
    description: "Charismatic and inspiring leaders who are passionate about helping others reach their potential.",
    traits: ["Empathetic", "Inspiring", "Organized", "People-focused"],
  },
  INTJ: {
    type: "INTJ",
    title: "The Architect",
    description: "Independent and strategic thinkers who love to solve complex problems and create systems.",
    traits: ["Strategic", "Independent", "Analytical", "Visionary"],
  },
  INFJ: {
    type: "INFJ",
    title: "The Advocate",
    description: "Creative and insightful individuals who are driven by their values and desire to help others.",
    traits: ["Insightful", "Creative", "Principled", "Altruistic"],
  },
  ESTP: {
    type: "ESTP",
    title: "The Entrepreneur",
    description:
      "Energetic and adaptable individuals who thrive in dynamic environments and love hands-on experiences.",
    traits: ["Adaptable", "Energetic", "Practical", "Spontaneous"],
  },
  ESFP: {
    type: "ESFP",
    title: "The Entertainer",
    description: "Enthusiastic and creative individuals who love to inspire and entertain others.",
    traits: ["Enthusiastic", "Creative", "People-oriented", "Flexible"],
  },
  ISTP: {
    type: "ISTP",
    title: "The Virtuoso",
    description: "Practical and analytical individuals who excel at understanding how things work.",
    traits: ["Practical", "Analytical", "Independent", "Adaptable"],
  },
  ISFP: {
    type: "ISFP",
    title: "The Adventurer",
    description: "Gentle and creative individuals who are driven by their values and love for beauty.",
    traits: ["Creative", "Gentle", "Values-driven", "Flexible"],
  },
}

export function PersonalityQuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [showResult, setShowResult] = useState(false)
  const [personalityResult, setPersonalityResult] = useState<PersonalityResult | null>(null)

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100

  const handleAnswer = (questionId: number, score: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: score }))
  }

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      calculateResult()
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const calculateResult = () => {
    // Simple personality type calculation based on answers
    const scores = {
      extraversion: 0,
      introversion: 0,
      sensing: 0,
      intuition: 0,
      thinking: 0,
      feeling: 0,
      judging: 0,
      perceiving: 0,
    }

    quizQuestions.forEach((question) => {
      const answer = answers[question.id] || 3
      const score = answer - 3 // Convert 1-5 scale to -2 to +2

      if (question.category === "extraversion") {
        scores.extraversion += score
        scores.introversion -= score
      } else if (question.category === "sensing") {
        scores.sensing += score
        scores.intuition -= score
      } else if (question.category === "thinking") {
        scores.thinking += score
        scores.feeling -= score
      } else if (question.category === "judging") {
        scores.judging += score
        scores.perceiving -= score
      } else if (question.category === "intuition") {
        scores.intuition += score
        scores.sensing -= score
      } else if (question.category === "feeling") {
        scores.feeling += score
        scores.thinking -= score
      } else if (question.category === "perceiving") {
        scores.perceiving += score
        scores.judging -= score
      } else if (question.category === "introversion") {
        scores.introversion += score
        scores.extraversion -= score
      }
    })

    // Determine personality type
    const type =
      (scores.extraversion > scores.introversion ? "E" : "I") +
      (scores.sensing > scores.intuition ? "S" : "N") +
      (scores.thinking > scores.feeling ? "T" : "F") +
      (scores.judging > scores.perceiving ? "J" : "P")

    setPersonalityResult(personalityTypes[type] || personalityTypes.INTJ)
    setShowResult(true)
  }

  if (showResult && personalityResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl relative z-10">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-4 bg-primary rounded-2xl animate-pulse-glow">
                <CheckCircle className="w-10 h-10 text-primary-foreground" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Your Personality
              </h1>
            </div>
          </div>

          <Card className="backdrop-blur-sm bg-card/80 border-2 shadow-2xl">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-4 mb-4">
                <Badge variant="secondary" className="text-2xl font-bold px-6 py-2">
                  {personalityResult.type}
                </Badge>
              </div>
              <CardTitle className="text-3xl mb-2">{personalityResult.title}</CardTitle>
              <CardDescription className="text-lg text-balance">{personalityResult.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Your Key Traits</h3>
                <div className="flex flex-wrap gap-2">
                  {personalityResult.traits.map((trait, index) => (
                    <Badge key={index} variant="outline" className="px-3 py-1">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <Link href="/career-agent">
                  <Button className="w-full h-12 text-base bg-purple-600 hover:bg-purple-700 transition-all duration-300 text-white shadow-lg">
                    Continue to Career Agent
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const currentQ = quizQuestions[currentQuestion]
  const currentAnswer = answers[currentQ.id]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10 flex items-center justify-center p-4">
      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary/10 rounded-full animate-float" />
        <div
          className="absolute top-40 right-32 w-24 h-24 bg-accent/10 rounded-full animate-float"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-4 bg-primary rounded-2xl animate-pulse-glow">
              <Brain className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Personality Quiz
            </h1>
          </div>
          <div className="space-y-2">
            <Progress value={progress} className="h-3" />
            <p className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {quizQuestions.length}
            </p>
          </div>
        </div>

        {/* Question Card */}
        <Card className="backdrop-blur-sm bg-card/80 border-2 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-xl text-center text-balance">{currentQ.statement}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Likert Scale */}
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Strongly Disagree</span>
                <span>Strongly Agree</span>
              </div>
              <div className="flex justify-between items-center gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => handleAnswer(currentQ.id, value)}
                    className={`w-12 h-12 rounded-full border-2 transition-all duration-300 hover:scale-110 ${
                      currentAnswer === value
                        ? "bg-primary border-primary text-primary-foreground shadow-lg scale-110"
                        : "border-border hover:border-primary/50 bg-background"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="flex items-center gap-2 bg-transparent"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </Button>
              <Button
                onClick={handleNext}
                disabled={!currentAnswer}
                className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                {currentQuestion === quizQuestions.length - 1 ? "Get Results" : "Next"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
