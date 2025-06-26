import React from 'react';
import './card.css';

const Card = ({ title, children }) => {
  return (
    <div className="custom-card">
      {title && <h3 className="card-title">{title}</h3>}
      <div className="card-content">
        {children}
      </div>
    </div>
  );
};

export default Card;
