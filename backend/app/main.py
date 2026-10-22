from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as api_router
from app.config import settings
from app.storage.db import init_db

app = FastAPI(
    title="CodeShield AI API",
    description="Code security, Graphify blast radius, and Kimi AI Inference API",
    version="0.1.0",
)

# Initialize SQLite database schema
init_db()

# CORS configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes with /api prefix
app.include_router(api_router, prefix="/api")


@app.get("/")
def root():
    provider = settings.get_resolved_provider()
    return {
        "service": "CodeShield AI",
        "version": "0.1.0",
        "docs_url": "/docs",
        "health_check": "/api/health",
        "ai_provider": provider,
        "persistence": "SQLite"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.host, port=settings.port, reload=True, reload_dirs=["app"])
