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

      {loading && <p className="text-center mt-4">Generating roadmap...</p>}
      {error && <p className="text-center mt-4 text-red-500">{error}</p>}

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
