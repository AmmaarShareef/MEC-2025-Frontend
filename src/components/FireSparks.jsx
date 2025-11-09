import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';

const FireSparks = ({ trigger, tabBounds }) => {
  const [sparks, setSparks] = useState([]);

  useEffect(() => {
    if (trigger > 0 && tabBounds) {
      // Generate sparks across the entire tab space
      const newSparks = Array.from({ length: 20 }, (_, i) => {
        const startX = tabBounds.left + Math.random() * tabBounds.width;
        const endX = tabBounds.left + Math.random() * tabBounds.width;
        const centerY = tabBounds.top + tabBounds.height / 2;
        return {
          id: i,
          startX: startX - tabBounds.left, // Relative to tab container
          startY: centerY - tabBounds.top, // Relative to tab container
          deltaX: endX - startX,
          deltaY: (Math.random() - 0.5) * tabBounds.height * 0.3,
          delay: Math.random() * 0.2,
          duration: 0.6 + Math.random() * 0.4,
        };
      });
      setSparks(newSparks);

      // Clear sparks after animation
      const timer = setTimeout(() => {
        setSparks([]);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [trigger, tabBounds]);

  return (
    <>
      <style>{`
        @keyframes sparkMove {
          0% {
            opacity: 1;
            transform: translate(0, 0) scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.2);
          }
          100% {
            opacity: 0;
            transform: scale(0.5);
          }
        }
      `}</style>
      {tabBounds && (
        <Box
          sx={{
            position: 'fixed',
            left: `${tabBounds.left}px`,
            top: `${tabBounds.top}px`,
            width: `${tabBounds.width}px`,
            height: `${tabBounds.height}px`,
            pointerEvents: 'none',
            zIndex: 9999,
            overflow: 'hidden',
          }}
        >
          {sparks.map((spark) => (
            <Box
              key={spark.id}
              sx={{
                position: 'absolute',
                left: `${spark.startX}px`,
                top: `${spark.startY}px`,
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                backgroundColor: '#ff4444', // Solid red, no outline
                animation: `sparkMove ${spark.duration}s ease-out ${spark.delay}s forwards`,
                transform: `translate(${spark.deltaX}px, ${spark.deltaY}px)`,
              }}
            />
          ))}
        </Box>
      )}
    </>
  );
};

export default FireSparks;
