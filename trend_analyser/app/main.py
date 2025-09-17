"""FastAPI application main module."""

import logging
from typing import List
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.models.schemas import TrendRequest, TrendResponse, ErrorResponse
from app.services.processor import TrendProcessor

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Skills Trend Analyzer",
    description="Analyze trending skills and job roles for any professional field using Google Trends data",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize processor
processor = TrendProcessor()

@app.get("/", tags=["Health"])
async def root():
    """Health check endpoint."""
    return {
        "message": "Skills Trend Analyzer API",
        "status": "healthy",
        "version": "1.0.0"
    }

@app.get("/health", tags=["Health"])
async def health_check():
    """Detailed health check."""
    from datetime import datetime
    return {
        "status": "healthy",
        "service": "Skills Trend Analyzer",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

@app.post("/analyze", response_model=TrendResponse, tags=["Trends"])
async def analyze_trends(request: TrendRequest):
    """
    Analyze trending skills and job roles for a professional field.
    
    This endpoint uses Google Trends data to identify high-demand skills
    and job roles within the specified field.
    """
    try:
        logger.info(f"Analyzing trends for field: {request.field}")
        
        result = await processor.analyze_field_trends(
            field=request.field,
            geo=request.geo,
            timeframe=request.timeframe
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Error analyzing trends: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze trends: {str(e)}"
        )

@app.get("/analyze/{field}", response_model=TrendResponse, tags=["Trends"])
async def analyze_trends_get(
    field: str,
    geo: str = Query("", description="Geographic location (e.g., 'US', 'GB'). Empty for global."),
    timeframe: str = Query("today 12-m", description="Time frame for trends")
):
    """
    Analyze trending skills and job roles for a professional field (GET method).
    
    Alternative endpoint that accepts parameters via URL path and query parameters.
    """
    try:
        request = TrendRequest(field=field, geo=geo, timeframe=timeframe)
        return await analyze_trends(request)
        
    except Exception as e:
        logger.error(f"Error analyzing trends: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze trends: {str(e)}"
        )

@app.get("/suggestions", tags=["Utilities"])
async def get_field_suggestions(q: str = Query(..., description="Partial field name for suggestions")):
    """
    Get field name suggestions based on partial input.
    
    Useful for autocomplete functionality in frontend applications.
    """
    try:
        if len(q.strip()) < 2:
            raise HTTPException(
                status_code=400,
                detail="Query must be at least 2 characters long"
            )
        
        suggestions = processor.get_field_suggestions(q)
        
        return {
            "query": q,
            "suggestions": suggestions,
            "count": len(suggestions)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting suggestions: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get suggestions: {str(e)}"
        )

@app.get("/fields", tags=["Utilities"])
async def get_supported_fields():
    """
    Get list of well-supported professional fields.
    
    Returns fields that have enhanced keyword mappings for better results.
    """
    from config import Config
    
    return {
        "supported_fields": list(Config.FIELD_ENHANCERS.keys()),
        "note": "These fields have enhanced keyword mappings for better trend analysis. Other fields are also supported.",
        "total_count": len(Config.FIELD_ENHANCERS)
    }

@app.exception_handler(404)
async def not_found_handler(request, exc):
    """Handle 404 errors."""
    return JSONResponse(
        status_code=404,
        content={"error": "Endpoint not found", "detail": "The requested endpoint does not exist."}
    )

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    """Handle internal server errors."""
    logger.error(f"Internal server error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": "An unexpected error occurred."}
    )