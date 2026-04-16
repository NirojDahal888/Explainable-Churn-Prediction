from fastapi import FastAPI
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware
from random_forest_model import RandomForestModel
from logistic_model import LogisticRegressionModel
from decision_tree_model import DecisionTreeModel
from svm_model import SvmModel
from ann_model import AnnModel

app = FastAPI(title="Churn Prediction API", version="1.0.0")
rf_model = RandomForestModel()
lr_model = LogisticRegressionModel()
dt_model = DecisionTreeModel()
svm_model = SvmModel()
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
    InternetService_Fiber_optic: int = Field(..., ge=0, le=1, description="1 if Fiber optic, else 0")
    PaymentMethod_Electronic_check: int = Field(..., ge=0, le=1, description="1 if Electronic check, else 0")
    Contract_Two_year: int = Field(..., ge=0, le=1, description="1 if Two year contract, else 0")
    OnlineSecurity_Yes: int = Field(..., ge=0, le=1, description="1 if Online security, else 0")
    TechSupport_Yes: int = Field(..., ge=0, le=1, description="1 if Tech support, else 0")
    PaperlessBilling_Yes: int = Field(..., ge=0, le=1, description="1 if Paperless billing, else 0")
    Partner_Yes: int = Field(..., ge=0, le=1, description="1 if has partner, else 0")


def get_action_recommendation(confidence: float):
    # The confidence value is the churn probability percentage from 0 to 100.
    if confidence <= 10:
        return {
            "risk_level": "Very Low Risk",
            "recommendation": "This customer is highly loyal and shows strong engagement with your product or service. At this stage, the focus should be on maintaining satisfaction and reinforcing their positive experience. Continue providing consistent value through high-quality service, smooth user experience, and reliable support. Consider sending occasional newsletters, updates about new features, or loyalty rewards such as exclusive perks or early access to new offerings. Avoid over-communication, but ensure the brand stays present in a non-intrusive way. The goal here is long-term retention through trust and consistency rather than aggressive marketing.",
            "color": "emerald",
        }
    if confidence <= 20:
        return {
            "risk_level": "Low Risk",
            "recommendation": "The customer is still engaged but may require light nurturing to maintain their interest. You should focus on personalized communication such as tailored emails, product recommendations, or updates based on their previous activity. Monitoring behavioral patterns like reduced usage or interaction frequency is important. Introduce small engagement strategies such as surveys, feedback forms, or feature highlights to keep them connected. The objective is to proactively maintain engagement before any noticeable decline begins.",
            "color": "emerald",
        }
    if confidence <= 30:
        return {
            "risk_level": "Slight Risk",
            "recommendation": "The customer is beginning to show early signs of disengagement. At this stage, it is important to act proactively by offering light incentives such as small discounts, loyalty points, or personalized offers. Improving the customer experience should be a priority, including faster support response times and better usability. Consider sending targeted emails that highlight the value they may be missing. This is also a good time to analyze their journey and identify any friction points that may be causing reduced engagement.",
            "color": "teal",
        }
    if confidence <= 40:
        return {
            "risk_level": "Moderate Risk",
            "recommendation": "The customer is at a moderate risk of churning and requires more focused attention. Implement targeted marketing campaigns such as personalized promotions or recommendations based on their behavior. Engage them through feedback requests to understand their concerns and satisfaction levels. It is also beneficial to reintroduce key features or benefits they may not be utilizing. Customer experience improvements and proactive communication will play a critical role in preventing further disengagement.",
            "color": "yellow",
        }
    if confidence <= 50:
        return {
            "risk_level": "Medium Risk",
            "recommendation": "At this stage, the customer is showing clear signs of disengagement and requires active intervention. Customer support teams should consider reaching out directly through email or calls to understand any issues they may be facing. Providing limited-time offers, discounts, or incentives can help re-engage them. Focus on identifying pain points such as pricing concerns, usability issues, or unmet expectations. A combination of human interaction and targeted offers is essential to retain the customer.",
            "color": "amber",
        }
    if confidence <= 60:
        return {
            "risk_level": "High Risk",
            "recommendation": "The customer is at high risk of churn and immediate action is required. Offer retention-focused incentives such as special discounts, subscription upgrades, or additional benefits tailored to their needs. Investigate customer behavior and feedback thoroughly to identify dissatisfaction triggers. Personalized communication is crucial here, ensuring the customer feels valued and understood. Escalating the case to experienced support staff can significantly improve the chances of retention.",
            "color": "orange",
        }
    if confidence <= 70:
        return {
            "risk_level": "Very High Risk",
            "recommendation": "The customer is very close to churning and requires urgent, personalized intervention. A direct approach from customer support or account managers is recommended. Provide highly customized offers, exclusive deals, or service recovery options to regain their trust. Analyze their entire journey to pinpoint exact issues and address them effectively. At this stage, building a personal connection and demonstrating commitment to resolving their concerns can make a significant difference.",
            "color": "orange",
        }
    if confidence <= 80:
        return {
            "risk_level": "Critical Risk",
            "recommendation": "The customer is at critical risk and may leave at any moment. Launch a strong retention campaign including exclusive discounts, premium support, or bundled offers that provide significant value. Immediate and proactive outreach is necessary, preferably through multiple channels such as email, phone, or in-app messaging. Focus on resolving any outstanding issues quickly and efficiently. Demonstrating urgency and care is essential to prevent churn at this stage.",
            "color": "rose",
        }
    if confidence <= 90:
        return {
            "risk_level": "Severe Risk",
            "recommendation": "This is a severe churn risk scenario requiring immediate and decisive action. Direct communication such as phone calls or personalized messages should be prioritized. Offer urgent retention deals, high-value incentives, or customized solutions to address their concerns. It is critical to identify and fix any major dissatisfaction factors immediately. The goal is to quickly re-establish trust and provide compelling reasons for the customer to stay.",
            "color": "rose",
        }
    return {
        "risk_level": "Extreme Risk",
        "recommendation": "The customer is on the verge of being lost or may have already disengaged completely. At this stage, a win-back strategy is essential. Offer significant incentives such as large discounts, exclusive benefits, or personalized recovery offers. Re-engagement campaigns should focus on reminding the customer of the value they once received while addressing past issues transparently. Even if recovery is uncertain, these efforts can provide valuable insights into churn reasons and improve future retention strategies.",
        "color": "rose",
    }


@app.get("/")
def root():
    return {"message": "Churn Prediction API is running"}


@app.post("/predict")
def predict(customer: Customer):
    features = customer.dict()
    rf_result = rf_model.predict(features)
    lr_result = lr_model.predict(features)
    dt_result = dt_model.predict(features)
    svm_result = svm_model.predict(features)
    ann_result = ann_model.predict(features)

    # Attach action recommendation metadata from backend logic
    for model_result in [rf_result, lr_result, dt_result, svm_result, ann_result]:
        rec = get_action_recommendation(model_result.get("confidence", 0))
        model_result["risk_level"] = rec["risk_level"]
        model_result["action_recommendation"] = rec["recommendation"]
        model_result["recommendation_color"] = rec["color"]

    top_rec = get_action_recommendation(dt_result.get("confidence", 0))

    return {
        # Use decision tree as the primary churn model for legacy top-level output now
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
        # New multi-model output for side-by-side rendering
        "models": {
            "random_forest": rf_result,
            "logistic_regression": lr_result,
            "decision_tree": dt_result,
            "svm": svm_result,
            "ann": ann_result,
        },
    }
