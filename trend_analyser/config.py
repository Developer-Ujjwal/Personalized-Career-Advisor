"""Configuration settings for the Skills Trend Analyzer."""

import os
from typing import List

class Config:
    # API Configuration
    API_HOST = os.getenv("API_HOST", "127.0.0.1")
    API_PORT = int(os.getenv("API_PORT", 8000))
    API_RELOAD = os.getenv("API_RELOAD", "True").lower() == "true"
    
    # Google Trends Configuration
    TRENDS_TIMEFRAME = "today 12-m"  # Last 12 months
    TRENDS_GEO = ""  # Global (can be changed to specific countries like "US")
    
    # Processing Configuration
    MAX_RELATED_TOPICS = 25
    MAX_RELATED_QUERIES = 25
    MIN_INTEREST_SCORE = 5  # Minimum score to consider a trend
    
    # Keywords to enhance search for different fields
    FIELD_ENHANCERS = {
        "engineering": ["software engineer", "developer", "programming", "tech skills"],
        "data science": ["data scientist", "machine learning", "analytics", "python"],
        "marketing": ["digital marketing", "seo", "social media", "content marketing"],
        "finance": ["financial analyst", "investment", "accounting", "fintech"],
        "healthcare": ["nurse", "medical", "healthcare", "clinical"],
        "design": ["ui ux", "graphic design", "web design", "creative"],
        "sales": ["sales rep", "business development", "crm", "lead generation"],
        "hr": ["human resources", "recruitment", "talent", "people management"],
        "consulting": ["business consultant", "strategy", "management", "advisory"],
        "education": ["teacher", "instructor", "training", "curriculum"]
    }