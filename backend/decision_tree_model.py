import joblib
import numpy as np
import pandas as pd
import shap

from model_config import DATASET_FEATURE_NAMES, FEATURE_LABELS, FEATURE_NAMES


class DecisionTreeModel:

    def __init__(self):
        self.model = joblib.load("dt_model.pkl")
        self.explainer = shap.TreeExplainer(self.model)
        ev = self.explainer.expected_value
        ev_arr = np.atleast_1d(ev)
        self.base_value = float(ev_arr[1]) if len(ev_arr) > 1 else float(ev_arr[0])

    def predict(self, features: dict):
        model_input = {
            DATASET_FEATURE_NAMES[f]: features[f]
            for f in FEATURE_NAMES
        }
        input_df = pd.DataFrame([model_input], columns=[DATASET_FEATURE_NAMES[f] for f in FEATURE_NAMES])

        prediction = int(self.model.predict(input_df)[0])
        probability = float(self.model.predict_proba(input_df)[0][1])

        shap_raw = self.explainer.shap_values(input_df.values.astype(float))
        if isinstance(shap_raw, list):
            sv = np.array(shap_raw[1])[0]
        elif np.array(shap_raw).ndim == 3:
            sv = np.array(shap_raw)[0, :, 1]
        else:
            sv = np.array(shap_raw)[0]

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
