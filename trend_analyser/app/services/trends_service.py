"""Google Trends service for fetching trending data."""

import logging
from typing import List, Tuple, Optional, Dict, Any
from pytrends.request import TrendReq
import pandas as pd
import time

from config import Config
from app.utils.keywords import KeywordProcessor

logger = logging.getLogger(__name__)

class GoogleTrendsService:
    """Service for interacting with Google Trends API."""
    
    def __init__(self):
        """Initialize the Google Trends service."""
        self.pytrends = None
        self._initialize_connection()
    
    def _initialize_connection(self) -> None:
        """Initialize connection to Google Trends."""
        try:
            self.pytrends = TrendReq(hl='en-US', tz=360)
            logger.info("Google Trends connection initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Google Trends connection: {e}")
            raise
    
    def _retry_request(self, func, *args, max_retries: int = 3, **kwargs):
        """Retry request with exponential backoff."""
        for attempt in range(max_retries):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                if attempt == max_retries - 1:
                    raise e
                wait_time = (2 ** attempt) + 1
                logger.warning(f"Request failed, retrying in {wait_time}s: {e}")
                time.sleep(wait_time)
    
    def get_trending_data(
        self, 
        field: str, 
        geo: str = "", 
        timeframe: str = "today 12-m"
    ) -> Tuple[List[Tuple[str, int, str]], Dict[str, Any]]:
        """
        Get trending skills and job roles for a specific field.
        
        Args:
            field: Professional field or domain name
            geo: Geographic location (empty for global)
            timeframe: Time frame for trends
            
        Returns:
            Tuple of (processed_trends, metadata)
        """
        try:
            # Enhance field keywords for better search results
            search_keywords = KeywordProcessor.enhance_field_keywords(
                field, Config.FIELD_ENHANCERS
            )
            
            all_trends = []
            metadata = {
                "field": field,
                "geo": geo or "global",
                "timeframe": timeframe,
                "search_keywords": search_keywords,
                "total_queries": 0,
                "successful_queries": 0
            }
            
            # Process each enhanced keyword
            for keyword in search_keywords[:5]:  # Limit to top 5 to avoid rate limits
                try:
                    trends_data = self._get_trends_for_keyword(keyword, geo, timeframe)
                    if trends_data:
                        all_trends.extend(trends_data)
                        metadata["successful_queries"] += 1
                    metadata["total_queries"] += 1
                    
                    # Rate limiting
                    time.sleep(1)
                    
                except Exception as e:
                    logger.warning(f"Failed to get trends for keyword '{keyword}': {e}")
                    continue
            
            # Remove duplicates and sort by score
            unique_trends = self._deduplicate_trends(all_trends)
            
            # Filter by minimum interest score
            filtered_trends = [
                trend for trend in unique_trends 
                if trend[1] >= Config.MIN_INTEREST_SCORE
            ]
            
            metadata["total_trends_found"] = len(filtered_trends)
            
            return filtered_trends, metadata
            
        except Exception as e:
            logger.error(f"Error getting trending data for field '{field}': {e}")
            raise
    
    def _get_trends_for_keyword(
        self, 
        keyword: str, 
        geo: str, 
        timeframe: str
    ) -> List[Tuple[str, int, str]]:
        """Get trends data for a specific keyword."""
        try:
            # Build payload for the keyword
            self._retry_request(
                self.pytrends.build_payload,
                [keyword],
                cat=0,
                timeframe=timeframe,
                geo=geo,
                gprop=''
            )
            
            trends_data = []
            
            # Get related topics
            try:
                related_topics = self._retry_request(self.pytrends.related_topics)
                if keyword in related_topics and related_topics[keyword]['top'] is not None:
                    topics_df = related_topics[keyword]['top']
                    trends_data.extend(self._process_topics_dataframe(topics_df))
                    
                if keyword in related_topics and related_topics[keyword]['rising'] is not None:
                    rising_topics_df = related_topics[keyword]['rising']
                    trends_data.extend(self._process_topics_dataframe(rising_topics_df))
                    
            except Exception as e:
                logger.warning(f"Failed to get related topics for '{keyword}': {e}")
            
            # Get related queries
            try:
                related_queries = self._retry_request(self.pytrends.related_queries)
                if keyword in related_queries and related_queries[keyword]['top'] is not None:
                    queries_df = related_queries[keyword]['top']
                    trends_data.extend(self._process_queries_dataframe(queries_df))
                    
                if keyword in related_queries and related_queries[keyword]['rising'] is not None:
                    rising_queries_df = related_queries[keyword]['rising']
                    trends_data.extend(self._process_queries_dataframe(rising_queries_df))
                    
            except Exception as e:
                logger.warning(f"Failed to get related queries for '{keyword}': {e}")
            
            return trends_data
            
        except Exception as e:
            logger.error(f"Error processing keyword '{keyword}': {e}")
            return []
    
    def _process_topics_dataframe(self, df: pd.DataFrame) -> List[Tuple[str, int, str]]:
        """Process topics dataframe into trend tuples."""
        if df is None or df.empty:
            return []
        
        trends = []
        for _, row in df.iterrows():
            try:
                topic_title = row.get('topic_title', '')
                value = row.get('value', 0)
                
                if topic_title and isinstance(value, (int, str)):
                    # Handle percentage strings like "100%" or ">100%"
                    if isinstance(value, str):
                        value = value.replace('>', '').replace('%', '').replace('+', '')
                        try:
                            value = int(value)
                        except ValueError:
                            continue
                    
                    keyword = KeywordProcessor.clean_keyword(topic_title)
                    if KeywordProcessor.is_valid_keyword(keyword):
                        category = KeywordProcessor.categorize_keyword(keyword)
                        trends.append((keyword, value, category))
                        
            except Exception as e:
                logger.warning(f"Error processing topic row: {e}")
                continue
        
        return trends
    
    def _process_queries_dataframe(self, df: pd.DataFrame) -> List[Tuple[str, int, str]]:
        """Process queries dataframe into trend tuples."""
        if df is None or df.empty:
            return []
        
        trends = []
        for _, row in df.iterrows():
            try:
                query = row.get('query', '')
                value = row.get('value', 0)
                
                if query and isinstance(value, (int, str)):
                    # Handle percentage strings
                    if isinstance(value, str):
                        value = value.replace('>', '').replace('%', '').replace('+', '')
                        try:
                            value = int(value)
                        except ValueError:
                            continue
                    
                    keyword = KeywordProcessor.clean_keyword(query)
                    if KeywordProcessor.is_valid_keyword(keyword):
                        category = KeywordProcessor.categorize_keyword(keyword)
                        trends.append((keyword, value, category))
                        
            except Exception as e:
                logger.warning(f"Error processing query row: {e}")
                continue
        
        return trends
    
    def _deduplicate_trends(self, trends: List[Tuple[str, int, str]]) -> List[Tuple[str, int, str]]:
        """Remove duplicate trends and keep the highest score."""
        trend_dict = {}
        
        for keyword, score, category in trends:
            if keyword in trend_dict:
                # Keep the higher score
                if score > trend_dict[keyword][1]:
                    trend_dict[keyword] = (keyword, score, category)
            else:
                trend_dict[keyword] = (keyword, score, category)
        
        # Sort by score descending
        return sorted(trend_dict.values(), key=lambda x: x[1], reverse=True)