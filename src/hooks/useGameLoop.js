import { useEffect, useRef } from 'react';
import { useGameContext } from '../context/GameContext';
import pathConfig from '../utils/pathConfig';
import prospectTypes from '../utils/prospectTypes';
import towerTypes from '../utils/towerTypes';
import { placeAiTower } from '../utils/aiLogic';

function useGameLoop() {
  const { state, dispatch } = useGameContext();
  const lastUpdateTimeRef = useRef(0);
  const requestIdRef = useRef(null);
  
  // Main game loop
  const gameLoop = time => {
    if (!lastUpdateTimeRef.current) {
      lastUpdateTimeRef.current = time;
      requestIdRef.current = requestAnimationFrame(gameLoop);
      return;
    }
    
    // Calculate delta time capped at a maximum value to prevent large jumps
    const deltaTime = Math.min((time - lastUpdateTimeRef.current) / 1000, 0.1);
    lastUpdateTimeRef.current = time;
    
    // Only update if wave is in progress
    if (state.waveInProgress) {
      // Update prospects (move them along the path)
      updateProspects(deltaTime);
      
      // Update towers (check for attacks)
      updateTowers(deltaTime);
      
      // Check if wave is complete
      checkWaveStatus();
    }
    
    // Continue the loop
    requestIdRef.current = requestAnimationFrame(gameLoop);
  };
  
  // In useGameLoop.js, simplify the updateProspects function:

const updateProspects = (deltaTime) => {
    // Create copies of the arrays to modify
    const updatedPlayerProspects = [...state.playerProspects];
    const updatedAiProspects = [...state.aiProspects];
    
    // Update player prospects
    let playerUpdates = false;
    updatedPlayerProspects.forEach(prospect => {
      if (!prospect.isActive || prospect.isConverted) return;
      
      // Move prospect
      prospect.pathProgress += prospect.speed * deltaTime;
      
      // Update position
      updateProspectPosition(prospect, pathConfig);
      
      // Check if reached end
      if (prospect.pathIndex >= pathConfig.length) {
        prospect.isActive = false;
      }
      
      playerUpdates = true;
    });
    
    // Update AI prospects
    let aiUpdates = false;
    updatedAiProspects.forEach(prospect => {
      if (!prospect.isActive || prospect.isConverted) return;
      
      // Move prospect
      prospect.pathProgress += prospect.speed * deltaTime;
      
      // Update position
      updateProspectPosition(prospect, pathConfig);
      
      // Check if reached end
      if (prospect.pathIndex >= pathConfig.length) {
        prospect.isActive = false;
      }
      
      aiUpdates = true;
    });
    
    // Only dispatch if there were changes
    if (playerUpdates) {
      dispatch({ 
        type: 'UPDATE_ALL_PLAYER_PROSPECTS', 
        payload: updatedPlayerProspects 
      });
    }
    
    if (aiUpdates) {
      dispatch({ 
        type: 'UPDATE_ALL_AI_PROSPECTS', 
        payload: updatedAiProspects 
      });
    }
  };
  
  // Helper function to update prospect position
  const updateProspectPosition = (prospect, path) => {
    if (prospect.pathIndex >= path.length) return;
    
    const segment = path[prospect.pathIndex];
    
    // Calculate position on segment
    if (segment.width > segment.height) {
      // Horizontal segment
      prospect.x = segment.x + (prospect.pathProgress / segment.width) * segment.width;
      prospect.y = segment.y + segment.height / 2 - 10;
    } else {
      // Vertical segment
      prospect.x = segment.x + segment.width / 2 - 10;
      prospect.y = segment.y + (prospect.pathProgress / segment.height) * segment.height;
    }
    
    // Check if reached end of segment
    const segmentLength = segment.width > segment.height ? segment.width : segment.height;
    if (prospect.pathProgress >= segmentLength) {
      prospect.pathIndex++;
      prospect.pathProgress = 0;
    }
  };
  
  // Update a group of prospects
  const updateProspectGroup = (prospects, deltaTime, isAI) => {
    prospects.forEach((prospect, index) => {
      if (!prospect.isActive || prospect.isConverted) return;
      
      // Move prospect along path
      moveProspect(prospect, deltaTime);
      
      // Check if prospect reached end of path
      if (prospect.pathIndex >= pathConfig.length) {
        // Prospect escaped, mark as inactive
        dispatch({ 
          type: isAI ? 'REMOVE_AI_PROSPECT' : 'REMOVE_PLAYER_PROSPECT', 
          payload: { index } 
        });
      }
    });
  };
  
  // Move a prospect along the path
  const moveProspect = (prospect, deltaTime) => {
    if (prospect.pathIndex >= pathConfig.length) return;
    
    const pathSegment = pathConfig[prospect.pathIndex];
    
    // Move based on speed and delta time
    prospect.pathProgress += prospect.speed * deltaTime;
    
    // Calculate position on path segment
    if (pathSegment.width > pathSegment.height) {
      // Horizontal segment
      prospect.x = pathSegment.x + (prospect.pathProgress / pathSegment.width) * pathSegment.width;
      prospect.y = pathSegment.y + pathSegment.height / 2 - 10; // Center on path
    } else {
      // Vertical segment
      prospect.x = pathSegment.x + pathSegment.width / 2 - 10; // Center on path
      prospect.y = pathSegment.y + (prospect.pathProgress / pathSegment.height) * pathSegment.height;
    }
    
    // Check if reached end of segment
    const segmentLength = pathSegment.width > pathSegment.height ? pathSegment.width : pathSegment.height;
    if (prospect.pathProgress >= segmentLength) {
      prospect.pathIndex++;
      prospect.pathProgress = 0;
    }
    
    // Update prospect position in state
    dispatch({
      type: prospect.isAI ? 'UPDATE_AI_PROSPECT' : 'UPDATE_PLAYER_PROSPECT',
      payload: { index: prospect.index, updates: { x: prospect.x, y: prospect.y, pathIndex: prospect.pathIndex, pathProgress: prospect.pathProgress } }
    });
  };
  
  // Update all towers
  const updateTowers = (deltaTime) => {
    // Update player towers
    state.playerTowers.forEach((tower, index) => {
      updateTower(tower, index, deltaTime, state.aiProspects, false);
    });
    
    // Update AI towers
    state.aiTowers.forEach((tower, index) => {
      updateTower(tower, index, deltaTime, state.playerProspects, true);
    });
  };
  
  // In useGameLoop.js, update the updateTower function:

// In the updateTower function within useGameLoop.js
const updateTower = (tower, towerIndex, deltaTime, targetProspects, isAI) => {
    // Accumulate time since last attack
    const lastAttackTime = tower.lastAttackTime + deltaTime;
    
    // Only attempt to attack if enough time has passed
    if (lastAttackTime >= tower.rate) {
      // Find prospects in range and filter to only active ones
      const prospectsInRange = targetProspects.filter(prospect => {
        if (!prospect.isActive || prospect.isConverted) return false;
        
        // Calculate distance between tower and prospect center
        const distance = Math.sqrt(
          Math.pow(tower.x - prospect.x - 10, 2) + 
          Math.pow(tower.y - prospect.y - 10, 2)
        );
        
        return distance <= tower.range;
      });
      
      // If we found targets, attack and reset timer
      if (prospectsInRange.length > 0) {
        // Get target based on strategy (just use first one for simplicity)
        const target = prospectsInRange[0];
        
        // Reset attack timer
        dispatch({
          type: isAI ? 'UPDATE_AI_TOWER' : 'UPDATE_TOWER',
          payload: { 
            index: towerIndex, 
            updates: { lastAttackTime: 0 } 
          }
        });
        
        // Create visual projectile
        dispatch({
          type: 'CREATE_PROJECTILE',
          payload: {
            id: Date.now() + Math.random(),
            fromX: tower.x,
            fromY: tower.y,
            toX: target.x + 10,
            toY: target.y + 10,
            color: towerTypes[tower.type].projectileColor,
            isAI
          }
        });
        
        // Apply damage
        const newHealth = Math.max(0, target.health - tower.power);
        
        // Update prospect
        dispatch({
          type: target.isAI ? 'UPDATE_AI_PROSPECT' : 'UPDATE_PLAYER_PROSPECT',
          payload: { 
            index: target.index, 
            updates: { health: newHealth } 
          }
        });
        
        // Check if converted
        if (newHealth <= 0) {
          const prospectType = prospectTypes.find(pt => pt.name === target.type);
          
          if (target.isAI) {
            dispatch({ 
              type: 'PLAYER_CONVERSION',
              payload: prospectType.value
            });
          } else {
            dispatch({ type: 'AI_CONVERSION' });
          }
          
          dispatch({
            type: target.isAI ? 'CONVERT_AI_PROSPECT' : 'CONVERT_PLAYER_PROSPECT',
            payload: { index: target.index }
          });
        }
      } else {
        // No targets in range, just update the timer
        dispatch({
          type: isAI ? 'UPDATE_AI_TOWER' : 'UPDATE_TOWER',
          payload: { 
            index: towerIndex, 
            updates: { lastAttackTime } 
          }
        });
      }
    } else {
      // Not ready to attack yet, just update the timer
      dispatch({
        type: isAI ? 'UPDATE_AI_TOWER' : 'UPDATE_TOWER',
        payload: { 
          index: towerIndex, 
          updates: { lastAttackTime } 
        }
      });
    }
  };
  
  // Find targets for a tower based on its strategy
  const findTargets = (tower, prospects, towerInfo) => {
    // Filter active prospects in range
    const prospectsInRange = prospects.filter(prospect => {
      if (!prospect.isActive || prospect.isConverted) return false;
      
      const distance = Math.sqrt(
        Math.pow(tower.x - prospect.x - 10, 2) + 
        Math.pow(tower.y - prospect.y - 10, 2)
      );
      
      return distance <= tower.range;
    });
    
    if (prospectsInRange.length === 0) return [];
    
    let targets = [];
    
    // Apply targeting strategy
    switch (towerInfo.targetStrategy) {
      case 'furthest':
        // Target furthest along the path
        prospectsInRange.sort((a, b) => {
          const aProgress = a.pathIndex * 1000 + a.pathProgress;
          const bProgress = b.pathIndex * 1000 + b.pathProgress;
          return bProgress - aProgress;
        });
        targets.push(prospectsInRange[0]);
        break;
        
      case 'closest':
        // Target closest to the tower
        prospectsInRange.sort((a, b) => {
          const distA = Math.sqrt(
            Math.pow(tower.x - a.x - 10, 2) + 
            Math.pow(tower.y - a.y - 10, 2)
          );
          const distB = Math.sqrt(
            Math.pow(tower.x - b.x - 10, 2) + 
            Math.pow(tower.y - b.y - 10, 2)
          );
          return distA - distB;
        });
        targets.push(prospectsInRange[0]);
        break;
        
      case 'highValue':
        // Target highest value prospects
        prospectsInRange.sort((a, b) => {
          const aType = prospectTypes.find(pt => pt.name === a.type);
          const bType = prospectTypes.find(pt => pt.name === b.type);
          return bType.value - aType.value;
        });
        targets.push(prospectsInRange[0]);
        break;
        
      case 'multi':
        // Target multiple prospects
        const maxTargets = Math.min(towerInfo.maxTargets || 1, prospectsInRange.length);
        for (let i = 0; i < maxTargets; i++) {
          targets.push(prospectsInRange[i]);
        }
        break;
        
      default:
        // Default to closest
        prospectsInRange.sort((a, b) => {
          const distA = Math.sqrt(
            Math.pow(tower.x - a.x - 10, 2) + 
            Math.pow(tower.y - a.y - 10, 2)
          );
          const distB = Math.sqrt(
            Math.pow(tower.x - b.x - 10, 2) + 
            Math.pow(tower.y - b.y - 10, 2)
          );
          return distA - distB;
        });
        targets.push(prospectsInRange[0]);
    }
    
    return targets;
  };
  
  // Attack a prospect
  const attackProspect = (tower, prospect, towerInfo, isAI) => {
    // Create a projectile (visual effect)
    dispatch({
      type: 'CREATE_PROJECTILE',
      payload: {
        fromX: tower.x,
        fromY: tower.y,
        toX: prospect.x + 10,
        toY: prospect.y + 10,
        color: towerInfo.projectileColor,
        isAI
      }
    });
    
    // Apply damage to prospect
    const newHealth = Math.max(0, prospect.health - tower.power);
    const updates = { health: newHealth };
    
    dispatch({
      type: prospect.isAI ? 'UPDATE_AI_PROSPECT' : 'UPDATE_PLAYER_PROSPECT',
      payload: { index: prospect.index, updates }
    });
    
    // Check if prospect is converted
    if (newHealth <= 0 && !prospect.isConverted) {
      const prospectType = prospectTypes.find(pt => pt.name === prospect.type);
      
      dispatch({
        type: prospect.isAI ? 'PLAYER_CONVERSION' : 'AI_CONVERSION',
        payload: prospect.isAI ? prospectType.value : 0
      });
      
      dispatch({
        type: prospect.isAI ? 'CONVERT_AI_PROSPECT' : 'CONVERT_PLAYER_PROSPECT',
        payload: { index: prospect.index }
      });
    }
  };
  
  // Check if wave is complete
  const checkWaveStatus = () => {
    // Check if all prospects are processed (converted or escaped)
    const activePlayerProspects = state.playerProspects.some(p => p.isActive && !p.isConverted);
    const activeAiProspects = state.aiProspects.some(p => p.isActive && !p.isConverted);
    
    if (!activePlayerProspects && !activeAiProspects) {
      // Wave complete
      dispatch({ type: 'END_WAVE' });
      
      // Let AI place towers for next wave
      setTimeout(() => {
        placeAiTower(state, dispatch);
      }, 1000);
      
      // Check if all waves are complete
      if (state.wave >= 10) {
        dispatch({ type: 'GAME_OVER' });
      }
    }
  };
  
  // Start or stop the game loop based on game state
  useEffect(() => {
    if (state.waveInProgress && !requestIdRef.current) {
      requestIdRef.current = requestAnimationFrame(gameLoop);
    }
    
    return () => {
      if (requestIdRef.current) {
        cancelAnimationFrame(requestIdRef.current);
        requestIdRef.current = null;
        lastUpdateTimeRef.current = 0;
      }
    };
  }, [state.waveInProgress]);
  
  return { gameLoop };
}

export default useGameLoop;