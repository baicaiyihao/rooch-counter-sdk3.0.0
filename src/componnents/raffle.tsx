import { Args, PaginatedIndexerEventViews, Transaction } from "@roochnetwork/rooch-sdk";
import { MODULE_ADDRESS } from "../config/constants";
import { useCurrentAddress, useRoochClient, useSignAndExecuteTransaction } from "@roochnetwork/rooch-sdk-kit";
import { CheckInRaffle, CheckInRaffleRecord } from "../type";

export function Raffle(){
    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    const client = useRoochClient();
    const currentAddress = useCurrentAddress();


    const GetCheckInRaffleByFate = async () => {
        const txn = new Transaction();
        txn.callFunction({
            address: MODULE_ADDRESS,
            module: "raffle_v2",
            function: "get_check_in_raffle_by_fate",
            args: [],
        });
    
        const result = await signAndExecuteTransaction({ transaction: txn });
    
        const test = await client.queryEvents({
            filter: {
                tx_hash: result?.execution_info?.tx_hash,
            },
            queryOption: {
                decode: true,
            },
        });
    
        const filterCheckInRaffleEvents = (events: PaginatedIndexerEventViews) => {
            const targetEventType = `${MODULE_ADDRESS}::raffle_v2::CheckInRaffleEmit`;
            return events.data.filter((event: { event_type: string; }) => event.event_type === targetEventType);
        };
    
        const filteredEvents = filterCheckInRaffleEvents(test);    
        return filteredEvents[0]?.decoded_event_data?.value.result;
    };

    const ClaimMaxRaffle = async () => {
        const txn = new Transaction();
        txn.callFunction({
            address: MODULE_ADDRESS,
            module: "raffle_v2",
            function: "claim_max_raffle",
            args: [],
        });
        return await signAndExecuteTransaction({ transaction: txn });
    }


    const QueryCheckInRaffle = async(): Promise<CheckInRaffle> => {
        const result = await client.executeViewFunction({
            address: MODULE_ADDRESS,
            module: "raffle_v2",
            function: "query_check_in_raffle_view",
            args: [],
        }) as any;
        console.log(result?.return_values[0]?.decoded_value?.value);
        return result?.return_values[0]?.decoded_value?.value;
    }

    const QueryCheckInRaffleRecord = async(): Promise<CheckInRaffleRecord> => {
        const address = currentAddress?.genRoochAddress().toHexAddress() || "";
        const result = await client.executeViewFunction({
            address: MODULE_ADDRESS,
            module: "raffle_v2",
            function: "query_check_in_raffle_record_view",
            args: [
                Args.address(address),
            ],
        }) as any;
        console.log(result?.return_values[0]?.decoded_value?.value);
        return result?.return_values[0]?.decoded_value?.value;
    }

    return {
        GetCheckInRaffleByFate,
        ClaimMaxRaffle,
        QueryCheckInRaffle,
        QueryCheckInRaffleRecord,
    };
}