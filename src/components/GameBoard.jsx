import React, { useRef, useEffect } from 'react';
import Path from './Path';
import Tower from './Tower';
import Prospect from './Prospect';
import Projectile from './Projectile';
import { useGameContext } from '../context/GameContext';
import pathConfig from '../utils/pathConfig';
import towerTypes from '../utils/towerTypes';

function GameBoard({ isAIBoard = false }) {
  const { state, dispatch } = useGameContext();
  const boardRef = useRef(null);
  
  // Get relevant towers and prospects based on whether this is player or AI board
  const towers = isAIBoard ? state.aiTowers : state.playerTowers;
  const prospects = isAIBoard ? state.aiProspects : state.playerProspects;
  
  // Filter projectiles for this board
  const projectiles = state.projectiles.filter(p => p.isAI === isAIBoard);
  
  // Handle player board click (for tower placement)
  const handleBoardClick = (e) => {
    if (isAIBoard || !state.selectedTowerType) return;
    
    const rect = boardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if valid position for placement
    if (isValidTowerPosition(x, y)) {
      const towerType = state.selectedTowerType;
      const towerInfo = towerTypes[towerType];
      
      // Check if enough budget
      if (state.budget >= towerInfo.cost) {
        const newTower = {
          id: Date.now(),
          type: towerType,
          x,
          y,
          level: 1,
          range: towerInfo.range,
          power: towerInfo.power,
          rate: towerInfo.rate,
          lastAttackTime: 0,
          cost: towerInfo.cost
        };
        
        dispatch({ type: 'PLACE_TOWER', payload: newTower });
        dispatch({ 
          type: 'SET_MESSAGE', 
          payload: `${towerInfo.name} placed successfully!` 
        });
      } else {
        dispatch({ 
          type: 'SET_MESSAGE', 
          payload: `Not enough budget to place ${towerInfo.name}. Need $${towerInfo.cost}.`
        });
      }
    } else {
      dispatch({ 
        type: 'SET_MESSAGE', 
        payload: 'Cannot place tower there. Avoid paths and other towers.'
      });
    }
  };
  
  // Check if tower position is valid
  const isValidTowerPosition = (x, y) => {
    // Check if on path
    for (const segment of pathConfig) {
      if (x >= segment.x - 15 && x <= segment.x + segment.width + 15 &&
          y >= segment.y - 15 && y <= segment.y + segment.height + 15) {
        return false;
      }
    }
    
    // Check if too close to other towers
    for (const tower of towers) {
      const distance = Math.sqrt(Math.pow(x - tower.x, 2) + Math.pow(y - tower.y, 2));
      if (distance < 40) { // Minimum distance between towers
        return false;
      }
    }
    
    // Check if within board bounds
    const boardRect = boardRef.current.getBoundingClientRect();
    if (x < 15 || x > boardRect.width - 15 || 
        y < 15 || y > boardRect.height - 15) {
      return false;
    }
    
    return true;
  };
  
  return (
    <div 
      className={`game-board ${isAIBoard ? 'ai-board' : 'player-board'}`}
      ref={boardRef}
      onClick={handleBoardClick}
    >
      {/* Render paths */}
      {pathConfig.map((segment, index) => (
        <Path key={index} segment={segment} />
      ))}
      
      {/* Render towers */}
      {towers.map((tower, index) => (
        <Tower 
          key={tower.id} 
          tower={tower} 
          index={index}
          isAI={isAIBoard}
        />
      ))}
      
      {/* Render prospects */}
      {prospects.filter(p => p.isActive).map((prospect) => (
        <Prospect 
          key={prospect.id} 
          prospect={prospect}
          isAI={isAIBoard}
        />
      ))}
      
      {/* Render projectiles */}
      {projectiles.map((projectile) => (
        <Projectile 
          key={projectile.id} 
          projectile={projectile}
          onComplete={() => dispatch({ type: 'REMOVE_PROJECTILE', payload: { id: projectile.id } })}
        />
      ))}
    </div>
  );
}

export default GameBoard;