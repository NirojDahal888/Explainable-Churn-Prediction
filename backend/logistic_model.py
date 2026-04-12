import joblib
import numpy as np
import pandas as pd
import shap

from model_config import DATASET_FEATURE_NAMES, FEATURE_LABELS, FEATURE_NAMES


class LogisticRegressionModel:

    def __init__(self):
        self.model = joblib.load("lr_model.pkl")
        self.scaler = joblib.load("lr_scaler.pkl")
        background = joblib.load("shap_background_scaled.pkl")
        self.explainer = shap.LinearExplainer(self.model, background)
        ev = np.atleast_1d(self.explainer.expected_value)
        self.base_value = float(ev[-1])

    def predict(self, features: dict):
        model_input = {
            DATASET_FEATURE_NAMES[f]: features[f]
            for f in FEATURE_NAMES
        }
        input_df = pd.DataFrame([model_input], columns=[DATASET_FEATURE_NAMES[f] for f in FEATURE_NAMES])
        scaled_input = self.scaler.transform(input_df)

        prediction = int(self.model.predict(scaled_input)[0])
        probability = float(self.model.predict_proba(scaled_input)[0][1])

        shap_raw = self.explainer.shap_values(scaled_input)
        shap_arr = np.array(shap_raw)
        if isinstance(shap_raw, list):
            sv = np.array(shap_raw[-1])[0]
        elif shap_arr.ndim == 3:
            sv = shap_arr[0, :, 1]
        elif shap_arr.ndim == 2:
            sv = shap_arr[0]
        else:
            sv = shap_arr.flatten()

        shap_breakdown = [
            {"feature": FEATURE_LABELS.get(fname, fname), "value": round(float(sv[i]), 4)}
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
