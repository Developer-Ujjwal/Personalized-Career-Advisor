"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle } from "lucide-react";
import axios from "axios";

interface HollandQuestion {
  id: number;
  text: string;
  category: "realistic" | "investigative" | "artistic" | "social" | "enterprising" | "conventional";
}

const hollandQuestions: HollandQuestion[] = [
  { id: 1, text: "I enjoy working with tools and machines.", category: "realistic" },
  { id: 2, text: "I like to analyze data and solve complex problems.", category: "investigative" },
  { id: 3, text: "I enjoy expressing myself creatively through art or music.", category: "artistic" },
  { id: 4, text: "I like to help people and work on social causes.", category: "social" },
  { id: 5, text: "I enjoy leading and persuading people.", category: "enterprising" },
  { id: 6, text: "I like to organize things and work with details.", category: "conventional" },
  { id: 7, text: "I prefer outdoor activities over indoor ones.", category: "realistic" },
  { id: 8, text: "I am good at scientific or mathematical tasks.", category: "investigative" },
  { id: 9, text: "I have a vivid imagination and enjoy creating new things.", category: "artistic" },
  { id: 10, text: "I am a good listener and enjoy teaching others.", category: "social" },
  { id: 11, text: "I am ambitious and enjoy taking risks.", category: "enterprising" },
  { id: 12, text: "I am very systematic and careful in my work.", category: "conventional" },
  { id: 13, text: "I like to build or repair things.", category: "realistic" },
  { id: 14, text: "I enjoy conducting experiments and research.", category: "investigative" },
  { id: 15, text: "I appreciate beauty and artistic expression.", category: "artistic" },
  { id: 16, text: "I am good at understanding people's feelings.", category: "social" },
  { id: 17, text: "I enjoy selling or promoting products/ideas.", category: "enterprising" },
  { id: 18, text: "I am good at keeping records and managing information.", category: "conventional" },
];

interface HollandResult {
  type: string;
  title: string;
  description: string;
  scores: Record<string, number>;
}

const getHollandProfile = (scores: Record<string, number>): HollandResult => {
  const sortedScores = Object.entries(scores).sort(([, scoreA], [, scoreB]) => scoreB - scoreA);
  const dominantTypes = sortedScores.slice(0, 3).map(([type]) => type.charAt(0).toUpperCase() + type.slice(1));

  const title = `Your Top Holland RIASEC Types: ${dominantTypes.join(", ")}`;
  const description = `Your Holland RIASEC profile indicates a strong preference for ${dominantTypes.join(", ")} activities and work environments. This suggests careers that align with these interests would be a good fit for you.`;

  return {
    type: "RIASEC",
    title,
    description,
    scores,
  };
};

export function HollandRiasecPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [hollandResult, setHollandResult] = useState<HollandResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHollandScores = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          setIsLoading(false);
          return;
        }

        const response = await axios.get("http://127.0.0.1:8000/holland_scores", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data && Object.keys(response.data).length > 0) {
          const hollandScores = response.data;
          const result = getHollandProfile(hollandScores);
          setHollandResult(result);
          setShowResult(true);
        }
      } catch (error) {
        console.error("Error fetching Holland scores:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHollandScores();
  }, []);

  const handleAnswer = (answer: number) => {
    setAnswers({ ...answers, [hollandQuestions[currentQuestion].id]: answer });
  };

  const handleNext = () => {
    if (currentQuestion < hollandQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResult();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateResult = async () => {
    const scores = {
      realistic: 0,
      investigative: 0,
      artistic: 0,
      social: 0,
      enterprising: 0,
      conventional: 0,
    };

    const counts = {
      realistic: 0,
      investigative: 0,
      artistic: 0,
      social: 0,
      enterprising: 0,
      conventional: 0,
    };

    hollandQuestions.forEach((question) => {
      const answer = answers[question.id] || 3; // Default to 3 if not answered
      scores[question.category] += answer;
      counts[question.category] += 1;
    });

    // Calculate average scores for each dimension
    Object.keys(scores).forEach((key) => {
      const dimension = key as keyof typeof scores;
      scores[dimension] = scores[dimension] / counts[dimension];
    });

    const result = getHollandProfile(scores);
    setHollandResult(result);
    setShowResult(true);

    // Send Holland scores to backend
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        console.error("No access token found. User not authenticated.");
        return;
      }

      await axios.post(
        "http://127.0.0.1:8000/holland_scores",
        {
          realistic: scores.realistic,
          investigative: scores.investigative,
          artistic: scores.artistic,
          social: scores.social,
          enterprising: scores.enterprising,
          conventional: scores.conventional,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Holland scores saved successfully!");
    } catch (error) {
      console.error("Error saving Holland scores:", error);
    }
  };

  const progress = ((currentQuestion + 1) / hollandQuestions.length) * 100;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading Holland RIASEC scores...</p>
      </div>
    );
  }

  if (showResult && hollandResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl relative z-10">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-4 bg-primary rounded-2xl animate-pulse-glow">
                <CheckCircle className="w-10 h-10 text-primary-foreground" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Your Holland RIASEC Profile
              </h1>
            </div>
          </div>

          <Card className="backdrop-blur-sm bg-card/80 border-2 shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl mb-2">{hollandResult.title}</CardTitle>
              <CardDescription className="text-lg text-balance">{hollandResult.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Your Holland RIASEC Scores</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(hollandResult.scores).map(([type, score]) => (
                    <div key={type} className="flex justify-between items-center bg-muted/50 p-3 rounded-lg">
                      <span className="font-medium capitalize">{type}:</span>
                      <span className="text-primary font-bold">{score.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-center pt-4">
                <Button onClick={() => setShowResult(false)} className="w-full">
                  Retake Test
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentQ = hollandQuestions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-3">
            Holland RIASEC Test
          </h1>
          <p className="text-lg text-muted-foreground">
            Answer these questions to discover your Holland RIASEC personality types.
          </p>
        </div>

        <Card className="backdrop-blur-sm bg-card/80 border-2 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Question {currentQuestion + 1} of {hollandQuestions.length}</CardTitle>
            <Progress value={progress} className="w-full mt-4" />
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold mb-6 text-center">{currentQ.text}</p>
            <div className="grid grid-cols-1 gap-3">
              {[1, 2, 3, 4, 5].map((value) => (
                <Button
                  key={value}
                  variant={answers[currentQ.id] === value ? "default" : "outline"}
                  onClick={() => handleAnswer(value)}
                  className="py-3 text-base"
                >
                  {value === 1 && "Strongly Disagree"}
                  {value === 2 && "Disagree"}
                  {value === 3 && "Neutral"}
                  {value === 4 && "Agree"}
                  {value === 5 && "Strongly Agree"}
                </Button>
              ))}
            </div>
            <div className="flex justify-between mt-6">
              <Button onClick={handlePrevious} disabled={currentQuestion === 0} variant="outline">
                Previous
              </Button>
              <Button onClick={handleNext} disabled={answers[currentQ.id] === undefined}>
                {currentQuestion === hollandQuestions.length - 1 ? "Finish" : "Next"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}