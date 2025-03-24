import React, { createContext, useContext, useReducer, useEffect } from 'react';
import gameConfig from '../utils/gameConfig';
import prospectTypes from '../utils/prospectTypes';

// Initial state
const initialState = {
  budget: gameConfig.startingBudget,
  playerConversions: 0,
  aiConversions: 0,
  wave: 0,
  waveInProgress: false,
  selectedTowerType: null,
  playerTowers: [],
  aiTowers: [],
  playerProspects: [],
  aiProspects: [],
  projectiles: [],
  message: "Select a tower and place it on your board to prepare for the first wave",
  gameOver: false
};

// Game reducer
function gameReducer(state, action) {
  switch (action.type) {
    case 'SELECT_TOWER':
      return { ...state, selectedTowerType: action.payload };
    
    case 'PLACE_TOWER':
      return { 
        ...state, 
        playerTowers: [...state.playerTowers, action.payload],
        budget: state.budget - action.payload.cost,
        selectedTowerType: null
      };
    
    case 'PLACE_AI_TOWER':
      return { 
        ...state, 
        aiTowers: [...state.aiTowers, action.payload]
      };
    
    case 'START_WAVE':
      // Generate prospects for both player and AI
      const waveConfig = calculateWaveConfig(state.wave + 1);
      const { playerProspects, aiProspects } = generateProspects(waveConfig);
      
      return { 
        ...state, 
        wave: state.wave + 1,
        waveInProgress: true,
        playerProspects,
        aiProspects,
        message: `Wave ${state.wave + 1} started! Defend against incoming prospects.`
      };
    
    case 'END_WAVE':
      const waveBonus = 100 + (state.wave * 50);
      return { 
        ...state, 
        waveInProgress: false,
        budget: state.budget + waveBonus,
        message: `Wave ${state.wave} completed! Bonus: $${waveBonus}`,
        projectiles: [] // Clear any remaining projectiles
      };
    
    case 'PLAYER_CONVERSION':
      return { 
        ...state, 
        playerConversions: state.playerConversions + 1,
        budget: state.budget + action.payload
      };
    
    case 'AI_CONVERSION':
      return { 
        ...state, 
        aiConversions: state.aiConversions + 1
      };
    
    case 'UPDATE_TOWER':
      return {
        ...state,
        playerTowers: state.playerTowers.map((tower, index) => 
          index === action.payload.index 
            ? { ...tower, ...action.payload.updates } 
            : tower
        )
      };
    
    case 'UPDATE_AI_TOWER':
      return {
        ...state,
        aiTowers: state.aiTowers.map((tower, index) => 
          index === action.payload.index 
            ? { ...tower, ...action.payload.updates } 
            : tower
        )
      };
    
    case 'UPGRADE_TOWER':
      return { 
        ...state, 
        playerTowers: state.playerTowers.map((tower, index) => 
          index === action.payload.index 
            ? { ...tower, ...action.payload.upgrades } 
            : tower
        ),
        budget: state.budget - action.payload.cost
      };
    
    case 'SELL_TOWER':
      return { 
        ...state, 
        playerTowers: state.playerTowers.filter((_, index) => 
          index !== action.payload.index
        ),
        budget: state.budget + action.payload.refund
      };
    
    case 'UPDATE_PLAYER_PROSPECT':
      return {
        ...state,
        playerProspects: state.playerProspects.map((prospect, index) => 
          index === action.payload.index 
            ? { ...prospect, ...action.payload.updates } 
            : prospect
        )
      };
    
    case 'UPDATE_AI_PROSPECT':
      return {
        ...state,
        aiProspects: state.aiProspects.map((prospect, index) => 
          index === action.payload.index 
            ? { ...prospect, ...action.payload.updates } 
            : prospect
        )
      };

    // In GameContext.jsx, add these action handlers:

    case 'UPDATE_ALL_PLAYER_PROSPECTS':
      return {
        ...state,
        playerProspects: action.payload
      };

    case 'UPDATE_ALL_AI_PROSPECTS':
      return {
        ...state,
        aiProspects: action.payload
      };
    
    case 'CONVERT_PLAYER_PROSPECT':
      return {
        ...state,
        playerProspects: state.playerProspects.map((prospect, index) => 
          index === action.payload.index 
            ? { ...prospect, isConverted: true, isActive: false } 
            : prospect
        )
      };
    
    case 'CONVERT_AI_PROSPECT':
      return {
        ...state,
        aiProspects: state.aiProspects.map((prospect, index) => 
          index === action.payload.index 
            ? { ...prospect, isConverted: true, isActive: false } 
            : prospect
        )
      };
    
    case 'REMOVE_PLAYER_PROSPECT':
      return {
        ...state,
        playerProspects: state.playerProspects.map((prospect, index) => 
          index === action.payload.index 
            ? { ...prospect, isActive: false } 
            : prospect
        )
      };
    
    case 'REMOVE_AI_PROSPECT':
      return {
        ...state,
        aiProspects: state.aiProspects.map((prospect, index) => 
          index === action.payload.index 
            ? { ...prospect, isActive: false } 
            : prospect
        )
      };
    
    case 'CREATE_PROJECTILE':
      const newProjectile = {
        id: Date.now() + Math.random(),
        ...action.payload
      };
      return {
        ...state,
        projectiles: [...state.projectiles, newProjectile]
      };
    
    case 'REMOVE_PROJECTILE':
      return {
        ...state,
        projectiles: state.projectiles.filter(p => p.id !== action.payload.id)
      };
    
    case 'SET_MESSAGE':
      return { ...state, message: action.payload };
    
    case 'GAME_OVER':
      return { ...state, gameOver: true };
    
    case 'RESET_GAME':
      return initialState;
    
    default:
      return state;
  }
}

// Calculate wave configuration based on wave number
function calculateWaveConfig(waveNumber) {
  // Base number of prospects
  let numProspects = 5 + Math.floor(waveNumber * 1.5);
  
  // Prospect type distribution changes by wave
  let distribution = {};
  
  if (waveNumber <= 3) {
    distribution = { SMB: 0.7, Mid: 0.3, Ent: 0 };
  } else if (waveNumber <= 6) {
    distribution = { SMB: 0.5, Mid: 0.4, Ent: 0.1 };
  } else if (waveNumber <= 9) {
    distribution = { SMB: 0.3, Mid: 0.5, Ent: 0.2 };
  } else {
    distribution = { SMB: 0.2, Mid: 0.4, Ent: 0.4 };
  }
  
  return {
    numProspects,
    distribution
  };
}

// Generate prospects for player and AI based on wave config
function generateProspects(waveConfig) {
  const { numProspects, distribution } = waveConfig;
  const playerProspects = [];
  const aiProspects = [];
  
  for (let i = 0; i < numProspects; i++) {
    // Determine prospect type based on distribution
    const rand = Math.random();
    let type;
    let cumulative = 0;
    
    for (const [typeName, prob] of Object.entries(distribution)) {
      cumulative += prob;
      if (rand < cumulative) {
        type = prospectTypes.find(pt => pt.name === typeName);
        break;
      }
    }
    
    // Create player prospect
    playerProspects.push({
      id: `player-${Date.now()}-${i}`,
      type: type.name,
      cssClass: type.cssClass,
      health: type.health,
      maxHealth: type.health,
      speed: type.speed,
      value: type.value,
      pathIndex: 0,
      pathProgress: 0,
      x: -30 - (i * 40), // Start off-screen with spacing
      y: 120,
      isActive: true,
      isConverted: false,
      isAI: false,
      index: i
    });
    
    // Create AI prospect
    aiProspects.push({
      id: `ai-${Date.now()}-${i}`,
      type: type.name,
      cssClass: type.cssClass,
      health: type.health,
      maxHealth: type.health,
      speed: type.speed,
      value: type.value,
      pathIndex: 0,
      pathProgress: 0,
      x: -30 - (i * 40), // Start off-screen with spacing
      y: 120,
      isActive: true,
      isConverted: false,
      isAI: true,
      index: i
    });
  }
  
  return { playerProspects, aiProspects };
}

// Create context
const GameContext = createContext();

// Context provider
export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  
  // Make values available to all child components
  const value = { state, dispatch };
  
  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

// Custom hook to use the game context
export function useGameContext() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
}