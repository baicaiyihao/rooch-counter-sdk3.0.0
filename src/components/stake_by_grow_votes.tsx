import { Args, Transaction } from "@roochnetwork/rooch-sdk";
import { MODULE_ADDRESS } from "../config/constants";
import { useCurrentAddress, useRoochClient, useSignAndExecuteTransaction } from "@roochnetwork/rooch-sdk-kit";
import { StakeInfo, StakePoolInfo } from "../type";

export function StakeByGrowVotes(){
    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    const currentAddress = useCurrentAddress();
    const client = useRoochClient();

    const UpdateGrowVotes = async () => {
        const projectlist = await client.queryObjectStates({
            filter: {
                object_type: "0x701c21bf1c8cd5af8c42983890d8ca55e7a820171b8e744c13f2d9998bf76cc3::grow_information_v3::GrowProjectList",
            },
            queryOption:{
                decode: true,
            }
        });
        const txn = new Transaction();
        txn.callFunction({
            address: MODULE_ADDRESS,
            module: "stake_by_grow_votes_v5",
            function: "update_grow_votes",
            args: [
                Args.objectId(projectlist?.data[0]?.id),
            ],
        });
        console.log(projectlist?.data[0]?.id);
        return await signAndExecuteTransaction({ transaction: txn });
    }

    const Stake = async () => {
        const txn = new Transaction();
        txn.callFunction({
            address: MODULE_ADDRESS,
            module: "stake_by_grow_votes_v5",
            function: "stake",
            args: [],
        });
        return await signAndExecuteTransaction({ transaction: txn });
    }

    const UnStake = async () => {
        const txn = new Transaction();
        txn.callFunction({
            address: MODULE_ADDRESS,
            module: "stake_by_grow_votes_v5",
            function: "unstake",
            args: [],
        });
        return signAndExecuteTransaction({ transaction: txn });
    }

    const ClaimRewords = async () => {
        const txn = new Transaction();
        txn.callFunction({
            address: MODULE_ADDRESS,
            module: "stake_by_grow_votes_v5",
            function: "harvest",
            args: [],
        });
        return await signAndExecuteTransaction({ transaction: txn });
    }


    const GetStakeInfo = async (): Promise<StakeInfo> => {
        const address = currentAddress?.genRoochAddress().toHexAddress() || "";
        const result = await client.executeViewFunction({
            address: MODULE_ADDRESS,
            module: "stake_by_grow_votes_v5",
            function: "query_stake_info_view",
            args: [
                Args.address(address),
            ],
        }) as any;
        console.log(result);
        return result?.return_values[0]?.decoded_value?.value;
    }

    const QueryStakePoolInfo = async (): Promise<StakePoolInfo> => {
        const result = await client.executeViewFunction({
            address: MODULE_ADDRESS,
            module: "stake_by_grow_votes_v5",
            function: "query_pool_info_view",
            args: [],
        }) as any;
        console.log(result);
        return result?.return_values[0]?.decoded_value?.value;
    }

    const QueryProjectName = async (): Promise<String> => {
        const result = await client.executeViewFunction({
            address: MODULE_ADDRESS,
            module: "stake_by_grow_votes_v5",
            function: "query_project_name",
            args: [],
        }) as any;
        return result?.return_values[0]?.decoded_value;
    }

    return {
        QueryStakePoolInfo,
        QueryProjectName,
        GetStakeInfo,
        UpdateGrowVotes,
        Stake,
        UnStake,
        ClaimRewords,
    };
}