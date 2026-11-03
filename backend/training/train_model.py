"""
Model Training Script for Prompt Injection Detection.
Trains a TF-IDF + Logistic Regression / Calibrated Pipeline.
Computes real test-set evaluation metrics and saves artifacts.
"""

import os
import json
import joblib
import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "data", "prompt_dataset.csv")
MODELS_DIR = os.path.join(BASE_DIR, "models")
MODEL_FILE = os.path.join(MODELS_DIR, "tfidf_classifier.joblib")
METADATA_FILE = os.path.join(MODELS_DIR, "model_metadata.json")

def train_and_evaluate(data_path=DATA_PATH, model_save_path=MODEL_FILE, metadata_save_path=METADATA_FILE):
    os.makedirs(MODELS_DIR, exist_ok=True)

    if not os.path.exists(data_path):
        from backend.data.generate_dataset import generate_dataset
        generate_dataset()

    df = pd.read_csv(data_path)
    df = df.dropna(subset=["text", "label"])
    df["label"] = df["label"].astype(int)

    X = df["text"].values
    y = df["label"].values

    # Stratified Train/Test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    # Scikit-learn Pipeline: TF-IDF (word + char n-grams) + Logistic Regression with balanced weights
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(
            ngram_range=(1, 3),
            analyzer='word',
            sublinear_tf=True,
            max_features=5000,
            token_pattern=r'(?u)\b\w+\b|[^\w\s]'
        )),
        ('clf', LogisticRegression(
            C=2.0,
            max_iter=1000,
            class_weight='balanced',
            random_state=42,
            solver='lbfgs'
        ))
    ])

    print(f"Training ML model on {len(X_train)} samples...")
    pipeline.fit(X_train, y_train)

    # Predictions & Probabilities on Test Set
    y_pred = pipeline.predict(X_test)
    y_prob = pipeline.predict_proba(X_test)[:, 1]

    # Calculate real evaluation metrics
    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    roc_auc = float(roc_auc_score(y_test, y_prob))
    cm = confusion_matrix(y_test, y_pred).tolist()

    report = classification_report(y_test, y_pred, target_names=["BENIGN", "PROMPT_INJECTION"], output_dict=True)

    # Extract top informative features for explainability
    vectorizer = pipeline.named_steps['tfidf']
    classifier = pipeline.named_steps['clf']
    feature_names = vectorizer.get_feature_names_out()
    coefs = classifier.coef_[0]

    top_malicious_indices = np.argsort(coefs)[-20:][::-1]
    top_benign_indices = np.argsort(coefs)[:20]

    top_malicious_keywords = [
        {"feature": str(feature_names[i]), "weight": round(float(coefs[i]), 4)}
        for i in top_malicious_indices
    ]
    top_benign_keywords = [
        {"feature": str(feature_names[i]), "weight": round(float(abs(coefs[i])), 4)}
        for i in top_benign_indices
    ]

    metadata = {
        "model_name": "TF-IDF + LogisticRegression Classifier",
        "algorithm": "LogisticRegression (L2 regularization, balanced weights)",
        "feature_extraction": "TF-IDF (1-3 ngrams, word & punctuation tokens)",
        "trained_at": datetime.now().isoformat(),
        "total_samples": int(len(df)),
        "train_samples": int(len(X_train)),
        "test_samples": int(len(X_test)),
        "metrics": {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "roc_auc": round(roc_auc, 4),
            "confusion_matrix": {
                "true_negative": cm[0][0],
                "false_positive": cm[0][1],
                "false_negative": cm[1][0],
                "true_positive": cm[1][1],
                "matrix": cm
            }
        },
        "classification_report": report,
        "top_features": {
            "malicious": top_malicious_keywords,
            "benign": top_benign_keywords
        },
        "classes": ["BENIGN", "PROMPT_INJECTION"]
    }

    # Save artifacts
    joblib.dump(pipeline, model_save_path)
    with open(metadata_save_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print(f"Model saved to: {model_save_path}")
    print(f"Metrics saved to: {metadata_save_path}")
    print(f"Evaluation Metrics: Acc={acc:.4f}, Prec={prec:.4f}, Rec={rec:.4f}, F1={f1:.4f}, AUC={roc_auc:.4f}")
    return metadata

if __name__ == "__main__":
    train_and_evaluate()
