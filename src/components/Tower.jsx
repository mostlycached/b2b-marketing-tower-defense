import React, { useState } from 'react';
import { useGameContext } from '../context/GameContext';
import towerTypes from '../utils/towerTypes';

function Tower({ tower, index, isAI }) {
  const { state, dispatch } = useGameContext();
  const [showInfo, setShowInfo] = useState(false);
  const towerInfo = towerTypes[tower.type];
  
  // Handle tower click (show info, range, etc.)
  const handleTowerClick = (e) => {
    if (isAI) return; // No interaction with AI towers
    
    e.stopPropagation();
    setShowInfo(!showInfo);
  };
  
  // Handle upgrade button click
  const handleUpgrade = (e) => {
    e.stopPropagation();
    
    // Calculate upgrade cost
    const upgradeCost = Math.floor(towerInfo.upgradeCost * Math.pow(1.5, tower.level - 1));
    
    // Check if enough budget
    if (state.budget >= upgradeCost) {
      // Calculate new stats
      const upgrades = {
        level: tower.level + 1,
        range: tower.range * 1.2,
        power: tower.power * towerInfo.upgradeMultiplier,
        rate: tower.rate * 0.85 // Lower is faster
      };
      
      // Dispatch upgrade action
      dispatch({ 
        type: 'UPGRADE_TOWER', 
        payload: { index, upgrades, cost: upgradeCost } 
      });
      
      dispatch({ 
        type: 'SET_MESSAGE', 
        payload: `${towerInfo.name} upgraded to level ${tower.level + 1}!` 
      });
    } else {
      dispatch({ 
        type: 'SET_MESSAGE', 
        payload: `Not enough budget to upgrade. Need $${upgradeCost}.` 
      });
    }
  };
  
  // Handle sell button click
  const handleSell = (e) => {
    e.stopPropagation();
    
    // Calculate sell value (70% of cost plus 50% of upgrade value per level)
    const sellValue = Math.floor(towerInfo.cost * 0.7 * (1 + (tower.level - 1) * 0.5));
    
    // Dispatch sell action
    dispatch({ 
      type: 'SELL_TOWER', 
      payload: { index, refund: sellValue } 
    });
    
    dispatch({ 
      type: 'SET_MESSAGE', 
      payload: `${towerInfo.name} sold for $${sellValue}.` 
    });
  };
  
  // Styles
  const towerStyle = {
    left: tower.x - 15, // Center the tower on click coordinates
    top: tower.y - 15,
    backgroundColor: towerInfo.color
  };
  
  const rangeStyle = {
    left: tower.x - tower.range,
    top: tower.y - tower.range,
    width: tower.range * 2,
    height: tower.range * 2,
    display: showInfo ? 'block' : 'none'
  };
  
  return (
    <>
      <div 
        className={`tower ${isAI ? 'ai-tower' : 'player-tower'}`}
        style={towerStyle}
        onClick={handleTowerClick}
      >
        {towerInfo.icon}
        {tower.level > 1 && <span className="tower-level">{tower.level}</span>}
      </div>
      
      {!isAI && (
        <>
          <div className="range-indicator" style={rangeStyle}></div>
          
          {showInfo && (
            <div className="tower-info" style={{
              left: tower.x + 20,
              top: tower.y - 60
            }}>
              <div className="tower-info-title">{towerInfo.name} (Lvl {tower.level})</div>
              <div className="tower-info-stats">
                <div>Range: {Math.round(tower.range)}</div>
                <div>Power: {Math.round(tower.power)}</div>
                <div>Rate: {tower.rate.toFixed(1)}s</div>
              </div>
              <div className="tower-info-actions">
                <button onClick={handleUpgrade}>
                  Upgrade (${Math.floor(towerInfo.upgradeCost * Math.pow(1.5, tower.level - 1))})
                </button>
                <button onClick={handleSell}>
                  Sell (${Math.floor(towerInfo.cost * 0.7 * (1 + (tower.level - 1) * 0.5))})
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default Tower;