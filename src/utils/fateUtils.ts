import { RoochClient } from "@roochnetwork/rooch-sdk";
import { formatBalance, getCoinDecimals } from "./coinUtils";

export const queryFateBalance = async (
    client: RoochClient, 
    address: string,
    coinType: string
): Promise<string> => {
    try {
        const decimals = await getCoinDecimals(client, coinType);
        
        const balanceObject = await client.getBalance({
            owner: address,
            coinType: coinType,
        }) as any;

        return formatBalance(balanceObject?.balance, decimals);
    } catch (error) {
        console.error(`获取 ${coinType} 余额失败:`, error);
        return '0';
    }
};