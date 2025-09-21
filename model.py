from pydantic import BaseModel, Field
from typing import Dict, List, Any, Tuple, Optional

class Profile(BaseModel):
    interests: List[str]
    skills: List[str]
    personality_traits: List[str]
    values: List[str]
    education_level: str
    experience_level: str
    dislikes: List[str]

class CareerRecommendation(BaseModel):
    career_name: str
    fit_explanation: str
    required_skills_education: str
    potential_growth: str

class CareerRecommendationsResponse(BaseModel):
    recommendations: List[CareerRecommendation]
    additional_advice: str

class CareerKeywordsResponse(BaseModel):
    keywords: List[str]

# User models
class HexacoScores(BaseModel):
    honesty_humility: float = 0.0
    emotionality: float = 0.0
    extraversion: float = 0.0
    agreeableness: float = 0.0
    conscientiousness: float = 0.0
    openness_to_experience: float = 0.0

class User(BaseModel):
    id: str
    username: str
    email: str
    hashed_password: str
    conversation_history: List[str] = []
    hexaco_scores: Optional[HexacoScores] = None
    user_profile: Dict = {
        "interests": [],
        "skills": [],
        "personality_traits": [],
        "values": [],
        "education_level": "",
        "experience_level": "",
        "dislikes": []
    }
    career_recommendations: List[Dict] = []
    additional_advice: str=""

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserResponse(BaseModel):
    question: str
    recommendations: Optional[List[Dict]] = None

# Add this with other model classes
class AnswerRequest(BaseModel):
    answer: str

# Roadmap models
class RoadmapStep(BaseModel):
    id: str
    title: str
    description: str
    prerequisites: List[str] = []
class Resource(BaseModel):
    type: str
    title: str
    url: Optional[str] = None
    description: Optional[str] = None

class RoadmapStep(BaseModel):
    id: str
    title: str
    description: str
    prerequisites: List[str] = []
    resources: List[Resource] = []
    details: Optional[str] = None
    duration: Optional[str] = None
    skills: List[str] = []
    milestones: List[str] = []

class RoadmapNodeData(BaseModel):
    label: str
    skills: List[str]
    experience: str
    step: Optional[RoadmapStep] = None

class RoadmapNode(BaseModel):
    id: str
    data: RoadmapNodeData
    position: Dict[str, int]

class RoadmapEdge(BaseModel):
    id: str
    source: str
    target: str

class Roadmap(BaseModel):
    nodes: List[RoadmapNode]
    edges: List[RoadmapEdge]

class RoadmapRequest(BaseModel):
    career_goal: str

class StepDetailsRequest(BaseModel):
    step: RoadmapStep
    overall_goal: str

class SkillDetail(BaseModel):
    name: str
    description: str
    learningPath: List[str] = []
    practiceProjects: List[str] = []
    resources: List[Resource] = []
    timeToLearn: str
    difficulty: str

class StepDetails(BaseModel):
    step: RoadmapStep
    skillDetails: List[SkillDetail] = []
    tips: List[str] = []
    commonMistakes: List[str] = []
    successMetrics: List[str] = []
