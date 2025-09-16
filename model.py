from pydantic import BaseModel
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

# User models
class User(BaseModel):
    username: str
    email: str
    hashed_password: str
    conversation_history: List[Dict] = []
    user_profile: Dict = {
        "interests": [],
        "skills": [],
        "personality_traits": [],
        "values": [],
        "education_level": "",
        "experience_level": "",
        "dislikes": []
    }

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