import towerTypes from './towerTypes';
import pathConfig from './pathConfig';
import gameConfig from './gameConfig';

// AI places a tower
export function placeAiTower(gameState, dispatch) {
  // Choose a strategy based on wave
  let strategy;
  if (gameState.wave <= 3) {
    strategy = 'balanced';
  } else if (gameState.wave <= 6) {
    strategy = 'offensive';
  } else {
    strategy = 'advanced';
  }
  
  // Get tower build plan
  const towersToBuild = getAiTowerBuildPlan(strategy, gameConfig.aiIntelligence);
  
  // For simplicity, just place the first tower type in the plan
  if (towersToBuild.length > 0) {
    const towerType = towersToBuild[0];
    const towerInfo = towerTypes[towerType];
    
    // Get a strategic position
    const position = getStrategicPosition(towerType, gameState);
    
    // Create the tower
    const newTower = {
      id: Date.now(),
      type: towerType,
      x: position.x,
      y: position.y,
      level: 1,
      range: towerInfo.range,
      power: towerInfo.power,
      rate: towerInfo.rate,
      lastAttackTime: 0
    };
    
    // Dispatch action to place the tower
    dispatch({ type: 'PLACE_AI_TOWER', payload: newTower });
    
    // Consider placing multiple towers based on wave
    if (gameState.wave > 5 && towersToBuild.length > 1) {
      setTimeout(() => {
        const secondTowerType = towersToBuild[1];
        const secondTowerInfo = towerTypes[secondTowerType];
        const secondPosition = getStrategicPosition(secondTowerType, gameState);
        
        const secondTower = {
          id: Date.now() + 1,
          type: secondTowerType,
          x: secondPosition.x,
          y: secondPosition.y,
          level: 1,
          range: secondTowerInfo.range,
          power: secondTowerInfo.power,
          rate: secondTowerInfo.rate,
          lastAttackTime: 0
        };
        
        dispatch({ type: 'PLACE_AI_TOWER', payload: secondTower });
      }, 1500);
    }
  }
}

// Get AI tower build plan based on strategy
function getAiTowerBuildPlan(strategy, intelligence) {
  let towerPlan = [];
  
  // Randomness factor - lower intelligence means more random choices
  const randomFactor = 1 - intelligence;
  
  switch (strategy) {
    case 'balanced':
      // Balanced approach
      towerPlan = ['content', 'social', 'paid'];
      break;
      
    case 'offensive':
      // Focus on high-damage towers
      towerPlan = ['paid', 'event', 'content'];
      break;
      
    case 'advanced':
      // Strategic mix
      towerPlan = ['event', 'paid', 'content', 'social'];
      break;
      
    default:
      towerPlan = ['content', 'social'];
  }
  
  // Add some randomness based on AI intelligence
  if (Math.random() < randomFactor) {
    // Randomly swap two tower types
    const idx1 = Math.floor(Math.random() * towerPlan.length);
    const idx2 = Math.floor(Math.random() * towerPlan.length);
    
    if (towerPlan[idx1] && towerPlan[idx2]) {
      [towerPlan[idx1], towerPlan[idx2]] = [towerPlan[idx2], towerPlan[idx1]];
    }
  }
  
  return towerPlan;
}

// Get a strategic position for AI tower placement
function getStrategicPosition(towerType, gameState) {
  // Existing towers to avoid overlap
  const existingTowers = gameState.aiTowers;
  
  // Strategic parameters based on tower type
  let preferredDistanceFromPath = 0;
  let preferPathSections = [];
  
  switch (towerType) {
    case 'content':
      // Content works well covering multiple path sections
      preferredDistanceFromPath = 50;
      preferPathSections = [2, 3, 4]; // Middle sections
      break;
      
    case 'social':
      // Social works well near the start for early engagement
      preferredDistanceFromPath = 40;
      preferPathSections = [0, 1]; // Early sections
      break;
      
    case 'event':
      // Events work well at choke points where paths bend
      preferredDistanceFromPath = 60;
      preferPathSections = [1, 3, 5]; // Path corners
      break;
      
    case 'paid':
      // Paid ads work well covering the most path segments
      preferredDistanceFromPath = 70;
      preferPathSections = [2, 4]; // Middle-late sections
      break;
  }
  
  // Generate potential positions near preferred path sections
  const candidates = [];
  
  for (let attempts = 0; attempts < 20; attempts++) {
    // Choose a random preferred path section
    const pathIndex = preferPathSections[Math.floor(Math.random() * preferPathSections.length)];
    const pathSegment = pathConfig[pathIndex];
    
    // Calculate position near path
    let x, y;
    
    if (pathSegment.width > pathSegment.height) {
      // Horizontal path segment
      x = pathSegment.x + Math.random() * pathSegment.width;
      
      // Position either above or below the path
      const above = Math.random() > 0.5;
      y = above ? 
          pathSegment.y - preferredDistanceFromPath : 
          pathSegment.y + pathSegment.height + preferredDistanceFromPath;
    } else {
      // Vertical path segment
      y = pathSegment.y + Math.random() * pathSegment.height;
      
      // Position either left or right of the path
      const left = Math.random() > 0.5;
      x = left ? 
          pathSegment.x - preferredDistanceFromPath : 
          pathSegment.x + pathSegment.width + preferredDistanceFromPath;
    }
    
    // Ensure within bounds
    x = Math.max(30, Math.min(x, 270));
    y = Math.max(30, Math.min(y, 270));
    
    // Check if position is valid (not overlapping with other towers)
    let isValid = true;
    
    for (const tower of existingTowers) {
      const distance = Math.sqrt(Math.pow(x - tower.x, 2) + Math.pow(y - tower.y, 2));
      if (distance < 50) { // Minimum distance between towers
        isValid = false;
        break;
      }
    }
    
    // Also check if on path
    for (const segment of pathConfig) {
      if (x >= segment.x - 20 && x <= segment.x + segment.width + 20 &&
          y >= segment.y - 20 && y <= segment.y + segment.height + 20) {
        isValid = false;
        break;
      }
    }
    
    if (isValid) {
      candidates.push({ x, y, score: Math.random() }); // Add some randomness to the score
    }
  }
  
  // Pick the best candidate position
  if (candidates.length > 0) {
    candidates.sort((a, b) => b.score - a.score);
    return candidates[0];
  }
  
  // Fallback to a random position if no good candidates
  return {
    x: 50 + Math.random() * 200,
    y: 50 + Math.random() * 200
  };
}