import { keyframes } from "@emotion/react";
import { styled } from "@mui/material/styles";

// 定义背景动画
 const backgroundAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

// 创建带有动画背景的容器
export const AnimatedBackground = styled('div')`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/original_bg.webp');
  background-size: cover;
  background-position: center;
  z-index: -1;
  animation: ${backgroundAnimation} 30s ease infinite;
  will-change: background-position; // 优化性能
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(5px);
  }
`;

// 添加浮动粒子动画
export const particleFloat = keyframes`
  0% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
  100% {
    transform: translateY(0) rotate(360deg);
  }
`;

// 创建粒子组件
export const Particle = styled('div')<{ size: number; top: string; left: string; delay: number }>`
  position: fixed;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  background-color: rgba(138, 43, 226, 0.2);
  border-radius: 50%;
  top: ${props => props.top};
  left: ${props => props.left};
  z-index: -1;
  animation: ${particleFloat} ${props => 5 + props.delay}s ease-in-out infinite;
  animation-delay: ${props => props.delay}s;
  will-change: transform; // 优化性能
`;

// 闪烁效果的动画
export const shineAnimation = keyframes`
  0% {
    background-position: -100px;
  }
  100% {
    background-position: 200px;
  }
`;
