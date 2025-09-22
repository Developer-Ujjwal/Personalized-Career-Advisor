import { RoadmapNode, RoadmapStep, StepDetails } from '@/components/roadmap-agent-components/types/roadmap';

export async function fetchRoadmap(careerGoal: string): Promise<{nodes: RoadmapNode[], edges: any[]}> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/roadmap`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
    body: JSON.stringify({ career_goal: careerGoal }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch roadmap');
  }

  return response.json();
}

export async function fetchRoadmapStepDetails(step: RoadmapStep, overallGoal: string): Promise<StepDetails> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/roadmap/step-details`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
    body: JSON.stringify({ step: step, overall_goal: overallGoal }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch roadmap step details');
  }

  const data = await response.json();
  return data; // Assuming the backend returns the StepDetails directly
}