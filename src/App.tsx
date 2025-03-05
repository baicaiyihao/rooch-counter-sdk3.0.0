import { Container, Flex, Heading, Text } from "@radix-ui/themes";
import { LoadingButton } from "@mui/lab";  
import "./styles.css"; 
import { Button, Chip, Divider, Stack, Typography,Box } from "@mui/material"; 
import { AnimatedBackground} from "./components/shared/animation_components"

import {
  useCurrentSession,
  useRoochClientQuery,
  useRoochClient,
  ConnectButton,
  useCurrentAddress,
  SessionKeyGuard,
} from "@roochnetwork/rooch-sdk-kit";

import { useEffect, useState } from "react";
import { useNetworkVariable } from "./networks.ts";
import { GridNavigation, NavigationCard } from './componnents/grid_navigation'; 
import { CheckIn } from './componnents/check_in';
import { MODULE_ADDRESS,FATETYPE } from './config/constants.ts'

function App() {
  const sessionKey = useCurrentSession();
  const client = useRoochClient();
  const currentAddress = useCurrentAddress();

  // const [loading, setLoading] = useState(false);
  // const devCounterAddress = useNetworkVariable("testnet");
  // const devCounterModule = `${devCounterAddress}::`;
  // let { data, error, isPending, refetch } = useRoochClientQuery(
  //   "executeViewFunction",
  //   {
  //     target: `${devCounterModule}::value`,
  //   },
  // );

  const {
    QueryDailyCheckInConfig,
    QueryCheckInRecord,
  } = CheckIn();

  const [checkInData, setCheckInData] = useState<any>(null);
  const [checkInConfig, setCheckInConfig] = useState<any>(null);


   // 获取签到数据
   useEffect(() => {
    const fetchCheckInData = async () => {
      if (currentAddress) {
        try {
          const record = await QueryCheckInRecord();
          setCheckInData(record);
          
          const config = await QueryDailyCheckInConfig();
          setCheckInConfig(config);
        } catch (error) {
          console.error("获取签到数据失败:", error);
        }
      }
    };
    
    fetchCheckInData();
  }, [currentAddress]);

    // 添加导航卡片数据
    const navigationCards: NavigationCard[] = [
      {
        title: "质押操作",
        description: "管理您的质押、解除质押和领取奖励等操作。",
        icon: "💰",
        onClick: () => window.location.href = '/stake',
        width:{lg:8}
      },
      {
        title: "每日签到",
        description: checkInData 
          ? `已连续签到 ${checkInData.continue_days} 天，总计 ${checkInData.total_sign_in_days} 天` 
          : "进行每日签到并查看签到记录和配置。",
        icon: "📅",
        onClick: () => window.location.href = '/check-in',
        width: { lg: 4 },
        extraContent: checkInData && checkInConfig ? {
          continueDays: checkInData.continue_days,
          totalDays: checkInData.total_sign_in_days,
          nextReward: checkInConfig.daily_rewards[Math.min(checkInData.continue_days, checkInConfig.daily_rewards.length - 1)],
          isCheckedInToday: new Date(Number(checkInData.last_sign_in_timestamp) * 1000).toDateString() === new Date().toDateString()
        } : undefined
        ,
      },
      {
        title: "抽奖系统",
        description: "参与抽奖活动并领取奖励。",
        icon: "🎲",
        onClick: () => window.location.href = '/raffle',
        width: { lg: 4} 
      },
      {
        title: "市场交易",
        description: "进行支付和查询价格记录。",
        icon: "🛒",
        onClick: () => window.location.href = '/leaderboard',
        width: { lg: 8 } 
      }
    ];

  return (
    <>
      <AnimatedBackground />
       <header className="app-header">
        <Box>
          <Heading>Fate X</Heading>
        </Box>
        <ConnectButton />
      </header>

      <Container
       className="app-container"  style={{ maxWidth: '100%', padding: '0 16px' }}>
        <Stack 
     direction="column-reverse"
     spacing={2}
     sx={{
       justifyContent: "normal",
       alignItems: "stretch",
       width: '100%',
       position: 'relative',
       overflow: 'visible'
     }}
    >
      <div className="navigation-wrapper" style={{ width: '100%' }}>
        <GridNavigation cards={navigationCards} defaultHeight="550px" fullWidth={false} />
      </div>
    </Stack>
        {/* <Flex
          style={{ flexDirection: "column", alignItems: "center", gap: 10 }}
        >
          <Text style={{ fontSize: 100 }}>
            {data?.return_values
              ? (data.return_values[0].decoded_value as string)
              : 0}
          </Text>
          <SessionKeyGuard onClick={handlerIncrease}>
            <Button disabled={loading || isPending}>Increment</Button>
          </SessionKeyGuard>
          {error && (
            <>
              <Text>
                Please refer to the contract published by readme before trying
                again.
              </Text>
              <Text>
                If you have published a contract, enter the contract address
                correctly into devCounterAddress.
              </Text>
            </>
          )}
        </Flex> */}
      </Container>
    </>
  );
}

export default App;
