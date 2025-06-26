// src/components/Sidebar.js
import React from "react";
import { NavLink } from "react-router-dom";
import { FaUpload, FaChartBar, FaCloud, FaBrain, FaBars, FaSmile } from "react-icons/fa";
import "./sidebar.css";

const Sidebar = ({ open, toggleSidebar }) => (
  <aside className={`sidebar ${open ? "open" : ""}`}>
    <div className="sidebar-header">
      <h2 className="sidebar-logo">Cafe Mocha</h2>
      <FaBars className="toggle-btn" onClick={toggleSidebar} />
    </div>
    <nav>
      <NavLink to="/upload" className="nav-item" onClick={toggleSidebar}>
        <FaUpload /> Upload
      </NavLink>
      <NavLink to="/financial" className="nav-item" onClick={toggleSidebar}>
        <FaChartBar /> Financial
      </NavLink>
      <NavLink to="/forecast" className="nav-item" onClick={toggleSidebar}>
        <FaCloud /> Forecast
      </NavLink>
      <NavLink to="/sentiment" className="nav-item" onClick={toggleSidebar}>
        <FaSmile /> Sentiment
      </NavLink>
      <NavLink to="/ai-insights" className="nav-item" onClick={toggleSidebar}>
        <FaBrain /> AI Insights
      </NavLink>
    </nav>
  </aside>
);

export default Sidebar;
