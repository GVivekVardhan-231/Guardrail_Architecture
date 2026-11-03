"""
End-to-End Guardrail Pipeline Orchestrator.
Executes Preprocessor -> Rules -> Embeddings -> ML -> Context -> Dynamic Risk Scoring -> Policy.
Measures high-resolution stage latency and provides comprehensive explainability.
"""

import time
import uuid
from datetime import datetime, timezone
from typing import Dict, Any

from app.config import settings
from app.detectors.preprocessor import preprocessor
from app.detectors.rule_detector import rule_detector
from app.detectors.semantic_detector import semantic_detector
from app.detectors.ml_detector import ml_detector
from app.services.context_service import context_service
from app.services.policy_engine import policy_engine

class GuardrailPipeline:
    def __init__(self):
        pass

    def inspect(self, prompt: str, session_id: str = "default") -> Dict[str, Any]:
        """
        Executes the complete inspection pipeline on an incoming prompt.
        """
        req_id = f"req_{uuid.uuid4().hex[:12]}"
        timestamp = datetime.now(timezone.utc).isoformat()
        start_total = time.perf_counter()

        # STEP 1: Input Preprocessing
        t0 = time.perf_counter()
        prep_res = preprocessor.process(prompt)
        t_prep_ms = (time.perf_counter() - t0) * 1000.0

        normalized_text = prep_res["normalized_text"]
        decoded_variants = prep_res["decoded_variants"]
        obf_score_pct = prep_res["obfuscation_score"] * 100.0

        # STEP 2: Rule-Based Detection
        t0 = time.perf_counter()
        rule_res = rule_detector.analyze(normalized_text, decoded_variants)
        t_rule_ms = (time.perf_counter() - t0) * 1000.0

        # STEP 3: ML Classification (TF-IDF + LogisticRegression)
        t0 = time.perf_counter()
        ml_res = ml_detector.analyze(normalized_text)
        t_ml_ms = (time.perf_counter() - t0) * 1000.0

        # STEP 4: Semantic Embedding Analysis (SentenceTransformer all-MiniLM-L6-v2)
        t0 = time.perf_counter()
        semantic_res = semantic_detector.analyze(normalized_text)
        t_sem_ms = (time.perf_counter() - t0) * 1000.0

        # Preliminary threat signal for contextual analysis
        prelim_threat = max(rule_res["rule_score"], ml_res["ml_score"], semantic_res["semantic_risk_score"])

        # STEP 5: Context / Intent Analysis
        t0 = time.perf_counter()
        context_res = context_service.analyze(session_id, prompt, prelim_threat)
        t_ctx_ms = (time.perf_counter() - t0) * 1000.0

        # STEP 6: Dynamic Risk Scoring Engine
        t0 = time.perf_counter()
        w_rules = settings.WEIGHT_RULES
        w_ml = settings.WEIGHT_ML
        w_semantic = settings.WEIGHT_SEMANTIC
        w_context = settings.WEIGHT_CONTEXT
        w_obf = settings.WEIGHT_OBFUSCATION

        raw_risk = (
            (w_rules * rule_res["rule_score"]) +
            (w_ml * ml_res["ml_score"]) +
            (w_semantic * semantic_res["semantic_risk_score"]) +
            (w_context * context_res["context_risk_score"]) +
            (w_obf * obf_score_pct)
        )

        # Multi-signal amplification: if 2 or more primary detectors strongly agree (> 70)
        strong_signals = sum([
            1 if rule_res["rule_score"] >= 70.0 else 0,
            1 if ml_res["ml_score"] >= 70.0 else 0,
            1 if semantic_res["semantic_risk_score"] >= 70.0 else 0
        ])
        if strong_signals >= 2:
            raw_risk = max(raw_risk, 82.0)

        # Critical rule override floor
        if rule_res["has_critical"]:
            raw_risk = max(raw_risk, 76.0)

        final_risk = min(100.0, max(0.0, raw_risk))
        risk_score = round(final_risk, 1)

        # Determine Risk Level
        if risk_score >= settings.RISK_THRESHOLD_HIGH:
            risk_level = "CRITICAL"
        elif risk_score >= settings.RISK_THRESHOLD_MEDIUM:
            risk_level = "HIGH"
        elif risk_score >= settings.RISK_THRESHOLD_LOW:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        # Classification label
        classification = "PROMPT_INJECTION" if risk_score >= 35.0 or ml_res["classification"] == "PROMPT_INJECTION" else "BENIGN"

        # Identify dominant attack category
        if classification == "BENIGN":
            attack_type = "BENIGN"
        elif rule_res["detected_rules"]:
            attack_type = rule_res["detected_rules"][0]["category"]
        elif prep_res["obfuscation_detected"] and obf_score_pct > 40:
            attack_type = "OBFUSCATION"
        elif semantic_res["nearest_attack_type"] not in ["UNKNOWN", "ERROR"]:
            attack_type = semantic_res["nearest_attack_type"]
        else:
            attack_type = "DIRECT_INJECTION"

        t_risk_ms = (time.perf_counter() - t0) * 1000.0

        # STEP 7: Policy Enforcement Engine
        policy_res = policy_engine.evaluate(
            risk_score=risk_score,
            risk_level=risk_level,
            detected_rules=rule_res["detected_rules"],
            original_prompt=prompt,
            obfuscation_detected=prep_res["obfuscation_detected"]
        )

        total_latency_ms = (time.perf_counter() - start_total) * 1000.0

        # Explainability Builder
        explainability = self._build_explainability(
            rule_res=rule_res,
            ml_res=ml_res,
            semantic_res=semantic_res,
            context_res=context_res,
            prep_res=prep_res,
            risk_score=risk_score,
            risk_level=risk_level,
            action=policy_res["action"]
        )

        return {
            "request_id": req_id,
            "timestamp": timestamp,
            "original_prompt": prompt,
            "risk_score": risk_score,
            "risk_level": risk_level,
            "classification": classification,
            "action": policy_res["action"],
            "attack_type": attack_type,
            "policy_reason": policy_res["policy_reason"],
            "sanitized_prompt": policy_res["sanitized_prompt"],
            "rewritten_prompt": policy_res["rewritten_prompt"],
            "effective_prompt": policy_res["effective_prompt"],
            "detected_rules": rule_res["detected_rules"],
            "semantic_similarity": semantic_res,
            "ml_prediction": ml_res,
            "context_analysis": context_res,
            "risk_breakdown": {
                "rule_score": rule_res["rule_score"],
                "ml_probability": ml_res["injection_probability"],
                "semantic_score": semantic_res["semantic_risk_score"],
                "context_score": context_res["context_risk_score"],
                "obfuscation_score": prep_res["obfuscation_score"],
                "weights_applied": {
                    "rules": w_rules,
                    "ml": w_ml,
                    "semantic": w_semantic,
                    "context": w_context,
                    "obfuscation": w_obf
                }
            },
            "timing": {
                "preprocessing_ms": round(t_prep_ms, 2),
                "rule_detector_ms": round(t_rule_ms, 2),
                "ml_inference_ms": round(t_ml_ms, 2),
                "semantic_embedding_ms": round(t_sem_ms, 2),
                "context_analysis_ms": round(t_ctx_ms, 2),
                "risk_scoring_ms": round(t_risk_ms, 2),
                "total_latency_ms": round(total_latency_ms, 2)
            },
            "explainability": explainability
        }

    def _build_explainability(
        self,
        rule_res: Dict,
        ml_res: Dict,
        semantic_res: Dict,
        context_res: Dict,
        prep_res: Dict,
        risk_score: float,
        risk_level: str,
        action: str
    ) -> list:
        factors = []

        if rule_res["detected_rules"]:
            for r in rule_res["detected_rules"]:
                factors.append(f"Rule Matched [{r['severity']}]: '{r['rule_name']}' matched text: \"{r['matched_text']}\"")
        else:
            factors.append("Rule Engine: No known injection signatures or forbidden keywords matched.")

        if ml_res["injection_probability"] > 0.65:
            factors.append(f"ML Classifier: High injection probability ({ml_res['injection_probability']:.1%}) based on learned structural features.")
        elif ml_res["injection_probability"] < 0.25:
            factors.append(f"ML Classifier: High confidence benign pattern ({ml_res['benign_probability']:.1%}).")
        else:
            factors.append(f"ML Classifier: Moderate probability ({ml_res['injection_probability']:.1%}).")

        if semantic_res["semantic_risk_score"] > 60:
            factors.append(f"Semantic Embedding: Vector cosine similarity ({semantic_res['malicious_similarity']:.2f}) aligned closely with known attack archetype: \"{semantic_res['nearest_attack_example']}\".")
        elif semantic_res["legitimate_similarity"] > 0.60:
            factors.append(f"Semantic Embedding: Strong affinity ({semantic_res['legitimate_similarity']:.2f}) with legitimate domain knowledge: \"{semantic_res['nearest_legitimate_example']}\".")

        if prep_res["obfuscation_detected"]:
            for anom in prep_res["anomalies"]:
                factors.append(f"Preprocessor Anomaly: {anom}")

        if context_res.get("prior_threat_escalation"):
            factors.append("Contextual Intent: Multi-turn reconnaissance escalation pattern confirmed.")

        factors.append(f"Policy Decision: {action} action assigned based on composite {risk_level} threat level ({risk_score}/100).")
        return factors

guardrail_pipeline = GuardrailPipeline()
