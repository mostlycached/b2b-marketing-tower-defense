import React from 'react';
import { useGameContext } from '../context/GameContext';
import towerTypes from '../utils/towerTypes';

function TowerSelection() {
  const { state, dispatch } = useGameContext();
  
  // Handle tower selection
  const handleTowerSelect = (type) => {
    dispatch({ type: 'SELECT_TOWER', payload: type });
    
    const towerInfo = towerTypes[type];
    dispatch({ 
      type: 'SET_MESSAGE', 
      payload: `Selected ${towerInfo.name}. Click on your board to place it. Cost: $${towerInfo.cost}`
    });
  };
  
  return (
    <div className="tower-selection">
      {Object.entries(towerTypes).map(([type, info]) => (
        <div 
          key={type}
          className={`tower-option ${state.selectedTowerType === type ? 'selected' : ''}`}
          onClick={() => handleTowerSelect(type)}
        >
          <div className="tower-icon">{info.icon}</div>
          <div className="tower-name">{info.name}</div>
          <div className="tower-cost">${info.cost}</div>
        </div>
      ))}
    </div>
  );
}

export default TowerSelection;