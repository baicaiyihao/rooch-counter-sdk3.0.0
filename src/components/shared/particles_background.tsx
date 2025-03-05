import React, { useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

const float = keyframes`
  0%, 100% { 
    transform: translate(0, 0) rotate(0deg);
    opacity: 0.3;
  }
  25% { 
    transform: translate(10px, -20px) rotate(90deg);
    opacity: 0.8;
  }
  50% { 
    transform: translate(20px, 0) rotate(180deg);
    opacity: 0.3;
  }
  75% { 
    transform: translate(10px, 20px) rotate(270deg);
    opacity: 0.8;
  }
`;

// const float = keyframes`
//   0% { transform: translateY(0) translateX(0); }
//   50% { transform: translateY(-20px) translateX(10px); }
//   100% { transform: translateY(0) translateX(0); }
// `;

const BubbleContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
`;

const Bubble = styled.div<{ size: number; top: number; left: number; delay: number }>`
  position: absolute;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  top: ${props => props.top}%;
  left: ${props => props.left}%;
  background: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.2)
  );
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: ${float} 8s ease-in-out infinite;
  animation-delay: ${props => props.delay}s;
  backdrop-filter: blur(2px);
`;

export const ParticlesBackground: React.FC = () => {
    const bubbles = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      size: Math.random() * 60 + 40,
      top: Math.random() * 100,
      left: Math.random() * 100,
      delay: Math.random() * 5
    }));
  
    return (
      <BubbleContainer>
        {bubbles.map(bubble => (
          <Bubble
            key={bubble.id}
            size={bubble.size}
            top={bubble.top}
            left={bubble.left}
            delay={bubble.delay}
            style={{
                transform: 'translateZ(0)',
                willChange: 'transform'
              }}
          />
        ))}
      </BubbleContainer>
    );
  };