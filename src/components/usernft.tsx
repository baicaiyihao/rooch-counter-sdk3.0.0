import { useCurrentAddress, useRoochClient } from "@roochnetwork/rooch-sdk-kit";
import { MODULE_ADDRESS } from "../config/constants";
import { UserNftView } from "../type";
import { Args } from "@roochnetwork/rooch-sdk";


export function UserNft(){
    const client = useRoochClient();
    const currentAddress = useCurrentAddress();

    const QueryUserNft = async (): Promise<UserNftView> => {
        const address = currentAddress?.genRoochAddress().toHexAddress() || "";
        const result = await client.executeViewFunction({
            address: MODULE_ADDRESS,
            module: "user_nft",
            function: "query_user_nft_view",
            args: [
                Args.address(address),
            ],
        }) as any;
        return result?.return_values[0]?.decoded_value?.value;
    }

    return {
        QueryUserNft,
    };
}