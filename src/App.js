import React, { useEffect } from 'react';
import { GameProvider, useGameContext } from './context/GameContext';
import GameStats from './components/GameStats';
import GameBoard from './components/GameBoard';
import TowerSelection from './components/TowerSelection';
import GameControls from './components/GameControls';
import GameModal from './components/GameModal';
import useGameLoop from './hooks/useGameLoop';
import './styles.css';

// Main game component
function Game() {
  const { state } = useGameContext();
  
  // Initialize game loop
  useGameLoop();
  
  return (
    <div className="container">
      <header>
        <h1>B2B Marketing Tower Defense</h1>
        <p>Compete against AI to convert B2B prospects with strategic marketing tactics</p>
      </header>
      
      <GameStats />
      
      <div className="game-area">
        <div className="board-container">
          <div className="board-title">
            <div className="color-indicator player-color"></div>
            <span>Your Territory</span>
          </div>
          <GameBoard />
        </div>
        
        <div className="board-container">
          <div className="board-title">
            <div className="color-indicator ai-color"></div>
            <span>AI Territory</span>
          </div>
          <GameBoard isAIBoard />
        </div>
      </div>
      
      <div className="controls">
        <TowerSelection />
        <GameControls />
      </div>
      
      <GameModal />
      
      <div className="game-guide">
        <h2>B2B Marketing Tower Defense Guide</h2>
        <div className="guide-grid">
          <div className="guide-item">
            <div className="guide-title">Content Marketing (📝)</div>
            <p>Balanced tower with good range and power. Targets prospects furthest along the path.</p>
          </div>
          <div className="guide-item">
            <div className="guide-title">Social Media (🔗)</div>
            <p>Fast attack speed but lower power. Targets closest prospects for quick engagement.</p>
          </div>
          <div className="guide-item">
            <div className="guide-title">Events (🎪)</div>
            <p>Expensive but can target multiple prospects at once. High impact marketing.</p>
          </div>
          <div className="guide-item">
            <div className="guide-title">Paid Advertising (💰)</div>
            <p>Long range and targets high-value prospects first. Good for enterprise clients.</p>
          </div>
          <div className="guide-item">
            <div className="guide-title">Prospect Types</div>
            <p><span style={{color:"#27ae60"}}>●</span> SMB: Fast but low value<br/>
               <span style={{color:"#f39c12"}}>●</span> Mid-Market: Balanced<br/>
               <span style={{color:"#8e44ad"}}>●</span> Enterprise: Slow but high value</p>
          </div>
          <div className="guide-item">
            <div className="guide-title">Strategy Tips</div>
            <p>Place towers strategically to cover the path. Upgrade key towers for later waves. Different towers work better against different prospect types.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// App wrapper with provider
function App() {
  return (
    <GameProvider>
      <Game />
    </GameProvider>
  );
}

export default App;