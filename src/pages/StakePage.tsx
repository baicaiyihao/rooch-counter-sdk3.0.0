import { useEffect, useState } from 'react';
import { LoadingButton } from "@mui/lab";
import { Container, Card, CardContent, Typography, Box, Chip, Grid, Zoom, Alert, Stack } from "@mui/material";
import { StakeByGrowVotes } from '../componnents/stake_by_grow_votes';
import { styled } from "@mui/material/styles";
import { keyframes } from "@emotion/react";
import { motion } from "framer-motion";
import Confetti from 'react-confetti';
import useWindowSize from 'react-use/lib/useWindowSize';
import { useCurrentAddress, useCurrentWallet, useRoochClient, useCurrentSession, SessionKeyGuard} from '@roochnetwork/rooch-sdk-kit';
import { getCoinDecimals, formatBalance } from '../utils/coinUtils';
import { FATETYPE } from '../config/constants';
import { Layout } from '../components/shared/layout';
import { CircularProgress } from '@mui/material'; 

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

export default function StakePage() {
  const [poolInfo, setPoolInfo] = useState<any>(null);
  const [stakeInfo, setStakeInfo] = useState<any>(null);
  const [hasVotes, setHasVotes] = useState(true);
  const [projectName, setProjectName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [justStaked, setJustStaked] = useState(false);
  const currentAddress = useCurrentAddress();
  const connectionStatus = useCurrentWallet();
  const { width, height } = useWindowSize();
  const [fateBalance, setFateBalance] = useState<string>('0');
  const client = useRoochClient();
  const sessionKey = useCurrentSession();


  // let { data, error, isPending, refetch } = useRoochClientQuery(
    //   "executeViewFunction",
    //   {
    //     target: `${devCounterModule}::value`,
    //   },
    // );

  const { 
    QueryStakePoolInfo, 
    GetStakeInfo, 
    UpdateGrowVotes,
    Stake, 
    UnStake, 
    ClaimRewords,
    QueryProjectName 
  } = StakeByGrowVotes();

  const fetchPoolInfo = async () => {
    try {
      const [poolData, projectNameData] = await Promise.all([
        QueryStakePoolInfo(),
        QueryProjectName()
      ]);
      setPoolInfo(poolData);
      setProjectName(projectNameData as string);
    } catch (error) {
      console.error('获取质押池信息失败:', error);
    }
  };

  const fetchUserInfo = async () => {
    console.log("staake currentAddress",currentAddress);
    if (!currentAddress) return;
    try {
      await UpdateGrowVotes();
      const stakeData = await GetStakeInfo();
      console.log("stakeData",stakeData);
      setStakeInfo(stakeData);
      setHasVotes(true);
    } catch (error) {
      console.error('获取用户质押信息失败:', error);
      setHasVotes(false);
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
        console.error('获取 FATE 余额失败:', error);
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
    }
  }, [currentAddress]);

  const formatDate = (timestamp: string) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleString();
  };

  const handleStake = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await Stake();
      await Promise.all([fetchUserInfo(), fetchPoolInfo()]);
      setShowSuccess(true);
      setJustStaked(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('质押失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnstake = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await UnStake();
      await Promise.all([fetchUserInfo(), fetchPoolInfo()]);
        } catch (error) {
      console.error('解除质押失败:', error);
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

      // 先显示成功消息，再刷新数据
      setShowSuccess(true);
      setStakeInfo((prev: any) => ({
        ...prev,
        accumulated_fate: rewardAmount // 临时保存已领取的数额，用于显示
      }));
      setJustStaked(true);

      setTimeout(() => {
        Promise.all([fetchUserInfo(), fetchFateBalance()]);
        setShowSuccess(false);
      }, 3000);

    } catch (error) {
      console.error('领取奖励失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderSuccessMessage = () => (
  <Box
    sx={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderRadius: 2,
      p: 4,
      boxShadow: 3,
      zIndex: 1000,
      textAlign: 'center',
      animation: `${keyframes`0% {transform: scale(0.5); opacity: 0;} 50% {transform: scale(1.2);} 100% {transform: scale(1); opacity: 1;}`} 0.5s ease forwards`,
    }}
  >
    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
      <Typography variant="h1" sx={{ fontSize: '4rem', color: '#4CAF50' }}>✓</Typography>
    </motion.div>
    <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>操作成功!</Typography>
    <Typography variant="body1" color="text.secondary">
      {stakeInfo?.accumulated_fate ? `已领取 ${stakeInfo.accumulated_fate} FATE` : '质押完成'}
    </Typography>
  </Box>
);

  const renderPoolInfoCard = () => (
    <StyledCard elevation={3}>
      <CardContent>
        <Typography variant="h5" sx={{ mb: 4, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <Box component="span" sx={{ mr: 1, fontSize: '1.5rem' }}>🏦</Box>
          质押池信息
        </Typography>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography>总质押数量:</Typography>
            <Zoom in={true} style={{ transitionDelay: '100ms' }}>
              <ShiningChip label={`${poolInfo?.total_staked_votes || 0} 票`} color="primary" sx={{ fontWeight: 'bold' }} />
            </Zoom>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography>每日产出:</Typography>
            <Zoom in={true} style={{ transitionDelay: '200ms' }}>
              <ShiningChip label={`${poolInfo?.fate_per_day || 0} FATE`} color="success" sx={{ fontWeight: 'bold' }} />
            </Zoom>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography>总可挖取:</Typography>
            <Zoom in={true} style={{ transitionDelay: '300ms' }}>
              <ShiningChip label={`${poolInfo?.total_fate_supply || 0} FATE`} color="secondary" sx={{ fontWeight: 'bold' }} />
            </Zoom>
          </Box>
          <Box>
            <Typography>开始时间: {poolInfo ? formatDate(poolInfo.start_time) : '-'}</Typography>
          </Box>
          <Box>
            <Typography>结束时间: {poolInfo ? formatDate(poolInfo.end_time) : '-'}</Typography>
          </Box>
        </Stack>
      </CardContent>
    </StyledCard>
  );

  // const renderUserStakeCard = () => {
  //   if (!currentAddress || connectionStatus.isDisconnected) {
  //     return (
  //       <StyledCard elevation={3}>
  //         <CardContent>
  //           <Typography variant="h5" sx={{ mb: 4, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
  //             <Box component="span" sx={{ mr: 1, fontSize: '1.5rem' }}>👤</Box>
  //             我的质押
  //           </Typography>
  //           <Alert severity="info" sx={{ borderRadius: 2 }}>请先连接钱包</Alert>
  //         </CardContent>
  //       </StyledCard>
  //     );
  //   }

  //   if (!hasVotes) {
  //     return (
  //       <StyledCard elevation={3}>
  //         <CardContent>
  //           <Typography variant="h5" sx={{ mb: 4, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
  //             <Box component="span" sx={{ mr: 1, fontSize: '1.5rem' }}>👤</Box>
  //             我的质押
  //           </Typography>
  //           <Alert severity="warning" sx={{ borderRadius: 2 }}>
  //             <Typography sx={{ mb: 1 }}>您还没有投票</Typography>
  //             <Typography variant="body2">
  //             请前往 <Typography component="a" href={`http://localhost:3000/`} target="_blank" sx={{ fontWeight: 'bold', textDecoration: 'underline' }}>Grow</Typography> 为项目投票以获取质押票数

  //               {/* 请前往 <Typography component="a" href={`https://grow.rooch.network/project/${projectName}`} target="_blank" sx={{ fontWeight: 'bold', textDecoration: 'underline' }}>Grow</Typography> 为项目投票以获取质押票数 */}
  //             </Typography>
  //           </Alert>
  //         </CardContent>
  //       </StyledCard>
  //     );
  //   }

  //   return (
  //     <StyledCard elevation={3}>
  //       <CardContent>
  //         <Typography variant="h5" sx={{ mb: 4, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
  //           <Box component="span" sx={{ mr: 1, fontSize: '1.5rem' }}>👤</Box>
  //           我的质押
  //         </Typography>
  //         <Stack spacing={4}>
  //         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  //             <Typography>FATE 余额:</Typography>
  //             <Zoom in={true} style={{ transitionDelay: '200ms' }}>
  //               <Chip label={`${fateBalance}`} color="primary" sx={{ fontWeight: 'bold' }} />
  //             </Zoom>
  //           </Box>
  //           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  //             <Typography>已质押数量:</Typography>
  //             <Zoom in={true} style={{ transitionDelay: '100ms' }}>
  //               <ShiningChip label={`${stakeInfo?.stake_grow_votes || 0} 票`} color="success" sx={{ fontWeight: 'bold' }} />
  //             </Zoom>
  //           </Box>
  //           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  //             <Typography>待质押数量:</Typography>
  //             <Zoom in={true} style={{ transitionDelay: '200ms' }}>
  //               <Chip label={`${stakeInfo?.fate_grow_votes || 0} 票`} color="primary" sx={{ fontWeight: 'bold' }} />
  //             </Zoom>
  //           </Box>
  //           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  //             <Typography>待领取奖励:</Typography>
  //             <Zoom in={true} style={{ transitionDelay: '300ms' }}>
  //               <ShiningChip label={`${stakeInfo?.accumulated_fate || 0} FATE`} color="secondary" sx={{ fontWeight: 'bold' }} />
  //             </Zoom>
  //           </Box>
  //           <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
  //           <SessionKeyGuard onClick={handleStake}>
  //           <StyledButton 
  //               variant="contained" 
  //               color="primary" 
  //               onClick={handleStake}
  //               disabled={!stakeInfo?.fate_grow_votes}
  //               loading={loading}
  //               startIcon={<span>📥</span>}
  //             >
  //               质押
  //             </StyledButton>
  //             </SessionKeyGuard>

  //             <SessionKeyGuard onClick={handleUnstake}>
  //             <StyledButton 
  //               variant="outlined"
  //               color="warning"
  //               disabled={!stakeInfo?.stake_grow_votes}
  //               loading={loading}
  //               startIcon={<span>📤</span>}
  //             >
  //               解除质押
  //             </StyledButton>
  //             </SessionKeyGuard>

  //             <SessionKeyGuard onClick={handleClaim}>
  //             <StyledButton 
  //               variant="contained" 
  //               color="success" 
  //               disabled={!stakeInfo?.accumulated_fate}
  //               loading={loading}
  //               startIcon={<span>🎁</span>}>
  //               领取奖励
  //             </StyledButton>
  //             </SessionKeyGuard>
  //           </Stack>
  //         </Stack>
  //       </CardContent>
  //     </StyledCard>
  //   );
  // };

  const renderUserStakeCard = () => (
    <StyledCard elevation={3}>
      <CardContent>
        <Typography variant="h5" sx={{ mb: 4, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <Box component="span" sx={{ mr: 1, fontSize: '1.5rem' }}>👤</Box>
          我的质押
        </Typography>
        {!currentAddress || connectionStatus.isDisconnected ? (
          <Alert severity="info" sx={{ borderRadius: 2 }}>请先连接钱包</Alert>
        ) : !stakeInfo ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : !hasVotes ? (
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            <Typography sx={{ mb: 1 }}>您还没有投票</Typography>
            <Typography variant="body2">
              请前往 <Typography component="a" href={`http://localhost:3000/`} target="_blank" sx={{ fontWeight: 'bold', textDecoration: 'underline' }}>Grow</Typography> 为项目投票以获取质押票数
            </Typography>
          </Alert>
        ) : (
          <Stack spacing={4}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography>FATE 余额:</Typography>
              <Zoom in={true} style={{ transitionDelay: '200ms' }}>
                <Chip label={`${fateBalance}`} color="primary" sx={{ fontWeight: 'bold' }} />
              </Zoom>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography>已质押数量:</Typography>
              <Zoom in={true} style={{ transitionDelay: '100ms' }}>
                <ShiningChip label={`${stakeInfo?.stake_grow_votes || 0} 票`} color="success" sx={{ fontWeight: 'bold' }} />
              </Zoom>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography>待质押数量:</Typography>
              <Zoom in={true} style={{ transitionDelay: '200ms' }}>
                <Chip label={`${stakeInfo?.fate_grow_votes || 0} 票`} color="primary" sx={{ fontWeight: 'bold' }} />
              </Zoom>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography>待领取奖励:</Typography>
              <Zoom in={true} style={{ transitionDelay: '300ms' }}>
                <ShiningChip label={`${stakeInfo?.accumulated_fate || 0} FATE`} color="secondary" sx={{ fontWeight: 'bold' }} />
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
                质押
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
                解除质押
              </StyledButton>
              </SessionKeyGuard>

              <SessionKeyGuard onClick={handleClaim}>
              <StyledButton 
                variant="contained" 
                color="success" 
                disabled={!stakeInfo?.accumulated_fate}
                loading={loading}
                startIcon={<span>🎁</span>}>
                领取奖励
              </StyledButton>
              </SessionKeyGuard>
            </Stack>
          </Stack>
        )}
      </CardContent>
    </StyledCard>
  );
  return (

    <Layout>
      <Container className="app-container">
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
      {showSuccess && renderSuccessMessage()}
      <Stack
        className="font-sans"
        direction="column"
        sx={{ 
            minHeight: "100vh",
            padding: { xs: "1rem", md: "2rem" },
            maxWidth: "1440px",  
            margin: "0 auto",    
            width: "100%"      
          }}      >
        <Stack direction="row" justifyContent="center " alignItems="center"  sx={{ 
          mb: { xs: 4, md: 8 },
          width: "100%"
        }}>
          
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>质押页面</Typography>
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
      </Stack>
    </Container>
    </Layout>
  );
}