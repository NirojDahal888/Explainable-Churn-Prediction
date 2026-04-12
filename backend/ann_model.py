import joblib
import numpy as np
import pandas as pd

from model_config import DATASET_FEATURE_NAMES, FEATURE_LABELS, FEATURE_NAMES


class AnnModel:

    def __init__(self):
        self.model = joblib.load("ann_model.pkl")
        self.scaler = joblib.load("ann_scaler.pkl")

        # Approximate baseline using average model output over a small background sample.
        background = joblib.load("shap_background_scaled.pkl")
        self._bg_mean = np.mean(background, axis=0)
        self.base_value = float(np.mean(self.model.predict_proba(background)[:, 1]))

    def predict(self, features: dict):
        model_input = {
            DATASET_FEATURE_NAMES[f]: features[f]
            for f in FEATURE_NAMES
        }
        input_df = pd.DataFrame([model_input], columns=[DATASET_FEATURE_NAMES[f] for f in FEATURE_NAMES])
        scaled_input = self.scaler.transform(input_df)

        prediction = int(self.model.predict(scaled_input)[0])
        probability = float(self.model.predict_proba(scaled_input)[0][1])

        # Lightweight contribution approximation from first-layer weights.
        # This keeps feature-impact output available without expensive explainers.
        weights = np.mean(np.abs(self.model.coefs_[0]), axis=1)
        delta = scaled_input[0] - self._bg_mean
        contribution = weights * delta

        shap_breakdown = [
            {"feature": FEATURE_LABELS.get(fname, fname), "value": round(float(contribution[i]), 4)}
            for i, fname in enumerate(FEATURE_NAMES)
        ]
        shap_breakdown.sort(key=lambda x: abs(x["value"]), reverse=True)

        return {
            "prediction": prediction,
            "churn": "Yes" if prediction == 1 else "No",
            "probability": round(probability, 4),
            "confidence": round(probability * 100, 2),
            "shap_values": shap_breakdown,
            "shap_base_value": round(self.base_value, 4),
        }
