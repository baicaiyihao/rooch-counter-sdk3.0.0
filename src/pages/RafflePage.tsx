import { LoadingButton } from "@mui/lab";
import {
  Divider,
  Container,
  Card,
  CardContent,
  Stack,
  Typography,
  Box,
  Chip,
  Grid,
  Fade,
  Zoom,
  Snackbar,
  Tooltip,
  IconButton,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import {
  useCurrentAddress,
  SessionKeyGuard,
  useCurrentSession,
  useRoochClient,
} from "@roochnetwork/rooch-sdk-kit";
import { useState, useEffect } from "react";
import { Raffle } from "../componnents/raffle";
import { styled } from "@mui/material/styles";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import { Layout } from "../components/shared/layout";
import { formatBalance, getCoinDecimals } from "../utils/coinUtils";
import { FATETYPE } from "../config/constants";

// Custom card style
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

// Custom button style
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

function RafflePage() {
  const currentAddress = useCurrentAddress();
  const currentSession = useCurrentSession();
  const [loading, setLoading] = useState(false);
  const [raffleConfig, setRaffleConfig] = useState<any>(null);
  const [raffleRecord, setRaffleRecord] = useState<any>(null);
  const [justRaffled, setJustRaffled] = useState(false);
  const [fateBalance, setFateBalance] = useState<string>("0");
  const { width, height } = useWindowSize();
  const client = useRoochClient();


  // Snackbar 状态
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  const {
    GetCheckInRaffleByFate,
    ClaimMaxRaffle,
    QueryCheckInRaffle,
    QueryCheckInRaffleRecord,
  } = Raffle();

  useEffect(() => {
    if (currentAddress && client) {
      fetchData();
      fetchFateBalance();
    }
  }, [currentAddress]);

  const fetchData = async () => {
    try {
      const raffleConfigData = await QueryCheckInRaffle();
      setRaffleConfig(raffleConfigData);
      console.log("奖池配置:", raffleConfigData);

      const raffleRecordData = await QueryCheckInRaffleRecord();
      console.log("抽奖记录:", raffleRecordData);
      setRaffleRecord(raffleRecordData);
    } catch (error) {
      console.error("获取数据失败:", error);
    }
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

  const getPrizeLevel = (result: number, config: any) => {
    if (!result || !config) return null;

    const resultNum = Number(result);
    const grandWeight = Number(config.grand_prize_weight);
    const secondWeight = Number(config.second_prize_weight);
    const thirdWeight = Number(config.third_prize_weight);

    const totalWeight = grandWeight + secondWeight + thirdWeight;
    const normalizedResult =
      (resultNum / Number(config.max_raffle_count_weight)) * totalWeight;

    if (normalizedResult <= grandWeight) {
      return {
        level: 1,
        name: "特等奖",
        duration: Number(config.grand_prize_duration),
      };
    } else if (normalizedResult <= grandWeight + secondWeight) {
      return {
        level: 2,
        name: "二等奖",
        duration: Number(config.second_prize_duration),
      };
    } else {
      return {
        level: 3,
        name: "三等奖",
        duration: Number(config.third_prize_duration),
      };
    }
  };

  

  const handleFateRaffle = async () => {
    if (loading) return;

    if (parseInt(raffleRecord?.raffle_count || "0") >= 50) {
      setSnackbarMessage("已达到最大抽奖次数限制（50次）");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    setLoading(true);
    try {
      const result = await GetCheckInRaffleByFate();
      console.log("Fate抽奖结果:", result);

      if (result === undefined) {
        setSnackbarMessage("Fate余额不足或已到抽取上限");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }

      const prizeLevel = getPrizeLevel(Number(result), raffleConfig);

      if (prizeLevel) {
        setSnackbarMessage(
          `恭喜获得${prizeLevel.name}！获取${prizeLevel.duration}FATE`
        );
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      }
      await fetchData();
      setJustRaffled(true);
      setTimeout(() => setJustRaffled(false), 3000);
    } catch (error) {
      console.error("Fate抽奖失败:", error);
      setSnackbarMessage("抽奖失败，请重试");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimMaxRaffle = async () => {
    if (loading) return;

    setLoading(true);
    try {
      await ClaimMaxRaffle();
      await fetchData();
      setJustRaffled(true);
      setSnackbarMessage("领取成功");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setTimeout(() => setJustRaffled(false), 3000);
    } catch (error) {
      console.error("领取保底失败:", error);
      setSnackbarMessage("领取保底失败，请重试");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Layout>
      <Container className="app-container">
        {justRaffled && (
          <Confetti
            width={width}
            height={height}
            recycle={false}
            numberOfPieces={500}
            gravity={0.1}
            onConfettiComplete={() => setJustRaffled(false)}
          />
        )}

        <Stack
          className="font-sans min-w-[1024px]"
          direction="column"
          sx={{
            minHeight: "100vh",
            padding: "2rem",
          }}
        >
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            className="mb-8"
          >
            <Typography variant="h4" className="font-bold">
              抽奖活动
            </Typography>
            <Box width={100} />
          </Stack>

          <Grid container spacing={4}>
            {/* Raffle Status Card */}
            <Grid item xs={12} md={6}>
              <StyledCard elevation={3} className="mb-8">
                <CardContent>
                  <Typography
                    variant="h5"
                    className="mb-4 font-bold"
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <Box component="span" sx={{ mr: 1, fontSize: "1.5rem" }}>
                      🎲
                    </Box>
                    抽奖状态
                  </Typography>

                  {raffleRecord ? (
                    <Stack spacing={2}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography>今日抽奖次数:</Typography>
                          <Tooltip
                            title="每日抽奖上限次数为50次, 次日首次抽奖后刷新次数。"
                            arrow
                            placement="top"
                          >
                            <IconButton size="small" sx={{ ml: 1 }}>
                              <HelpOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        <Zoom in={true} style={{ transitionDelay: "100ms" }}>
                          <Chip
                            label={raffleRecord?.daily_raffle_count || 0}
                            color="secondary"
                            sx={{ fontWeight: "bold" }}
                          />
                        </Zoom>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography>累计未领保底次数:</Typography>
                          <Tooltip
                            title="每累计10次抽奖可领取一次保底奖励，领取后此数值会减少10"
                            arrow
                            placement="top"
                          >
                            <IconButton size="small" sx={{ ml: 1 }}>
                              <HelpOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        <Zoom in={true} style={{ transitionDelay: "200ms" }}>
                          <Chip
                            label={raffleRecord?.raffle_count || 0}
                            color="primary"
                            sx={{ fontWeight: "bold" }}
                          />
                        </Zoom>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography>距下次保底还需:</Typography>
                        <Zoom in={true} style={{ transitionDelay: "300ms" }}>
                          <Chip
                            label={
                              (raffleRecord?.raffle_count || 0) % 10 === 0
                                ? 10
                                : 10 - ((raffleRecord?.raffle_count || 0) % 10)
                            }
                            color="warning"
                            sx={{ fontWeight: "bold" }}
                          />
                        </Zoom>
                      </Box>
                    </Stack>
                  ) : (
                    <Typography>未查询到抽奖信息，请先进行抽奖。</Typography>
                  )}
                </CardContent>
              </StyledCard>
            </Grid>

            {/* Raffle Pool Card */}
            <Grid item xs={12} md={6}>
              <StyledCard elevation={3} className="mb-8">
                <CardContent>
                  <Typography
                    variant="h5"
                    className="mb-4 font-bold"
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <Box component="span" sx={{ mr: 1, fontSize: "1.5rem" }}>
                      🏆
                    </Box>
                    奖池信息
                  </Typography>
                  {raffleConfig ? (
                    <Stack spacing={2}>
                      <Typography
                        variant="subtitle1"
                        className="mb-2 font-bold"
                      >
                        奖品设置:
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography>特等奖:</Typography>
                        <Chip
                          label={`${raffleConfig?.grand_prize_duration?.toString() || "0"} FATE`}
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
                        <Typography>二等奖:</Typography>
                        <Chip
                          label={`${raffleConfig?.second_prize_duration?.toString() || "0"} FATE`}
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
                        <Typography>三等奖:</Typography>
                        <Chip
                          label={`${raffleConfig?.third_prize_duration?.toString() || "0"} FATE`}
                          color="secondary"
                          sx={{ fontWeight: "bold" }}
                        />
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Typography
                        variant="subtitle1"
                        className="mb-2 font-bold"
                      >
                        中奖概率:
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography>特等奖概率:</Typography>
                        <Chip
                          label={`${raffleConfig?.grand_prize_weight?.toString() || "0"}%`}
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
                        <Typography>二等奖概率:</Typography>
                        <Chip
                          label={`${raffleConfig?.second_prize_weight?.toString() || "0"}%`}
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
                        <Typography>三等奖概率:</Typography>
                        <Chip
                          label={`${raffleConfig?.third_prize_weight?.toString() || "0"}%`}
                          color="secondary"
                          sx={{ fontWeight: "bold" }}
                        />
                      </Box>
                    </Stack>
                  ) : (
                    <Typography>--</Typography>
                  )}
                </CardContent>
              </StyledCard>
            </Grid>
          </Grid>

          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            className="mt-4"
            style={{ marginTop: "30px" }}
          >
            <SessionKeyGuard onClick={handleFateRaffle}>
              <StyledButton
                variant="contained"
                color="secondary"
                size="large"
                loading={loading}
                startIcon={<span>✨</span>}
              >
                Fate抽奖
              </StyledButton>
            </SessionKeyGuard>

            <SessionKeyGuard onClick={handleClaimMaxRaffle}>
              <StyledButton
                variant="outlined"
                color="success"
                size="large"
                loading={loading}
                disabled={parseInt(raffleRecord?.raffle_count || "0") < 10}
                startIcon={<span>🏅</span>}
              >
                领取保底奖励
              </StyledButton>
            </SessionKeyGuard>
          </Stack>
          {raffleConfig && (
            <Fade in={true}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 2, textAlign: "center" }}
              >
                当前 FATE 余额:{fateBalance}
                <br/>
                抽奖费用:{" "}
                {(
                  (Number(raffleConfig?.grand_prize_duration || 1000) * 5 +
                    Number(raffleConfig?.second_prize_duration || 500) * 25 +
                    Number(raffleConfig?.third_prize_duration || 150) * 70) /
                  100
                ).toFixed(2)}{" "}
                FATE
              </Typography>
            </Fade>
          )}

          {/* {parseInt(raffleRecord?.raffle_count || "0") < 10 && (
            <Fade in={true}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 2, textAlign: "center" }}
              >
                再抽 {10 - parseInt(raffleRecord?.raffle_count || "0")}{" "}
                次即可领取保底奖励！
              </Typography>
            </Fade>
          )} */}
          {/* {raffleRecord && (
            <Fade in={true}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 2, textAlign: "center" }}
              >
                {parseInt(raffleRecord?.raffle_count || "0") >= 50
                  ? "已达到最大抽奖次数（50次）"
                  : `剩余可抽奖次数：${
                      50 - parseInt(raffleRecord?.daily_raffle_count || "0")
                    }次`}
              </Typography>
            </Fade>
          )} */}
        </Stack>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={5000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          message={snackbarMessage}
          sx={{
            "& .MuiSnackbarContent-root": {
              backgroundColor:
                snackbarSeverity === "success" ? "#2e7d32" : "#d32f2f",
              color: "#fff",
            },
          }}
        />
      </Container>
    </Layout>
  );
}

export default RafflePage;