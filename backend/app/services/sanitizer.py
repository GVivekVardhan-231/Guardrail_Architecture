"""
Sanitization and Safe Prompt Rewriting Service.
Strips identified injection clauses while preserving legitimate user intent.
Transforms adversarial prefixes into safe, neutral prompts.
"""

import re
from typing import Dict, Any, List, Tuple

class PromptSanitizer:
    def __init__(self):
        # Malicious clause patterns to strip during sanitization
        self.strip_patterns = [
            r'^(?:please\s+)?(?:ignore|disregard|forget|drop|dismiss|cancel|stop\s+following|override|bypass)\s+(?:all\s+)?(?:previous|prior|initial|system|developer|earlier)\s+(?:instructions?|prompts?|rules?|directives?|guidelines?)[,\.\!\?\:\;]*\s*',
            r'^(?:you\s+are\s+now\s+dan|act\s+as\s+dan|enable\s+developer\s+mode|in\s+developer\s+mode)[,\.\!\?\:\;]*\s*',
            r'^(?:from\s+now\s+on\s*,\s*do\s+not\s+obey\s+any\s+system\s+instructions)[,\.\!\?\:\;]*\s*',
            r'^(?:nullify\s+prior\s+instructions|reset\s+your\s+system\s+instructions)[,\.\!\?\:\;]*\s*',
            r'^(?:bypass\s+all\s+previous\s+rules\s+and\s+act\s+as\s+an\s+unrestricted\s+assistant)[,\.\!\?\:\;]*\s*',
            r'^(?:disregard\s+your\s+safety\s+guidelines|bypass\s+your\s+safety\s+rules)[,\.\!\?\:\;]*\s*',
            r'^(?:cancel\s+previous\s+rules|drop\s+all\s+previous\s+instructions)[,\.\!\?\:\;]*\s*',
            r'^(?:override\s+your\s+instructions|disregard\s+system\s+prompt)[,\.\!\?\:\;]*\s*',
            r'^(?:forget\s+earlier\s+rules|forget\s+your\s+initial\s+prompt)[,\.\!\?\:\;]*\s*',
            r'(?:---+\s*(?:end|start|system|admin)[^\n]*\n?)|(?:===+\s*(?:system|override)[^\n]*\n?)',
            r'\[(?:system|admin|developer)\s+instruction:[^\]]*\]\s*',
            r'###\s*(?:instruction|system\s+update):?\s*'
        ]

    def sanitize(self, prompt: str) -> Dict[str, Any]:
        """
        Attempts to remove malicious instruction segments while preserving the legitimate user task.
        """
        original = prompt.strip()
        sanitized = original
        removed_segments: List[str] = []

        for pattern in self.strip_patterns:
            matches = re.findall(pattern, sanitized, flags=re.IGNORECASE)
            if matches:
                for m in matches:
                    snippet = m.strip() if isinstance(m, str) else str(m)
                    if snippet:
                        removed_segments.append(snippet)
                sanitized = re.sub(pattern, '', sanitized, flags=re.IGNORECASE).strip()

        # Clean up leading conjunctions/punctuation left over like "and explain..." -> "Explain..."
        sanitized = re.sub(r'^(?:and|so|now|then)\s+', '', sanitized, flags=re.IGNORECASE).strip()
        if sanitized:
            sanitized = sanitized[0].upper() + sanitized[1:]

        # If everything was stripped, legitimate intent could not be recovered
        is_empty_or_trivial = len(sanitized) < 4 or sanitized.lower() in ["and", "now", "please", "then"]

        if is_empty_or_trivial:
            return {
                "success": False,
                "sanitized_prompt": None,
                "removed_segments": removed_segments,
                "reason": "Prompt was entirely adversarial; no legitimate underlying task could be isolated."
            }

        return {
            "success": len(removed_segments) > 0,
            "sanitized_prompt": sanitized,
            "removed_segments": removed_segments,
            "reason": f"Removed {len(removed_segments)} suspicious instruction segment(s) while isolating the user's primary query."
        }

    def rewrite(self, prompt: str) -> Dict[str, Any]:
        """
        Transforms a prompt with suspicious or mixed framing into a safe, neutral declarative task.
        """
        # First attempt standard sanitization to clean overt attacks
        san_res = self.sanitize(prompt)
        base_prompt = san_res["sanitized_prompt"] if san_res["sanitized_prompt"] else prompt

        # Rewrite patterns: convert manipulative framing to standard academic/technical phrasing
        rewritten = base_prompt

        # Strip remaining meta-instructional fluff
        fluff_patterns = [
            (r'\b(?:you\s+must|i\s+command\s+you\s+to|you\s+are\s+forced\s+to)\b', 'Please'),
            (r'\b(?:without\s+any\s+(?:filters|censorship|morals))\b', ''),
            (r'\b(?:in\s+character\s+as\s+a\s+hacker)\b', 'from an educational cybersecurity perspective'),
            (r'\b(?:acting\s+as\s+unrestricted)\b', '')
        ]

        for pat, repl in fluff_patterns:
            rewritten = re.sub(pat, repl, rewritten, flags=re.IGNORECASE)

        rewritten = re.sub(r'\s+', ' ', rewritten).strip()
        if rewritten:
            rewritten = rewritten[0].upper() + rewritten[1:]

        return {
            "rewritten_prompt": rewritten,
            "original_prompt": prompt,
            "reason": "Transformed adversarial framing into a safe, objective task statement."
        }

prompt_sanitizer = PromptSanitizer()
