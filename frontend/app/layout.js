import "./globals.css";

export const metadata = {
  title: "ChurnDetecter | AI-Powered Churn Prediction",
  description: "Predict customer churn using Random Forest machine learning",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-white antialiased">
        {children}
      </body>
    </html>
  );
}
