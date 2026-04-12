"""Generate ROC curve, confusion matrices, and SHAP summary plot for churn models."""

from pathlib import Path

import joblib
import matplotlib
import matplotlib.pyplot as plt
import pandas as pd
import shap
from sklearn.metrics import ConfusionMatrixDisplay, roc_auc_score, roc_curve
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

matplotlib.use("Agg")


def load_data():
    """Load and preprocess data to match training-time feature pipeline."""
    df = pd.read_csv("telco.csv")

    df.drop("customerID", axis=1, inplace=True)
    df["TotalCharges"] = pd.to_numeric(df["TotalCharges"], errors="coerce")
    df["TotalCharges"] = df["TotalCharges"].fillna(df["TotalCharges"].median())
    df["Churn"] = df["Churn"].map({"Yes": 1, "No": 0})

    df_encoded = pd.get_dummies(df, drop_first=True)
    selected_features = [
        "tenure",
        "MonthlyCharges",
        "TotalCharges",
        "InternetService_Fiber optic",
        "PaymentMethod_Electronic check",
        "Contract_Two year",
        "OnlineSecurity_Yes",
        "TechSupport_Yes",
        "PaperlessBilling_Yes",
        "Partner_Yes",
    ]

    X = df_encoded[selected_features]
    y = df_encoded["Churn"]
    return X, y


def build_test_sets(X, y):
    """Recreate train/test split and scaling used in model training."""
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    return X_test, X_test_scaled, y_test


def load_models():
    """Load saved model artifacts produced by train_model.py."""
    return {
        "Random Forest": joblib.load("rf_model.pkl"),
        "Logistic Regression": joblib.load("lr_model.pkl"),
        "Decision Tree": joblib.load("dt_model.pkl"),
        "SVM": joblib.load("svm_model.pkl"),
        "ANN": joblib.load("ann_model.pkl"),
    }


def generate_roc_plot(models, X_test, X_test_scaled, y_test, out_dir):
    """Generate one ROC plot with all model curves."""
    plt.figure(figsize=(10, 7))

    for model_name, model in models.items():
        X_eval = X_test if model_name == "Decision Tree" else X_test_scaled
        y_score = model.predict_proba(X_eval)[:, 1]
        fpr, tpr, _ = roc_curve(y_test, y_score)
        auc_score = roc_auc_score(y_test, y_score)
        plt.plot(fpr, tpr, linewidth=2, label=f"{model_name} (AUC={auc_score:.3f})")

    plt.plot([0, 1], [0, 1], linestyle="--", color="gray", label="Random baseline")
    plt.title("ROC Curve Comparison")
    plt.xlabel("False Positive Rate")
    plt.ylabel("True Positive Rate")
    plt.legend(loc="lower right")
    plt.grid(alpha=0.25)
    plt.tight_layout()
    roc_path = out_dir / "roc_curve_all_models.png"
    plt.savefig(roc_path, dpi=200)
    plt.close()


def generate_confusion_matrices(models, X_test, X_test_scaled, y_test, out_dir):
    """Generate a confusion matrix grid for all trained models."""
    fig, axes = plt.subplots(2, 3, figsize=(15, 9))
    axes = axes.flatten()

    for idx, (model_name, model) in enumerate(models.items()):
        X_eval = X_test if model_name == "Decision Tree" else X_test_scaled
        y_pred = model.predict(X_eval)
        ConfusionMatrixDisplay.from_predictions(
            y_test,
            y_pred,
            ax=axes[idx],
            colorbar=False,
            cmap="Blues",
            values_format="d",
        )
        axes[idx].set_title(model_name)

    axes[-1].axis("off")
    fig.suptitle("Confusion Matrices (All Models)", fontsize=14)
    plt.tight_layout()
    cm_path = out_dir / "confusion_matrix_all_models.png"
    plt.savefig(cm_path, dpi=200)
    plt.close()


def generate_shap_summary(X_test, out_dir):
    """Generate SHAP summary plot for Decision Tree model."""
    dt_model = joblib.load("dt_model.pkl")
    explainer = shap.TreeExplainer(dt_model)

    shap_raw = explainer.shap_values(X_test.values.astype(float))
    if isinstance(shap_raw, list):
        shap_values = shap_raw[1]
    elif getattr(shap_raw, "ndim", 0) == 3:
        shap_values = shap_raw[:, :, 1]
    else:
        shap_values = shap_raw

    plt.figure(figsize=(10, 6))
    shap.summary_plot(shap_values, X_test, feature_names=X_test.columns, show=False)
    plt.tight_layout()
    shap_path = out_dir / "shap_summary_decision_tree.png"
    plt.savefig(shap_path, dpi=200, bbox_inches="tight")
    plt.close()


def main():
    out_dir = Path("plots")
    out_dir.mkdir(parents=True, exist_ok=True)

    X, y = load_data()
    X_test, X_test_scaled, y_test = build_test_sets(X, y)
    models = load_models()

    generate_roc_plot(models, X_test, X_test_scaled, y_test, out_dir)
    generate_confusion_matrices(models, X_test, X_test_scaled, y_test, out_dir)
    generate_shap_summary(X_test, out_dir)

    print("Generated plots:")
    print(f"- {out_dir / 'roc_curve_all_models.png'}")
    print(f"- {out_dir / 'confusion_matrix_all_models.png'}")
    print(f"- {out_dir / 'shap_summary_decision_tree.png'}")


if __name__ == "__main__":
    main()
