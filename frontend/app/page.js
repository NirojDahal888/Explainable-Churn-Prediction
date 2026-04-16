"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "http://127.0.0.1:8000/predict";

const MODEL_ORDER = [
  { key: "random_forest", label: "Random Forest", short: "RF" },
  { key: "logistic_regression", label: "Logistic Regression", short: "LR" },
  { key: "decision_tree", label: "Decision Tree", short: "DT" },
  { key: "svm", label: "SVM", short: "SVM" },
  { key: "ann", label: "ANN", short: "ANN" },
];

const FIELDS = [
  { name: "tenure", label: "Tenure", unit: "mo", type: "number", placeholder: "24", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", description: "Customer lifetime in months" },
  { name: "MonthlyCharges", label: "Monthly Charges", unit: "$", type: "number", placeholder: "75.50", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", description: "Amount billed each month" },
  { name: "TotalCharges", label: "Total Charges", unit: "$", type: "number", placeholder: "1800.00", icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z", description: "Cumulative amount charged" },
  { name: "InternetService_Fiber_optic", label: "Fiber Optic", type: "toggle", icon: "M13 10V3L4 14h7v7l9-11h-7z", description: "Fiber optic internet" },
  { name: "PaymentMethod_Electronic_check", label: "E-Check", type: "toggle", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z", description: "Electronic check payment" },
  { name: "Contract_Two_year", label: "2-Year Contract", type: "toggle", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", description: "Locked into 2-year plan" },
  { name: "OnlineSecurity_Yes", label: "Online Security", type: "toggle", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", description: "Has security add-on" },
  { name: "TechSupport_Yes", label: "Tech Support", type: "toggle", icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z", description: "Has tech support plan" },
  { name: "PaperlessBilling_Yes", label: "Paperless Billing", type: "toggle", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", description: "E-billing enabled" },
  { name: "Partner_Yes", label: "Has Partner", type: "toggle", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z", description: "Customer has a partner" },
];

function DonutChart({ probability }) {
  const churnPct = probability * 100;
  const retainPct = 100 - churnPct;
  const circumference = 2 * Math.PI * 54;
  const churnDash = (churnPct / 100) * circumference;
  const retainDash = (retainPct / 100) * circumference;

  return (
    <div className="flex items-center gap-6">
      <div className="relative shrink-0">
        <svg width="140" height="140" viewBox="0 0 140 140" className="transform -rotate-90">
          <circle cx="70" cy="70" r="54" fill="none" stroke="#f1f5f9" strokeWidth="14" />
          <circle cx="70" cy="70" r="54" fill="none" stroke="#10b981" strokeWidth="14"
            strokeDasharray={`${retainDash} ${circumference}`} strokeLinecap="round" />
          <circle cx="70" cy="70" r="54" fill="none" stroke="#f43f5e" strokeWidth="14"
            strokeDasharray={`${churnDash} ${circumference}`}
            strokeDashoffset={`${-retainDash}`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-black text-slate-800">{churnPct.toFixed(1)}%</span>
          <span className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold">churn</span>
        </div>
      </div>
      <div className="space-y-3 flex-1">
        <div>
          <div className="flex justify-between text-xs mb-1 font-semibold">
            <span className="text-rose-500 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />Churn Risk</span>
            <span className="text-rose-600 font-black">{churnPct.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-rose-500 rounded-full transition-all duration-1000" style={{ width: `${churnPct}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1 font-semibold">
            <span className="text-emerald-500 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Retention</span>
            <span className="text-emerald-600 font-black">{retainPct.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${retainPct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ShapChart({ shapValues, baseValue }) {
  if (!shapValues || shapValues.length === 0) return null;
  const maxAbs = Math.max(...shapValues.map((s) => Math.abs(s.value)), 0.001);

  return (
    <div className="space-y-2.5">
      <div className="flex gap-3 text-[10px] font-bold uppercase tracking-wider mb-3">
        <span className="flex items-center gap-1 text-rose-500"><span className="w-2 h-2 rounded-sm bg-rose-500 inline-block" />Churn</span>
        <span className="flex items-center gap-1 text-emerald-500"><span className="w-2 h-2 rounded-sm bg-emerald-500 inline-block" />Retention</span>
      </div>
      {shapValues.map((item, idx) => {
        const pct = (Math.abs(item.value) / maxAbs) * 100;
        const isChurn = item.value > 0;
        return (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-medium w-28 truncate text-right shrink-0">{item.feature}</span>
            <div className="flex-1 flex items-center h-5 relative">
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 z-10" />
              {isChurn ? (
                <div className="absolute left-1/2 h-4 rounded-r bg-rose-400 transition-all duration-700" style={{ width: `${pct / 2}%` }} />
              ) : (
                <div className="absolute right-1/2 h-4 rounded-l bg-emerald-400 transition-all duration-700" style={{ width: `${pct / 2}%` }} />
              )}
            </div>
            <span className={`text-[10px] font-bold w-12 text-right shrink-0 ${isChurn ? "text-rose-500" : "text-emerald-500"}`}>
              {item.value > 0 ? "+" : ""}{item.value.toFixed(3)}
            </span>
          </div>
        );
      })}
      {baseValue !== undefined && (
        <p className="text-[10px] text-slate-400 text-center pt-2 border-t border-slate-100">
          Base value: <span className="font-bold text-slate-500">{baseValue.toFixed(4)}</span>
        </p>
      )}
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none ${checked ? "bg-indigo-500" : "bg-slate-200"}`}>
      <span className={`pointer-events-none inline-block h-4 w-4 mt-0.5 transform rounded-full bg-white shadow transition duration-200 ${checked ? "translate-x-4" : "translate-x-0.5"}`} />
    </button>
  );
}

function ModelPredictionCard({ modelName, modelResult, isActive, onSelect }) {
  const isChurn = modelResult?.prediction === 1;
  const confidence = modelResult?.confidence ?? 0;

  return (
    <button type="button" onClick={onSelect}
      className={`w-full text-left rounded-xl border p-3.5 transition-all duration-200 ${
        isActive ? "border-indigo-300 bg-indigo-50 shadow-sm shadow-indigo-100" : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
      }`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">{modelName}</p>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isChurn ? "bg-rose-50 text-rose-600 border border-rose-200" : "bg-emerald-50 text-emerald-600 border border-emerald-200"}`}>
          {isChurn ? "Churn" : "Stay"}
        </span>
      </div>
      <p className={`text-2xl font-black mb-1.5 ${isChurn ? "text-rose-500" : "text-emerald-500"}`}>{confidence.toFixed(1)}<span className="text-sm font-semibold">%</span></p>
      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${confidence > 50 ? "bg-rose-400" : "bg-emerald-400"}`}
          style={{ width: `${Math.min(Math.max(confidence, 0), 100)}%` }} />
      </div>
    </button>
  );
}

function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 border-[3px] border-slate-100 rounded-full" />
        <div className="absolute inset-0 border-[3px] border-transparent border-t-indigo-500 rounded-full animate-spin" />
      </div>
      <span className="text-sm text-slate-400 font-medium animate-pulse">Analyzing customer data...</span>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    tenure: "", MonthlyCharges: "", TotalCharges: "",
    InternetService_Fiber_optic: 0, PaymentMethod_Electronic_check: 0, Contract_Two_year: 0,
    OnlineSecurity_Yes: 0, TechSupport_Yes: 0, PaperlessBilling_Yes: 0, Partner_Yes: 0,
  });

  const [result, setResult] = useState(null);
  const [selectedModelKey, setSelectedModelKey] = useState("random_forest");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    let authCheckInterval;

    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", { method: "GET", cache: "no-store" });
        if (!response.ok) {
          setAuthRequired(true);
          setCurrentUser(null);
          return;
        }
        const data = await response.json();
        setCurrentUser(data.user || null);
        setAuthRequired(false);
      } catch (err) {
        setAuthRequired(true);
        setCurrentUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();

    authCheckInterval = setInterval(checkAuth, 3000); // auto-check every 3s

    return () => clearInterval(authCheckInterval);
  }, [router]);

  const getRecommendation = (confidence) => {
  if (confidence <= 10) return {
    riskLevel: "Very Low Risk",
    recommendation: "This customer is highly loyal and shows strong engagement with your product or service. At this stage, the focus should be on maintaining satisfaction and reinforcing their positive experience. Continue providing consistent value through high-quality service, smooth user experience, and reliable support. Consider sending occasional newsletters, updates about new features, or loyalty rewards such as exclusive perks or early access to new offerings. Avoid over-communication, but ensure the brand stays present in a non-intrusive way. The goal here is long-term retention through trust and consistency rather than aggressive marketing.",
    color: "emerald"
  };

  if (confidence <= 20) return {
    riskLevel: "Low Risk",
    recommendation: "The customer is still engaged but may require light nurturing to maintain their interest. You should focus on personalized communication such as tailored emails, product recommendations, or updates based on their previous activity. Monitoring behavioral patterns like reduced usage or interaction frequency is important. Introduce small engagement strategies such as surveys, feedback forms, or feature highlights to keep them connected. The objective is to proactively maintain engagement before any noticeable decline begins.",
    color: "emerald"
  };

  if (confidence <= 30) return {
    riskLevel: "Slight Risk",
    recommendation: "The customer is beginning to show early signs of disengagement. At this stage, it is important to act proactively by offering light incentives such as small discounts, loyalty points, or personalized offers. Improving the customer experience should be a priority, including faster support response times and better usability. Consider sending targeted emails that highlight the value they may be missing. This is also a good time to analyze their journey and identify any friction points that may be causing reduced engagement.",
    color: "teal"
  };

  if (confidence <= 40) return {
    riskLevel: "Moderate Risk",
    recommendation: "The customer is at a moderate risk of churning and requires more focused attention. Implement targeted marketing campaigns such as personalized promotions or recommendations based on their behavior. Engage them through feedback requests to understand their concerns and satisfaction levels. It is also beneficial to reintroduce key features or benefits they may not be utilizing. Customer experience improvements and proactive communication will play a critical role in preventing further disengagement.",
    color: "yellow"
  };

  if (confidence <= 50) return {
    riskLevel: "Medium Risk",
    recommendation: "At this stage, the customer is showing clear signs of disengagement and requires active intervention. Customer support teams should consider reaching out directly through email or calls to understand any issues they may be facing. Providing limited-time offers, discounts, or incentives can help re-engage them. Focus on identifying pain points such as pricing concerns, usability issues, or unmet expectations. A combination of human interaction and targeted offers is essential to retain the customer.",
    color: "amber"
  };

  if (confidence <= 60) return {
    riskLevel: "High Risk",
    recommendation: "The customer is at high risk of churn and immediate action is required. Offer retention-focused incentives such as special discounts, subscription upgrades, or additional benefits tailored to their needs. Investigate customer behavior and feedback thoroughly to identify dissatisfaction triggers. Personalized communication is crucial here, ensuring the customer feels valued and understood. Escalating the case to experienced support staff can significantly improve the chances of retention.",
    color: "orange"
  };

  if (confidence <= 70) return {
    riskLevel: "Very High Risk",
    recommendation: "The customer is very close to churning and requires urgent, personalized intervention. A direct approach from customer support or account managers is recommended. Provide highly customized offers, exclusive deals, or service recovery options to regain their trust. Analyze their entire journey to pinpoint exact issues and address them effectively. At this stage, building a personal connection and demonstrating commitment to resolving their concerns can make a significant difference.",
    color: "orange"
  };

  if (confidence <= 80) return {
    riskLevel: "Critical Risk",
    recommendation: "The customer is at critical risk and may leave at any moment. Launch a strong retention campaign including exclusive discounts, premium support, or bundled offers that provide significant value. Immediate and proactive outreach is necessary, preferably through multiple channels such as email, phone, or in-app messaging. Focus on resolving any outstanding issues quickly and efficiently. Demonstrating urgency and care is essential to prevent churn at this stage.",
    color: "rose"
  };

  if (confidence <= 90) return {
    riskLevel: "Severe Risk",
    recommendation: "This is a severe churn risk scenario requiring immediate and decisive action. Direct communication such as phone calls or personalized messages should be prioritized. Offer urgent retention deals, high-value incentives, or customized solutions to address their concerns. It is critical to identify and fix any major dissatisfaction factors immediately. The goal is to quickly re-establish trust and provide compelling reasons for the customer to stay.",
    color: "rose"
  };

  return {
    riskLevel: "Extreme Risk",
    recommendation: "The customer is on the verge of being lost or may have already disengaged completely. At this stage, a win-back strategy is essential. Offer significant incentives such as large discounts, exclusive benefits, or personalized recovery offers. Re-engagement campaigns should focus on reminding the customer of the value they once received while addressing past issues transparently. Even if recovery is uncertain, these efforts can provide valuable insights into churn reasons and improve future retention strategies.",
    color: "rose"
  };
};

  const getBadgeColors = (color) => {
    const map = {
      emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
      teal: "bg-teal-50 border-teal-200 text-teal-700",
      yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
      amber: "bg-amber-50 border-amber-200 text-amber-700",
      orange: "bg-orange-50 border-orange-200 text-orange-700",
      rose: "bg-rose-50 border-rose-200 text-rose-700",
    };
    return map[color] || map.emerald;
  };

  const handleChange = (name, value) => {
    setFormData((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "tenure" || name === "MonthlyCharges") {
        const tenure = Number(name === "tenure" ? value : prev.tenure);
        const monthly = Number(name === "MonthlyCharges" ? value : prev.MonthlyCharges);

        if (!Number.isNaN(tenure) && !Number.isNaN(monthly) && tenure >= 0 && monthly >= 0) {
          next.TotalCharges = (tenure * monthly).toFixed(2);
        } else {
          next.TotalCharges = "";
        }
      }

      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setResult(null); setLoading(true);
    const numericFields = ["tenure", "MonthlyCharges", "TotalCharges"];
    for (const f of numericFields) {
      if (formData[f] === "" || isNaN(Number(formData[f])) || Number(formData[f]) < 0) {
        setError(`Please enter a valid positive number for ${FIELDS.find(x => x.name === f)?.label || f}`);
        setLoading(false); return;
      }
    }
    const payload = { ...formData, tenure: parseFloat(formData.tenure), MonthlyCharges: parseFloat(formData.MonthlyCharges), TotalCharges: parseFloat(formData.TotalCharges) };
    try {
      const res = await fetch(API_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.status === 401) {
        setAuthRequired(true);
        setError("Session expired. Please log in again.");
        return;
      }
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.detail || `Server error: ${res.status}`);
      }
      const data = await res.json();
      setResult(data); setSelectedModelKey("random_forest");
    } catch (err) {
      setError(err.message || "Failed to connect to the prediction server.");
    } finally { setLoading(false); }
  };

  const handleReset = () => {
    setFormData({ tenure: "", MonthlyCharges: "", TotalCharges: "", InternetService_Fiber_optic: 0, PaymentMethod_Electronic_check: 0, Contract_Two_year: 0, OnlineSecurity_Yes: 0, TechSupport_Yes: 0, PaperlessBilling_Yes: 0, Partner_Yes: 0 });
    setResult(null); setSelectedModelKey("random_forest"); setError("");
  };

  const handleLogout = async () => {
    try { await fetch("/api/auth/logout", { method: "POST" }); } finally { router.replace("/login"); }
  };

  const modelsResult = result?.models || (result ? { random_forest: result } : null);
  const selectedModelResult = modelsResult?.[selectedModelKey] || modelsResult?.random_forest || result;
  const selectedModelLabel = MODEL_ORDER.find((m) => m.key === selectedModelKey)?.label || "Random Forest";

  if (authLoading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spinner />
      </main>
    );
  }

  if (authRequired) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl p-6 shadow-sm text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h1>
          <p className="text-sm text-gray-600 mb-6">
            Your authentication cookie is missing or invalid. For security, we have locked the prediction dashboard.
          </p>
          <button
            onClick={() => router.replace("/login")}
            className="w-full bg-blue-600 text-white rounded-lg py-2.5 font-semibold hover:bg-blue-700 transition"
          >
            Go to Login
          </button>
          <p className="text-xs text-gray-400 mt-4">If you deleted the cookie manually, please sign in again.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f9fc]" style={{ fontFamily: "'DM Sans', 'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800;9..40,900&display=swap');
        .card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03); }
        .section-label { font-size: 10.5px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #94a3b8; }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        .result-appear { animation: resultAppear 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes resultAppear { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

          {/* Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white flex items-center justify-center shrink-0">
              <img src="/logo.jpg" alt="ChurnDetecter logo"
                className="w-full h-full object-contain p-0.5"
                onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-black text-slate-900 tracking-tight">ChurnDetecter</span>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wide hidden sm:block">ML Churn Prediction Platform</span>
            </div>
          </div>



          {/* Right side */}
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
              Model Online
            </span>
            {currentUser?.email && (
              <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                <div className="w-5 h-5 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center shrink-0">
                  <span className="text-[9px] font-black text-indigo-600">{currentUser.email[0].toUpperCase()}</span>
                </div>
                <span className="text-[11px] text-slate-600 font-medium max-w-[140px] truncate">{currentUser.email}</span>
              </div>
            )}
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 text-[11px] font-bold px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-5">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <p className="section-label mb-1.5">ML Prediction Dashboard · 5 Models Active</p>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Customer Churn Prediction</h1>
            <p className="text-sm text-slate-500 mt-1.5">Enter customer attributes for instant multi-model churn analysis with SHAP explainability</p>
          </div>
          {result && selectedModelResult && (
            <div className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl border font-bold text-sm result-appear shrink-0 ${
              selectedModelResult.prediction === 1 ? "bg-rose-50 border-rose-200 text-rose-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"
            }`}>
              {selectedModelResult.prediction === 1 ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              )}
              {selectedModelResult.prediction === 1 ? "Likely to Churn" : "Likely to Stay"}
              <span className="font-black">{selectedModelResult.confidence}%</span>
            </div>
          )}
        </div>

        {/* ═══ ROW 1: Input Form + Summary Panel ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">

          {/* ── Col 1: Customer Profile Form ── */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-800">Customer Profile</h2>
                <p className="text-[11px] text-slate-400">10 features · 3 numeric + 7 categorical</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Numeric inputs — each on its own row */}
              <div>
                <p className="section-label mb-3">Billing & Tenure</p>
                <div className="flex flex-col gap-2.5">
                  {FIELDS.filter(f => f.type === "number").map((field) => (
                    <div key={field.name} className="flex items-center gap-3">
                      <label className="text-[11px] font-bold text-slate-500 w-32 shrink-0 text-right">{field.label}</label>
                      <div className="relative flex-1">
                        <input type="number" step="any" min="0" placeholder={field.placeholder}
                          value={formData[field.name]}
                          onChange={(e) => handleChange(field.name, e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 pr-10 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 focus:bg-white transition-all outline-none font-semibold" />
                        {field.unit && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">{field.unit}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-slate-100" />
                <p className="section-label">Service Features</p>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              {/* Toggle inputs */}
              <div className="grid grid-cols-2 gap-2">
                {FIELDS.filter(f => f.type === "toggle").map((field) => (
                  <div key={field.name}
                    onClick={() => handleChange(field.name, formData[field.name] === 1 ? 0 : 1)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl border transition-all duration-150 cursor-pointer select-none ${
                      formData[field.name] === 1 ? "bg-indigo-50 border-indigo-200" : "bg-slate-50 border-slate-200 hover:border-slate-300"
                    }`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <svg className={`w-3.5 h-3.5 shrink-0 ${formData[field.name] === 1 ? "text-indigo-500" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={field.icon} />
                      </svg>
                      <span className={`text-xs font-semibold truncate ${formData[field.name] === 1 ? "text-indigo-700" : "text-slate-600"}`}>{field.label}</span>
                    </div>
                    <Toggle checked={formData[field.name] === 1} onChange={(v) => handleChange(field.name, v ? 1 : 0)} />
                  </div>
                ))}
              </div>

              {error && (
                <div className="mt-4 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 font-medium">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              <div className="flex gap-3 mt-5">
                <button type="submit" disabled={loading}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold py-2.5 px-7 rounded-xl transition-all shadow-sm shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                  {loading ? (
                    <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>Analyzing...</>
                  ) : (
                    <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>Run Prediction</>
                  )}
                </button>
                <button type="button" onClick={handleReset}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-500 font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all text-sm">
                  Clear
                </button>
              </div>
            </form>
          </div>

          {/* ── Col 2: Input Summary & Quick Guide ── */}
          <div className="flex flex-col gap-4 h-full">

            {/* Live input snapshot */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800">Input Summary</h3>
                  <p className="text-[11px] text-slate-400">Live preview of entered values</p>
                </div>
              </div>

              {/* Numeric summary */}
              <div className="space-y-2 mb-4">
                {FIELDS.filter(f => f.type === "number").map((field) => {
                  const val = formData[field.name];
                  const filled = val !== "" && !isNaN(Number(val)) && Number(val) >= 0;
                  return (
                    <div key={field.name} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <span className="text-xs text-slate-500 font-medium">{field.label}</span>
                      <span className={`text-xs font-bold ${filled ? "text-slate-800" : "text-slate-300"}`}>
                        {filled ? `${field.unit === "$" ? "$" : ""}${Number(val).toLocaleString()}${field.unit === "mo" ? " mo" : ""}` : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Active features */}
              <p className="section-label mb-2">Active Features</p>
              <div className="flex flex-wrap gap-1.5">
                {FIELDS.filter(f => f.type === "toggle" && formData[f.name] === 1).length === 0 ? (
                  <span className="text-[11px] text-slate-300 font-medium">None selected</span>
                ) : (
                  FIELDS.filter(f => f.type === "toggle" && formData[f.name] === 1).map(f => (
                    <span key={f.name} className="text-[10px] font-bold px-2 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600">
                      {f.label}
                    </span>
                  ))
                )}
              </div>

              {/* Completeness bar */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                {(() => {
                  const numFilled = FIELDS.filter(f => f.type === "number").filter(f => formData[f.name] !== "" && !isNaN(Number(formData[f.name])) && Number(formData[f.name]) >= 0).length;
                  const pct = Math.round((numFilled / 3) * 100);
                  return (
                    <>
                      <div className="flex justify-between text-[11px] font-bold mb-1.5">
                        <span className="text-slate-500">Form completeness</span>
                        <span className={pct === 100 ? "text-emerald-500" : "text-slate-400"}>{pct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? "bg-emerald-400" : "bg-indigo-400"}`}
                          style={{ width: `${pct}%` }} />
                      </div>
                      {pct === 100 && (
                        <p className="text-[10px] text-emerald-500 font-semibold mt-1.5 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                          Ready to run prediction
                        </p>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            {/* How it works */}
            <div className="card p-5 flex-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-sm font-extrabold text-slate-800">How It Works</h3>
              </div>
              <div className="space-y-3">
                {[
                  { step: "1", title: "Enter Customer Data", desc: "Fill in tenure, charges, and toggle active service features.", color: "bg-indigo-500" },
                  { step: "2", title: "Run 5 ML Models", desc: "Random Forest, Logistic Regression, Decision Tree, SVM, and ANN predict in parallel.", color: "bg-violet-500" },
                  { step: "3", title: "Compare & Explain", desc: "View per-model confidence scores and SHAP feature attribution.", color: "bg-sky-500" },
                  { step: "4", title: "Act on Insights", desc: "Follow the risk-tiered recommendation to retain the customer.", color: "bg-emerald-500" },
                ].map(({ step, title, desc, color }) => (
                  <div key={step} className="flex gap-3">
                    <div className={`w-5 h-5 rounded-full ${color} flex items-center justify-center shrink-0 mt-0.5`}>
                      <span className="text-[9px] font-black text-white">{step}</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">{title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="card p-10">
            <Spinner />
          </div>
        )}

        {/* ═══ RESULTS ═══ */}
        {result && !loading && (
          <div className="space-y-5 result-appear">

            {/* ── ROW 2: Model Comparison | Probability + Donut ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              {/* Model Comparison */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-800">Model Comparison</h3>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">Click to inspect</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {MODEL_ORDER.filter((m) => modelsResult[m.key]).map((modelMeta) => (
                    <ModelPredictionCard key={modelMeta.key} modelName={modelMeta.label}
                      modelResult={modelsResult[modelMeta.key]}
                      isActive={selectedModelKey === modelMeta.key}
                      onSelect={() => setSelectedModelKey(modelMeta.key)} />
                  ))}
                </div>
                <p className="text-[11px] text-center mt-3 text-slate-400">
                  Active: <span className="font-bold text-slate-600">{selectedModelLabel}</span>
                </p>
              </div>

              {/* Churn Probability + Donut */}
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-800">Churn Probability</h3>
                </div>

                <DonutChart probability={selectedModelResult.probability} />

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500">Overall Risk Score</span>
                    <span className={`text-2xl font-black ${selectedModelResult.confidence > 50 ? "text-rose-500" : "text-emerald-500"}`}>
                      {selectedModelResult.confidence}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-1000 ${selectedModelResult.confidence > 50 ? "bg-gradient-to-r from-orange-400 to-rose-500" : "bg-gradient-to-r from-teal-400 to-emerald-500"}`}
                      style={{ width: `${selectedModelResult.confidence}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* ── ROW 3: SHAP | Status + Stats + Recommendation ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              {/* SHAP Feature Impact */}
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800">SHAP — Feature Impact</h3>
                    <p className="text-[10px] text-slate-400">How each feature pushes the prediction</p>
                  </div>
                </div>
                {selectedModelResult?.shap_values ? (
                  <ShapChart shapValues={selectedModelResult.shap_values} baseValue={selectedModelResult.shap_base_value} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                      <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <p className="text-xs text-slate-400 font-semibold">SHAP values not available</p>
                    <p className="text-[11px] text-slate-300 mt-0.5">Not supported for this model</p>
                  </div>
                )}
              </div>

              {/* Status + Stats + Recommendation */}
              <div className="card p-6 flex flex-col gap-4">

                {/* Prediction outcome badge */}
                <div className={`flex items-center justify-between p-4 rounded-2xl border ${
                  selectedModelResult.prediction === 1 ? "bg-rose-50 border-rose-200" : "bg-emerald-50 border-emerald-200"
                }`}>
                  <div>
                    <p className={`text-base font-black ${selectedModelResult.prediction === 1 ? "text-rose-600" : "text-emerald-600"}`}>
                      {selectedModelResult.prediction === 1 ? "Likely to Churn" : "Likely to Stay"}
                    </p>
                    <p className={`text-xs font-semibold mt-0.5 ${selectedModelResult.prediction === 1 ? "text-rose-400" : "text-emerald-400"}`}>
                      {selectedModelResult.prediction === 1 ? "Intervention recommended" : "Customer appears stable"}
                    </p>
                  </div>
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    selectedModelResult.prediction === 1 ? "bg-rose-100" : "bg-emerald-100"
                  }`}>
                    {selectedModelResult.prediction === 1 ? (
                      <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                    ) : (
                      <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    )}
                  </div>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                    <p className="section-label mb-1">Status</p>
                    <p className={`text-sm font-black ${selectedModelResult.prediction === 1 ? "text-rose-500" : "text-emerald-500"}`}>
                      {selectedModelResult.churn === "Yes" ? "Churning" : "Retained"}
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                    <p className="section-label mb-1">Confidence</p>
                    <p className="text-sm font-black text-indigo-600">
                      {selectedModelResult.confidence > 50 ? selectedModelResult.confidence : (100 - selectedModelResult.confidence).toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Recommendation */}
                {(() => {
                  const rec = {
                    riskLevel: selectedModelResult.risk_level || getRecommendation(selectedModelResult.confidence).riskLevel,
                    recommendation: selectedModelResult.action_recommendation || getRecommendation(selectedModelResult.confidence).recommendation,
                    color: selectedModelResult.recommendation_color || getRecommendation(selectedModelResult.confidence).color,
                  };
                  return (
                    <div className="flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <p className="section-label">Action Recommendation</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getBadgeColors(rec.color)}`}>
                          {rec.riskLevel}
                        </span>
                      </div>
                      <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                        <p className="text-xs text-slate-600 leading-relaxed">{rec.recommendation}</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !result && !error && (
          <div className="card p-14 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm font-extrabold text-slate-400">No Analysis Yet</p>
            <p className="text-xs text-slate-400 mt-1.5 max-w-xs leading-relaxed">Fill in the customer profile above and click <span className="font-bold text-indigo-500">Run Prediction</span> to see full multi-model churn analysis</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-12 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">

            {/* Brand block */}
            <div className="flex flex-col items-center sm:items-start gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl overflow-hidden border border-slate-200 bg-white flex items-center justify-center shrink-0">
                  <img src="/logo.jpg" alt="ChurnDetecter"
                    className="w-full h-full object-contain p-0.5"
                    onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800 tracking-tight">ChurnDetecter</p>
                  <p className="text-[10px] text-slate-400 font-semibold">ML Churn Prediction Platform</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 max-w-xs text-center sm:text-left leading-relaxed">
                Predict customer churn with multiple machine learning models and SHAP explainability.
              </p>
            </div>

            {/* Tech stack */}
            <div className="flex flex-col items-center sm:items-end gap-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Powered by</p>
              <div className="flex flex-wrap justify-center sm:justify-end gap-1.5">
                {["FastAPI", "Next.js", "Random Forest", "Logistic Reg.", "Decision Tree", "SVM", "ANN"].map((tech) => (
                  <span key={tech} className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-500">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-[11px] text-slate-400">© {new Date().getFullYear()} ChurnDetecter. All rights reserved.</p>
            <p className="text-[11px] text-slate-400">Built for customer retention intelligence</p>
          </div>
        </div>
      </footer>
    </main>
  );
}