import React from 'react';

function Path({ segment }) {
  const pathStyle = {
    left: segment.x,
    top: segment.y,
    width: segment.width,
    height: segment.height
  };
  
  return <div className="path" style={pathStyle}></div>;
}

export default Path;