// src/pages/AIInsights.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import Card from "../components/card";
import { motion } from "framer-motion"

const AIInsights = () => {
  const [insights, setInsights] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/ai/insights")
      .then((res) => {
        setInsights(res.data.insights);
        setLoading(false);
      })
      .catch((err) => {
        setInsights("Failed to fetch AI insights.");
        setLoading(false);
      });
  }, []);

  return (
    <motion.div className="page-wrapper">
      <h2>📊 AI Insights</h2>
      <Card title="🤖 Gemini Analysis & Recommendations">
        {loading ? (
          <p>Loading insights...</p>
        ) : (
          <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
            {insights}
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default AIInsights;
