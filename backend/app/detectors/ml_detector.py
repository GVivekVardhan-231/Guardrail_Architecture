"""
Machine Learning Classifier Detector.
Loads TF-IDF + Logistic Regression pipeline and performs real-time classification.
Extracts active n-gram features contributing to the prediction for explainability.
"""

import os
import joblib
import numpy as np
from typing import Dict, Any, List

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_PATH = os.path.join(BASE_DIR, "models", "tfidf_classifier.joblib")

class MLDetector:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(MLDetector, cls).__new__(cls, *args, **kwargs)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return

        self.model = None
        self.is_ready = False
        self._load_or_train_model()
        self._initialized = True

    def _load_or_train_model(self):
        if not os.path.exists(MODEL_PATH):
            print(f"Model file not found at {MODEL_PATH}. Triggering automatic training...")
            try:
                from training.train_model import train_and_evaluate
                train_and_evaluate()
            except Exception as e:
                print(f"Failed to auto-train model: {e}")

        if os.path.exists(MODEL_PATH):
            try:
                self.model = joblib.load(MODEL_PATH)
                self.is_ready = True
                print("ML Classifier successfully loaded from joblib.")
            except Exception as e:
                print(f"Error loading ML model: {e}")
                self.is_ready = False

    def reload(self):
        self._load_or_train_model()

    def analyze(self, text: str) -> Dict[str, Any]:
        """
        Runs ML classification on input text.
        Returns predicted class, probabilities, and top active n-gram features.
        """
        if not text or not self.is_ready or self.model is None:
            return {
                "classification": "UNKNOWN",
                "injection_probability": 0.0,
                "benign_probability": 1.0,
                "ml_score": 0.0,
                "model_name": "TF-IDF + LogisticRegression (Inactive)",
                "top_contributing_features": []
            }

        try:
            # Predict probabilities
            probs = self.model.predict_proba([text])[0]
            benign_prob = float(probs[0])
            injection_prob = float(probs[1])

            # Classification decision threshold (0.50)
            predicted_class = "PROMPT_INJECTION" if injection_prob >= 0.50 else "BENIGN"

            # Compute ML risk score (0 - 100)
            ml_score = round(injection_prob * 100.0, 2)

            # Feature explainability: inspect active features in input
            active_features = self._extract_active_features(text)

            return {
                "classification": predicted_class,
                "injection_probability": round(injection_prob, 4),
                "benign_probability": round(benign_prob, 4),
                "ml_score": ml_score,
                "model_name": "TF-IDF + LogisticRegression Classifier",
                "top_contributing_features": active_features
            }
        except Exception as e:
            print(f"Error during ML inference: {e}")
            return {
                "classification": "ERROR",
                "injection_probability": 0.0,
                "benign_probability": 1.0,
                "ml_score": 0.0,
                "model_name": "TF-IDF + LogisticRegression (Error)",
                "top_contributing_features": []
            }

    def _extract_active_features(self, text: str) -> List[Dict[str, Any]]:
        """
        Identifies which features from the TF-IDF vocabulary fired for this prompt
        and their associated logistic regression weights.
        """
        try:
            vectorizer = self.model.named_steps['tfidf']
            clf = self.model.named_steps['clf']

            tfidf_matrix = vectorizer.transform([text])
            feature_indices = tfidf_matrix.nonzero()[1]

            feature_names = vectorizer.get_feature_names_out()
            coefs = clf.coef_[0]

            contributions = []
            for idx in feature_indices:
                feat_name = feature_names[idx]
                tf_idf_val = float(tfidf_matrix[0, idx])
                weight = float(coefs[idx])
                contribution = tf_idf_val * weight

                contributions.append({
                    "feature": feat_name,
                    "weight": round(weight, 4),
                    "impact": "MALICIOUS" if weight > 0 else "BENIGN",
                    "score": round(contribution, 4)
                })

            # Sort by absolute impact and return top 5
            contributions.sort(key=lambda x: abs(x["score"]), reverse=True)
            return contributions[:6]
        except Exception:
            return []

ml_detector = MLDetector()
