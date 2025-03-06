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
          margin: '0 auto',
        }}>
          {navItems.map((item) => (
            <Button
              key={item.name}
              onClick={() => handleNavigation(item.path)}
              sx={{
                color: activePage === item.path ? '#000' : 'rgba(0, 0, 0, 0.6)',
                margin: '0 4px',
                padding: '6px 16px',
                fontWeight: activePage === item.path ? 'bold' : 'normal',
                position: 'relative',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: '#000'
                },
                '&::after': activePage === item.path ? {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '30%',
                  height: '2px',
                  backgroundColor: '#000',
                  borderRadius: '2px'
                } : {}
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