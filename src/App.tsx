import { Container } from "@radix-ui/themes";
import "./styles.css"; 
import {  Stack } from "@mui/material"; 
import { AnimatedBackground} from "./components/shared/animation_components"
import { NavBar } from './components/shared/nav_bar';
import { StakeByGrowVotes } from './componnents/stake_by_grow_votes';
import {
  useCurrentSession,
  useRoochClientQuery,
  useRoochClient,
  useCurrentAddress,
} from "@roochnetwork/rooch-sdk-kit";

import { useEffect, useState } from "react";
import { GridNavigation, NavigationCard } from './componnents/grid_navigation'; 
import { CheckIn } from './componnents/check_in';
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


  const [poolInfo, setPoolInfo] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  const {
    QueryStakePoolInfo,
  } = StakeByGrowVotes();

  useEffect(() => {
    const fetchPoolInfo = async () => {
        try {
          const info = await QueryStakePoolInfo();
          console.log('质押池信息:', info); // 添加日志查看数据
          setPoolInfo(info);
        } catch (error) {
          console.error("获取质押池信息失败:", error);
        }
   
    };
    
    fetchPoolInfo();
  }, [currentAddress]);

  useEffect(() => {
    if (!poolInfo?.end_time) return;
    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000);
      const endTime = parseInt(poolInfo.end_time);
      const diff = endTime - now;
      if (diff <= 0) {
        setTimeRemaining('活动已结束');
        return;
      }
      const days = Math.floor(diff / (24 * 60 * 60));
      const hours = Math.floor((diff % (24 * 60 * 60)) / (60 * 60));
      const minutes = Math.floor((diff % (60 * 60)) / 60);
      setTimeRemaining(`${days}天 ${hours}时 ${minutes}分`);
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 60000); // 每分钟更新
    return () => clearInterval(timer);
  }, [poolInfo]);

    // 添加导航卡片数据
    const navigationCards: NavigationCard[] = [
      {
        title: "质押操作",
        description: poolInfo ? 
        `管理您的质押、解除质押和领取奖励等操作\n 总可挖取: ${poolInfo.total_fate_supply || 0} FATE\n剩余时间: ${timeRemaining}` : "管理您的质押、解除质押和领取奖励等操作。",
        icon: "💰",
        onClick: () => window.location.href = '/stake',
        width:{lg:8},extraContent: poolInfo ? {
          stats: [
            {
              label: "总质押数量",
              value: `${poolInfo.total_staked_votes || 0} 票`,
              icon: "📊"
            },
            {
              label: "每日产出",
              value: `${poolInfo.fate_per_day || 0} FATE`,
              icon: "📈"
            }
          ],
          countdown: timeRemaining
        } : undefined
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
      <NavBar />
      <Container
       className="app-container"  style={{ maxWidth: '100%', padding: '0 24px',position:'relative',zIndex: 1,
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(255, 255, 255, 0.3)', transition: 'backdrop-filter 0.3s ease'}}>
        <Stack 
     direction="column-reverse"
     spacing={2}
     sx={{
       justifyContent: "normal",
       alignItems: "stretch",
       width: '100%',
       position: 'relative',
       overflow: 'visible',
       padding: '0 16px',
     }}
    >
      <div className="navigation-wrapper" style={{ width: '100%' }}>
        <GridNavigation cards={navigationCards} defaultHeight="550px" fullWidth={false} />
      </div>
    </Stack>
      </Container>
    </>
  );
}

export default App;
