import { useRoochClient, useSignAndExecuteTransaction } from "@roochnetwork/rooch-sdk-kit";
import { Args, Transaction } from "@roochnetwork/rooch-sdk";
import { MODULE_ADDRESS } from "../config/constants";
import { fetchLevelConfigsTableData, fetchRankingsTableData, fetchRankTiersTableData, fetchUserRewardsTableData } from "../utils/tableData";
import { LevelConfigsTableData , RankingsTableData, RankTiersTableData, UserRewardsTableData } from "../type";
import { formatBalance, getCoinDecimals } from "../utils/coinUtils";


export function Leaderboard(){
    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    const client = useRoochClient();

    const Burnfate = async (amount: number | bigint): Promise<any> => {
        const txn = new Transaction();
        const fateamount = BigInt(amount);
        txn.callFunction({
            address: MODULE_ADDRESS,
            module: "leaderboard",
            function: "burn_fate",
            args: [
                Args.u256(fateamount),
            ],
        });
        return await signAndExecuteTransaction({ transaction: txn });
    }

    const QueryLeaderboardUserRewards = async (): Promise<UserRewardsTableData[]> => {
        const result = await client.executeViewFunction({
            address: MODULE_ADDRESS,
            module: "leaderboard",
            function: "query_leaderboard",
            args: [],
        }) as any;

        const user_rewardstableId = result?.return_values[0]?.decoded_value?.value?.user_rewards?.value?.handle?.value?.id;
        const formattedData = await fetchUserRewardsTableData(client,user_rewardstableId);
        return formattedData;
    }

    const QueryLeaderboardRankingsData = async (): Promise<RankingsTableData[]> => {
        try {
            const result = await client.executeViewFunction({
                address: MODULE_ADDRESS,
                module: "leaderboard",
                function: "query_leaderboard",
                args: [],
            }) as any;
    
            if (!result?.return_values?.[0]?.decoded_value?.value?.rankings?.value?.handle?.value?.id) {
                console.error('查询返回数据格式异常:', result);
                throw new Error('数据格式错误');
            }
    
            const rankingstableId = result.return_values[0].decoded_value.value.rankings.value.handle.value.id;
            const formattedData = await fetchRankingsTableData(client, rankingstableId);
            
            return formattedData;
        } catch (error) {
            console.error('查询排行榜数据失败:', error);
            throw error;
        }
    }

    const QueryLeaderboardRankings = async (): Promise<{ addresses: string[], ranks: number[] }> => {
        const result = await client.executeViewFunction({
            address: MODULE_ADDRESS,
            module: "leaderboard",
            function: "query_leaderboard",
            args: [],
        }) as any;

        const rankingstableId = result?.return_values[0]?.decoded_value?.value?.rankings?.value?.handle?.value?.id;
        const formattedData = await fetchRankingsTableData(client,rankingstableId);
        const sortedData = formattedData
            .sort((a, b) => {
                const diff = BigInt(b.amount) - BigInt(a.amount);
                return diff > 0n ? 1 : diff < 0n ? -1 : 0;
            })
            .map((item, index) => ({
                ...item,
                rank: index + 1
            }));
        const addresses = sortedData.map(item => item.address);
        const ranks = sortedData.map(item => item.rank);
    
        return {
            addresses,
            ranks
        };
    }

    const QueryLeaderboardLevelConfigs = async (): Promise<LevelConfigsTableData[]> => {
        const result = await client.executeViewFunction({
            address: MODULE_ADDRESS,
            module: "leaderboard",
            function: "query_leaderboard",
            args: [],
        }) as any;

        const level_configstableId = result?.return_values[0]?.decoded_value?.value?.level_configs?.value?.handle?.value?.id;
        const formattedData = await fetchLevelConfigsTableData(client,level_configstableId);
        return formattedData;
    }

    const QueryLeaderboardRankTiers = async (): Promise<RankTiersTableData[]> => {
        const result = await client.executeViewFunction({
            address: MODULE_ADDRESS,
            module: "leaderboard",
            function: "query_leaderboard",
            args: [],
        }) as any;

        const rank_tierstableId = result?.return_values[0]?.decoded_value?.value?.rank_tiers?.value?.handle?.value?.id;
        const formattedData = await fetchRankTiersTableData(client,rank_tierstableId);
        return formattedData;
    }

    const QueryLeaderboardGrowPoolsBalance = async (): Promise<string> => {
        const result = await client.executeViewFunction({
            address: MODULE_ADDRESS,
            module: "leaderboard",
            function: "query_leaderboard",
            args: [],
        }) as any;

        const growObject = await client.queryObjectStates({
            filter: {
                object_id: result?.return_values[0]?.decoded_value?.value?.grow_store?.value?.id,
            },
            queryOption: {
                decode: true,
            }
        }) as any;
        const objectType = growObject?.data[0]?.object_type || '';
        const growType = objectType.match(/<(.+)>/)?.[1] || '';
        const grow = await getCoinDecimals(client,growType);
        const balance = formatBalance(growObject?.data[0]?.decoded_value?.value?.balance?.value?.value,grow)

        return balance;
    }

    const QueryLeaderboardRgasPoolsBalance = async (): Promise<string> => {
        const result = await client.executeViewFunction({
            address: MODULE_ADDRESS,
            module: "leaderboard",
            function: "query_leaderboard",
            args: [],
        }) as any;

        const rgasObject = await client.queryObjectStates({
            filter: {
                object_id: result?.return_values[0]?.decoded_value?.value?.rgas_store?.value?.id,
            },
            queryOption: {
                decode: true,
            }
        }) as any;
        const objectType = rgasObject?.data[0]?.object_type || '';
        const rgasType = objectType.match(/<(.+)>/)?.[1] || '';
        const rgas = await getCoinDecimals(client,rgasType);
        const balance = formatBalance(rgasObject?.data[0]?.decoded_value?.value?.balance?.value?.value,rgas);
        return balance;
    }

    const QueryLeaderboardEndTimeAndTotalBurned = async (): Promise<{ endTime: string, totalBurned: string}> => {
        const result = await client.executeViewFunction({
            address: MODULE_ADDRESS,
            module: "leaderboard",
            function: "query_leaderboard",
            args: [],
        }) as any;

        return {
            endTime: result?.return_values[0]?.decoded_value?.value?.end_time || "0",
            totalBurned: result?.return_values[0]?.decoded_value?.value?.total_burned || "0"
        };
    };
    

    const Snapshot = async (): Promise<any> => {
        const txn = new Transaction();
        const { addresses, ranks } = await QueryLeaderboardRankings();
        let firstAddresses: string[] = [];
        let remainingAddresses: string[] = [];

        if (addresses.length <= 1000) {
            firstAddresses = addresses;
        } else {
            firstAddresses = addresses.slice(0, 999);  // 从0到999，共1000个位置
            remainingAddresses = addresses.slice(999);
        }
        txn.callFunction({
            address: MODULE_ADDRESS,
            module: "leaderboard",
            function: "snapshot_top_tiers",
            args: [
                Args.objectId("0x779bda16b1c00ba2d5a369bd015f5e88d51c00711536b6ee6716e56feb317dee"),
                Args.vec(
                    'address',
                    firstAddresses
                ),
                Args.vec(
                    'u64',
                    ranks
                ),
                Args.vec(
                    'address',
                    remainingAddresses
                ),
            ],
        });
        return await signAndExecuteTransaction({ transaction: txn });
    }

    return {
        Burnfate,
        QueryLeaderboardRankings,
        QueryLeaderboardRankingsData,
        QueryLeaderboardUserRewards,
        QueryLeaderboardLevelConfigs,
        QueryLeaderboardRankTiers,
        QueryLeaderboardGrowPoolsBalance,
        QueryLeaderboardRgasPoolsBalance,
        QueryLeaderboardEndTimeAndTotalBurned,
        Snapshot,
    };
}