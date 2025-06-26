import React, { useState } from 'react';
import axios from 'axios';
import BASE_URL from '../config';
import Card from "../components/card";
import { motion } from "framer-motion";

function Upload() {
  const [finFile, setFinFile] = useState(null);
  const [revFile, setRevFile] = useState(null);
  const [status, setStatus] = useState("");

  const handleUpload = async () => {
    try {
      setStatus("📤 Uploading...");

      if (finFile) {
        const finForm = new FormData();
        finForm.append("file", finFile);

        // Upload to both /financial and /forecast
        await axios.post(`${BASE_URL}/financial/upload`, finForm);
        await axios.post(`${BASE_URL}/forecast/upload`, finForm);
      }

      if (revFile) {
        const revForm = new FormData();
        revForm.append("file", revFile);
        await axios.post(`${BASE_URL}/sentiment/upload`, revForm);
      }

      setStatus("✅ Upload successful!");
    } catch (err) {
      console.error("Upload error:", err.response || err.message || err);
      setStatus("❌ Upload failed. Check file format and backend status.");
    }
  };

  return (
   <motion.div className="page-wrapper" initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}>
    <Card title="📤 Upload Your CSV Files">
      <div style={{ marginBottom: '1.5rem' }}>
        <label><strong>Financial CSV:</strong></label><br />
        <input type="file" accept=".csv" onChange={(e) => setFinFile(e.target.files[0])} />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label><strong>Reviews CSV:</strong></label><br />
        <input type="file" accept=".csv" onChange={(e) => setRevFile(e.target.files[0])} />
      </div>

      <button onClick={handleUpload} style={{ padding: '8px 16px', cursor: 'pointer' }}>
        🚀 Upload
      </button>

      {status && (
        <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>
          {status}
        </p>
      )}
    </Card>
   </motion.div>
  );
}

export default Upload;
