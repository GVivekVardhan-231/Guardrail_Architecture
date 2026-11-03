"""
Main FastAPI Application Entrypoint for Prompt Injection Guardrail.
Initializes CORS, database schemas, preloads ML models, and mounts routers.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database import init_db, SessionLocal
from app.api.routes import router as api_router, seed_demo_data
from app.models.db_models import RequestLog

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB and preload models
    print(f"Starting {settings.APP_NAME} v{settings.VERSION}...")
    init_db()

    # Preload ML classifier
    from app.detectors.ml_detector import ml_detector
    if not ml_detector.is_ready:
        print("Preloading ML Classifier...")
        ml_detector.reload()

    # Preload Semantic detector
    from app.detectors.semantic_detector import semantic_detector
    if not semantic_detector.is_ready:
        print("Preloading Semantic Embedding Detector...")

    # Seed demo logs if DB is freshly created
    try:
        db = SessionLocal()
        count = db.query(RequestLog).count()
        if count == 0:
            print("Database empty. Seeding realistic demo records for dashboard visualization...")
            seed_demo_data(db)
        db.close()
    except Exception as e:
        print(f"Notice: Demo seed check: {e}")

    print("Guardrail Architecture is fully operational and ready to intercept prompts.")
    yield
    print("Shutting down Guardrail Architecture.")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Real-Time Multi-Layer Guardrail Architecture for Prompt Injection Detection in LLMs",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes
app.include_router(api_router)

# Mount direct /v1 endpoints for standard OpenAI SDK clients (e.g. base_url="http://localhost:8000/v1")
from app.api.routes import openai_compatible_chat_proxy, openai_compatible_models
app.add_api_route("/v1/chat/completions", openai_compatible_chat_proxy, methods=["POST"])
app.add_api_route("/v1/models", openai_compatible_models, methods=["GET"])

@app.get("/")
def root():
    return {
        "project": "GuardWall LLM Security Framework",
        "version": settings.VERSION,
        "status": "OPERATIONAL",
        "documentation": "/docs",
        "endpoints": {
            "analyze": "POST /api/analyze",
            "chat": "POST /api/chat",
            "openai_proxy": "POST /v1/chat/completions",
            "logs": "GET /api/logs",
            "stats": "GET /api/stats",
            "trends": "GET /api/stats/trends",
            "health": "GET /api/health",
            "metrics": "GET /api/model/metrics"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
