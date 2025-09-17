"""Application runner script."""

import uvicorn
from config import Config

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=Config.API_HOST,
        port=Config.API_PORT,
        reload=Config.API_RELOAD,
        log_level="info"
    )