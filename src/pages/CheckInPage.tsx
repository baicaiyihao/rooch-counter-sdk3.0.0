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

// 奖励闪光效果
const shineAnimation = keyframes`
  0% { background-position: -100px; }
  40% { background-position: 200px; }
  100% { background-position: 200px; }
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

// 自定义卡片样式（与 StakePage 一致）
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

// 自定义按钮样式（与 StakePage 一致）
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

// 签到成功提示组件（与 StakePage 的 RaffleMessage 样式对齐）
const SuccessMessage = styled(Box)`
  position: fixed;
  top: 20px;
  left: 20px;
  background-color: rgba(46, 125, 50, 0.95);
  color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  text-align: center;
  width: 90%;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
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
    const fetchConfig = async () => {
      try {
        const config = await QueryDailyCheckInConfig();
        setCheckInConfig(config);
      } catch (error) {
        console.error("Failed to fetch check-in config:", error);
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const record = await QueryCheckInRecord();
        setCheckInRecord(record);
      } catch (error) {
        console.error("Failed to fetch check-in record:", error);
      }
    };
    if (currentAddress) {
      fetchRecord();
    }
  }, [currentAddress]);

  const onCheckIn = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await handleCheckIn();
      const record = await QueryCheckInRecord();
      setCheckInRecord(record);

      if (checkInConfig && record) {
        const dayIndex = Number(record.continue_days) - 1;
        if (dayIndex >= 0 && dayIndex < checkInConfig.daily_rewards.length) {
          setTodayReward(checkInConfig.daily_rewards[dayIndex]);
        }
      }

      setShowSuccess(true);
      setJustCheckedIn(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Check-in failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const onWeekRaffle = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await GetWeekRaffle();
      const record = await QueryCheckInRecord();
      setCheckInRecord(record);
    } catch (error) {
      console.error("Weekly raffle failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const isCheckedInToday =
    checkInRecord &&
    new Date(Number(checkInRecord.last_sign_in_timestamp) * 1000).toDateString() ===
      new Date().toDateString();

  const renderCheckInDetailsCard = () => (
    <StyledCard elevation={3}>
      <CardContent>
        <Typography variant="h5" sx={{ mb: 4, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <Box component="span" sx={{ mr: 1, fontSize: '1.5rem' }}>📊</Box>
          Your Check-in Details
        </Typography>
        {currentAddress ? (
          checkInRecord ? (
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography>Total check-in days:</Typography>
                <Zoom in={true} style={{ transitionDelay: '100ms' }}>
                  <ShiningChip label={checkInRecord.total_sign_in_days} color="primary" sx={{ fontWeight: 'bold' }} />
                </Zoom>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography>Consecutive check-in days:</Typography>
                <Zoom in={true} style={{ transitionDelay: '200ms' }}>
                  <ShiningChip label={checkInRecord.continue_days} color="success" sx={{ fontWeight: 'bold' }} />
                </Zoom>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography>Last check-in time:</Typography>
                <Zoom in={true} style={{ transitionDelay: '300ms' }}>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(Number(checkInRecord.last_sign_in_timestamp) * 1000).toLocaleString()}
                  </Typography>
                </Zoom>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography>Raffle counts:</Typography>
                <Zoom in={true} style={{ transitionDelay: '400ms' }}>
                  <ShiningChip label={checkInRecord.lottery_count} color="secondary" sx={{ fontWeight: 'bold' }} />
                </Zoom>
              </Box>
            </Stack>
          ) : (
            <Typography>No check-in information found. Please check in first.</Typography>
          )
        ) : (
          <Typography>Please connect your wallet to view check-in details.</Typography>
        )}
      </CardContent>
    </StyledCard>
  );

  const renderRewardsCard = () => (
    <StyledCard elevation={3}>
      <CardContent>
        <Typography variant="h5" sx={{ mb: 4, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <Box component="span" sx={{ mr: 1, fontSize: '1.5rem' }}>🎁</Box>
          Check-in Rewards
        </Typography>
        {checkInConfig ? (
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography>Maximum consecutive check-in days:</Typography>
              <Zoom in={true} style={{ transitionDelay: '100ms' }}>
                <ShiningChip label={checkInConfig.max_continue_days} color="primary" sx={{ fontWeight: 'bold' }} />
              </Zoom>
            </Box>
            <Typography variant="h6">Daily rewards:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {checkInConfig.daily_rewards.map((reward: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ShiningChip
                    label={`Day ${index + 1}: ${reward}`}
                    color={currentAddress && index < checkInRecord?.continue_days ? "success" : "default"}
                    variant={currentAddress && index < checkInRecord?.continue_days ? "filled" : "outlined"}
                    sx={{ fontWeight: 'bold' }}
                  />
                </motion.div>
              ))}
            </Box>
          </Stack>
        ) : (
          <Typography>Loading check-in configuration...</Typography>
        )}
      </CardContent>
    </StyledCard>
  );

  return (
    <Layout>
      <Container className="app-container">
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
        {showSuccess && (
          <SuccessMessage>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Typography variant="h1" component="div" sx={{ fontSize: '4rem', color: 'white' }}>
                ✓
              </Typography>
            </motion.div>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 2 }}>
              Check in successfully!
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              Reward: <ShiningChip label={todayReward} color="success" sx={{ fontWeight: 'bold' }} />
            </Typography>
          </SuccessMessage>
        )}
        <Stack
          className="font-sans"
          direction="column"
          sx={{
            minHeight: "100vh",
            padding: { xs: "1rem", md: "2rem" },
            maxWidth: "1440px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          <Stack direction="row" justifyContent="center" alignItems="center" sx={{ mb: { xs: 4, md: 8 } }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Daily Check-in</Typography>
            <Box width={100} />
          </Stack>
          <Grid container spacing={4} sx={{ width: "100%", margin: "0 auto" }}>
            <Grid item xs={12} md={6}>
              {renderCheckInDetailsCard()}
            </Grid>
            <Grid item xs={12} md={6}>
              {renderRewardsCard()}
            </Grid>
          </Grid>
          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
            <SessionKeyGuard onClick={onCheckIn}>
              <StyledButton
                variant="contained"
                color="primary"
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
              loading={loading}
              onClick={onWeekRaffle}
              disabled={!currentAddress || !checkInRecord || checkInRecord.lottery_count <= 0}
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