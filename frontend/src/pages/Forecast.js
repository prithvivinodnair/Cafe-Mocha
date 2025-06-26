import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BASE_URL from '../config';
import Plot from 'react-plotly.js';
import Card from "../components/card";
import { motion } from "framer-motion";

function Forecast() {
  const [forecast, setForecast] = useState(null);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const res1 = await axios.get(`${BASE_URL}/forecast/sarima`);
        const res2 = await axios.get(`${BASE_URL}/forecast/xgboost`);
        setForecast(res1.data);
        setMetrics(res2.data);
      } catch (err) {
        console.error("Error fetching forecast data:", err);
      }
    };

    fetchForecast();
  }, []);

  return (
    <motion.div className="page-wrapper">
      <h2>📈 Forecast & Model Performance</h2>

      {metrics && (
        <Card title="📊 Model Performance Metrics">
          <p><strong>MAE:</strong> {metrics.MAE}</p>
          <p><strong>RMSE:</strong> {metrics.RMSE}</p>
          <p><strong>R² Score:</strong> {metrics.R2}</p>
        </Card>
      )}

      {forecast && (
        <>
          <Card title="📊 Forecasted Revenue vs Expenses (Next 36 Months)">
            <Plot
              data={[
                {
                  x: forecast.months,
                  y: forecast.revenue,
                  name: 'Revenue',
                  type: 'scatter',
                  mode: 'lines+markers',
                },
                {
                  x: forecast.months,
                  y: forecast.expenses,
                  name: 'Expenses',
                  type: 'scatter',
                  mode: 'lines+markers',
                },
              ]}
              layout={{ width: 700, height: 400 }}
            />
          </Card>

          <Card title="💵 Forecasted Profit">
            <Plot
              data={[
                {
                  x: forecast.months,
                  y: forecast.profit,
                  name: 'Profit',
                  type: 'scatter',
                  mode: 'lines+markers',
                  line: { color: 'green' },
                },
              ]}
              layout={{ width: 700, height: 400 }}
            />
          </Card>
        </>
      )}
    </motion.div>
  );
}

export default Forecast;
