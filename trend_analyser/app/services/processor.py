"""Data processing service for trend analysis results."""

import logging
from typing import List, Tuple, Dict, Any
from datetime import datetime

from app.models.schemas import TrendItem, TrendResponse
from app.services.trends_service import GoogleTrendsService

logger = logging.getLogger(__name__)

class TrendProcessor:
    """Processes and formats trend analysis results."""
    
    def __init__(self):
        """Initialize the trend processor."""
        self.trends_service = GoogleTrendsService()
    
    async def analyze_field_trends(
        self, 
        field: str, 
        geo: str = "", 
        timeframe: str = "today 12-m"
    ) -> TrendResponse:
        """
        Analyze trends for a specific professional field.
        
        Args:
            field: Professional field or domain name
            geo: Geographic location
            timeframe: Time frame for analysis
            
        Returns:
            TrendResponse with categorized trends
        """
        try:
            logger.info(f"Starting trend analysis for field: {field}")
            
            # Get trending data from Google Trends
            trends_data, metadata = self.trends_service.get_trending_data(
                field=field,
                geo=geo,
                timeframe=timeframe
            )
            
            # Separate skills and job roles
            skills, job_roles = self._categorize_trends(trends_data)
            
            # Create response metadata
            response_metadata = {
                **metadata,
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "skills_count": len(skills),
                "job_roles_count": len(job_roles)
            }
            
            # Create response
            response = TrendResponse(
                field=field,
                total_trends=len(trends_data),
                skills=skills,
                job_roles=job_roles,
                metadata=response_metadata
            )
            
            logger.info(f"Trend analysis completed for field: {field}. Found {len(skills)} skills and {len(job_roles)} job roles")
            return response
            
        except Exception as e:
            logger.error(f"Error analyzing trends for field '{field}': {e}")
            raise
    
    def _categorize_trends(self, trends_data: List[Tuple[str, int, str]]) -> Tuple[List[TrendItem], List[TrendItem]]:
        """
        Categorize trends into skills and job roles.
        
        Args:
            trends_data: List of (keyword, score, category) tuples
            
        Returns:
            Tuple of (skills_list, job_roles_list)
        """
        skills = []
        job_roles = []
        
        for keyword, score, category in trends_data:
            trend_item = TrendItem(
                keyword=keyword,
                score=score,
                category=category
            )
            
            if category == "skill":
                skills.append(trend_item)
            else:  # category == "job_role"
                job_roles.append(trend_item)
        
        # Limit results to prevent overly large responses
        max_items = 20
        skills = skills[:max_items]
        job_roles = job_roles[:max_items]
        
        return skills, job_roles
    
    def get_field_suggestions(self, partial_field: str) -> List[str]:
        """
        Get field suggestions based on partial input.
        
        Args:
            partial_field: Partial field name
            
        Returns:
            List of suggested field names
        """
        from config import Config
        
        suggestions = []
        partial_lower = partial_field.lower()
        
        # Search in predefined field enhancers
        for field_name in Config.FIELD_ENHANCERS.keys():
            if partial_lower in field_name or field_name in partial_lower:
                suggestions.append(field_name)
        
        # Add some common variations
        common_fields = [
            "software engineering", "web development", "mobile development",
            "data science", "machine learning", "artificial intelligence",
            "digital marketing", "content marketing", "social media marketing",
            "financial analysis", "investment banking", "accounting",
            "nursing", "medical", "healthcare administration",
            "graphic design", "ui ux design", "product design",
            "business development", "sales management", "account management",
            "human resources", "talent acquisition", "organizational development",
            "business consulting", "management consulting", "strategy consulting",
            "teaching", "training", "educational technology"
        ]
        
        for field in common_fields:
            if partial_lower in field and field not in suggestions:
                suggestions.append(field)
        
        return suggestions[:10]  # Limit to 10 suggestions