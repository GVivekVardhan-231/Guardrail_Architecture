"""
SQLAlchemy ORM models for requests, security logs, detections, and metrics.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, Text, DateTime, JSON, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

class RequestLog(Base):
    __tablename__ = "requests"

    id = Column(String(64), primary_key=True, index=True)
    session_id = Column(String(64), index=True, default="default")
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    original_prompt = Column(Text, nullable=False)
    sanitized_prompt = Column(Text, nullable=True)
    rewritten_prompt = Column(Text, nullable=True)
    classification = Column(String(32), nullable=False, index=True)  # BENIGN, PROMPT_INJECTION
    risk_score = Column(Float, nullable=False)
    risk_level = Column(String(16), nullable=False, index=True)      # LOW, MEDIUM, HIGH, CRITICAL
    action = Column(String(16), nullable=False, index=True)          # ALLOW, SANITIZE, REWRITE, BLOCK
    attack_type = Column(String(64), default="BENIGN", index=True)
    total_latency_ms = Column(Float, default=0.0)
    llm_status = Column(String(32), default="NOT_CALLED")            # SUCCESS, NOT_CALLED, FAILED, BLOCKED
    llm_response = Column(Text, nullable=True)

    detection = relationship("DetectionDetail", back_populates="request", uselist=False, cascade="all, delete-orphan")
    security_events = relationship("SecurityEvent", back_populates="request", cascade="all, delete-orphan")

class DetectionDetail(Base):
    __tablename__ = "detections"

    id = Column(Integer, primary_key=True, autoincrement=True)
    request_id = Column(String(64), ForeignKey("requests.id"), unique=True, index=True)
    rule_score = Column(Float, default=0.0)
    ml_probability = Column(Float, default=0.0)
    semantic_score = Column(Float, default=0.0)
    context_score = Column(Float, default=0.0)
    obfuscation_score = Column(Float, default=0.0)
    
    detected_rules = Column(JSON, default=list)
    ml_details = Column(JSON, default=dict)
    semantic_details = Column(JSON, default=dict)
    context_details = Column(JSON, default=dict)
    timing_breakdown = Column(JSON, default=dict)

    request = relationship("RequestLog", back_populates="detection")

class SecurityEvent(Base):
    __tablename__ = "security_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    request_id = Column(String(64), ForeignKey("requests.id"), index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    risk_score = Column(Float, nullable=False)
    risk_level = Column(String(16), nullable=False, index=True)
    classification = Column(String(32), nullable=False)
    attack_type = Column(String(64), nullable=False)
    action = Column(String(16), nullable=False)
    summary = Column(Text, nullable=True)

    request = relationship("RequestLog", back_populates="security_events")

class SessionContext(Base):
    __tablename__ = "sessions"

    id = Column(String(64), primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    prompt_count = Column(Integer, default=0)
    last_risk_score = Column(Float, default=0.0)
    accumulated_risk = Column(Float, default=0.0)
    flagged_attempts = Column(Integer, default=0)

class ModelMetricRecord(Base):
    __tablename__ = "model_metrics"

    id = Column(Integer, primary_key=True, autoincrement=True)
    trained_at = Column(DateTime, default=datetime.utcnow)
    model_name = Column(String(128))
    accuracy = Column(Float)
    precision = Column(Float)
    recall = Column(Float)
    f1_score = Column(Float)
    roc_auc = Column(Float)
    total_samples = Column(Integer)
    train_samples = Column(Integer)
    test_samples = Column(Integer)
    metadata_json = Column(JSON)
