import { Box, Button, IconButton, Menu, MenuItem, useMediaQuery } from "@mui/material";
import { Heading } from "@radix-ui/themes";
import { ConnectButton } from "@roochnetwork/rooch-sdk-kit";
import { useEffect, useState } from "react";
import MenuIcon from "@mui/icons-material/Menu"; // 汉堡菜单图标

// 导航项定义
const navItems = [
  { name: "STAKE", path: "/stake" },
  { name: "CHECK IN", path: "/check-in" },
  { name: "RAFFLE", path: "/raffle" },
  { name: "LEADERBOARD", path: "/leaderboard" },
  { name: "DOCS", path: "/docs" },
];

export function NavBar() {
  const [activePage, setActivePage] = useState("/");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null); // 控制下拉菜单
  const isMobile = useMediaQuery("(max-width: 768px)"); // 判断是否为手机端

  useEffect(() => {
    setActivePage(window.location.pathname);
  }, []);

  // 导航处理函数
  const handleNavigation = (path: string) => {
    window.location.href = path;
    setAnchorEl(null); // 关闭下拉菜单
  };

  // 打开下拉菜单
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // 关闭下拉菜单
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <header className="app-header">
      <Box
        className="nav-container"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: { xs: "0.5rem", md: "1rem" }, // 手机端 8px，PC 端 16px
          maxWidth: "1440px",
          margin: "0 auto",
          width: "100%",
          flexWrap: "nowrap", // 防止换行
          height: { xs: "48px", md: "60px" }, // 手机端 48px，PC 端 60px
          overflow: "hidden", // 防止溢出
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            transition: "opacity 0.2s ease",
            cursor: "pointer",
            "&:hover": { opacity: 0.8 },
            gap: { xs: 0.5, md: 1 }, // 手机端 4px，PC 端 8px
          }}
          onClick={() => handleNavigation("/")}
        >
          <Box
            component="img"
            src="/4.svg" // 替换为您的 Logo 路径
            alt="Fate X Logo"
            sx={{
              width: { xs: 24, md: 40 }, // 手机端 24px，PC 端 40px
              height: "auto",
            }}
          />
          {!isMobile && <Heading>Fate X</Heading>} {/* 手机端隐藏文字 */}
        </Box>

        {/* 手机端导航栏 */}
        {isMobile ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, md: "8px" } }}>
            {/* 汉堡菜单 */}
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleMenuOpen}
              sx={{ color: "black", padding: { xs: "4px", md: "6px" } }}
            >
              <MenuIcon sx={{ fontSize: { xs: "1.25rem", md: "1.5rem" } }} />
            </IconButton>
            {/* 钱包按钮 */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                width: "180px", // 固定宽度（基于连接后尺寸）
                height: "40px", // 固定高度
                overflow: "hidden",
              }}
            >
              <ConnectButton
                style={{
                  padding: "2px 6px", // 手机端内边距
                  fontSize: "0.65rem", // 缩小字体
                  width: "100%", // 填充 Box
                  height: "100%", // 填充 Box
                  lineHeight: "normal", // 防止字体撑开高度
                  whiteSpace: "nowrap", // 防止文本换行
                  overflow: "hidden",
                  textOverflow: "ellipsis", // 文本过长时显示省略号
                }}
              />
            </Box>
          </Box>
        ) : (
          /* PC 端导航栏 */
          <>
            <Box sx={{ display: "flex", margin: "0 auto", gap: "8px" }}>
              {navItems.map((item) => (
                <Button
                  key={item.name}
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    color: activePage === item.path ? "#000" : "rgba(0, 0, 0, 0.6)",
                    margin: "0 4px",
                    padding: "6px 16px",
                    fontWeight: activePage === item.path ? "bold" : "normal",
                    position: "relative",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: "transparent",
                      color: "#000",
                    },
                    "&::after": activePage === item.path
                      ? {
                          content: '""',
                          position: "absolute",
                          bottom: 0,
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: "30%",
                          height: "2px",
                          backgroundColor: "#000",
                          borderRadius: "2px",
                        }
                      : {},
                  }}
                >
                  {item.name}
                </Button>
              ))}
            </Box>
            {/* 超链接，放在 ConnectButton 左侧，仅限 PC 端 */}
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <a
                href="https://t.me/fatex_protocol"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
              >
                <Box
                  component="img"
                  src="/tg.svg"
                  alt="Telegram"
                  sx={{ width: 24, height: 24, "&:hover": { opacity: 0.8 } }}
                />
              </a>
              <a
                href="https://x.com/fatex_protocol"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
              >
                <Box
                  component="img"
                  src="/twitter.svg" // 请替换为您的 Twitter 图标路径
                  alt="Twitter"
                  sx={{ width: 24, height: 24, "&:hover": { opacity: 0.8 } }}
                />
              </a>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  width: "180px", // PC 端固定宽度
                  height: "40px", // PC 端固定高度
                  overflow: "hidden",
                }}
              >
                <ConnectButton
                  style={{
                    padding: "6px 12px",
                    fontSize: "1rem",
                    width: "100%",
                    height: "100%",
                    lineHeight: "normal",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                />
              </Box>
            </Box>
          </>
        )}

        {/* 手机端下拉菜单 */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              minWidth: "150px",
              mt: 1.5,
              borderRadius: "8px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          {navItems.map((item) => (
            <MenuItem
              key={item.name}
              onClick={() => handleNavigation(item.path)}
              sx={{
                fontWeight: activePage === item.path ? "bold" : "normal",
                color: activePage === item.path ? "#000" : "rgba(0, 0, 0, 0.6)",
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