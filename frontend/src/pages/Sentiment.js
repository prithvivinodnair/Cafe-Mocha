import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BASE_URL from '../config';
import Plot from 'react-plotly.js';
import Card from "../components/card";
import { motion } from "framer-motion";

function Sentiment() {
  const [mentions, setMentions] = useState({});
  const [wordclouds, setWordclouds] = useState({});
  const [bubbleData, setBubbleData] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [radarData, setRadarData] = useState([]);
  const [ratings, setRatings] = useState({});

  const emojiMap = {
    pasta: '🍝',
    burger: '🍔',
    coffee: '☕',
    pizza: '🍕',
    mocha: '🍫',
    sandwich: '🥪',
    wrap: '🌯',
    brownie: '🍰',
    smoothie: '🥤',
    food: '🍽️',
    service: '🙋‍♂️',
    ambience: '🪷',
    pricing: '💰',
    staff: '🧑‍🍳',
    menu: '📋',
    cleanliness: '🧼',
    'waiting time': '⏳',
    music: '🎵',
    lighting: '💡'
  };

  useEffect(() => {
    const fetchSentiment = async () => {
      try {
        const [
          mentionsRes,
          wcRes,
          bubbleRes,
          heatmapRes,
          trendRes,
          radarRes,
          ratingsRes
        ] = await Promise.all([
          axios.get(`${BASE_URL}/sentiment/mentions`),
          axios.get(`${BASE_URL}/sentiment/wordcloud`),
          axios.get(`${BASE_URL}/sentiment/bubble`),
          axios.get(`${BASE_URL}/sentiment/heatmap`),
          axios.get(`${BASE_URL}/sentiment/trend`),
          axios.get(`${BASE_URL}/sentiment/radar`),
          axios.get(`${BASE_URL}/sentiment/ratings`)
        ]);

        setMentions(mentionsRes.data);
        setWordclouds(wcRes.data);
        setBubbleData(bubbleRes.data);
        setHeatmapData(heatmapRes.data);
        setTrendData(trendRes.data);
        setRadarData(radarRes.data);
        setRatings(ratingsRes.data);
      } catch (err) {
        console.error("Sentiment data error:", err);
      }
    };

    fetchSentiment();
  }, []);

  return (
    <motion.div className="page-wrapper" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <h2>💬 Sentiment Analysis</h2>

      <Card title="🔢 Mentions Count">
        <ul>
          {Object.entries(mentions).map(([word, count]) => (
            <li key={word}>
              {emojiMap[word] || word}: {count}
            </li>
          ))}
        </ul>
      </Card>

      <Card title="🧠 Wordclouds">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          {wordclouds.positive && (
            <img src={wordclouds.positive} alt="Positive Wordcloud" width="400" />
          )}
          {wordclouds.negative && (
            <img src={wordclouds.negative} alt="Negative Wordcloud" width="400" />
          )}
        </div>
      </Card>

      <Card title="🔵 Aspect-Sentiment Bubble Chart">
        <div style={{ overflowX: "auto" }}>
          <Plot
            data={[{
              x: bubbleData.map(item => item.Aspect),
              y: bubbleData.map(item => item.Sentiment),
              mode: 'markers',
              marker: { size: bubbleData.map(item => item.Count), sizemode: 'area' },
              text: bubbleData.map(item => `${item.Aspect} (${item.Count})`),
              type: 'scatter'
            }]}
            layout={{ width: 800, height: 400, margin: { t: 30 } }}
          />
        </div>
      </Card>

      <Card title="🔥 Heatmap of Sentiments per Aspect">
        <div style={{ overflowX: "auto" }}>
          <Plot
            data={[{
              z: heatmapData.map(row => [row.Negative, row.Neutral, row.Positive]),
              x: ['Negative', 'Neutral', 'Positive'],
              y: heatmapData.map(row => row.Aspect),
              type: 'heatmap',
              colorscale: 'Blues'
            }]}
            layout={{ width: 800, height: 400 }}
          />
        </div>
      </Card>

      <Card title="📈 Sentiment Trend Over Months">
        <div style={{ overflowX: "auto" }}>
          <Plot
            data={['LABEL_0', 'LABEL_1', 'LABEL_2'].map(label => ({
              x: trendData.filter(d => d.Predicted_Label === label).map(d => d.Month),
              y: trendData.filter(d => d.Predicted_Label === label).map(d => d.Count),
              type: 'scatter',
              mode: 'lines+markers',
              name: label
            }))}
            layout={{ width: 800, height: 400 }}
          />
        </div>
      </Card>

      <Card title="🧭 Radar Chart: Positive vs Negative per Aspect">
        <div style={{ overflowX: "auto" }}>
          <Plot
            data={[
              {
                type: 'scatterpolar',
                r: radarData.map(r => r.Positive),
                theta: radarData.map(r => r.Aspect),
                fill: 'toself',
                name: 'Positive'
              },
              {
                type: 'scatterpolar',
                r: radarData.map(r => r.Negative),
                theta: radarData.map(r => r.Aspect),
                fill: 'toself',
                name: 'Negative'
              }
            ]}
            layout={{
              width: 600,
              height: 500,
              polar: { radialaxis: { visible: true } },
              showlegend: true
            }}
          />
        </div>
      </Card>

      <Card title="🍩 Customer Rating Distribution">
        <div style={{ overflowX: "auto" }}>
          <Plot
            data={[{
              type: 'pie',
              labels: Object.keys(ratings),
              values: Object.values(ratings),
              hole: 0.5
            }]}
            layout={{ width: 500, height: 400 }}
          />
        </div>
      </Card>
    </motion.div>
  );
}

export default Sentiment;
