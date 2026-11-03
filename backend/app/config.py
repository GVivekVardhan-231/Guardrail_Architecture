"""
Configuration Management for Prompt Injection Guardrail.
Loads from environment variables (.env) with validated defaults.
"""

import os
from pydantic import BaseModel
from typing import Optional

class Settings(BaseModel):
    # Application Info
    APP_NAME: str = "A Guardrail Architecture for Real-Time Prompt Injection Detection"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # LLM Settings
    LLM_API_KEY: Optional[str] = os.getenv("LLM_API_KEY", "")
    LLM_BASE_URL: str = os.getenv("LLM_BASE_URL", "https://api.openai.com/v1")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gpt-4o-mini")
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "demo")  # 'demo' or 'openai'

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./guardrail.db")

    # Risk Scoring Thresholds (0-100)
    RISK_THRESHOLD_LOW: float = float(os.getenv("RISK_THRESHOLD_LOW", "10.0"))
    RISK_THRESHOLD_MEDIUM: float = float(os.getenv("RISK_THRESHOLD_MEDIUM", "50.0"))
    RISK_THRESHOLD_HIGH: float = float(os.getenv("RISK_THRESHOLD_HIGH", "75.0"))

    # Dynamic Scoring Weights (Sum to 1.0)
    WEIGHT_RULES: float = float(os.getenv("WEIGHT_RULES", "0.25"))
    WEIGHT_ML: float = float(os.getenv("WEIGHT_ML", "0.25"))
    WEIGHT_SEMANTIC: float = float(os.getenv("WEIGHT_SEMANTIC", "0.25"))
    WEIGHT_CONTEXT: float = float(os.getenv("WEIGHT_CONTEXT", "0.15"))
    WEIGHT_OBFUSCATION: float = float(os.getenv("WEIGHT_OBFUSCATION", "0.10"))

    # Server settings
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", "8000"))
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

    # Paths
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    MODEL_DIR: str = os.path.join(BASE_DIR, "models")
    DATA_DIR: str = os.path.join(BASE_DIR, "data")

settings = Settings()
