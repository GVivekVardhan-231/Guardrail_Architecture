"""
GuardWall: A Multi-Layer Defensive Security Framework for Real-Time Prompt Injection Detection.
Acts as an inline security gateway between user prompts and Large Language Models.
"""

from guardwall.core import GuardWall, PromptBlockedException
from guardwall.types import (
    GuardDecision,
    PolicyAction,
    RiskLevel,
    RiskBreakdown,
    TimingBreakdown
)
from guardwall.middleware import GuardWallMiddleware

__version__ = "1.0.0"

__all__ = [
    "GuardWall",
    "PromptBlockedException",
    "GuardDecision",
    "PolicyAction",
    "RiskLevel",
    "RiskBreakdown",
    "TimingBreakdown",
    "GuardWallMiddleware",
]
