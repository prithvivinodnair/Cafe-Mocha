import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BASE_URL from '../config';
import Plot from 'react-plotly.js';
import Card from "../components/card";
import { motion } from "framer-motion";

function FinancialInsights() {
  const [summary, setSummary] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [monthlyProfit, setMonthlyProfit] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res1 = await axios.get(`${BASE_URL}/financial/summary`);
        const res2 = await axios.get(`${BASE_URL}/financial/expense-breakdown`);
        const res3 = await axios.get(`${BASE_URL}/financial/monthly-profit`);

        setSummary(res1.data);
        setExpenses(res2.data);
        setMonthlyProfit(res3.data);
      } catch (err) {
        console.error("Error loading financial data:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <motion.div className="page-wrapper">
      <h2>📊 Financial Insights</h2>

      {summary && (
        <Card title="📌 Summary">
          <p><strong>Total Customers:</strong> {summary.total_customers}</p>
          <p><strong>Average Monthly Profit:</strong> ${summary.avg_profit}</p>
          <p><strong>Lowest Profit:</strong> ${summary.min_profit}</p>
          <p><strong>Status:</strong> {summary.status}</p>
        </Card>
      )}

      {expenses.length > 0 && (
        <Card title="💸 Expense Breakdown">
          <Plot
            data={[
              {
                type: 'pie',
                labels: expenses.map(e => e.Expense),
                values: expenses.map(e => e.Total),
                hole: 0.4,
              },
            ]}
            layout={{ width: 500, height: 400 }}
          />
        </Card>
      )}

      {monthlyProfit.length > 0 && (
        <Card title="📈 Monthly Profit Trend">
          <Plot
            data={[
              {
                type: 'scatter',
                mode: 'lines+markers',
                x: monthlyProfit.map(p => p.Month_Year),
                y: monthlyProfit.map(p => p.Profit),
                line: { color: 'green' },
              },
            ]}
            layout={{ width: 600, height: 400 }}
          />
        </Card>
      )}
    </motion.div>
  );
}

export default FinancialInsights;
