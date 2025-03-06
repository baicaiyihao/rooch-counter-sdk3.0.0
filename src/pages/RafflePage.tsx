import { LoadingButton } from "@mui/lab";
import {
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
} from "@mui/material";
import {
  useCurrentAddress,
  SessionKeyGuard,
  useCurrentSession,
} from "@roochnetwork/rooch-sdk-kit";
import { useState, useEffect } from "react";
import { CheckIn } from "../componnents/check_in";
import { Raffle } from "../componnents/raffle";
import { styled } from "@mui/material/styles";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import { Layout } from "../components/shared/layout";

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
  const [checkInRecord, setCheckInRecord] = useState<any>(null);
  const [raffleConfig, setRaffleConfig] = useState<any>(null);
  const [raffleRecord, setRaffleRecord] = useState<any>(null);
  const [justRaffled, setJustRaffled] = useState(false);
  const { width, height } = useWindowSize();

  // Snackbar 状态
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success",
  );

  const { GetWeekRaffle, QueryCheckInRecord } = CheckIn();
  const {
    GetCheckInRaffleByFate,
    ClaimMaxRaffle,
    QueryCheckInRaffle,
    QueryCheckInRaffleRecord,
  } = Raffle();

  useEffect(() => {
      fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const raffleConfigData = await QueryCheckInRaffle();
      setRaffleConfig(raffleConfigData);
      console.log("奖池配置:", raffleConfigData);

    if (currentAddress) {
      const checkInRecordData = await QueryCheckInRecord();
      const raffleRecordData = await QueryCheckInRaffleRecord();
      
      setCheckInRecord(checkInRecordData);
      if (raffleRecordData) {
        setRaffleRecord(raffleRecordData);
        console.log("抽奖记录:", raffleRecordData);
      }
    }
    } catch (error) {
      console.error("获取数据失败:", error);
    }
  };

  const handleWeekRaffle = async () => {
    if (loading) return;

    setLoading(true);
    try {
      await GetWeekRaffle();
      await fetchData();
      setJustRaffled(true);
      setTimeout(() => setJustRaffled(false), 3000); // Reset confetti after 3s
    } catch (error) {
      console.error("每周抽奖失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPrizeLevel = (result: number, config: any) => {
    if (!result || !config) return null;

    const resultNum = Number(result);
    const grandWeight = Number(config.grand_prize_weight);
    const secondWeight = Number(config.second_prize_weight);
    const thirdWeight = Number(config.third_prize_weight);

    // 计算累积权重
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

    setLoading(true);
    try {
      const result = await GetCheckInRaffleByFate();
      console.log("Fate抽奖结果:", result);

      // 添加类型检查
      if (result === undefined) {
        setSnackbarMessage("抽奖结果无效");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }

      // 判断中奖等级
      const prizeLevel = getPrizeLevel(Number(result), raffleConfig);

      if (prizeLevel) {
        setSnackbarMessage(
          `恭喜获得${prizeLevel.name}！获取${prizeLevel.duration}FATE`,
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
      setTimeout(() => setJustRaffled(false), 3000);
    } catch (error) {
      console.error("领取保底失败:", error);
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

                  {checkInRecord && raffleRecord ? (
                    <Stack spacing={2}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography>剩余抽奖次数:</Typography>
                        <Zoom in={true} style={{ transitionDelay: "100ms" }}>
                          <Chip
                            label={checkInRecord?.lottery_count || 0}
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
                        <Typography>已抽取次数:</Typography>
                        <Zoom in={true} style={{ transitionDelay: "200ms" }}>
                          <Chip
                            label={raffleRecord?.raffle_count || 0}
                            color="primary"
                            sx={{ fontWeight: "bold" }}
                          />
                        </Zoom>
                      </Box>
                    </Stack>
                  ) : (
                    <Typography>--</Typography>
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
            className="mt-4 "
            style={{ marginTop: "30px" }}
          >
            {/* <SessionKeyGuard onClick={handleWeekRaffle}>
         <StyledButton
            variant="contained"
            color="primary"
            size="large"
            loading={loading}
            disabled={parseInt(checkInRecord?.lottery_count || '0') === 0}
            startIcon={<span>🎲</span>}
          >
            每周抽奖 ({checkInRecord?.lottery_count || 0})
          </StyledButton>
         </SessionKeyGuard> */}

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
                onClick={handleClaimMaxRaffle}
                disabled={parseInt(raffleRecord?.raffle_count || "0") < 10}
                startIcon={<span>🏅</span>}
              >
                领取保底奖励
              </StyledButton>
            </SessionKeyGuard>
          </Stack>

          {parseInt(raffleRecord?.raffle_count || "0") < 10 && (
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
          )}
        </Stack>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={5000} // 5秒后自动关闭，与原 message.success 的 5 秒一致
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          message={snackbarMessage}
          sx={{
            "& .MuiSnackbarContent-root": {
              backgroundColor:
                snackbarSeverity === "success" ? "#2e7d32" : "#d32f2f", // success: green, error: red
              color: "#fff",
            },
          }}
        />
      </Container>
    </Layout>
  );
}

export default RafflePage;
