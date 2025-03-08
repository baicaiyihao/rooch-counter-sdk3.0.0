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
  { name: 'LEADERBOARD', path: '/leaderboard' },
  { name: 'DOCS', path: '/docs' }
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
      <Box
        className="nav-container"
        sx={{
          display: 'flex !important',
          flexDirection: 'row !important',// 强制保持水平布局
          alignItems: 'center',
          justifyContent: 'space-between', // 水平分布
          padding: { xs: '0.5rem', md: '1rem' }, // 移动端缩小内边距
          maxWidth: '1440px',
          margin: '0 auto',
          width: '100%',
          // flexWrap: 'nowrap', // 防止换行
          height: { xs: '60px', md: '80px' },
        }}
      >
        {/* 左侧 Logo */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flex: '0 0 auto',
            // transition: 'opacity 0.2s ease',
            // cursor: 'pointer',
            // '&:hover': { opacity: 0.8 },
          }}
          onClick={() => handleNavigation('/')} // 添加点击事件
        >
                    {/* 左边添加 logo */}
            <Box
            component="img"
            src="/4.svg" // 替换为实际的 logo 路径
            alt="Fate X Logo"
            sx={{
              width: { xs: 30, md: 40 }, // 移动端缩小 Logo
              height: 'auto',
              cursor: 'pointer',
              // marginRight: { xs: 0.5, md: 1 },
            }}
          />
          <Heading>Fate X</Heading>
        </Box>

        {/* 桌面端：显示导航项 */}
        {!isMobile && (
           <Box sx={{ display: 'flex', flex: 2, justifyContent: 'center', gap: 2 }}>
           {/*  <Box sx={{ display: 'flex', margin: '0 auto' }}> */}
         
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
                    color: '#000',
                  },
                  '&::after': activePage === item.path
                    ? {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '30%',
                        height: '2px',
                        backgroundColor: '#000',
                        borderRadius: '2px',
                      }
                    : {},
                }}
              >
                {item.name}
              </Button>
            ))}
          </Box>
        )}

        {/* 移动端：汉堡菜单 + 钱包按钮 */}
        <Box sx={{
           display: 'flex', 
           alignItems: 'center', 
           gap: { xs: 1, md: 2 },
           ml: 'auto',
          //  display: 'flex', alignItems: 'center' 
           }}>
          {isMobile && (
            <IconButton
              // edge="start"
              // color="inherit"
              // aria-label="menu"
              onClick={handleMenuOpen}
              sx={{ color: 'black', 
                padding: '8px',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
                //  marginRight: '8px' 
                }} // 靠右调整
            >
              <MenuIcon />
            </IconButton>
          )}
          <ConnectButton
            sx={{
              padding: { xs: '6px 12px', md: '12px 24px' }, // 移动端缩小按钮
              fontSize: { xs: '0.875rem', md: '1rem' },
              minWidth: { xs: 'auto', md: '120px' },
            }}
          />
        </Box>

        {/* 下拉菜单 */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: { 
              // minWidth: '150px'
              minWidth: '200px',
            mt: 1.5,
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
             },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {navItems.map((item) => (
            <MenuItem
              key={item.name}
              onClick={() => handleNavigation(item.path)}
              sx={{
                fontWeight: activePage === item.path ? 'bold' : 'normal',
                color: activePage === item.path ? '#000' : 'rgba(0, 0, 0, 0.6)',
              }}
            >
              {item.name}
            </MenuItem>
          ))}
        </Menu>
      </Box>
    </header>
  );
}