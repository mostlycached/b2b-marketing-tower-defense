import React, { useEffect, useRef } from 'react';

// In the Projectile.jsx component
function Projectile({ projectile, onComplete }) {
    const projectileRef = useRef(null);
    
    useEffect(() => {
      if (!projectileRef.current) return;
      
      // Make projectile more visible
      projectileRef.current.style.width = '8px';
      projectileRef.current.style.height = '8px';
      projectileRef.current.style.boxShadow = `0 0 5px ${projectile.color}`;
      
      // Create animation with clearer visual feedback
      const animation = projectileRef.current.animate([
        { 
          left: projectile.fromX + 'px', 
          top: projectile.fromY + 'px',
          transform: 'scale(0.8)'
        },
        { 
          left: projectile.toX + 'px', 
          top: projectile.toY + 'px',
          transform: 'scale(1.2)'
        }
      ], {
        duration: 200, // Faster animation for better feedback
        easing: 'ease-out'
      });
      
      // Remove projectile when animation completes
      animation.onfinish = onComplete;
      
      return () => {
        if (animation) {
          animation.cancel();
        }
      };
    }, []);
    
    return (
      <div 
        ref={projectileRef}
        className="projectile" 
        style={{ 
          backgroundColor: projectile.color,
          left: projectile.fromX,
          top: projectile.fromY,
          zIndex: 20 // Higher z-index to ensure visibility
        }}
      ></div>
    );
  }

export default Projectile;