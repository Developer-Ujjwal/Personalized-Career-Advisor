"use client";

import { useState, useEffect } from 'react';
import  RoadmapGraph  from '@/components/roadmap-agent-components/components/RoadmapGraph';
import  InputForm  from '@/components/roadmap-agent-components/components/InputForm';
import  StepModal  from '@/components/roadmap-agent-components/components/StepModal';
import { fetchRoadmap, fetchRoadmapStepDetails } from '@/lib/api';
import { RoadmapNode, RoadmapEdge, RoadmapStep, StepDetails } from '@/components/roadmap-agent-components/types/roadmap';

export default function CareerRoadmapPage() {
  const [roadmap, setRoadmap] = useState<{nodes: RoadmapNode[], edges: RoadmapEdge[]} | null>(null);
  const [selectedStep, setSelectedStep] = useState<RoadmapStep | null>(null);
  const [stepDetails, setStepDetails] = useState<StepDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [careerGoal, setCareerGoal] = useState<string>("");
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const storedRoadmap = localStorage.getItem("current_roadmap");
    if (storedRoadmap) {
      setRoadmap(JSON.parse(storedRoadmap));
    }
    const params = new URLSearchParams(window.location.search);
      const goal = params.get("career");
      console.log("Career goal from URL:", goal);
      if (goal) {
        setCareerGoal(decodeURIComponent(goal));
        handleGenerateRoadmap(decodeURIComponent(goal));
      }
  }, []);

  const handleGenerateRoadmap = async (goal: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRoadmap(goal);
      setRoadmap(data);
      setCareerGoal(goal);
      localStorage.setItem("current_roadmap", JSON.stringify(data));
    } catch (err) {
      setError('Failed to generate roadmap. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStepClick = async (step: RoadmapStep) => {
    setLoading(true);
    setError(null);
    setSelectedStep(step);
    setModalOpen(true);
    try {
      const details = await fetchRoadmapStepDetails(step, careerGoal);
      setStepDetails(details);
    } catch (err) {
      setError('Failed to fetch step details. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setTimeout(() => {
      setSelectedStep(null);
      setStepDetails(null);
    }, 300); // Small delay to allow modal close animation
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center mt-5">Career Roadmap Generator</h1>
      <InputForm onSubmit={handleGenerateRoadmap} loading={loading} />

      {loading && (
        <div className="flex flex-col items-center justify-center mt-8 gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary border-solid rounded-full animate-spin border-t-transparent"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13v-6m0-6v6m0 6h6m-6 0H5.5a1.5 1.5 0 01-1.5-1.5v-1a1.5 1.5 0 011.5-1.5H9m6 0h1.5a1.5 1.5 0 011.5 1.5v1a1.5 1.5 0 01-1.5 1.5H15m-6 0V7m6 0V5.618a1 1 0 00-.553-.894L15 2m0 15l5.447-2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7" /></svg>
            </div>
          </div>
          <p className="text-lg font-medium text-muted-foreground">Generating your career roadmap...</p>
        </div>
      )}
      {error && (
        <div className="text-center mt-8 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
          <p className="text-destructive font-medium">{error}</p>
        </div>
      )}

      {roadmap && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Your Roadmap for {careerGoal}</h2>
          <RoadmapGraph 
            nodes={roadmap.nodes} 
            edges={roadmap.edges} 
            onStepClick={handleStepClick} 
            overallGoal={careerGoal} 
          />
        </div>
      )}

      <StepModal 
        isOpen={modalOpen}
        onClose={handleCloseModal}
        stepDetails={stepDetails}
        isLoading={loading}
      />
    </div>
  );
}
