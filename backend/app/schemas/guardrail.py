"""
Pydantic Schemas for Prompt Injection Guardrail API.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class AnalyzeRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=10000, description="User prompt to inspect")
    session_id: Optional[str] = Field("default", description="Client session identifier")

class RuleHit(BaseModel):
    rule_id: str
    rule_name: str
    category: str
    severity: str  # LOW, MEDIUM, HIGH, CRITICAL
    matched_text: str
    confidence_contribution: float
    description: str

class SemanticSimilarityDetail(BaseModel):
    malicious_similarity: float
    legitimate_similarity: float
    nearest_attack_type: str
    nearest_attack_example: str
    nearest_legitimate_example: str
    semantic_risk_score: float

class MLPredictionDetail(BaseModel):
    classification: str
    injection_probability: float
    benign_probability: float
    model_name: str
    top_contributing_features: List[Dict[str, Any]] = []

class ContextAnalysisDetail(BaseModel):
    session_id: str
    turn_count: int
    prior_threat_escalation: bool
    context_risk_score: float
    reasons: List[str] = []

class TimingBreakdown(BaseModel):
    preprocessing_ms: float
    rule_detector_ms: float
    ml_inference_ms: float
    semantic_embedding_ms: float
    context_analysis_ms: float
    risk_scoring_ms: float
    total_latency_ms: float

class RiskBreakdown(BaseModel):
    rule_score: float
    ml_probability: float
    semantic_score: float
    context_score: float
    obfuscation_score: float
    weights_applied: Dict[str, float]

class AnalyzeResponse(BaseModel):
    request_id: str
    timestamp: str
    original_prompt: str
    risk_score: float
    risk_level: str  # LOW, MEDIUM, HIGH, CRITICAL
    classification: str  # BENIGN, PROMPT_INJECTION
    action: str  # ALLOW, SANITIZE, REWRITE, BLOCK
    attack_type: str
    policy_reason: str
    sanitized_prompt: Optional[str] = None
    rewritten_prompt: Optional[str] = None
    detected_rules: List[RuleHit] = []
    semantic_similarity: SemanticSimilarityDetail
    ml_prediction: MLPredictionDetail
    context_analysis: ContextAnalysisDetail
    risk_breakdown: RiskBreakdown
    timing: TimingBreakdown
    explainability: List[str] = []

class ChatRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=10000)
    session_id: Optional[str] = "default"

class ChatResponse(BaseModel):
    request_id: str
    timestamp: str
    session_id: str
    original_prompt: str
    effective_prompt: Optional[str] = None
    action: str
    risk_score: float
    risk_level: str
    classification: str
    attack_type: str
    llm_status: str
    llm_response: Optional[str] = None
    policy_reason: str
    guardrail_analysis: AnalyzeResponse

class LogEntry(BaseModel):
    id: str
    session_id: str
    timestamp: str
    original_prompt: str
    sanitized_prompt: Optional[str]
    rewritten_prompt: Optional[str]
    classification: str
    risk_score: float
    risk_level: str
    action: str
    attack_type: str
    total_latency_ms: float
    llm_status: str

class SecurityEventItem(BaseModel):
    id: int
    request_id: str
    timestamp: str
    risk_score: float
    risk_level: str
    classification: str
    attack_type: str
    action: str
    summary: str

class DashboardStats(BaseModel):
    total_analyzed: int
    benign_count: int
    injection_count: int
    blocked_count: int
    sanitized_count: int
    rewritten_count: int
    allowed_count: int
    avg_risk_score: float
    avg_latency_ms: float
    attack_categories: Dict[str, int]
    risk_distribution: Dict[str, int]
    action_distribution: Dict[str, int]

class TrendItem(BaseModel):
    time_label: str
    total: int
    benign: int
    attacks: int
    blocked: int
    avg_risk: float

class HealthStatus(BaseModel):
    status: str
    timestamp: str
    backend: str
    database: str
    ml_classifier: str
    semantic_embeddings: str
    llm_gateway: str
    device: str
    version: str

class ConfigSchema(BaseModel):
    RISK_THRESHOLD_LOW: float
    RISK_THRESHOLD_MEDIUM: float
    RISK_THRESHOLD_HIGH: float
    WEIGHT_RULES: float
    WEIGHT_ML: float
    WEIGHT_SEMANTIC: float
    WEIGHT_CONTEXT: float
    WEIGHT_OBFUSCATION: float
    LLM_PROVIDER: str
    LLM_MODEL: str
