"""Keyword filtering and categorization utilities."""

import re
from typing import List, Tuple, Set

class KeywordProcessor:
    """Processes and categorizes keywords from Google Trends data."""
    
    # Common skill-related terms
    SKILL_INDICATORS = {
        'programming', 'coding', 'development', 'framework', 'library', 'language',
        'tool', 'software', 'platform', 'technology', 'skill', 'certification',
        'training', 'course', 'learning', 'tutorial', 'guide', 'api', 'database',
        'cloud', 'analytics', 'analysis', 'modeling', 'visualization', 'design',
        'testing', 'deployment', 'automation', 'optimization', 'algorithm',
        'machine learning', 'ai', 'artificial intelligence', 'data mining',
        'statistics', 'mathematics', 'research', 'methodology', 'technique'
    }
    
    # Common job role indicators
    JOB_ROLE_INDICATORS = {
        'engineer', 'developer', 'analyst', 'scientist', 'manager', 'director',
        'lead', 'senior', 'junior', 'intern', 'specialist', 'consultant',
        'architect', 'administrator', 'coordinator', 'supervisor', 'executive',
        'officer', 'representative', 'associate', 'assistant', 'technician',
        'researcher', 'designer', 'strategist', 'advisor', 'expert', 'professional',
        'job', 'career', 'position', 'role', 'employment', 'work', 'hiring',
        'recruitment', 'vacancy', 'opportunity', 'salary', 'interview'
    }
    
    # Terms to exclude (too generic or irrelevant)
    EXCLUDE_TERMS = {
        'google', 'search', 'online', 'free', 'best', 'top', 'how to', 'what is',
        'vs', 'comparison', 'review', 'price', 'cost', 'cheap', 'download',
        'install', 'tutorial', 'course', 'book', 'pdf', 'video', 'youtube',
        'blog', 'article', 'news', 'update', 'latest', 'new', 'trending',
        'popular', 'common', 'basic', 'beginner', 'advanced', 'professional'
    }
    
    @classmethod
    def clean_keyword(cls, keyword: str) -> str:
        """Clean and normalize keyword."""
        if not keyword or not isinstance(keyword, str):
            return ""
        
        # Convert to lowercase and strip
        keyword = keyword.lower().strip()
        
        # Remove special characters but keep spaces and hyphens
        keyword = re.sub(r'[^\w\s\-]', '', keyword)
        
        # Remove extra whitespace
        keyword = re.sub(r'\s+', ' ', keyword)
        
        return keyword
    
    @classmethod
    def is_valid_keyword(cls, keyword: str, min_length: int = 2) -> bool:
        """Check if keyword is valid for analysis."""
        if not keyword or len(keyword) < min_length:
            return False
        
        # Check if keyword is in exclude list
        keyword_lower = keyword.lower()
        for exclude_term in cls.EXCLUDE_TERMS:
            if exclude_term in keyword_lower:
                return False
        
        # Check if it's just numbers
        if keyword.isdigit():
            return False
        
        # Check if it contains at least one letter
        if not re.search(r'[a-zA-Z]', keyword):
            return False
        
        return True
    
    @classmethod
    def categorize_keyword(cls, keyword: str) -> str:
        """Categorize keyword as 'skill' or 'job_role'."""
        keyword_lower = keyword.lower()
        
        # Check for job role indicators
        job_score = sum(1 for indicator in cls.JOB_ROLE_INDICATORS 
                       if indicator in keyword_lower)
        
        # Check for skill indicators
        skill_score = sum(1 for indicator in cls.SKILL_INDICATORS 
                         if indicator in keyword_lower)
        
        # Additional heuristics
        if any(word in keyword_lower for word in ['engineer', 'developer', 'analyst', 'manager', 'scientist']):
            return 'job_role'
        
        if any(word in keyword_lower for word in ['programming', 'coding', 'framework', 'language', 'tool']):
            return 'skill'
        
        # If scores are equal or both zero, use length-based heuristic
        if job_score == skill_score:
            # Shorter terms are more likely to be skills, longer ones job roles
            return 'skill' if len(keyword_lower.split()) <= 2 else 'job_role'
        
        return 'job_role' if job_score > skill_score else 'skill'
    
    @classmethod
    def process_trends_data(cls, topics_data: List, queries_data: List, field: str) -> List[Tuple[str, int, str]]:
        """Process Google Trends data and return categorized keywords."""
        processed_keywords = []
        seen_keywords = set()
        
        # Process related topics
        for _, row in topics_data.iterrows() if hasattr(topics_data, 'iterrows') else []:
            if hasattr(row, 'topic_title') and hasattr(row, 'value'):
                keyword = cls.clean_keyword(row.topic_title)
                score = row.value if isinstance(row.value, int) else 0
                
                if keyword and cls.is_valid_keyword(keyword) and keyword not in seen_keywords:
                    category = cls.categorize_keyword(keyword)
                    processed_keywords.append((keyword, score, category))
                    seen_keywords.add(keyword)
        
        # Process related queries
        for _, row in queries_data.iterrows() if hasattr(queries_data, 'iterrows') else []:
            if hasattr(row, 'query') and hasattr(row, 'value'):
                keyword = cls.clean_keyword(row.query)
                score = row.value if isinstance(row.value, int) else 0
                
                if keyword and cls.is_valid_keyword(keyword) and keyword not in seen_keywords:
                    category = cls.categorize_keyword(keyword)
                    processed_keywords.append((keyword, score, category))
                    seen_keywords.add(keyword)
        
        # Sort by score descending
        processed_keywords.sort(key=lambda x: x[1], reverse=True)
        
        return processed_keywords
    
    @classmethod
    def enhance_field_keywords(cls, field: str, enhancers: dict) -> List[str]:
        """Get enhanced keywords for better field-specific search."""
        field_lower = field.lower()
        keywords = [field]
        
        # Add exact match enhancers
        if field_lower in enhancers:
            keywords.extend(enhancers[field_lower])
        
        # Add partial match enhancers
        for key, values in enhancers.items():
            if any(word in field_lower for word in key.split()):
                keywords.extend(values)
        
        return list(set(keywords))  # Remove duplicates