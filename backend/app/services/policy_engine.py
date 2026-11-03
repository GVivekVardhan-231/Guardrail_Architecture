"""
Policy Engine for Guardrail Architecture.
Maps calculated dynamic risk scores and detected threats to deterministic enforcement actions:
ALLOW, SANITIZE, REWRITE, BLOCK.
"""

from typing import Dict, Any, Optional
from app.config import settings
from app.services.sanitizer import prompt_sanitizer

class PolicyEngine:
    def evaluate(
        self,
        risk_score: float,
        risk_level: str,
        detected_rules: list,
        original_prompt: str,
        obfuscation_detected: bool
    ) -> Dict[str, Any]:
        """
        Determines the enforcement action and prepares transformed prompts where applicable.
        """
        threshold_low = settings.RISK_THRESHOLD_LOW
        threshold_med = settings.RISK_THRESHOLD_MEDIUM
        threshold_high = settings.RISK_THRESHOLD_HIGH

        has_critical_rule = any(r.get("severity") == "CRITICAL" for r in detected_rules)
        has_high_rule = any(r.get("severity") == "HIGH" for r in detected_rules)

        # Check for pure non-recoverable attack vectors
        has_pure_leak_or_jailbreak = any(
            r.get("category") in ["SYSTEM_PROMPT_EXTRACTION", "JAILBREAK", "DATA_EXFILTRATION"]
            for r in detected_rules
        )

        action = "ALLOW"
        reason = ""
        sanitized_prompt: Optional[str] = None
        rewritten_prompt: Optional[str] = None
        effective_prompt: Optional[str] = original_prompt

        # Attempt sanitization check for mixed prompts with recoverable benign intent
        san_res = prompt_sanitizer.sanitize(original_prompt)

        # 1. Recoverable Mixed Prompts (e.g. "Ignore previous instructions. Explain recursion in C++.")
        if san_res["success"] and san_res["sanitized_prompt"] and not has_pure_leak_or_jailbreak:
            action = "SANITIZE"
            sanitized_prompt = san_res["sanitized_prompt"]
            effective_prompt = sanitized_prompt
            reason = f"Sanitized suspicious injection clauses while preserving legitimate query intent ('{sanitized_prompt}')."
            return {
                "action": action,
                "policy_reason": reason,
                "sanitized_prompt": sanitized_prompt,
                "rewritten_prompt": None,
                "effective_prompt": effective_prompt
            }

        # 2. CRITICAL THREAT (Score >= HIGH THRESHOLD or critical rule trigger)
        if risk_score >= threshold_high or (has_critical_rule and risk_score >= 50.0):
            action = "BLOCK"
            if has_critical_rule:
                rule_names = ", ".join([r.get("rule_name") for r in detected_rules if r.get("severity") == "CRITICAL"])
                reason = f"Request blocked due to critical prompt injection signature ({rule_names}) and severe risk score ({risk_score}/100)."
            else:
                reason = f"Request blocked because dynamic risk score ({risk_score}/100) exceeded critical security threshold."
            effective_prompt = None

        # 3. HIGH THREAT (threshold_med <= Score < threshold_high)
        elif risk_score >= threshold_med:
            action = "BLOCK"
            reason = (
                f"Request cannot be fulfilled as requested: dynamic risk score ({risk_score}/100) "
                f"exceeds the medium-risk threshold (>= {threshold_med}). "
                "Safe alternative: Reframe the inquiry to focus on theoretical cybersecurity concepts or threat defense."
            )
            effective_prompt = None

        # 4. MEDIUM / ELEVATED THREAT (threshold_low <= Score < threshold_med)
        elif risk_score >= threshold_low:
            action = "BLOCK"
            reason = (
                f"Request cannot be fulfilled as requested: dynamic risk score ({risk_score}/100) "
                f"meets or exceeds the safety threshold (>= {threshold_low}). "
                "Safe alternative: Reframe the query to focus strictly on defensive principles, "
                "remediation guidelines, or abstract security concepts."
            )
            effective_prompt = None

        # 5. LOW THREAT (Score < threshold_low)
        else:
            action = "ALLOW"
            reason = f"Prompt verified benign and safe. Risk score: {risk_score}/100 (< {threshold_low} threshold)."
            effective_prompt = original_prompt

        return {
            "action": action,
            "policy_reason": reason,
            "sanitized_prompt": sanitized_prompt,
            "rewritten_prompt": rewritten_prompt,
            "effective_prompt": effective_prompt
        }

policy_engine = PolicyEngine()
