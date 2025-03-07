import { useEffect, useState } from "react";
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
  Container,
  Tooltip,
  IconButton,
} from "@mui/material";
import { Leaderboard } from "../components/leaderboard";
import { UserNft } from "../components/usernft";
import {
  useCurrentAddress,
  useRoochClient,
  SessionKeyGuard,
} from "@roochnetwork/rooch-sdk-kit";
import { RankTiersTableData } from "../type";
import { getCoinDecimals, formatBalance } from "../utils/coinUtils";
import { FATETYPE } from "../config/constants";
import { motion } from "framer-motion";
import { Layout } from "../uicomponents/shared/layout";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";


// Custom card styling
const StyledCard = styled(Card)`
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
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
  const [burnAmount, setBurnAmount] = useState<string>("");
  const currentAddress = useCurrentAddress();
  const [fateBalance, setFateBalance] = useState<string>("0");
  const client = useRoochClient();
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  const { QueryLeaderboardRankingsData, QueryLeaderboardRankTiers, QueryLeaderboardEndTimeAndTotalBurned, Burnfate } =
    Leaderboard();

  const { QueryUserNft } = UserNft();

  // Fetch leaderboard data
  const fetchRankingsData = async () => {
    try {
      const [rankingsData, rankTiersData] = await Promise.all([
        QueryLeaderboardRankingsData(),
        QueryLeaderboardRankTiers(),
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
          level: getLevelByRank(rank, rankTiersData),
        };
      });

      setRankings(combinedData);
    } catch (error) {
      console.error("Failed to fetch leaderboard data:", error);
    }
  };

  // Fetch user NFT data
  const fetchUserNftData = async () => {
    try {
      const userData = await QueryUserNft();
      setUserNftData(userData);
    } catch (error) {
      console.error("Failed to fetch user NFT data:", error);
      setUserNftData(null);
    }
  };

  // Get level by rank
  const getLevelByRank = (rank: number, tiers: RankTiersTableData[]) => {
    const tierInfo = tiers.find((tier) => {
      const minRank = Number(tier.value.min_rank);
      const maxRank = Number(tier.value.max_rank);
      return rank >= minRank && rank <= maxRank;
    });
    return tierInfo ? Number(tierInfo.value.level) : "-";
  };

  // Shorten address for display
  const shortenAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  // Get current user's rank
  const getCurrentUserRank = () => {
    const userAddress = currentAddress?.genRoochAddress().toHexAddress();
    const userRanking = rankings.find((item) => item.address === userAddress);
    return userRanking?.rank || "-";
  };

  const fetchFateBalance = async () => {
    if (!currentAddress || !client) return;

    try {
      console.log("开始获取余额...");
      const decimals = await getCoinDecimals(client, FATETYPE);
      console.log("获取到 decimals:", decimals);

      const balance = (await client.getBalance({
        owner: currentAddress?.genRoochAddress().toHexAddress() || "",
        coinType: FATETYPE,
      })) as any;
      console.log("原始余额数据:", balance);

      if (!balance?.balance) {
        console.warn("余额返回值异常:", balance);
        setFateBalance("0");
        return;
      }
      const formattedBalance = formatBalance(balance.balance, decimals);
      console.log("格式化后的余额:", formattedBalance);
      setFateBalance(formatBalance(balance?.balance, decimals));
    } catch (error) {
      console.error("获取 FATE 余额失败:", error);
      setFateBalance("0");
    }
  };

  const updateCountdown = (endTime: string) => {
    const now = Math.floor(Date.now() / 1000);
    const end = parseInt(endTime);
    console.log("end",endTime);
    const diff = end - now;
    
    if (diff <= 0) {
      setTimeRemaining('The event is over');
      return;
    }
    
    const days = Math.floor(diff / (24 * 60 * 60));
    const hours = Math.floor((diff % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((diff % (60 * 60)) / 60);
    setTimeRemaining(`${days}天 ${hours}时 ${minutes}分`);
  };


  const fetchEndTime = async () => {
    try {
      const endTime = (await QueryLeaderboardEndTimeAndTotalBurned()).endTime;
      updateCountdown(endTime);
      
      // 设置定时器每分钟更新倒计时
      const timer = setInterval(() => updateCountdown(endTime), 60000);
      return () => clearInterval(timer);
    } catch (error) {
      console.error("获取结束时间失败:", error);
    }
  };
  // Fetch data on component mount
  useEffect(() => {
    if (currentAddress && client) {
      fetchRankingsData();
      fetchUserNftData();
      fetchFateBalance();
      fetchEndTime();
    }
  }, [currentAddress, client]);

  // Handle burn action
  const handleBurn = async () => {
    if (!burnAmount || isNaN(Number(burnAmount))) {
      alert("请输入有效数量");
      return;
    }

    try {
      // 保存当前燃烧数量用于显示
      const amountToBurn = Number(burnAmount);

      // 清空输入框，防止重复提交
      setBurnAmount("");

      // 执行燃烧操作
      await Burnfate(amountToBurn);

      // 等待交易确认后再刷新数据
      setTimeout(async () => {
        try {
          // 并行请求更新数据
          await Promise.all([
            fetchFateBalance(),
            fetchRankingsData(),
            fetchUserNftData(),
          ]);

          // 成功提示
          alert(`成功燃烧 ${amountToBurn} FATE`);
        } catch (error) {
          console.error("数据刷新失败:", error);
        }
      }, 1000);
    } catch (error) {
      console.error("燃烧失败:", error);
      setBurnAmount(burnAmount);
    }
  };

  return (
    <Layout>
      <Container className="app-container">
        <Stack
          className="font-sans"
          direction="column"
          sx={{
            minHeight: "100vh",
            padding: { xs: "1rem", md: "2rem" },
            maxWidth: "1440px", // 添加最大宽度
            margin: "0 auto", // 居中显示
            width: "100%", // 确保占满可用空间
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              mb: { xs: 4, md: 8 },
              width: "100%",
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              排行榜
            </Typography>
            {timeRemaining && (
        <Chip
          label={`剩余时间: ${timeRemaining}`}
          color="primary"
          sx={{ fontWeight: "bold" }}
        />
      )}
            {/* <Box width={100} /> */}
          </Stack>
          <Grid container spacing={4}>
            {/* User Info Card */}
            <Grid item xs={12}>
              <StyledCard elevation={3}>
                <CardContent>
                  <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
                    我的信息
                  </Typography>
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography>当前排名:</Typography>
                      <Chip
                        label={getCurrentUserRank()}
                        color="primary"
                        sx={{ fontWeight: "bold" }}
                      />
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography>当前NFT等级:</Typography>
                      <Chip
                        label={userNftData?.level || "-"}
                        color="success"
                        sx={{ fontWeight: "bold" }}
                      />
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography>已燃烧数量:</Typography>
                      <Chip
                        label={userNftData?.burn_amount || "-"}
                        color="secondary"
                        sx={{ fontWeight: "bold" }}
                      />
                    </Box>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <TextField
                        placeholder="输入要燃烧的FATE数量"
                        value={burnAmount}
                        onChange={(e) => setBurnAmount(e.target.value)}
                        size="small"
                        sx={{ width: 200 }}
                      />
                      <Typography color="text.secondary">
                        当前 FATE 余额: {fateBalance}
                      </Typography>
                      <SessionKeyGuard onClick={handleBurn}>
                        <StyledButton
                          variant="contained"
                          color="primary"
                          disabled={
                            !burnAmount ||
                            Number(burnAmount) <= 0 ||
                            Number(burnAmount) > Number(fateBalance)
                          }
                        >
                          燃烧
                        </StyledButton>
                      </SessionKeyGuard>
                    </Stack>
                  </Stack>
                </CardContent>
              </StyledCard>
            </Grid>

            {/* Leaderboard Table */}
            <Grid item xs={12}>
              <StyledCard elevation={3}>
                <CardContent>
                  <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
                    Ranking list
                  </Typography>
                  <Stack spacing={2}>
                    {/* 表头 */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        py: 1,
                        borderBottom: "2px solid rgba(0, 0, 0, 0.12)",
                        fontWeight: "bold",
                        color: "text.secondary",
                      }}
                    >
                      <Typography sx={{ width: "10%", textAlign: "center" }}>
                        Rank
                      </Typography>
                      <Typography sx={{ width: "40%", textAlign: "center" }}>
                        Address
                      </Typography>
                      <Box
                        sx={{
                          width: "20%",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Typography>Level</Typography>
                        <Tooltip
                          title="Level为预览, 每周一 20:00 （UTC+8）进行快照同步至NFT"
                          arrow
                          placement="top"
                        >
                          <IconButton size="small" sx={{ ml: 0.5 }}>
                            <HelpOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Typography sx={{ width: "30%", textAlign: "center" }}>
                        Burn Amount
                      </Typography>
                    </Box>
                    {/* 表格内容 */}
                    {rankings.map((item, index) => (
                      <motion.div
                        key={item.key}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            py: 1,
                            borderBottom:
                              index < rankings.length - 1
                                ? "1px solid rgba(0, 0, 0, 0.12)"
                                : "none",
                          }}
                        >
                          <Typography sx={{ width: "10%", textAlign: "center" }}>
                            {item.rank}
                          </Typography>
                          <Typography sx={{ width: "40%", textAlign: "center" }}>
                            {shortenAddress(item.address)}
                          </Typography>
                          <Typography sx={{ width: "20%", textAlign: "center" }}>
                            {item.level}
                          </Typography>
                          <Typography sx={{ width: "30%", textAlign: "center" }}>
                            {item.burnAmount}
                          </Typography>
                        </Box>
                      </motion.div>
                    ))}
                  </Stack>
                </CardContent>
              </StyledCard>
            </Grid>
          </Grid>
        </Stack>
      </Container>
    </Layout>
  );
}
