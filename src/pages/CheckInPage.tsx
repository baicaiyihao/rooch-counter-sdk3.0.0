import { LoadingButton } from "@mui/lab";
import { Card, CardContent, Stack, Typography, Box, Chip, Container, Grid, Fade, Zoom } from "@mui/material";
import { useCurrentAddress, SessionKeyGuard } from "@roochnetwork/rooch-sdk-kit";
import { useState, useEffect } from "react";
import { CheckIn } from '../components/check_in';
import { styled } from "@mui/material/styles";
import { keyframes } from "@emotion/react";
import { motion } from "framer-motion";
import Confetti from 'react-confetti';
import useWindowSize from 'react-use/lib/useWindowSize';
import { Layout } from '../uicomponents/shared/layout';

// 自定义卡片样式
const StyledCard = styled(Card)`
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.9);

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
  }
`;

// 自定义按钮样式
const StyledButton = styled(LoadingButton)`
  border-radius: 50px;
  padding: 12px 32px;
  font-weight: bold;
  text-transform: none;
  font-size: 1rem;
  transition: transform 0.2s ease;

  &:hover:not(:disabled) {
    transform: scale(1.05);
  }
`;

// 从顶部滑下的动画
const slideDownAnimation = keyframes`
  0% {
    transform: translateY(-100%);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
`;

// 签到成功提示组件
const SuccessMessage = styled(Box)`
  position: fixed;
  top: 20px; /* 改为顶部 20px */
  left: 20px; /* 保持左侧 20px */
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  text-align: center;
  animation: ${slideDownAnimation} 0.5s ease forwards; /* 更新为滑下动画 */
  width: 90%; /* 响应式宽度 */
  max-width: 400px; /* 最大宽度限制 */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

// 奖励闪光效果
const shineAnimation = keyframes`
  0% {
    background-position: -100px;
  }
  40% {
    background-position: 200px;
  }
  100% {
    background-position: 200px;
  }
`;

const ShiningChip = styled(Chip)`
  position: relative;
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.3) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    transform: rotate(30deg);
    animation: ${shineAnimation} 2s infinite;
  }
`;

function CheckInPage() {
  const currentAddress = useCurrentAddress();
  const [loading, setLoading] = useState(false);
  const [checkInRecord, setCheckInRecord] = useState<any>(null);
  const [checkInConfig, setCheckInConfig] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [todayReward, setTodayReward] = useState<string>('');
  const [justCheckedIn, setJustCheckedIn] = useState(false);
  const { width, height } = useWindowSize();

  const {
    CheckIn: handleCheckIn,
    GetWeekRaffle,
    QueryDailyCheckInConfig,
    QueryCheckInRecord,
  } = CheckIn();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = await QueryDailyCheckInConfig();
        setCheckInConfig(config);

        const record = await QueryCheckInRecord();
        setCheckInRecord(record);
      } catch (error) {
        console.error("获取签到数据失败:", error);
      }
    };

    if (currentAddress) {
      fetchData();
    }
  }, [currentAddress]);

  // 处理签到
  const onCheckIn = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const result = await handleCheckIn();
      console.log('签到结果:', result);

      const record = await QueryCheckInRecord();
      setCheckInRecord(record);

      // 设置今日奖励
      if (checkInConfig && record) {
        const dayIndex = Number(record.continue_days) - 1;
        if (dayIndex >= 0 && dayIndex < checkInConfig.daily_rewards.length) {
          setTodayReward(checkInConfig.daily_rewards[dayIndex]);
        }
      }

      // 显示成功提示和彩花效果
      setShowSuccess(true);
      setJustCheckedIn(true);

      // 3秒后自动关闭成功提示
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("签到失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 处理周抽奖
  const onWeekRaffle = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const result = await GetWeekRaffle();
      console.log('周抽奖结果:', result);

      // 重新获取签到记录
      const record = await QueryCheckInRecord();
      setCheckInRecord(record);
    } catch (error) {
      console.error("周抽奖失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 判断今日是否已签到
  const isCheckedInToday = checkInRecord && 
    new Date(Number(checkInRecord.last_sign_in_timestamp) * 1000).toDateString() === new Date().toDateString();

  return (
    <Layout>
      <Container className="app-container">

      {/* 签到成功时显示彩花效果 */}
      {justCheckedIn && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.1}
          onConfettiComplete={() => setJustCheckedIn(false)}
        />
      )}

      {/* 签到成功提示 */}
      {showSuccess && (
        <SuccessMessage>
          <Box sx={{ mb: 2 }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Typography variant="h1" component="div" sx={{ fontSize: '4rem', color: '#4CAF50' }}>
                ✓
              </Typography>
            </motion.div>
          </Box>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
          Check in successfully!
          </Typography>
          <Typography variant="h6" sx={{ mb: 3 }}>
          Congratulations on getting today's reward : <ShiningChip label={todayReward} color="success" sx={{ fontWeight: 'bold', fontSize: '1rem' }} />
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Continuous Check-in {checkInRecord?.continue_days} days
          </Typography>
        </SuccessMessage>
      )}

      <Stack
        className="font-sans min-w-[1024px]"
        direction="column"
        sx={{
          minHeight: "100vh",
          padding: "2rem",
        }}
      >
        <Stack direction="row" justifyContent="center" alignItems="center" className="mb-8">
          <Typography variant="h4" className="font-bold">
            Daily Check-in
          </Typography>
          <Box width={100} /> {/* 占位元素，保持标题居中 */}
        </Stack>

        <Grid container spacing={4}>
          {/* 签到状态卡片 */}
          <Grid item xs={12} md={6}>
            <StyledCard elevation={3} className="mb-8">
              <CardContent>
                <Typography variant="h5" className="mb-4 font-bold" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box component="span" sx={{ mr: 1, fontSize: '1.5rem' }}>📊</Box>
                  Your Check-in Details
                </Typography>
                <br/>


                {checkInRecord ? (
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography>Total check-in days:</Typography>
                      <Zoom in={true} style={{ transitionDelay: '100ms' }}>
                        <Chip 
                          label={checkInRecord.total_sign_in_days} 
                          color="primary" 
                          sx={{ fontWeight: 'bold' }}
                        />
                      </Zoom>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography>Consecutive check-in days:</Typography>
                      <Zoom in={true} style={{ transitionDelay: '200ms' }}>
                        <Chip 
                          label={checkInRecord.continue_days} 
                          color="success" 
                          sx={{ fontWeight: 'bold' }}
                        />
                      </Zoom>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography>Last check-in time:</Typography>
                      <Fade in={true} style={{ transitionDelay: '300ms' }}>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(Number(checkInRecord.last_sign_in_timestamp) * 1000).toLocaleString()}
                        </Typography>
                      </Fade>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography>Raffle counts:</Typography>
                      <Zoom in={true} style={{ transitionDelay: '400ms' }}>
                        <Chip 
                          label={checkInRecord.lottery_count} 
                          color="secondary" 
                          sx={{ fontWeight: 'bold' }}
                        />
                      </Zoom>
                    </Box>
                  </Stack>
                ) : (
                  <Typography>No check-in information found. Please check in first.</Typography>
                )}
              </CardContent>
            </StyledCard>
          </Grid>

          {/* 签到奖励卡片 */}
          <Grid item xs={12} md={6}>
            <StyledCard elevation={3} className="mb-8">
              <CardContent>
                <Typography variant="h5" className="mb-4 font-bold" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box component="span" sx={{ mr: 1, fontSize: '1.5rem' }}>🎁</Box>
                  Check-in Rewards
                </Typography>

                {checkInConfig ? (
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography>Maximum consecutive check-in days:</Typography>
                      <Chip 
                        label={checkInConfig.max_continue_days} 
                        color="primary" 
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>
                    <Typography variant="h6" className="mt-2">Daily rewards:</Typography>
                    <Box className="flex flex-wrap gap-2">
                      {checkInConfig.daily_rewards.map((reward: any, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Chip 
                            label={`Day ${index + 1}: ${reward}`}
                            color={index < checkInRecord?.continue_days ? "success" : "default"}
                            variant={index < checkInRecord?.continue_days ? "filled" : "outlined"}
                            sx={{ 
                              fontWeight: 'bold',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                transform: 'scale(1.05)'
                              }
                            }}
                          />
                        </motion.div>
                      ))}
                    </Box>
                  </Stack>
                ) : (
                  <Typography>Loading sign-in configuration...</Typography>
                )}
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>

        <Stack direction="row" spacing={3} justifyContent="center" className="mt-4" style={{ marginTop: '30px' }}>
          <SessionKeyGuard onClick={onCheckIn}>
            <StyledButton
              variant="contained"
              color="primary"
              size="large"
              loading={loading}
              disabled={isCheckedInToday}
              startIcon={<span>✓</span>}
            >
              {isCheckedInToday ? "Checked in today" : "Check in now"}
            </StyledButton>
          </SessionKeyGuard>

          <StyledButton
            variant="outlined"
            color="secondary"
            size="large"
            loading={loading}
            onClick={onWeekRaffle}
            disabled={!checkInRecord || checkInRecord.lottery_count <= 0}
            startIcon={<span>🎲</span>}
          >
            Weekly Raffle ({checkInRecord?.lottery_count || 0})
          </StyledButton>
        </Stack>

        {isCheckedInToday && (
          <Fade in={true}>
            <Typography variant="body2" color="success.main" sx={{ mt: 2, textAlign: 'center' }}>
              Congratulations! You have checked in today! Come back tomorrow for more rewards~
            </Typography>
          </Fade>
        )}
      </Stack>
      </Container>
    </Layout>
  );
}

export default CheckInPage;