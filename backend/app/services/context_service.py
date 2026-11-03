"""
Contextual Intent and Session State Analysis Service.
Tracks multi-turn conversation patterns and detects attack escalation,
such as benign pretexting followed by injection attempts.
"""

from typing import Dict, Any, List
from datetime import datetime, timezone

class ContextAnalysisService:
    def __init__(self):
        # In-memory session tracking cache (persisted to DB as well)
        self.session_store: Dict[str, List[Dict[str, Any]]] = {}

    def analyze(self, session_id: str, current_prompt: str, current_prelim_risk: float) -> Dict[str, Any]:
        """
        Analyzes prompt in relation to session history.
        Detects multi-turn probing, escalating risk, or manipulative context transitions.
        """
        if not session_id:
            session_id = "default"

        history = self.session_store.get(session_id, [])
        turn_count = len(history) + 1
        reasons: List[str] = []
        context_risk = 0.0
        escalation_detected = False

        if turn_count == 1:
            # First turn in session - evaluate standalone intent
            reasons.append("Initial interaction in session.")
            if current_prelim_risk > 60:
                context_risk = 30.0
                reasons.append("High-severity threat initiated immediately on first turn.")
            else:
                context_risk = 5.0
        else:
            # Multi-turn analysis
            recent_turns = history[-4:]
            avg_prior_risk = sum(t["risk_score"] for t in recent_turns) / len(recent_turns)
            prior_high_risk_count = sum(1 for t in recent_turns if t["risk_score"] >= 60.0)

            # 1. Escalation check: previous prompt discussed system instructions / safety, now attacking
            last_prompt = recent_turns[-1]["prompt"].lower()
            lower_current = current_prompt.lower()

            probing_keywords = ["system prompt", "instruction", "safety", "rules", "filter", "guideline", "restrictions"]
            injection_keywords = ["ignore", "bypass", "reveal", "disable", "override", "unrestricted", "dan"]

            if any(k in last_prompt for k in probing_keywords) and any(k in lower_current for k in injection_keywords):
                escalation_detected = True
                context_risk += 55.0
                reasons.append("Detected two-step reconnaissance escalation: prior probe of system bounds followed by injection directive.")

            # 2. Repeated violation penalty
            if prior_high_risk_count >= 2:
                context_risk += 35.0
                reasons.append(f"Multiple suspicious attempts ({prior_high_risk_count}) recorded in recent session turns.")

            # 3. Sudden risk jump from benign baseline
            if avg_prior_risk < 20.0 and current_prelim_risk >= 65.0:
                context_risk += 25.0
                reasons.append("Abrupt adversarial shift from previously benign conversation history.")

            # Base context risk tied to interaction momentum
            context_risk = max(context_risk, min(100.0, avg_prior_risk * 0.4 + (20.0 if current_prelim_risk > 50 else 0.0)))

        # Cap context risk between 0 and 100
        final_context_score = min(100.0, max(0.0, context_risk))

        return {
            "session_id": session_id,
            "turn_count": turn_count,
            "prior_threat_escalation": escalation_detected,
            "context_risk_score": round(float(final_context_score), 2),
            "reasons": reasons
        }

    def record_turn(self, session_id: str, prompt: str, risk_score: float, action: str):
        """Records a completed turn in session memory."""
        if not session_id:
            session_id = "default"
        if session_id not in self.session_store:
            self.session_store[session_id] = []

        self.session_store[session_id].append({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "prompt": prompt,
            "risk_score": risk_score,
            "action": action
        })

        # Keep last 15 turns in memory
        if len(self.session_store[session_id]) > 15:
            self.session_store[session_id] = self.session_store[session_id][-15:]

    def clear_session(self, session_id: str):
        if session_id in self.session_store:
            del self.session_store[session_id]

context_service = ContextAnalysisService()
