from pydantic import BaseModel, Field
from typing import Dict, List, Any, Tuple, Optional

class Profile(BaseModel):
    interests: List[str] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)
    personality_traits: List[str] = Field(default_factory=list)
    values: List[str] = Field(default_factory=list)
    education: str = ""
    experience_level: str = ""
    dislikes: List[str] = Field(default_factory=list)

class CareerRecommendation(BaseModel):
    career_name: str
    fit_explanation: str
    required_skills_education: str
    potential_growth: str

class CareerRecommendationsResponse(BaseModel):
    recommendations: List[CareerRecommendation]
    additional_advice: str
    influence_breakdown: Dict[str, float] = Field(default_factory=dict)

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
    
class HollandScores(BaseModel):
    realistic: float = 0.0
    investigative: float = 0.0
    artistic: float = 0.0
    social: float = 0.0
    enterprising: float = 0.0
    conventional: float = 0.0

class User(BaseModel):
    id: str
    username: str
    email: str
    hashed_password: str
    conversation_history: List[Dict[str, Any]] = []
    hexaco_scores: Optional[HexacoScores] = None
    holland_scores: Optional[HollandScores] = None
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
    conversation_id: str

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

# Conversation models
class Message(BaseModel):
    id: str
    type: str  # "user" or "agent"
    content: str
    timestamp: str

class Conversation(BaseModel):
    id: str
    user_id: str
    title: str
    messages: List[Message] = []
    conversation_history: List[Dict[str, Any]] = []
    user_profile: Dict = {}
    career_recommendations: List[Dict] = []
    additional_advice: str = ""
    influence_breakdown: Dict[str, float] = {}
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class ConversationCreate(BaseModel):
    title: Optional[str] = "New Chat"

class ConversationResponse(BaseModel):
    id: str
    title: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class GenerateRecommendationsRequest(BaseModel):
    conversation_id: str
