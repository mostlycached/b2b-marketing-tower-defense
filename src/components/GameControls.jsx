import React from 'react';
import { useGameContext } from '../context/GameContext';
import gameConfig from '../utils/gameConfig';
import { placeAiTower } from '../utils/aiLogic';

function GameControls() {
  const { state, dispatch } = useGameContext();
  
  // Handle start wave button click
  const handleStartWave = () => {
    // Start the wave
    dispatch({ type: 'START_WAVE' });
    
    // AI places towers after a delay
    setTimeout(() => {
      placeAiTower(state, dispatch);
    }, 1000);
  };
  
  // Button text based on game state
  const getButtonText = () => {
    if (state.waveInProgress) {
      return `Wave ${state.wave} in Progress...`;
    } else if (state.wave === 0) {
      return 'Start Wave 1';
    } else if (state.wave < gameConfig.maxWaves) {
      return `Start Wave ${state.wave + 1}`;
    } else {
      return 'Game Complete';
    }
  };
  
  // Button disabled state
  const isButtonDisabled = state.waveInProgress || state.wave >= gameConfig.maxWaves;
  
  return (
    <div className="game-controls">
      <div className="message-box">{state.message}</div>
      <div className="action-buttons">
        <button 
          className="start-btn" 
          onClick={handleStartWave}
          disabled={isButtonDisabled}
        >
          {getButtonText()}
        </button>
      </div>
    </div>
  );
}

export default GameControls;