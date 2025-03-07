import { useCurrentAddress, useRoochClient, useSignAndExecuteTransaction } from "@roochnetwork/rooch-sdk-kit";
import { Args, Transaction } from "@roochnetwork/rooch-sdk";
import { MODULE_ADDRESS } from "../config/constants";
import { DailyCheckInConfig } from "../type";
import { CheckInRecord } from "../type";


export function CheckIn(){
    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    const client = useRoochClient();
    const currentAddress = useCurrentAddress();

    const CheckIn = async (): Promise<any> => {
        const txn = new Transaction();
        txn.callFunction({
            address: MODULE_ADDRESS,
            module: "daily_check_in",
            function: "checkin",
            args: [],
        });
        return await signAndExecuteTransaction({ transaction: txn });
    }

    const GetWeekRaffle = async (): Promise<any> => {
        const txn = new Transaction();
        txn.callFunction({
            address: MODULE_ADDRESS,
            module: "daily_check_in",
            function: "get_week_raffle",
            args: [],
        });
        return await signAndExecuteTransaction({ transaction: txn });
    }

    const QueryDailyCheckInConfig = async (): Promise<DailyCheckInConfig> => {
        const result = await client.executeViewFunction({
            address: MODULE_ADDRESS,
            module: "daily_check_in",
            function: "query_config_view",
            args: [],
        }) as any;
        return result?.return_values[0]?.decoded_value?.value;
    }

    const QueryCheckInRecord = async (): Promise<CheckInRecord> => {
        const address = currentAddress?.genRoochAddress().toHexAddress() || "";
        const result = await client.executeViewFunction({
            address: MODULE_ADDRESS,
            module: "daily_check_in",
            function: "get_check_in_record_view",
            args: [
                Args.address(address),
            ],
        }) as any;
        return result?.return_values[0]?.decoded_value?.value;
    }

    return {
        CheckIn,
        GetWeekRaffle,
        QueryDailyCheckInConfig,
        QueryCheckInRecord,
    };
}