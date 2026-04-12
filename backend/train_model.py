"""Train and save churn models using Decision Tree, SVM, and ANN."""

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score, roc_auc_score
from sklearn.model_selection import GridSearchCV, train_test_split
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.tree import DecisionTreeClassifier
from sklearn.svm import SVC


def load_data():
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

    return X, y, selected_features


def evaluate_model(model_name, model, X_eval, y_eval):
    y_pred = model.predict(X_eval)
    y_proba = model.predict_proba(X_eval)[:, 1]
    pred_confidence = np.maximum(y_proba, 1 - y_proba)

    metrics = {
        "accuracy": accuracy_score(y_eval, y_pred),
        "precision": precision_score(y_eval, y_pred, zero_division=0),
        "recall": recall_score(y_eval, y_pred, zero_division=0),
        "f1": f1_score(y_eval, y_pred, zero_division=0),
        "roc_auc": roc_auc_score(y_eval, y_proba),
        "avg_confidence": float(np.mean(pred_confidence)),
    }

    print(
        f"{model_name}: "
        f"Accuracy={metrics['accuracy']:.4f}, "
        f"Precision={metrics['precision']:.4f}, "
        f"Recall={metrics['recall']:.4f}, "
        f"F1={metrics['f1']:.4f}, "
        f"ROC-AUC={metrics['roc_auc']:.4f}, "
        f"AvgConfidence={metrics['avg_confidence']:.4f}"
    )

    return metrics


# ------------------ Decision Tree ------------------
def train_decision_tree(X_train, y_train):
    param_grid = {
        "max_depth": [None, 5, 10, 20],
        "min_samples_leaf": [1, 5, 10],
        "min_samples_split": [2, 5, 10],
        "criterion": ["gini", "entropy"],
    }

    grid = GridSearchCV(
        DecisionTreeClassifier(class_weight="balanced", random_state=42),
        param_grid,
        cv=5,
        scoring="roc_auc",
        n_jobs=-1,
    )

    grid.fit(X_train.astype(float), y_train)
    print(f"Decision Tree best params: {grid.best_params_}")
    return grid.best_estimator_


# ------------------ SVM ------------------
def train_svm(X_train_scaled, y_train):
    param_grid = {
        "C": [0.1, 1, 10, 100],
        "kernel": ["linear", "rbf"],
        "gamma": ["scale", "auto"],
    }

    grid = GridSearchCV(
        SVC(class_weight="balanced", probability=True, random_state=42),
        param_grid,
        cv=5,
        scoring="roc_auc",
        n_jobs=-1,
    )

    grid.fit(X_train_scaled, y_train)
    print(f"SVM best params: {grid.best_params_}")
    return grid.best_estimator_


# ------------------ ANN ------------------
def train_ann(X_train_scaled, y_train):
    param_grid = {
        "hidden_layer_sizes": [(32, 16), (64, 32)],
        "activation": ["relu", "tanh"],
        "alpha": [0.0001, 0.001],
        "learning_rate_init": [0.001],
    }

    grid = GridSearchCV(
        MLPClassifier(
            solver="adam",
            early_stopping=True,
            max_iter=600,
            random_state=42,
        ),
        param_grid,
        cv=5,
        scoring="roc_auc",
        n_jobs=-1,
    )

    grid.fit(X_train_scaled, y_train)
    print(f"ANN best params: {grid.best_params_}")
    return grid.best_estimator_


def main():
    X, y, selected_features = load_data()

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Scaling (for SVM and ANN only)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # ---------------- Baseline Models ----------------
    dt_baseline = DecisionTreeClassifier(class_weight="balanced", random_state=42)
    dt_baseline.fit(X_train.astype(float), y_train)

    svm_baseline = SVC(class_weight="balanced", probability=True, random_state=42)
    svm_baseline.fit(X_train_scaled, y_train)

    ann_baseline = MLPClassifier(max_iter=600, random_state=42)
    ann_baseline.fit(X_train_scaled, y_train)

    print("\nBefore Tuning:")
    evaluate_model("Decision Tree (Before)", dt_baseline, X_test, y_test)
    evaluate_model("SVM (Before)", svm_baseline, X_test_scaled, y_test)
    evaluate_model("ANN (Before)", ann_baseline, X_test_scaled, y_test)

    # ---------------- Tuned Models ----------------
    dt_model = train_decision_tree(X_train, y_train)
    svm_model = train_svm(X_train_scaled, y_train)
    ann_model = train_ann(X_train_scaled, y_train)

    print("\nAfter Tuning:")
    evaluate_model("Decision Tree (After)", dt_model, X_test, y_test)
    evaluate_model("SVM (After)", svm_model, X_test_scaled, y_test)
    evaluate_model("ANN (After)", ann_model, X_test_scaled, y_test)

    # ---------------- Save Models ----------------
    joblib.dump(dt_model, "dt_model.pkl")
    joblib.dump(svm_model, "svm_model.pkl")
    joblib.dump(ann_model, "ann_model.pkl")
    joblib.dump(scaler, "scaler.pkl")
    joblib.dump(selected_features, "features.pkl")

    print("Saved: dt_model.pkl, svm_model.pkl, ann_model.pkl, scaler.pkl, features.pkl")


if __name__ == "__main__":
    main()