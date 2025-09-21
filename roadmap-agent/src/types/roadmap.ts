export interface RoadmapNode {
  id: string;
  data: {
    label: string;
    step?: RoadmapStep;
  };
  position: { x: number; y: number };
}

export interface RoadmapEdge {
  id: string;
  source: string;
  target: string;
}

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  duration: string;
  skills: string[];
  resources: string[];
  milestones: string[];
}

export interface SkillDetail {
  name: string;
  description: string;
  learningPath: string[];
  practiceProjects: string[];
  resources: {
    type: string;
    title: string;
    url?: string;
    description: string;
  }[];
  timeToLearn: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

export interface StepDetails {
  step: RoadmapStep;
  skillDetails: SkillDetail[];
  tips: string[];
  commonMistakes: string[];
  successMetrics: string[];
}
