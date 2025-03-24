import React from 'react';
import { useGameContext } from '../context/GameContext';

function GameModal() {
  const { state, dispatch } = useGameContext();
  
  // Handle play again button
  const handlePlayAgain = () => {
    dispatch({ type: 'RESET_GAME' });
  };
  
  // Don't render if game is not over
  if (!state.gameOver) {
    return null;
  }
  
  // Determine winner
  const isVictory = state.playerConversions > state.aiConversions;
  const isTie = state.playerConversions === state.aiConversions;
  
  // Modal title and message based on game outcome
  let title, message;
  
  if (isTie) {
    title = "It's a Tie!";
    message = "You and the AI finished with exactly the same number of conversions.";
  } else if (isVictory) {
    title = "Victory!";
    message = "Congratulations! Your marketing strategy outperformed the AI competitor.";
  } else {
    title = "Defeat";
    message = "The AI's marketing strategy was more effective this time.";
  }
  
  return (
    <div className="modal" style={{ display: 'flex' }}>
      <div className="modal-content">
        <div className="modal-title">{title}</div>
        <p>{message}</p>
        <div className="game-stats">
          <div className="stat">
            <div>Your Conversions</div>
            <div className="stat-value">{state.playerConversions}</div>
          </div>
          <div className="stat">
            <div>AI Conversions</div>
            <div className="stat-value">{state.aiConversions}</div>
          </div>
        </div>
        <div style={{ marginTop: '20px' }}>
          <button className="start-btn" onClick={handlePlayAgain}>
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
}

export default GameModal;