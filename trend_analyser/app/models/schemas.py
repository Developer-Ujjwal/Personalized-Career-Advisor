"""Pydantic models for request/response schemas."""

from typing import List, Optional
from pydantic import BaseModel, Field


class TrendRequest(BaseModel):
    """Request model for trend analysis."""
    field: str = Field(..., description="Professional field or domain name", min_length=2, max_length=100)
    geo: Optional[str] = Field("", description="Geographic location (e.g., 'US', 'GB'). Empty for global.")
    timeframe: Optional[str] = Field("today 12-m", description="Time frame for trends (e.g., 'today 12-m', 'today 5-y')")
    
    class Config:
        json_schema_extra = {
            "example": {
                "field": "data science",
                "geo": "",
                "timeframe": "today 12-m"
            }
        }


class TrendItem(BaseModel):
    """Individual trend item."""
    keyword: str = Field(..., description="Trending keyword or phrase")
    score: int = Field(..., description="Interest score (0-100)")
    category: str = Field(..., description="Category: 'skill' or 'job_role'")
    
    class Config:
        json_schema_extra = {
            "example": {
                "keyword": "machine learning",
                "score": 85,
                "category": "skill"
            }
        }


class TrendResponse(BaseModel):
    """Response model for trend analysis."""
    field: str = Field(..., description="The analyzed professional field")
    total_trends: int = Field(..., description="Total number of trends found")
    skills: List[TrendItem] = Field(..., description="List of trending skills")
    job_roles: List[TrendItem] = Field(..., description="List of trending job roles")
    metadata: dict = Field(..., description="Additional metadata about the analysis")
    
    class Config:
        json_schema_extra = {
            "example": {
                "field": "data science",
                "total_trends": 15,
                "skills": [
                    {"keyword": "machine learning", "score": 85, "category": "skill"},
                    {"keyword": "python", "score": 78, "category": "skill"}
                ],
                "job_roles": [
                    {"keyword": "data scientist", "score": 92, "category": "job_role"},
                    {"keyword": "ml engineer", "score": 67, "category": "job_role"}
                ],
                "metadata": {
                    "timeframe": "today 12-m",
                    "geo": "global",
                    "timestamp": "2024-01-15T10:30:00Z"
                }
            }
        }


class ErrorResponse(BaseModel):
    """Error response model."""
    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Detailed error information")