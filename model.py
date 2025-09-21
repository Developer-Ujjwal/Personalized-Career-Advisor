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