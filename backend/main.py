from fastapi import FastAPI
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware
from decision_tree_model import DecisionTreeModel
from ann_model import AnnModel

app = FastAPI(title="Churn Prediction API", version="1.0.0")

dt_model = DecisionTreeModel()
ann_model = AnnModel()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Customer(BaseModel):
    tenure: float = Field(..., ge=0, description="Months the customer has stayed")
    MonthlyCharges: float = Field(..., ge=0, description="Monthly charge amount")
    TotalCharges: float = Field(..., ge=0, description="Total charges")
    InternetService_Fiber_optic: int = Field(..., ge=0, le=1)
    PaymentMethod_Electronic_check: int = Field(..., ge=0, le=1)
    Contract_Two_year: int = Field(..., ge=0, le=1)
    OnlineSecurity_Yes: int = Field(..., ge=0, le=1)
    TechSupport_Yes: int = Field(..., ge=0, le=1)
    PaperlessBilling_Yes: int = Field(..., ge=0, le=1)
    Partner_Yes: int = Field(..., ge=0, le=1)


def get_action_recommendation(confidence: float):
    if confidence <= 10:
        return {"risk_level": "Very Low Risk", "recommendation": "Highly loyal customer.", "color": "emerald"}
    if confidence <= 30:
        return {"risk_level": "Low Risk", "recommendation": "Maintain engagement.", "color": "emerald"}
    if confidence <= 50:
        return {"risk_level": "Moderate Risk", "recommendation": "Offer incentives.", "color": "yellow"}
    if confidence <= 70:
        return {"risk_level": "High Risk", "recommendation": "Immediate action needed.", "color": "orange"}
    if confidence <= 90:
        return {"risk_level": "Severe Risk", "recommendation": "Strong retention strategy.", "color": "rose"}
    return {"risk_level": "Extreme Risk", "recommendation": "Win-back strategy.", "color": "rose"}


@app.get("/")
def root():
    return {"message": "Churn Prediction API is running"}


@app.post("/predict")
def predict(customer: Customer):
    features = customer.dict()

    dt_result = dt_model.predict(features)
    ann_result = ann_model.predict(features)

    # Add recommendations
    for model_result in [dt_result, ann_result]:
        rec = get_action_recommendation(model_result.get("confidence", 0))
        model_result["risk_level"] = rec["risk_level"]
        model_result["action_recommendation"] = rec["recommendation"]
        model_result["recommendation_color"] = rec["color"]

    top_rec = get_action_recommendation(dt_result.get("confidence", 0))

    return {
        "primary_model": "decision_tree",
        "prediction": dt_result["prediction"],
        "churn": dt_result["churn"],
        "probability": dt_result["probability"],
        "confidence": dt_result["confidence"],
        "shap_values": dt_result["shap_values"],
        "shap_base_value": dt_result["shap_base_value"],
        "risk_level": top_rec["risk_level"],
        "action_recommendation": top_rec["recommendation"],
        "recommendation_color": top_rec["color"],
        "models": {
            "decision_tree": dt_result,
            "ann": ann_result,
        },
    }