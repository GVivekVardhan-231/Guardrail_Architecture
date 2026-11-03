"""
Types and Data Structures for GuardWall Framework.
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Dict, Any, List, Optional


class PolicyAction(str, Enum):
    ALLOW = "ALLOW"
    SANITIZE = "SANITIZE"
    REWRITE = "REWRITE"
    BLOCK = "BLOCK"


class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


@dataclass
class TimingBreakdown:
    total_latency_ms: float
    preprocessing_ms: float
    rule_detector_ms: float
    ml_inference_ms: float
    semantic_embedding_ms: float
    context_analysis_ms: float
    risk_scoring_ms: float
    policy_enforcement_ms: float


@dataclass
class RiskBreakdown:
    rule_score: float
    ml_probability: float
    semantic_score: float
    context_score: float
    obfuscation_score: float
    weights_applied: Dict[str, float]


@dataclass
class GuardDecision:
    """
    The verdict produced by the GuardWall for an intercepted prompt.
    """
    request_id: str
    original_prompt: str
    effective_prompt: str
    action: PolicyAction
    risk_score: float
    risk_level: RiskLevel
    classification: str
    attack_type: str
    policy_reason: str
    is_blocked: bool
    is_sanitized: bool
    sanitized_prompt: Optional[str]
    rewritten_prompt: Optional[str]
    detected_rules: List[Dict[str, Any]]
    risk_breakdown: RiskBreakdown
    timing: TimingBreakdown
    raw_analysis: Dict[str, Any] = field(default_factory=dict)

    @property
    def passed(self) -> bool:
        """Returns True if the prompt is allowed through to the LLM (either directly, sanitized, or rewritten)."""
        return not self.is_blocked
