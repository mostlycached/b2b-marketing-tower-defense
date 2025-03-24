import React from 'react';
import { useGameContext } from '../context/GameContext';
import gameConfig from '../utils/gameConfig';

function GameStats() {
  const { state } = useGameContext();
  
  return (
    <div className="game-stats">
      <div className="stat">
        <div>Budget</div>
        <div className="stat-value">${state.budget}</div>
      </div>
      <div className="stat">
        <div>Your Conversions</div>
        <div className="stat-value">{state.playerConversions}</div>
      </div>
      <div className="stat">
        <div>AI Conversions</div>
        <div className="stat-value">{state.aiConversions}</div>
      </div>
      <div className="stat">
        <div>Wave</div>
        <div className="stat-value">{state.wave}/{gameConfig.maxWaves}</div>
      </div>
    </div>
  );
}

export default GameStats;