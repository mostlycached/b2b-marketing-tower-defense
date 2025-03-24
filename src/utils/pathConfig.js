import gameConfig from './gameConfig';

const pathConfig = [
  { x: 0, y: 100, width: 180, height: gameConfig.pathWidth },
  { x: 180, y: 100, width: gameConfig.pathWidth, height: 80 },
  { x: 100, y: 180, width: 110, height: gameConfig.pathWidth },
  { x: 100, y: 180, width: gameConfig.pathWidth, height: 50 },
  { x: 100, y: 50, width: gameConfig.pathWidth, height: 130 },
  { x: 100, y: 50, width: 200, height: gameConfig.pathWidth }
];

export default pathConfig;
