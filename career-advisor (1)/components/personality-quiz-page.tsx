"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Brain, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"
import axios from "axios"
import { useEffect } from "react"

interface QuizQuestion {
  id: number
  statement: string
  category: string
  reverse?: boolean // For reverse-scored items
}

interface PersonalityResult {
  type: string
  title: string
  description: string
  traits: string[]
  scores: Record<string, number>
}

const quizQuestions: QuizQuestion[] = [
  // Honesty-Humility
  {
    id: 1,
    statement: "I would be tempted to buy stolen property if I were financially tight",
    category: "honesty",
    reverse: true,
  },
  { id: 2, statement: "I would never accept a bribe, even if it were very large", category: "honesty" },
  {
    id: 3,
    statement: "I wouldn't use flattery to get a raise or promotion at work, even if I thought it would succeed",
    category: "honesty",
  },

  // Emotionality
  { id: 4, statement: "I would feel afraid if I had to travel in bad weather conditions", category: "emotionality" },
  { id: 5, statement: "I worry a lot less than most people do", category: "emotionality", reverse: true },
  { id: 6, statement: "I feel reasonably satisfied with myself overall", category: "emotionality", reverse: true },

  // eXtraversion
  { id: 7, statement: "I feel comfortable approaching someone I find attractive", category: "extraversion" },
  { id: 8, statement: "I enjoy having lots of people around to talk with", category: "extraversion" },
  {
    id: 9,
    statement: "I prefer jobs that involve active social interaction to those that involve working alone",
    category: "extraversion",
  },

  // Agreeableness
  {
    id: 10,
    statement: "I rarely hold a grudge, even against people who have badly wronged me",
    category: "agreeableness",
  },
  {
    id: 11,
    statement: "I am usually quite flexible in my opinions when people disagree with me",
    category: "agreeableness",
  },
  { id: 12, statement: "I tend to be lenient in judging other people", category: "agreeableness" },

  // Conscientiousness
  {
    id: 13,
    statement: "I plan ahead and organize things, to avoid scrambling at the last minute",
    category: "conscientiousness",
  },
  { id: 14, statement: "I often push myself very hard when trying to achieve a goal", category: "conscientiousness" },
  {
    id: 15,
    statement: "I do only the minimum amount of work needed to get by",
    category: "conscientiousness",
    reverse: true,
  },

  // Openness to Experience
  {
    id: 16,
    statement: "I would enjoy creating a work of art, such as a novel, a song, or a painting",
    category: "openness",
  },
  {
    id: 17,
    statement: "I think that paying attention to radical ideas is a waste of time",
    category: "openness",
    reverse: true,
  },
  { id: 18, statement: "I like people who have unconventional views", category: "openness" },
]

const getPersonalityProfile = (scores: Record<string, number>): PersonalityResult => {
  // Determine dominant traits based on scores
  const traits = []
  const dominantDimensions = []

  if (scores.honesty > 3.5) {
    traits.push("Honest", "Sincere", "Fair")
    dominantDimensions.push("High Honesty-Humility")
  }
  if (scores.emotionality > 3.5) {
    traits.push("Sensitive", "Anxious", "Sentimental")
    dominantDimensions.push("High Emotionality")
  } else if (scores.emotionality < 2.5) {
    traits.push("Brave", "Tough", "Independent")
    dominantDimensions.push("Low Emotionality")
  }
  if (scores.extraversion > 3.5) {
    traits.push("Outgoing", "Sociable", "Confident")
    dominantDimensions.push("High Extraversion")
  } else if (scores.extraversion < 2.5) {
    traits.push("Reserved", "Quiet", "Introspective")
    dominantDimensions.push("Low Extraversion")
  }
  if (scores.agreeableness > 3.5) {
    traits.push("Forgiving", "Gentle", "Cooperative")
    dominantDimensions.push("High Agreeableness")
  }
  if (scores.conscientiousness > 3.5) {
    traits.push("Organized", "Disciplined", "Careful")
    dominantDimensions.push("High Conscientiousness")
  }
  if (scores.openness > 3.5) {
    traits.push("Creative", "Curious", "Unconventional")
    dominantDimensions.push("High Openness")
  }

  const title = dominantDimensions.slice(0, 2).join(" & ") || "Balanced Profile"
  const description = `Your personality profile shows ${dominantDimensions.length > 0 ? dominantDimensions.join(", ") : "a balanced mix across all dimensions"}. This combination of traits influences how you approach work, relationships, and personal growth.`

  return {
    type: "HEXACO", // Simple label instead of complex type code
    title,
    description,
    traits: traits.slice(0, 6),
    scores,
  }
}

export function PersonalityQuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [showResult, setShowResult] = useState(false)
  const [personalityResult, setPersonalityResult] = useState<PersonalityResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchHexacoScores = async () => {
      try {
        const token = localStorage.getItem("access_token")
        if (!token) {
          setIsLoading(false)
          return
        }

        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/hexaco_scores`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.data && Object.keys(response.data).length > 0) {
          const hexacoScores = response.data
          const result = getPersonalityProfile(hexacoScores)
          setPersonalityResult(result)
          setShowResult(true)
        }
      } catch (error) {
        console.error("Error fetching HEXACO scores:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchHexacoScores()
  }, [])

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

  const calculateResult = async () => {
    const scores = {
      honesty: 0,
      emotionality: 0,
      extraversion: 0,
      agreeableness: 0,
      conscientiousness: 0,
      openness: 0,
    }

    const counts = {
      honesty: 0,
      emotionality: 0,
      extraversion: 0,
      agreeableness: 0,
      conscientiousness: 0,
      openness: 0,
    }

    quizQuestions.forEach((question) => {
      const answer = answers[question.id] || 3
      const score = question.reverse ? 6 - answer : answer // Reverse scoring for reverse items

      scores[question.category as keyof typeof scores] += score
      counts[question.category as keyof typeof counts] += 1
    })

    // Calculate average scores for each dimension
    Object.keys(scores).forEach((key) => {
      const dimension = key as keyof typeof scores
      scores[dimension] = scores[dimension] / counts[dimension]
    })

    const result = getPersonalityProfile(scores)
    setPersonalityResult(result)
    setShowResult(true)

    // Send HEXACO scores to backend
    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        console.error("No access token found. User not authenticated.")
        return
      }

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/hexaco_scores`,
        {
          honesty_humility: scores.honesty,
          emotionality: scores.emotionality,
          extraversion: scores.extraversion,
          agreeableness: scores.agreeableness,
          conscientiousness: scores.conscientiousness,
          openness_to_experience: scores.openness,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      console.log("HEXACO scores saved successfully!")
    } catch (error) {
      console.error("Error saving HEXACO scores:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading personality scores...</p>
      </div>
    )
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
                Your HEXACO Profile
              </h1>
            </div>
          </div>

          <Card className="backdrop-blur-sm bg-card/80 border-2 shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl mb-2">{personalityResult.title}</CardTitle>
              <CardDescription className="text-lg text-balance">{personalityResult.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Your HEXACO Scores</h3>
                <div className="space-y-2">
                  {Object.entries(personalityResult.scores).map(([dimension, score]) => (
                    <div key={dimension} className="flex items-center justify-between">
                      <span className="capitalize font-medium">
                        {dimension === "extraversion" ? "Extraversion" : dimension}
                      </span>
                      <div className="flex items-center gap-2">
                        <Progress value={(score / 5) * 100} className="w-24 h-2" />
                        <span className="text-sm font-mono">{score.toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

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
                <div className="w-full grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="w-full gap-2 dark:hover:text-pink-300"
                    onClick={() => {
                      setShowResult(false);
                      setCurrentQuestion(0);
                      setAnswers({});
                    }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Retake Test
                  </Button>
                  <Link href="/career-agent">
                    <Button className="w-full gap-2 bg-primary hover:bg-primary/90">
                      Continue to Career Agent
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
                <div className="pt-4">
                  <Link href="/personality-entry">
                    <Button variant="outline" className="w-full gap-2 dark:hover:text-pink-300">
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </Button>
                  </Link>
                </div>
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
              HEXACO Personality Test
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
                  <Button
                    key={value}
                    onClick={() => handleAnswer(currentQ.id, value)}
                    variant={answers[currentQ.id] === value ? "default" : "outline"}
                    className={`flex-1 py-3 text-base transition-all duration-200 ${
                      answers[currentQ.id] === value
                        ? "bg-primary border-primary text-primary-foreground shadow-lg scale-105"
                        : "border-border hover:border-primary hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary dark:hover:text-pink-300 bg-background"
                    }`}
                  >
                    {value === 1 && "Strongly Disagree"}
                    {value === 2 && "Disagree"}
                    {value === 3 && "Neutral"}
                    {value === 4 && "Agree"}
                    {value === 5 && "Strongly Agree"}
                  </Button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <Link href="/personality-entry">
                <Button 
                  variant="outline" 
                  className="gap-2 hover:text-primary dark:hover:text-pink-300 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </Link>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  className="flex items-center gap-2 bg-transparent hover:text-primary dark:hover:text-pink-300 transition-colors disabled:hover:text-muted-foreground"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!currentAnswer}
                  className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 hover:text-white dark:hover:text-white"
                >
                  {currentQuestion === quizQuestions.length - 1 ? "Get Results" : "Next"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
