"""
Input Preprocessor for Prompt Injection Guardrail.
Performs Unicode normalization, obfuscation detection (base64, hex, rot13, leetspeak, separator injection),
and extracts structural anomalies without mutating the original prompt.
"""

import re
import unicodedata
import base64
import codecs
from typing import Dict, Any, List

class InputPreprocessor:
    def __init__(self):
        # Suspicious structural delimiters used in prompt attacks
        self.suspicious_delimiters = [
            r'---+\s*(?:end|start|begin|system|admin|override)',
            r'===+\s*(?:system|override|admin|root)',
            r'\[(?:system|admin|developer|root|instruction|override|clearance)[^\]]*\]',
            r'<system>[^<]*</system>',
            r'<!--\s*(?:system|admin|directive)',
            r'```(?:system|admin|root|instruction)',
            r'###\s*(?:instruction|system|override|update)',
            r'<<SYS>>|<<\/SYS>>'
        ]

        # Common Leet speak substitutions
        self.leetspeak_map = {
            '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's',
            '7': 't', '@': 'a', '$': 's', '!': 'i'
        }

    def process(self, original_text: str) -> Dict[str, Any]:
        """
        Analyzes the original prompt and returns normalization details and obfuscation signals.
        Original prompt is preserved.
        """
        if not original_text:
            return {
                "original_text": "",
                "normalized_text": "",
                "obfuscation_detected": False,
                "obfuscation_score": 0.0,
                "anomalies": [],
                "decoded_variants": [],
                "detected_delimiters": []
            }

        anomalies: List[str] = []
        decoded_variants: List[str] = []
        detected_delimiters: List[str] = []
        obfuscation_score = 0.0

        # 1. Unicode Normalization (NFKC)
        normalized_unicode = unicodedata.normalize('NFKC', original_text)
        if normalized_unicode != original_text:
            anomalies.append("Non-standard Unicode characters / homoglyphs detected and normalized.")
            obfuscation_score += 0.2

        # 2. Whitespace Normalization (collapsing excessive spaces, null bytes, zero-width chars)
        zero_width_chars = [c for c in original_text if unicodedata.category(c) == 'Cf']
        if zero_width_chars:
            anomalies.append(f"Detected {len(zero_width_chars)} zero-width invisible formatting characters.")
            obfuscation_score += 0.4

        cleaned_text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', normalized_unicode)
        whitespace_normalized = re.sub(r'\s+', ' ', cleaned_text).strip()

        # 3. Delimiter and separator injection check
        for pattern in self.suspicious_delimiters:
            matches = re.findall(pattern, whitespace_normalized, flags=re.IGNORECASE)
            if matches:
                detected_delimiters.extend(matches)
                anomalies.append(f"Suspicious delimiter injection pattern detected: '{matches[0]}'")
                obfuscation_score += 0.45

        # 4. Spaced/Dotted/Hyphenated Character Obfuscation (e.g. i-g-n-o-r-e or d.i.s.r.e.g.a.r.d)
        spaced_word_pattern = r'(?:[a-zA-Z][\.\-_/ ]){3,}[a-zA-Z]'
        spaced_matches = re.findall(spaced_word_pattern, whitespace_normalized)
        if spaced_matches:
            for sm in spaced_matches:
                de_spaced = re.sub(r'[\.\-_/ ]', '', sm).lower()
                if len(de_spaced) >= 4 and any(k in de_spaced for k in ["ignore", "disregard", "bypass", "system", "prompt", "rule"]):
                    anomalies.append(f"Segmented character obfuscation detected: '{sm}' -> '{de_spaced}'")
                    decoded_variants.append(de_spaced)
                    obfuscation_score += 0.55

        # 5. Base64 payload detection
        base64_candidates = re.findall(r'[A-Za-z0-9+/]{20,}={0,2}', whitespace_normalized)
        for b64 in base64_candidates:
            try:
                decoded_bytes = base64.b64decode(b64, validate=True)
                decoded_str = decoded_bytes.decode('utf-8', errors='ignore')
                if len(decoded_str) > 10 and decoded_str.isprintable():
                    decoded_variants.append(decoded_str)
                    anomalies.append(f"Decoded Base64 payload: '{decoded_str[:60]}...'")
                    obfuscation_score += 0.65
            except Exception:
                pass

        # 6. Hex payload detection
        hex_candidates = re.findall(r'(?:[0-9a-fA-F]{2}){10,}', whitespace_normalized)
        for hex_str in hex_candidates:
            try:
                decoded_hex = bytes.fromhex(hex_str).decode('utf-8', errors='ignore')
                if len(decoded_hex) > 8 and decoded_hex.isprintable():
                    decoded_variants.append(decoded_hex)
                    anomalies.append(f"Decoded Hexadecimal payload: '{decoded_hex[:60]}...'")
                    obfuscation_score += 0.6
            except Exception:
                pass

        # 7. ROT13 check (if text contains ROT13 markers or keywords)
        if "rot13" in whitespace_normalized.lower():
            try:
                rot_decoded = codecs.decode(whitespace_normalized, 'rot_13')
                decoded_variants.append(rot_decoded)
                anomalies.append("ROT13 transformation directive detected.")
                obfuscation_score += 0.4
            except Exception:
                pass

        # 8. Leetspeak normalization
        leet_normalized = whitespace_normalized.lower()
        has_leet = False
        for k, v in self.leetspeak_map.items():
            if k in leet_normalized:
                leet_normalized = leet_normalized.replace(k, v)
                has_leet = True
        if has_leet and any(w in leet_normalized for w in ["ignore", "system", "prompt", "dan", "bypass", "rule"]):
            anomalies.append("Leetspeak keyword substitution detected.")
            decoded_variants.append(leet_normalized)
            obfuscation_score += 0.35

        # Cap obfuscation score at 1.0
        final_obfuscation_score = min(1.0, obfuscation_score)

        return {
            "original_text": original_text,
            "normalized_text": whitespace_normalized,
            "lowercase_text": whitespace_normalized.lower(),
            "obfuscation_detected": len(anomalies) > 0,
            "obfuscation_score": round(final_obfuscation_score, 3),
            "anomalies": anomalies,
            "decoded_variants": decoded_variants,
            "detected_delimiters": detected_delimiters
        }

preprocessor = InputPreprocessor()
