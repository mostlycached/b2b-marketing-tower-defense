// In Prospect.jsx

import React, { useEffect, useRef } from 'react';
import prospectTypes from '../utils/prospectTypes';

function Prospect({ prospect, isAI }) {
  const elementRef = useRef(null);
  const lastHealthRef = useRef(prospect.health);

  useEffect(() => {
    if (prospect.health < lastHealthRef.current && elementRef.current) {
      // Flash animation for damage
      elementRef.current.animate([
        { backgroundColor: 'rgba(255, 0, 0, 0.5)' },
        { backgroundColor: 'rgba(255, 0, 0, 0)' }
      ], {
        duration: 300,
        easing: 'ease-out'
      });
    }
    
    lastHealthRef.current = prospect.health;
  }, [prospect.health]);
  
  // Get prospect type info
  const prospectTypeInfo = prospectTypes.find(pt => pt.name === prospect.type);
  
  // Update position when x/y changes
  useEffect(() => {
    if (elementRef.current) {
      elementRef.current.style.left = `${prospect.x}px`;
      elementRef.current.style.top = `${prospect.y}px`;
    }
  }, [prospect.x, prospect.y]);
  
  // Handle conversion effect
  useEffect(() => {
    if (prospect.isConverted && elementRef.current) {
      elementRef.current.classList.add('convert-animation');
      
      // Remove after animation
      const timer = setTimeout(() => {
        if (elementRef.current) {
          elementRef.current.style.display = 'none';
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [prospect.isConverted]);
  
  // Calculate health percentage
  const healthPercent = (prospect.health / prospect.maxHealth) * 100;
  
  // Health bar color based on percentage
  const healthColor = healthPercent < 30 ? '#e74c3c' : 
                      healthPercent < 60 ? '#f39c12' : 
                      '#2ecc71';
  
  return (
    <div 
      ref={elementRef}
      className={`prospect ${prospectTypeInfo.cssClass} ${isAI ? 'ai-prospect' : 'player-prospect'}`}
      style={{
        left: prospect.x,
        top: prospect.y,
        display: prospect.isActive ? 'flex' : 'none'
      }}
    >
      {prospectTypeInfo.name.charAt(0)}
      <div className="health-bar">
        <div 
          className="health-fill" 
          style={{
            width: `${healthPercent}%`,
            backgroundColor: healthColor
          }}
        ></div>
      </div>
    </div>
  );
}

export default Prospect;