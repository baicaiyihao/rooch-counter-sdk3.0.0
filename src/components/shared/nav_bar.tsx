import { Box, Button } from "@mui/material";
import { Heading } from "@radix-ui/themes";
import { ConnectButton } from "@roochnetwork/rooch-sdk-kit";
import { useEffect, useState } from "react";

// 导航项定义
const navItems = [
  // { name: 'FATE X', path: '/' },
  { name: 'STAKE', path: '/stake' },
  { name: 'CHECK IN', path: '/check-in' },
  { name: 'RAFFLE', path: '/raffle' },
  { name: 'LEADERBOARD', path: '/leaderboard' }
];

export function NavBar() {
  // 当前活动页面
  const [activePage, setActivePage] = useState('/');

  useEffect(() => {
    setActivePage(window.location.pathname);
  }, []);

  // 导航处理函数
  const handleNavigation = (path: string) => {
    window.location.href = path;
  };

  return (
    <header className="app-header">
      <div className="nav-container">
      <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            transition: 'opacity 0.2s ease',
            cursor: 'pointer', // 添加指针样式
            '&:hover': {
              opacity: 0.8
            }
          }}
          onClick={() => handleNavigation('/')} // 添加点击事件
        >
          <Heading>Fate X</Heading>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          borderRadius: '50px',
          padding: '4px',
          margin: '0 auto',
          transform: 'translateZ(0)', 
          willChange: 'transform' 
        }}>
          {navItems.map((item) => (
            <Button
              key={item.name}
              onClick={() => handleNavigation(item.path)}
              sx={{
                color: activePage === item.path ? '#000' : 'rgba(0, 0, 0, 0.6)',
                backgroundColor: activePage === item.path ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
                borderRadius: '50px',
                margin: '0 4px',
                padding: '6px 16px',
                fontWeight: activePage === item.path ? 'bold' : 'normal',
                transition: 'all 0.2s ease', 
                transform: 'translateZ(0)', 
                '&:hover': {
                  backgroundColor: activePage === item.path 
                    ? 'rgba(255, 255, 255, 0.9)' 
                    : 'rgba(255, 255, 255, 0.3)'
                }
              }}
            >
              {item.name}
            </Button>
          ))}
        </Box>
        
        <ConnectButton />
      </div>
    </header>
  );
}