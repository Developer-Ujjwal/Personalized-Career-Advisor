"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Brain, ArrowRight, ArrowLeft, Save, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import axios from "axios"
import { useToast } from "@/components/ui/use-toast"

export function HexacoEntryPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  
  const [scores, setScores] = useState({
    honesty_humility: 50,
    emotionality: 50,
    extraversion: 50,
    agreeableness: 50,
    conscientiousness: 50,
    openness_to_experience: 50
  })

  const handleSliderChange = (trait: string, value: number[]) => {
    setScores(prev => ({
      ...prev,
      [trait]: value[0]
    }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      // Convert scores from 0-100 scale to 0-1 scale for backend
      const normalizedScores = {
        honesty_humility: scores.honesty_humility / 100,
        emotionality: scores.emotionality / 100,
        extraversion: scores.extraversion / 100,
        agreeableness: scores.agreeableness / 100,
        conscientiousness: scores.conscientiousness / 100,
        openness_to_experience: scores.openness_to_experience / 100
      }
      
      // Get token from localStorage
      const token = localStorage.getItem('access_token')
      
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to save your scores",
          variant: "destructive"
        })
        setIsSubmitting(false)
        return
      }
      
      // Send scores to backend
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      await axios.post(`${apiUrl}/hexaco_scores`, normalizedScores, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      setIsSuccess(true)
      toast({
        title: "Success!",
        description: "Your HEXACO scores have been saved",
        variant: "default"
      })
      
    } catch (error) {
      console.error('Error saving HEXACO scores:', error)
      toast({
        title: "Error",
        description: "Failed to save your scores. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary rounded-xl">
              <Brain className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              HEXACO Personality Profile
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            Enter your known HEXACO scores to get personalized career recommendations
          </p>
        </div>

        <Card className="backdrop-blur-sm bg-card/90 border shadow-lg">
          <CardHeader>
            <CardTitle>Your HEXACO Scores</CardTitle>
            <CardDescription>
              Move the sliders to match your known scores for each dimension (0-100)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Honesty-Humility */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="honesty_humility" className="text-base font-medium">Honesty-Humility ({scores.honesty_humility})</Label>
                <span className="text-sm text-muted-foreground">Sincerity, fairness, modesty</span>
              </div>
              <Slider
                id="honesty_humility"
                min={0}
                max={100}
                step={1}
                value={[scores.honesty_humility]}
                onValueChange={(value) => handleSliderChange('honesty_humility', value)}
                className="py-2"
              />
            </div>

            {/* Emotionality */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="emotionality" className="text-base font-medium">Emotionality ({scores.emotionality})</Label>
                <span className="text-sm text-muted-foreground">Fearfulness, anxiety, dependence</span>
              </div>
              <Slider
                id="emotionality"
                min={0}
                max={100}
                step={1}
                value={[scores.emotionality]}
                onValueChange={(value) => handleSliderChange('emotionality', value)}
                className="py-2"
              />
            </div>

            {/* Extraversion */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="extraversion" className="text-base font-medium">Extraversion ({scores.extraversion})</Label>
                <span className="text-sm text-muted-foreground">Social self-esteem, sociability, liveliness</span>
              </div>
              <Slider
                id="extraversion"
                min={0}
                max={100}
                step={1}
                value={[scores.extraversion]}
                onValueChange={(value) => handleSliderChange('extraversion', value)}
                className="py-2"
              />
            </div>

            {/* Agreeableness */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="agreeableness" className="text-base font-medium">Agreeableness ({scores.agreeableness})</Label>
                <span className="text-sm text-muted-foreground">Forgiveness, gentleness, patience</span>
              </div>
              <Slider
                id="agreeableness"
                min={0}
                max={100}
                step={1}
                value={[scores.agreeableness]}
                onValueChange={(value) => handleSliderChange('agreeableness', value)}
                className="py-2"
              />
            </div>

            {/* Conscientiousness */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="conscientiousness" className="text-base font-medium">Conscientiousness ({scores.conscientiousness})</Label>
                <span className="text-sm text-muted-foreground">Organization, diligence, perfectionism</span>
              </div>
              <Slider
                id="conscientiousness"
                min={0}
                max={100}
                step={1}
                value={[scores.conscientiousness]}
                onValueChange={(value) => handleSliderChange('conscientiousness', value)}
                className="py-2"
              />
            </div>

            {/* Openness to Experience */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="openness_to_experience" className="text-base font-medium">Openness to Experience ({scores.openness_to_experience})</Label>
                <span className="text-sm text-muted-foreground">Aesthetic appreciation, creativity, inquisitiveness</span>
              </div>
              <Slider
                id="openness_to_experience"
                min={0}
                max={100}
                step={1}
                value={[scores.openness_to_experience]}
                onValueChange={(value) => handleSliderChange('openness_to_experience', value)}
                className="py-2"
              />
            </div>

            <div className="flex justify-between pt-6">
              {isSuccess ? (
                <div className="w-full grid grid-cols-2 gap-4">
                  <Link href="/personality-entry">
                    <Button 
                      variant="outline" 
                      className="w-full gap-2 dark:hover:text-pink-300"
                      onClick={() => {
                        setIsSuccess(false);
                        setScores({
                          honesty_humility: 50,
                          emotionality: 50,
                          extraversion: 50,
                          agreeableness: 50,
                          conscientiousness: 50,
                          openness_to_experience: 50
                        });
                      }}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Assessments
                    </Button>
                  </Link>
                  <Link href="/career-agent">
                    <Button 
                      className="w-full gap-2 bg-primary hover:bg-primary/90"
                    >
                      Continue to Career Agent
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <Link href="/personality-entry">
                    <Button variant="outline" className="gap-2 dark:hover:text-pink-300">
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </Button>
                  </Link>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                    className="gap-2 bg-primary hover:bg-primary/90"
                  >
                    {isSubmitting ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Scores
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            After saving your scores, you'll be redirected to the Career Agent for personalized recommendations
          </p>
        </div>
      </div>
    </div>
  )
}