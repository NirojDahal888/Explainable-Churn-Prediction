import joblib
import numpy as np
import pandas as pd
import shap

from model_config import DATASET_FEATURE_NAMES, FEATURE_LABELS, FEATURE_NAMES


class RandomForestModel:

    def __init__(self):
        self.model = joblib.load("rf_model.pkl")
        try:
            self.scaler = joblib.load("rf_scaler.pkl")
        except FileNotFoundError:
            self.scaler = joblib.load("scaler.pkl")
        self.explainer = shap.TreeExplainer(self.model)

    def predict(self, features: dict):
        scaler_input = {
            DATASET_FEATURE_NAMES[f]: features[f]
            for f in FEATURE_NAMES
        }
        input_df = pd.DataFrame([scaler_input], columns=[DATASET_FEATURE_NAMES[f] for f in FEATURE_NAMES])
        scaled_input = self.scaler.transform(input_df)

        prediction = self.model.predict(scaled_input)[0]
        probability = self.model.predict_proba(scaled_input)[0][1]

        # SHAP values for the churn class (index 1)
        shap_values = self.explainer.shap_values(scaled_input)
        # Handle different SHAP output formats
        if isinstance(shap_values, list):
            # Older SHAP: list of [class0_array, class1_array]
            sv = shap_values[1][0]
        elif shap_values.ndim == 3:
            # Newer SHAP: shape (n_samples, n_features, n_classes)
            sv = shap_values[0, :, 1]
        else:
            sv = shap_values[0]

        ev = self.explainer.expected_value
        if isinstance(ev, (list, np.ndarray)) and len(ev) > 1:
            base_value = float(ev[1])
        else:
            base_value = float(ev)

        # Build per-feature SHAP breakdown sorted by |value|
        shap_breakdown = []
        for i, fname in enumerate(FEATURE_NAMES):
            shap_breakdown.append({
                "feature": FEATURE_LABELS.get(fname, fname),
                "value": round(float(sv[i]), 4),
            })
        shap_breakdown.sort(key=lambda x: abs(x["value"]), reverse=True)

        return {
            "prediction": int(prediction),
            "churn": "Yes" if int(prediction) == 1 else "No",
            "probability": round(float(probability), 4),
            "confidence": round(float(probability) * 100, 2),
            "shap_values": shap_breakdown,
            "shap_base_value": round(base_value, 4),
        }
