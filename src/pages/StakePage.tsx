import { useEffect, useState } from 'react';
import { LoadingButton } from "@mui/lab";
import { Container, Card, CardContent, Typography, Box, Chip, Grid, Zoom, Stack } from "@mui/material";
import { StakeByGrowVotes } from '../components/stake_by_grow_votes';
import { styled } from "@mui/material/styles";
import { keyframes } from "@emotion/react";
import { motion } from "framer-motion";
import Confetti from 'react-confetti';
import useWindowSize from 'react-use/lib/useWindowSize';
import { useCurrentAddress, useCurrentWallet, useRoochClient, SessionKeyGuard } from '@roochnetwork/rooch-sdk-kit';
import { getCoinDecimals, formatBalance } from '../utils/coinUtils';
import { FATETYPE } from '../config/constants';
import { Layout } from '../uicomponents/shared/layout';
import { CircularProgress } from '@mui/material';
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useSessionKey } from '../utils/useSessionKey';

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

// 提示弹窗样式
const RaffleMessage = styled(Box)<{ type: "success" | "error" }>(({ type }) => ({
  position: "fixed",
  top: "20px",
  left: "20px",
  backgroundColor: type === "success" ? "rgba(46, 125, 50, 0.95)" : "rgba(211, 47, 47, 0.95)",
  color: "white",
  borderRadius: "12px",
  padding: "1.5rem",
  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
  zIndex: 1000,
  textAlign: "center",
  width: "90%",
  maxWidth: "300px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
}));

export default function StakePage() {
  const [isFeatureEnabled] = useState<boolean>(true); 
  const [poolInfo, setPoolInfo] = useState<any>(null);
  const [stakeInfo, setStakeInfo] = useState<any>(null);
  const [hasVotes, setHasVotes] = useState<boolean | null>(null); // null 表示加载中
  const [projectName, setProjectName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [messageText, setMessageText] = useState("");
  const [justStaked, setJustStaked] = useState(false);
  const currentAddress = useCurrentAddress();
  const connectionStatus = useCurrentWallet();
  const { width, height } = useWindowSize();
  const [fateBalance, setFateBalance] = useState<string>('0');
  const client = useRoochClient();

  const { 
    QueryStakePoolInfo, 
    GetStakeInfo, 
    UpdateGrowVotes,
    Stake, 
    UnStake, 
    ClaimRewords,
    QueryProjectName 
  } = StakeByGrowVotes();

  const { checkSessionKey, createSession } = useSessionKey();

  const fetchPoolInfo = async () => {
    try {
      const [poolData, projectNameData] = await Promise.all([
        QueryStakePoolInfo(),
        QueryProjectName()
      ]);
      setPoolInfo(poolData);
      setProjectName(projectNameData as string);
    } catch (error) {
      console.error('get stake pool info failed:', error);
    }
  };

  const fetchUserInfo = async () => {
    console.log("stake currentAddress", currentAddress);
    if (!currentAddress) return;

    // 检查 session key 是否有效
    const hasValidSession = await checkSessionKey();
    if (!hasValidSession) {
      const success = await createSession();
      if (!success) {
        setMessageType("error");
        setMessageText("RGas 不足");
        setMessageOpen(true);
        return;
      } 
    }

    // session key 已确认有效，继续获取用户信息
    try {
      await UpdateGrowVotes();
      const stakeData = await GetStakeInfo();
      console.log("stakeData", stakeData);
      setStakeInfo(stakeData);
      const stake_grow_votes = Number(stakeData?.stake_grow_votes || 0);
      const fate_grow_votes = Number(stakeData?.fate_grow_votes || 0);
      setHasVotes(Boolean(stake_grow_votes || fate_grow_votes));
      } catch (error) {
      console.error('get user stake info failed:', error);
      setStakeInfo(null);
      setHasVotes(false); // 明确设置为未投票
    }
  };

  const refreshStakeInfo = async () => {
    try {
      const stakeData = await GetStakeInfo();
      setStakeInfo(stakeData);
    } catch (error) {
      console.error('refresh stake info failed:', error);
    }
  };

  const fetchFateBalance = async () => {
    if (!currentAddress || !client) return;
    try {
      const decimals = await getCoinDecimals(client, FATETYPE);
      const balance = await client.getBalance({
        owner: currentAddress?.genRoochAddress().toHexAddress() || "",
        coinType: FATETYPE
      }) as any;
      console.log(balance);
      setFateBalance(formatBalance(balance?.balance, decimals));
    } catch (error) {
      console.error('get $FATE balance failed:', error);
      setFateBalance('0');
    }
  };

  useEffect(() => {
    fetchPoolInfo();
  }, []);

  useEffect(() => {
    if (currentAddress) {
      fetchUserInfo();
      fetchFateBalance();
  
      const refreshInterval = setInterval(() => {
        refreshStakeInfo(); // 只刷新 stakeInfo，包括 accumulated_fate
      }, 30000); // 30000ms = 30 seconds
  
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          refreshStakeInfo();
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);
  
      return () => {
        clearInterval(refreshInterval);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [currentAddress]);

  useEffect(() => {
    if (messageOpen) {
      const timer = setTimeout(() => {
        setMessageOpen(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [messageOpen]);

  const formatDate = (timestamp: string) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleString();
  };

  const handleStake = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await Stake();
      await Promise.all([fetchUserInfo(), fetchPoolInfo(), fetchFateBalance()]);
      setMessageType("success");
      setMessageText("Stake successful!");
      setMessageOpen(true);
      setJustStaked(true);
    } catch (error) {
      console.error('stake failed:', error);
      setMessageType("error");
      setMessageText("Stake failed, please try again.");
      setMessageOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleUnstake = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await UnStake();
      await Promise.all([fetchUserInfo(), fetchPoolInfo(), fetchFateBalance()]);
      setMessageType("success");
      setMessageText("Unstake successful!");
      setMessageOpen(true);
      setJustStaked(true);
    } catch (error) {
      console.error('unstake failed:', error);
      setMessageType("error");
      setMessageText("Unstake failed, please try again.");
      setMessageOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const rewardAmount = stakeInfo?.accumulated_fate || 0;
      await ClaimRewords();
      setMessageType("success");
      setMessageText(`Claimed ${rewardAmount} $FATE successfully!`);
      setMessageOpen(true);
      setJustStaked(true);
      setTimeout(() => {
        Promise.all([fetchUserInfo(), fetchFateBalance()]);
      }, 3000);
    } catch (error) {
      console.error('claim rewards failed:', error);
      setMessageType("error");
      setMessageText("Claim failed, please try again.");
      setMessageOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const renderPoolInfoCard = () => (
    <StyledCard elevation={3}>
      <CardContent>
        <Typography variant="h5" sx={{ mb: 4, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <Box component="span" sx={{ mr: 1, fontSize: '1.5rem' }}>🏦</Box>
          Stake Pool Info
        </Typography>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography>Total Stake Votes Amount:</Typography>
            <Zoom in={true} style={{ transitionDelay: '100ms' }}>
              <ShiningChip label={`${poolInfo?.total_staked_votes || 0} Votes`} color="primary" sx={{ fontWeight: 'bold' }} />
            </Zoom>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography>Release Per Second:</Typography>
            <Zoom in={true} style={{ transitionDelay: '200ms' }}>
              <ShiningChip label={`${poolInfo?.release_per_second || 0} $FATE`} color="success" sx={{ fontWeight: 'bold' }} />
            </Zoom>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography>Total Supply:</Typography>
            <Zoom in={true} style={{ transitionDelay: '300ms' }}>
              <ShiningChip label={`${poolInfo?.total_fate_supply || 0} $FATE`} color="secondary" sx={{ fontWeight: 'bold' }} />
            </Zoom>
          </Box>
          <Box>
            <Typography>Start Time: {poolInfo ? formatDate(poolInfo.start_time) : '-'}</Typography>
          </Box>
          <Box>
            <Typography>End Time: {poolInfo ? formatDate(poolInfo.end_time) : '-'}</Typography>
          </Box>
        </Stack>
      </CardContent>
    </StyledCard>
  );

  const renderUserStakeCard = () => {
    if (!currentAddress || connectionStatus.isDisconnected) {
      return (
        <StyledCard elevation={3}>
          <CardContent>
            <Typography variant="h5" sx={{ mb: 4, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              <Box component="span" sx={{ mr: 1, fontSize: '1.5rem' }}>👤</Box>
              Your Stake Details
            </Typography>
            <Typography>Please connect wallet.</Typography>
          </CardContent>
        </StyledCard>
      );
    }
    if (hasVotes === null) { // 加载中状态
      return (
        <StyledCard elevation={3}>
          <CardContent>
            <Typography variant="h5" sx={{ mb: 4, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              <Box component="span" sx={{ mr: 1, fontSize: '1.5rem' }}>👤</Box>
              Your Stake Details
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
              <CircularProgress />
            </Box>
          </CardContent>
        </StyledCard>
      );
    }
    if (!hasVotes) { // 未投票状态
      return (
        <StyledCard elevation={3}>
          <CardContent>
            <Typography variant="h5" sx={{ mb: 4, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              <Box component="span" sx={{ mr: 1, fontSize: '1.5rem' }}>👤</Box>
              Your Stake Details
            </Typography>
            <Typography sx={{ mb: 1 }}>You didn't vote.</Typography>
            <Typography variant="body2">
              Please go to <Typography component="a" href={`https://grow.rooch.network/project/${projectName}`} target="_blank" sx={{ fontWeight: 'bold', textDecoration: 'underline' }}>Grow</Typography> vote for the project.
            </Typography>
          </CardContent>
        </StyledCard>
      );
    }

    return (
      <StyledCard elevation={3}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 4, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
            <Box component="span" sx={{ mr: 1, fontSize: '1.5rem' }}>👤</Box>
            Your Stake Details
          </Typography>
          <Stack spacing={4}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography>$FATE Balance:</Typography>
              <Zoom in={true} style={{ transitionDelay: '200ms' }}>
                <Chip label={`${fateBalance}`} color="primary" sx={{ fontWeight: 'bold' }} />
              </Zoom>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography>Stake Votes Amount:</Typography>
              <Zoom in={true} style={{ transitionDelay: '100ms' }}>
                <ShiningChip label={`${stakeInfo?.stake_grow_votes || 0} Votes`} color="success" sx={{ fontWeight: 'bold' }} />
              </Zoom>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography>Unstake Votes Amount:</Typography>
              <Zoom in={true} style={{ transitionDelay: '200ms' }}>
                <Chip label={`${stakeInfo?.fate_grow_votes || 0} Votes`} color="primary" sx={{ fontWeight: 'bold' }} />
              </Zoom>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography>Rewards:</Typography>
              <Zoom in={true} style={{ transitionDelay: '300ms' }}>
                <ShiningChip label={`${stakeInfo?.accumulated_fate || 0} $FATE`} color="secondary" sx={{ fontWeight: 'bold' }} />
              </Zoom>
            </Box>
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
              <SessionKeyGuard onClick={handleStake}>
                <StyledButton 
                  variant="contained" 
                  color="primary" 
                  disabled={!stakeInfo?.fate_grow_votes}
                  loading={loading}
                  startIcon={<span>📥</span>}
                >
                  Stake
                </StyledButton>
              </SessionKeyGuard>
              <SessionKeyGuard onClick={handleUnstake}>
                <StyledButton 
                  variant="outlined"
                  color="warning"
                  disabled={!stakeInfo?.stake_grow_votes}
                  loading={loading}
                  startIcon={<span>📤</span>}
                >
                  Unstake
                </StyledButton>
              </SessionKeyGuard>
              <SessionKeyGuard onClick={handleClaim}>
                <StyledButton 
                  variant="contained" 
                  color="success" 
                  disabled={!stakeInfo?.accumulated_fate}
                  loading={loading}
                  startIcon={<span>🎁</span>}
                >
                  Claim
                </StyledButton>
              </SessionKeyGuard>
            </Stack>
          </Stack>
        </CardContent>
      </StyledCard>
    );
  };

  const renderMaintenanceMessage = () => (
    <Box
      sx={{
        height: '80vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '20px'
      }}
    >
      <Typography 
        variant="h4" 
        sx={{ 
          fontWeight: 'bold',
          color: '#666',
          maxWidth: '800px',
          animation: 'fadeIn 0.5s ease-in',
          '@keyframes fadeIn': {
            '0%': { opacity: 0, transform: 'scale(0.9)' },
            '100%': { opacity: 1, transform: 'scale(1)' }
          }
        }}
      >
        This feature is undergoing urgent maintenance and will be available later.
      </Typography>
    </Box>
  );
  return (
    <Layout>
      <Container className="app-container">
      {isFeatureEnabled ? (<>
        {justStaked && (
          <Confetti
            width={width}
            height={height}
            recycle={false}
            numberOfPieces={500}
            gravity={0.1}
            onConfettiComplete={() => setJustStaked(false)}
          />
        )}
        {messageOpen && (
          <RaffleMessage type={messageType}>
            {messageType === "success" && (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <CheckCircleOutlineIcon sx={{ fontSize: "3rem", color: "white", mb: 2 }} />
                </motion.div>
                <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                  {messageText}
                </Typography>
              </>
            )}
            {messageType === "error" && (
              <>
                <ErrorOutlineIcon sx={{ fontSize: "3rem", color: "white", mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                  {messageText}
                </Typography>
              </>
            )}
          </RaffleMessage>
        )}
        <Stack
          className="font-sans"
          direction="column"
          sx={{ 
            minHeight: "100vh",
            padding: { xs: "1rem", md: "2rem" },
            maxWidth: "1440px",
            margin: "0 auto",
            width: "100%"
          }}
        >
          <Stack direction="row" justifyContent="center" alignItems="center" sx={{ 
            mb: { xs: 4, md: 8 },
            width: "100%"
          }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Fate & Grow Stake</Typography>
            <Box width={100} />
          </Stack>
          <Grid container spacing={4} sx={{ 
            width: "100%",
            margin: "0 auto"
          }}>
            <Grid item xs={12} md={6}>
              {renderPoolInfoCard()}
            </Grid>
            <Grid item xs={12} md={6}>
              {renderUserStakeCard()}
            </Grid>
          </Grid>
        </Stack></>
      ) : renderMaintenanceMessage()}
      </Container>
    </Layout>
  );
}