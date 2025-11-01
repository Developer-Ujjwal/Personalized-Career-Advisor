"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mail, Phone, MapPin, Award, BookOpen, Target, LogOut } from "lucide-react"

export function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)

  // Mock user data - in a real app, this would come from a database/auth service
  const userProfile = {
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    headline: "Aspiring Full Stack Developer",
    bio: "Passionate about building scalable web applications and learning new technologies.",
    hexacoProfile: {
      honesty: 7,
      emotionality: 5,
      extraversion: 8,
      agreeableness: 6,
      conscientiousness: 8,
      openness: 9,
    },
    completedCourses: ["HTML Fundamentals", "CSS Mastery", "JavaScript Basics"],
    inProgressCourses: ["React Development", "Node.js Backend"],
    targetRole: "Full Stack Developer",
    joinedDate: "November 2024",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {userProfile.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">{userProfile.name}</h1>
                <p className="text-lg text-muted-foreground mb-1">{userProfile.headline}</p>
                <p className="text-sm text-muted-foreground">Member since {userProfile.joinedDate}</p>
              </div>
            </div>
            <Button onClick={() => setIsEditing(!isEditing)} variant="default" className="rounded-full">
              {isEditing ? "Save Changes" : "Edit Profile"}
            </Button>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Mail className="w-5 h-5 text-purple-500" />
              <span>{userProfile.email}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Phone className="w-5 h-5 text-pink-500" />
              <span>{userProfile.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <MapPin className="w-5 h-5 text-blue-500" />
              <span>{userProfile.location}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Target className="w-5 h-5 text-green-500" />
              <span>Target: {userProfile.targetRole}</span>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <Card className="p-6 mb-8 bg-white/50 backdrop-blur border-purple-200">
          <h2 className="text-xl font-semibold text-foreground mb-3">About</h2>
          <p className="text-muted-foreground leading-relaxed">{userProfile.bio}</p>
        </Card>

        {/* HEXACO Profile */}
        <Card className="p-6 mb-8 bg-white/50 backdrop-blur border-purple-200">
          <h2 className="text-xl font-semibold text-foreground mb-4">HEXACO Personality Profile</h2>
          <div className="space-y-4">
            {Object.entries(userProfile.hexacoProfile).map(([trait, score]) => (
              <div key={trait}>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-foreground capitalize">
                    {trait === "honesty"
                      ? "Honesty-Humility"
                      : trait === "emotionality"
                        ? "Emotionality"
                        : trait === "extraversion"
                          ? "Extraversion"
                          : trait === "agreeableness"
                            ? "Agreeableness"
                            : trait === "conscientiousness"
                              ? "Conscientiousness"
                              : "Openness to Experience"}
                  </label>
                  <span className="text-sm font-semibold text-purple-600">{score}/10</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                    style={{ width: `${(score / 10) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Learning Progress */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Completed Courses */}
          <Card className="p-6 bg-white/50 backdrop-blur border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-6 h-6 text-green-500" />
              <h3 className="text-lg font-semibold text-foreground">Completed Courses</h3>
            </div>
            <div className="space-y-2">
              {userProfile.completedCourses.map((course) => (
                <div key={course} className="p-3 bg-green-50 rounded-lg text-sm text-green-700 border border-green-200">
                  ✓ {course}
                </div>
              ))}
            </div>
          </Card>

          {/* In Progress Courses */}
          <Card className="p-6 bg-white/50 backdrop-blur border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-6 h-6 text-blue-500" />
              <h3 className="text-lg font-semibold text-foreground">In Progress</h3>
            </div>
            <div className="space-y-2">
              {userProfile.inProgressCourses.map((course) => (
                <div key={course} className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700 border border-blue-200">
                  → {course}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Logout Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            className="rounded-full gap-2 text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}
