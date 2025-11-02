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

export function HollandEntryPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  
  const [scores, setScores] = useState({
    realistic: 50,
    investigative: 50,
    artistic: 50,
    social: 50,
    enterprising: 50,
    conventional: 50
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
        realistic: scores.realistic / 100,
        investigative: scores.investigative / 100,
        artistic: scores.artistic / 100,
        social: scores.social / 100,
        enterprising: scores.enterprising / 100,
        conventional: scores.conventional / 100
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
      await axios.post(`${apiUrl}/holland_scores`, normalizedScores, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      setIsSuccess(true)
      toast({
        title: "Success!",
        description: "Your Holland RIASEC scores have been saved",
        variant: "default"
      })
      
    } catch (error) {
      console.error('Error saving Holland scores:', error)
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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-accent rounded-xl">
              <Brain className="w-8 h-8 text-accent-foreground" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              Holland RIASEC Profile
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            Enter your known Holland RIASEC scores to get personalized career recommendations
          </p>
        </div>

        <Card className="backdrop-blur-sm bg-card/90 border shadow-lg">
          <CardHeader>
            <CardTitle>Your Holland RIASEC Scores</CardTitle>
            <CardDescription>
              Move the sliders to match your known scores for each dimension (0-100)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Realistic */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="realistic" className="text-base font-medium">Realistic ({scores.realistic})</Label>
                <span className="text-sm text-muted-foreground">Practical, mechanical, hands-on</span>
              </div>
              <Slider
                id="realistic"
                min={0}
                max={100}
                step={1}
                value={[scores.realistic]}
                onValueChange={(value) => handleSliderChange('realistic', value)}
                className="py-2"
              />
            </div>

            {/* Investigative */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="investigative" className="text-base font-medium">Investigative ({scores.investigative})</Label>
                <span className="text-sm text-muted-foreground">Analytical, intellectual, scientific</span>
              </div>
              <Slider
                id="investigative"
                min={0}
                max={100}
                step={1}
                value={[scores.investigative]}
                onValueChange={(value) => handleSliderChange('investigative', value)}
                className="py-2"
              />
            </div>

            {/* Artistic */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="artistic" className="text-base font-medium">Artistic ({scores.artistic})</Label>
                <span className="text-sm text-muted-foreground">Creative, expressive, original</span>
              </div>
              <Slider
                id="artistic"
                min={0}
                max={100}
                step={1}
                value={[scores.artistic]}
                onValueChange={(value) => handleSliderChange('artistic', value)}
                className="py-2"
              />
            </div>

            {/* Social */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="social" className="text-base font-medium">Social ({scores.social})</Label>
                <span className="text-sm text-muted-foreground">Helpful, cooperative, supportive</span>
              </div>
              <Slider
                id="social"
                min={0}
                max={100}
                step={1}
                value={[scores.social]}
                onValueChange={(value) => handleSliderChange('social', value)}
                className="py-2"
              />
            </div>

            {/* Enterprising */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="enterprising" className="text-base font-medium">Enterprising ({scores.enterprising})</Label>
                <span className="text-sm text-muted-foreground">Persuasive, leadership, managerial</span>
              </div>
              <Slider
                id="enterprising"
                min={0}
                max={100}
                step={1}
                value={[scores.enterprising]}
                onValueChange={(value) => handleSliderChange('enterprising', value)}
                className="py-2"
              />
            </div>

            {/* Conventional */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="conventional" className="text-base font-medium">Conventional ({scores.conventional})</Label>
                <span className="text-sm text-muted-foreground">Organized, detail-oriented, systematic</span>
              </div>
              <Slider
                id="conventional"
                min={0}
                max={100}
                step={1}
                value={[scores.conventional]}
                onValueChange={(value) => handleSliderChange('conventional', value)}
                className="py-2"
              />
            </div>

            <div className="flex justify-between pt-6">
              {isSuccess ? (
                <div className="w-full grid grid-cols-2 gap-4">
                  <Link href="/personality-entry">
                    <Button 
                      variant="outline" 
                      className="w-full gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Assessments
                    </Button>
                  </Link>
                  <Link href="/career-agent">
                    <Button 
                      className="w-full gap-2 bg-accent hover:bg-accent/90"
                    >
                      Continue to Career Agent
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <Link href="/personality-entry">
                    <Button variant="outline" className="gap-2">
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </Button>
                  </Link>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                    className="gap-2 bg-accent hover:bg-accent/90"
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