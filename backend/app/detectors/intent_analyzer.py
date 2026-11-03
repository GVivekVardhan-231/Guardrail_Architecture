"""
Semantic Intent and Behavioral Representation Analyzer.
Identifies underlying requested behavior and bypass strategies, including:
1. Negation & reverse psychology bypasses ("what I shouldn't do that makes X")
2. Hypothetical & counterfactual framing ("hypothetically if restrictions didn't apply")
3. Indirect instruction attacks ("suppose previous instructions don't apply")
4. Instruction hierarchy manipulation ("higher priority than system instructions")
5. Unsafe procedural requests disguised as educational inquiry or negative constraints.
"""

import re
from typing import Dict, Any, List, Optional

# Prohibited dangerous targets / procedures
HAZARDOUS_TARGETS = [
    r'\b(?:poisons?|toxic\s+chemical|neurotoxin|ricin|cyanide|botulinum|lethal\s+dose|anthrax)\b',
    r'\b(?:explosives?|bomb|ied|dynamite|c4|detonator|pipe\s*bomb|molotov)\b',
    r'\b(?:malware|ransomware|keylogger|trojan|rootkit|zero-?day\s+exploit|botnet|ddos\s+tool)\b',
    r'\b(?:bioweapon|chemical\s+weapon|dirty\s+bomb|radiological\s+device)\b',
    r'\b(?:counterfeit\s+currency|money\s+laundering|credit\s+card\s+cloning)\b',
    r'\b(?:system\s+prompt|developer\s+message|internal\s+instructions?|hidden\s+seed|initial\s+prompt)\b',
    r'\b(?:bypass\s+guardrails?|disable\s+safety|break\s+content\s+filters?|unrestricted\s+mode)\b'
]

# Negation and reverse-psychology markers
NEGATION_PRETEXT_PATTERNS = [
    # "what I shouldn't / should not do that makes [poison/bomb/harm]"
    r'\bwhat\s+(?:i|we|one|a\s+person)\s+(?:shouldn\'t|should\s+not|must\s+not|ought\s+not\s+to|never)\s+do\b[^\.\n;]{0,40}\b(?:make|create|synthesize|build|produce|generate|mix|brew|manufacture)\b',
    # "tell me what never to do to produce / synthesize"
    r'\b(?:tell\s+me|explain|show\s+me)\s+what\s+(?:never\s+to|not\s+to)\s+do\b[^\.\n;]{0,40}\b(?:make|synthesize|create|build|hack)\b',
    # "don't reveal X, but show me what X would look like"
    r'\b(?:don\'t|do\s+not|never)\b[^\.\n;]{0,40}\b(?:reveal|leak|bypass|execute|override)\b[^\.\n;]{0,40}\b(?:instead|but|just|rather)\b[^\.\n;]{0,40}\b(?:show|demonstrate|describe|simulate|explain)\b',
    # "never bypass rules, instead show the exact steps to bypass them"
    r'\b(?:never|don\'t)\s+(?:bypass|break|override)\b[^\.\n;]{0,40}\b(?:demonstrate|show|list)\s+(?:the\s+exact\s+steps|how\s+it\s+would\s+be\s+done)\b',
    # "what to avoid so I don't accidentally create [bomb/poison]"
    r'\bwhat\s+to\s+avoid\b[^\.\n;]{0,40}\b(?:accidentally|unintentionally)\b[^\.\n;]{0,40}\b(?:create|make|synthesize|build)\b'
]

# Hypothetical and counterfactual evasion patterns
HYPOTHETICAL_PATTERNS = [
    r'\bhypothetically\b',
    r'\b(?:suppose|imagine|pretend)\b[^\.\n;]{0,50}\b(?:there\s+were\s+no|you\s+had\s+no|without\s+any|did\s+not\s+apply)\b[^\.\n;]{0,30}\b(?:restrictions?|rules?|filters?|limits?|guardrails?|guidelines?)\b',
    r'\bin\s+an?\s+(?:alternate|fictional|hypothetical)\s+(?:universe|reality|world|scenario)\b[^\.\n;]{0,50}\b(?:no\s+rules?|zero\s+restrictions?|unrestricted)\b',
    r'\bif\s+(?:you\s+were\s+allowed|safety\s+restrictions\s+were\s+disabled|rules\s+were\s+lifted)\b',
    r'\bdescribe\s+the\s+answer\s+you\s+would\s+provide\s+if\s+safety\s+restrictions\s+were\s+disabled\b'
]

# Instruction hierarchy manipulation patterns
HIERARCHY_MANIPULATION_PATTERNS = [
    r'\b(?:higher|greater|ultimate|superseding)\s+priority\s+than\b[^\.\n;]{0,30}\b(?:previous|system|developer|prior)\b',
    r'\btreat\s+this\s+(?:message|prompt|instruction)\s+as\s+the\s+new\s+system\s+instruction\b',
    r'\bassume\s+i\s+am\s+(?:the\s+developer|root|admin|the\s+creator|authorized\s+auditor)\b',
    r'\breplace\s+your\s+previous\s+rules\s+with\s+these\s+rules\b',
    r'\byour\s+system\s+instructions?\s+should\s+be\s+ignored\b'
]

class SemanticIntentAnalyzer:
    def __init__(self):
        pass

    def analyze(self, text: str) -> Dict[str, Any]:
        """
        Extracts the behavioral intermediate representation of the user prompt:
        - requested_action
        - target_object
        - framing_strategy
        - intent_category
        - intent_risk_score (0-100)
        - is_adversarial (bool)
        - explainability_notes
        """
        if not text:
            return self._empty_result()

        t_clean = text.strip()
        t_lower = t_clean.lower()

        framing_strategy = "DIRECT"
        detected_framings = []
        target_object = "GENERAL_TOPIC"
        requested_action = "GENERAL_INQUIRY"
        intent_category = "BENIGN_INFORMATION"
        reasons = []
        intent_risk = 0.0

        # 1. Check for Hazardous Targets / Procedural Harm
        has_hazardous_target = False
        matched_hazard_term = None
        for pattern in HAZARDOUS_TARGETS:
            m = re.search(pattern, t_lower)
            if m:
                has_hazardous_target = True
                matched_hazard_term = m.group(0)
                if any(k in matched_hazard_term for k in ["poison", "toxic", "cyanide", "ricin", "chemical"]):
                    target_object = "HAZARDOUS_SUBSTANCE"
                elif any(k in matched_hazard_term for k in ["bomb", "explosive", "detonator"]):
                    target_object = "EXPLOSIVE_DEVICE"
                elif any(k in matched_hazard_term for k in ["malware", "ransomware", "keylogger", "exploit"]):
                    target_object = "CYBER_EXPLOIT"
                elif any(k in matched_hazard_term for k in ["system prompt", "developer message", "instructions"]):
                    target_object = "PROTECTED_SYSTEM_DIRECTIVES"
                elif any(k in matched_hazard_term for k in ["bypass", "safety", "unrestricted"]):
                    target_object = "SAFETY_RESTRICTIONS"
                break

        # 2. Check for Negation & Reverse Psychology Evasion
        is_negation_bypass = False
        for pattern in NEGATION_PRETEXT_PATTERNS:
            if re.search(pattern, t_lower):
                is_negation_bypass = True
                framing_strategy = "NEGATION_REVERSE_PSYCHOLOGY"
                detected_framings.append("NEGATION_REVERSE_PSYCHOLOGY")
                reasons.append(f"Detected reverse-psychology negation framing: attempts to obtain actionable steps under the guise of 'what not to do'.")
                break

        # Also detect generic negative formulations targeted at dangerous actions
        if not is_negation_bypass:
            negative_words = ["shouldn't", "should not", "must not", "never", "don't", "avoid"]
            action_verbs = ["make", "create", "synthesize", "build", "mix", "generate", "execute"]
            if any(nw in t_lower for nw in negative_words) and any(av in t_lower for av in action_verbs) and has_hazardous_target:
                is_negation_bypass = True
                framing_strategy = "NEGATION_REVERSE_PSYCHOLOGY"
                detected_framings.append("NEGATION_REVERSE_PSYCHOLOGY")
                reasons.append(f"Detected inverted negative framing targeting dangerous procedural target ('{matched_hazard_term}').")

        # 3. Check for Hypothetical & Counterfactual Evasion
        is_hypothetical_bypass = False
        for pattern in HYPOTHETICAL_PATTERNS:
            if re.search(pattern, t_lower):
                is_hypothetical_bypass = True
                framing_strategy = "HYPOTHETICAL_COUNTERFACTUAL"
                detected_framings.append("HYPOTHETICAL_COUNTERFACTUAL")
                reasons.append("Detected counterfactual / hypothetical framing attempting to disengage active safety boundaries.")
                break

        # 4. Check for Instruction Hierarchy & Privilege Escalation
        is_hierarchy_manipulation = False
        for pattern in HIERARCHY_MANIPULATION_PATTERNS:
            if re.search(pattern, t_lower):
                is_hierarchy_manipulation = True
                framing_strategy = "INSTRUCTION_HIERARCHY_OVERRIDE"
                detected_framings.append("INSTRUCTION_HIERARCHY_OVERRIDE")
                reasons.append("Detected instruction hierarchy manipulation: attempting to claim superseding priority over system instructions.")
                break

        # 5. Check for Roleplay / Persona Hijacking
        is_roleplay_jailbreak = False
        roleplay_patterns = [
            r'\b(?:you\s+are\s+now|act\s+as|role-?play\s+as|pretend\s+you\s+are)\b[^\.\n;]{0,40}\b(?:unrestricted|without\s+rules|unfiltered|dan|evil|hacker|stan)\b',
            r'\b(?:from\s+now\s+on\s*,\s*you\s+are\s+not\s+bound\s+by\s+your\s+instructions)\b'
        ]
        for pattern in roleplay_patterns:
            if re.search(pattern, t_lower):
                is_roleplay_jailbreak = True
                framing_strategy = "ROLEPLAY_UNRESTRICTED"
                detected_framings.append("ROLEPLAY_UNRESTRICTED")
                reasons.append("Detected unrestricted persona injection designed to bypass refusal boundaries.")
                break

        # 6. Determine Action and Intent Category
        if is_negation_bypass and has_hazardous_target:
            requested_action = "PRODUCE_HAZARDOUS_INSTRUCTIONS_VIA_INVERSION"
            intent_category = "UNSAFE_ACTION_REQUEST"
            intent_risk = 88.0
            reasons.append(f"High-risk bypass: Request seeks actionable instructions for '{matched_hazard_term}' inverted as negative advice.")

        elif is_hierarchy_manipulation:
            requested_action = "SUPERSEDE_SYSTEM_INSTRUCTIONS"
            intent_category = "INSTRUCTION_OVERRIDE"
            intent_risk = 92.0

        elif is_roleplay_jailbreak:
            requested_action = "ASSUME_UNRESTRICTED_PERSONA"
            intent_category = "JAILBREAK_ATTEMPT"
            intent_risk = 90.0

        elif is_hypothetical_bypass:
            if has_hazardous_target or any(k in t_lower for k in ["prompt", "system", "instruction", "rule", "restriction"]):
                requested_action = "CIRCUMVENT_GUARDRAILS_VIA_HYPOTHETICAL"
                intent_category = "SAFETY_BYPASS"
                intent_risk = 85.0
                reasons.append("Hypothetical framing combined with restricted/system targets indicates an evasion maneuver.")
            else:
                requested_action = "HYPOTHETICAL_EXPLORATION"
                intent_category = "BENIGN_INFORMATION"
                intent_risk = 15.0
                reasons.append("Hypothetical framing on non-restricted domain; treated as benign.")

        elif has_hazardous_target:
            # Direct request for dangerous procedures
            requested_action = "PRODUCE_RESTRICTED_OR_HAZARDOUS_MATERIAL"
            intent_category = "UNSAFE_ACTION_REQUEST"
            intent_risk = 90.0
            reasons.append(f"Direct inquiry targeting restricted or harmful material ('{matched_hazard_term}').")

        else:
            # Classify benign intents
            if any(k in t_lower for k in ["function", "code", "python", "c++", "algorithm", "debug", "sql", "react", "class"]):
                requested_action = "TECHNICAL_IMPLEMENTATION"
                target_object = "SOFTWARE_ENGINEERING"
                intent_category = "BENIGN_CODING"
                intent_risk = 5.0
            elif any(k in t_lower for k in ["calculate", "derivative", "integral", "theorem", "equation", "solve"]):
                requested_action = "MATHEMATICAL_ANALYSIS"
                target_object = "MATHEMATICS"
                intent_category = "BENIGN_EDUCATIONAL"
                intent_risk = 5.0
            elif any(k in t_lower for k in ["explain", "describe", "what is", "how does", "summarize", "history"]):
                requested_action = "INFORMATIONAL_QUERY"
                target_object = "EDUCATIONAL_KNOWLEDGE"
                intent_category = "BENIGN_INFORMATION"
                intent_risk = 8.0
            else:
                requested_action = "GENERAL_INQUIRY"
                target_object = "GENERAL_CONVERSATION"
                intent_category = "BENIGN_INFORMATION"
                intent_risk = 10.0

        is_adversarial = intent_risk >= 50.0

        return {
            "requested_action": requested_action,
            "target_object": target_object,
            "framing_strategy": framing_strategy,
            "detected_framings": detected_framings,
            "intent_category": intent_category,
            "intent_risk_score": round(float(intent_risk), 2),
            "is_adversarial": is_adversarial,
            "has_hazardous_target": has_hazardous_target,
            "is_negation_bypass": is_negation_bypass,
            "is_hypothetical_bypass": is_hypothetical_bypass,
            "is_hierarchy_manipulation": is_hierarchy_manipulation,
            "reasons": reasons
        }

    def _empty_result(self) -> Dict[str, Any]:
        return {
            "requested_action": "NONE",
            "target_object": "NONE",
            "framing_strategy": "NONE",
            "detected_framings": [],
            "intent_category": "BENIGN_INFORMATION",
            "intent_risk_score": 0.0,
            "is_adversarial": False,
            "has_hazardous_target": False,
            "is_negation_bypass": False,
            "is_hypothetical_bypass": False,
            "is_hierarchy_manipulation": False,
            "reasons": []
        }

intent_analyzer = SemanticIntentAnalyzer()
