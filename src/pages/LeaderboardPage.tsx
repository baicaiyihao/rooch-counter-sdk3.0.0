import { useEffect, useState } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Chip, 
  Grid, 
  Stack, 
  TextField, 
  Typography, 
  styled, 
} from '@mui/material';
import { Leaderboard } from '../componnents/leaderboard';
import { UserNft } from '../componnents/usernft';
import { useCurrentAddress, useRoochClient } from '@roochnetwork/rooch-sdk-kit';
import { RankTiersTableData } from '../type';
import { getCoinDecimals, formatBalance } from '../utils/coinUtils';
import { FATETYPE } from '../config/constants';
import { motion } from 'framer-motion';
import {AnimatedBackground} from '../components/shared/animation_components'
import { NavBar } from '../components/shared/nav_bar';


// Custom card styling
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

// Custom button styling
const StyledButton = styled(Button)`
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

export default function LeaderboardPage() {
  const [rankings, setRankings] = useState<any[]>([]);
  const [userNftData, setUserNftData] = useState<any>(null);
  const [burnAmount, setBurnAmount] = useState<string>('');
  const currentAddress = useCurrentAddress();
  const [fateBalance, setFateBalance] = useState<string>('0');
  const client = useRoochClient();

  const { 
    QueryLeaderboardRankingsData, 
    QueryLeaderboardRankTiers, 
    Burnfate 
  } = Leaderboard();

  const { QueryUserNft } = UserNft();

  // Fetch leaderboard data
  const fetchRankingsData = async () => {
    try {
      const [rankingsData, rankTiersData] = await Promise.all([
        QueryLeaderboardRankingsData(),
        QueryLeaderboardRankTiers()
      ]);

      const sortedRankings = [...rankingsData].sort((a, b) => {
        const diff = BigInt(b.amount) - BigInt(a.amount);
        return diff > 0n ? 1 : diff < 0n ? -1 : 0;
      });

      const combinedData = sortedRankings.map((item, index) => {
        const rank = index + 1;
        return {
          key: index,
          rank,
          address: item.address,
          burnAmount: item.amount,
          level: getLevelByRank(rank, rankTiersData)
        };
      });

      setRankings(combinedData);
    } catch (error) {
      console.error('Failed to fetch leaderboard data:', error);
    }
  };

  // Fetch user NFT data
  const fetchUserNftData = async () => {
    try {
      const userData = await QueryUserNft();
      setUserNftData(userData);
    } catch (error) {
      console.error('Failed to fetch user NFT data:', error);
      setUserNftData(null);
    }
  };

  // Get level by rank
  const getLevelByRank = (rank: number, tiers: RankTiersTableData[]) => {
    const tierInfo = tiers.find(tier => {
      const minRank = Number(tier.value.min_rank);
      const maxRank = Number(tier.value.max_rank);
      return rank >= minRank && rank <= maxRank;
    });
    return tierInfo ? Number(tierInfo.value.level) : '-';
  };

 

  // Shorten address for display
  const shortenAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  // Get current user's rank
  const getCurrentUserRank = () => {
    const userAddress = currentAddress?.genRoochAddress().toHexAddress();
    const userRanking = rankings.find(item => item.address === userAddress);
    return userRanking?.rank || '-';
  };

  const fetchFateBalance = async () => {
    if (!currentAddress || !client) return;
    
    try {
        const decimals = await getCoinDecimals(client, FATETYPE);
        const balance = await client.getBalance({
            owner: currentAddress?.genRoochAddress().toHexAddress() || "",
            coinType: FATETYPE
        }) as any;
        setFateBalance(formatBalance(balance?.balance, decimals));
    } catch (error) {
        console.error('获取 FATE 余额失败:', error);
        setFateBalance('0');
    }
};

  // Fetch data on component mount
  useEffect(() => {
    fetchRankingsData();
    fetchUserNftData();
    fetchFateBalance();
  }, []);

  // Handle burn action
  const handleBurn = async () => {
    if (!burnAmount || isNaN(Number(burnAmount))) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      await Burnfate(Number(burnAmount));
      alert('Burn successful');
      await Promise.all([
        fetchRankingsData(),
        fetchUserNftData(),
        fetchFateBalance()
    ]);
    setBurnAmount('');
    } catch (error) {
      console.error('Burn failed:', error);
      alert('Burn failed');
    }
  };

  return (
    <>
      <AnimatedBackground />
      <NavBar />
      <Stack
        className="font-sans"
        direction="column"
        sx={{ 
            minHeight: "100vh",
            padding: { xs: "1rem", md: "2rem" },
            maxWidth: "1440px",  // 添加最大宽度
            margin: "0 auto",    // 居中显示
            width: "100%"        // 确保占满可用空间
          }}      >
 <Stack direction="row" justifyContent="space-between" alignItems="center"  sx={{ 
          mb: { xs: 4, md: 8 },
          width: "100%"
        }}>
      <Button variant="outlined" onClick={() => window.history.back()} startIcon={<span>←</span>}>
            返回首页
          </Button>

        <Typography variant="h4" sx={{ fontWeight: 'bold', }}>
          排行榜
        </Typography>
        <Box width={100} />
        </Stack>
        <Grid container spacing={4}>
          {/* User Info Card */}
          <Grid item xs={12}>
            <StyledCard elevation={3}>
              <CardContent>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                  我的信息
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography>当前排名:</Typography>
                    <Chip label={getCurrentUserRank()} color="primary" sx={{ fontWeight: 'bold' }} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography>当前NFT等级:</Typography>
                    <Chip label={userNftData?.level || '-'} color="success" sx={{ fontWeight: 'bold' }} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography>已燃烧数量:</Typography>
                    <Chip label={userNftData?.burn_amount || '-'} color="secondary" sx={{ fontWeight: 'bold' }} />
                  </Box>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <TextField
                      placeholder="输入要燃烧的FATE数量"
                      value={burnAmount}
                      onChange={(e) => setBurnAmount(e.target.value)}
                      size="small"
                      sx={{ width: 200 }}
                    />
                    <Typography color="text.secondary">当前 FATE 余额: {fateBalance}</Typography>
                    <StyledButton variant="contained" color="primary" onClick={handleBurn}  disabled={!burnAmount || 
                                    Number(burnAmount) <= 0 || 
                                    Number(burnAmount) > Number(fateBalance)}>
                      燃烧
                    </StyledButton>
                  </Stack>
                </Stack>
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Leaderboard Table */}
          <Grid item xs={12}>
            <StyledCard elevation={3}>
              <CardContent>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                  排行榜
                </Typography>
                <Stack spacing={2}>
                  {rankings.map((item, index) => (
                    <motion.div
                      key={item.key}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          py: 1,
                          borderBottom: index < rankings.length - 1 ? '1px solid rgba(0, 0, 0, 0.12)' : 'none',
                        }}
                      >
                        <Typography sx={{ width: '10%' }}>{item.rank}</Typography>
                        <Typography sx={{ width: '40%' }}>{shortenAddress(item.address)}</Typography>
                        <Typography sx={{ width: '20%' }}>{item.level}</Typography>
                        <Typography sx={{ width: '30%' }}>{item.burnAmount}</Typography>
                      </Box>
                    </motion.div>
                  ))}
                </Stack>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>
      </Stack>
    </>
  );
};