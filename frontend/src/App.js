// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/sidebar";
import Header from "./components/header";
import Upload from "./pages/Upload";
import FinancialInsights from "./pages/FinancialInsights";
import Forecast from "./pages/Forecast";
import Sentiment from "./pages/Sentiment";
import AIInsights from "./pages/AIInsights";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <div className="content-wrapper">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to="/upload" />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/financial" element={<FinancialInsights />} />
              <Route path="/forecast" element={<Forecast />} />
              <Route path="/sentiment" element={<Sentiment />} />
              <Route path="/ai-insights" element={<AIInsights />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
