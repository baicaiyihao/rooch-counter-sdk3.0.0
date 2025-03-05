// import { Grid, Paper, Typography, Box, Chip } from "@mui/material";
// import { keyframes } from "@emotion/react";
// import { styled } from "@mui/material/styles";
// import { motion } from "framer-motion"; // 引入framer-motion
// import { cn } from "../utils/cn"; 
// // 定义浮动动画
// const float = keyframes`
//   0% {
//     transform: translateY(0px);
//   }
//   50% {
//     transform: translateY(-10px);
//   }
//   100% {
//     transform: translateY(0px);
//   }
// `;

// // 创建带有浮动动画的Paper组件
// const AnimatedPaper = styled(Paper)`
//   transition: all 0.3s ease;
//   &:hover {
//     transform: translateY(-5px);
//     box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
//   }
//   animation: ${float} 4s ease-in-out infinite;
//   animation-delay: ${props => props.delay || '0s'};
// `;

// // 导航卡片类型定义
// export interface NavigationCard {
//   title: string;
//   description: string;
//   icon: string;
//   onClick?: () => void;
//   width?: {
//     xs?: number;
//     sm?: number;
//     md?: number;
//     lg?: number;
//   };
//   height?: number | string; // 添加高度属性
//   extraContent?: {
//     continueDays?: number;
//     totalDays?: number;
//     nextReward?: string;
//     isCheckedInToday?: boolean;
//   };
// }

// interface GridNavigationProps {
//   cards: NavigationCard[]; 
//   // 添加默认宽度占比属性
//   xs?: number;
//   sm?: number;
//   md?: number;
//   lg?: number;
//   defaultHeight?: number | string; // 添加默认高度属性
//   fullWidth?: boolean;
// }

// export function GridNavigation({ 
//   cards, 
//   xs = 12, 
//   sm = 6, 
//   md = 6, 
//   lg = 6 ,
//   defaultHeight = '180px' ,// 设置默认高度
//   fullWidth = false
// }: GridNavigationProps) {
//   return (
//     <div 
//     style={{ 
//       width: fullWidth ? '100vw' : '100%',
//       position: fullWidth ? 'relative' : 'static',
//       left: fullWidth ? '50%' : 'auto',
//       transform: fullWidth ? 'translateX(-50%)' : 'none',
//       marginLeft: fullWidth ? '0' : 'auto',
//       marginRight: fullWidth ? '0' : 'auto',
//       boxSizing: 'border-box'
//     }}
//   >
//     <Grid container spacing={3} className="mb-8" sx={{ maxWidth: '1200px', margin: '0 auto' }}>
//     {cards.map((card, index) => (
//       <Grid 
//         item 
//         xs={card.width?.xs || xs} 
//         sm={card.width?.sm || sm} 
//         md={card.width?.md || md} 
//         lg={card.width?.lg || lg} 
//         key={index}
//       >
//         <motion.div
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: index * 0.1, duration: 0.5 }}
//         >
//           <AnimatedPaper 
//             elevation={1} 
//             className="p-6 h-full cursor-pointer"
//             sx={{ 
//               borderRadius: '12px',
//               border: '1px solid #eaeaea',
//               height: '100%',
//               display: 'flex',
//               flexDirection: 'column',
//               justifyContent: 'flex-start',
//               alignItems: 'flex-start',
//                 minHeight: card.height || defaultHeight, 
//               position: 'relative',
//               overflow: 'hidden'
//             }}
//             onClick={card.onClick}
//             delay={`${index * 0.5}s`}
//           >
//             {/* 添加背景光效 */}
//             <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
            
//             <Box className="mb-2 text-2xl relative z-10">{card.icon}</Box>
//             <Typography variant="h5" component="h2" className="font-bold mb-2 relative z-10">
//               {card.title}
//             </Typography>
//             <Typography variant="body1" color="text.secondary" className="relative z-10">
//               {card.description}
//             </Typography>

//              {/* 显示签到额外信息 */}
//              {card.extraContent && (
//                 <Box sx={{ mt: 2, width: '100%' }} className="relative z-10">
//                   {card.extraContent.isCheckedInToday ? (
//                     <Chip 
//                       label="今日已签到" 
//                       color="success" 
//                       sx={{ 
//                         fontWeight: 'bold', 
//                         mt: 1,
//                         animation: 'pulse 2s infinite'
//                       }} 
//                     />
//                   ) : (
//                     <Chip 
//                       label="点击签到" 
//                       color="primary" 
//                       variant="outlined" 
//                       sx={{ 
//                         fontWeight: 'bold', 
//                         mt: 1,
//                         animation: 'pulse 2s infinite'
//                       }} 
//                     />
//                   )}
                  
//                   {card.extraContent.nextReward && (
//                     <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
//                       下次签到奖励: <Chip size="small" label={card.extraContent.nextReward} color="secondary" />
//                     </Typography>
//                   )}
//                 </Box>
//               )}
//              {/* 显示签到额外信息  结尾*/}


//           </AnimatedPaper>
//         </motion.div>
//       </Grid>
//     ))}
//   </Grid>
//   </div>
//   );
// }
import { Grid, Paper, Typography, Box } from "@mui/material";
import { keyframes } from "@emotion/react";
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion"; 
import { cn } from "../utils/cn"; 
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { CardBody, CardContainer, CardItem } from "../components/ui/3d-card";

// 定义浮动动画
const float = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
`;

// 创建带有浮动动画的Paper组件
const AnimatedPaper = styled(Paper)`
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }
  animation: ${float} 4s ease-in-out infinite;
  animation-delay: ${props => props.delay || '0s'};
`;

// 定义脉冲动画
const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

// 创建脉冲效果的徽章
const PulseBadge = styled(motion.div)`
  display: inline-flex;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.875rem;
  line-height: 1.5;
  margin-top: 0.5rem;
  background: linear-gradient(45deg, #4f46e5, #8b5cf6);
  color: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
`;

// 创建奖励徽章
const RewardBadge = styled(motion.div)`
  display: inline-flex;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.75rem;
  line-height: 1.5;
  margin-left: 0.5rem;
  background: linear-gradient(45deg, #f59e0b, #ef4444);
  color: white;
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06);
`;

// 导航卡片类型定义
export interface NavigationCard {
  title: string;
  description: string;
  icon: string;
  onClick?: () => void;
  width?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
  height?: number | string; // 添加高度属性
  extraContent?: {
    continueDays?: number;
    totalDays?: number;
    nextReward?: string;
    isCheckedInToday?: boolean;
  };
}

interface GridNavigationProps {
  cards: NavigationCard[]; 
  // 添加默认宽度占比属性
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  defaultHeight?: number | string; // 添加默认高度属性
  fullWidth?: boolean;
}

export function GridNavigation({ 
  cards, 
  xs = 12, 
  sm = 6, 
  md = 6, 
  lg = 6 ,
  defaultHeight = '180px' ,// 设置默认高度
  fullWidth = false
}: GridNavigationProps) {
  return (
    <div 
    style={{ 
      width: '100%',  // 修改为始终100%
      position: 'relative',
      boxSizing: 'border-box',
      overflow: 'hidden'  // 防止溢出
    }}
  >
    <Grid container spacing={3} className="mb-8" className="mb-8" sx={{ width: '100%', margin: '0 auto', maxWidth: 'none' }}>
    {cards.map((card, index) => (
      <Grid 
        item 
        xs={card.width?.xs || xs} 
        sm={card.width?.sm || sm} 
        md={card.width?.md || md} 
        lg={card.width?.lg || lg} 
        key={index}
      >
        <CardContainer className="w-full h-full" onClick={card.onClick}>
          <CardBody className={cn(
            "backdrop-filter backdrop-blur-md bg-white/30 border border-white/40 rounded-xl shadow-md hover:shadow-xl transition-all duration-300",
            "flex flex-col justify-start items-start p-6 relative overflow-hidden",
            "w-full h-full"  
         )}
         style={{ minHeight: card.height || defaultHeight, width: '100%'  }}
         >
           {/* 移除原有的背景渐变效果 */}
           {/* <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 opacity-50"></div> */}
            {/* 背景渐变效果 */}
          {/* 添加新的玻璃态效果 */}
           <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/20 rounded-xl"></div>            
            {/* 卡片内容 */}
            <CardItem
              translateZ="50"
              className="text-2xl mb-2 relative z-10"
            >
              {card.icon}
            </CardItem>
            
            <CardItem
              translateZ="60"
              className="text-xl font-bold mb-2 relative z-10"
            >
              {card.title}
            </CardItem>
            
            <CardItem
              translateZ="40"
              className="text-gray-600 text-sm relative z-10"
            >
              {card.description}
            </CardItem>

            {/* 显示签到额外信息 */}
            {card.extraContent && (
              <CardItem translateZ="70" className="mt-4 w-full relative z-10">
                {card.extraContent.isCheckedInToday ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <PulseBadge
                      className="bg-green-500"
                      animate={{ 
                        boxShadow: ["0px 0px 0px rgba(79, 209, 127, 0.3)", "0px 0px 15px rgba(79, 209, 127, 0.6)", "0px 0px 0px rgba(79, 209, 127, 0.3)"]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      ✓ 今日已签到
                    </PulseBadge>
                  </motion.div>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <PulseBadge
                      className="bg-blue-500 cursor-pointer"
                      animate={{ 
                        boxShadow: ["0px 0px 0px rgba(59, 130, 246, 0.3)", "0px 0px 15px rgba(59, 130, 246, 0.6)", "0px 0px 0px rgba(59, 130, 246, 0.3)"]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      ✓ 点击签到
                    </PulseBadge>
                  </motion.div>
                )}
                
                {card.extraContent.continueDays && (
                  <div className="mt-2 text-sm font-medium text-gray-700">
                    已连续签到 
                    <span className="text-indigo-600 font-bold mx-1">
                      {card.extraContent.continueDays}
                    </span> 
                    天
                  </div>
                )}
                
                {card.extraContent.nextReward && (
                  <div className="mt-2 text-sm font-medium text-gray-700 flex items-center">
                    下次签到奖励: 
                    <RewardBadge
                      animate={{ 
                        y: [0, -3, 0],
                        rotate: [0, 2, 0, -2, 0]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {card.extraContent.nextReward}
                    </RewardBadge>
                  </div>
                )}
              </CardItem>
            )}
          </CardBody>
        </CardContainer>
      </Grid>
    ))}
  </Grid>
  </div>
  );
}