import { RoochClient } from "@roochnetwork/rooch-sdk";

export const getCoinDecimals = async (
    client: RoochClient,
    coinType: string
): Promise<number> => {
    try {
        const coinInfo = await client.queryObjectStates({
            filter: {
                object_type: `0x3::coin::CoinInfo<${coinType}>`,
            },
            queryOption: {
                decode: true,
            }
        }) as any;

        return coinInfo?.data[0]?.decoded_value?.value?.decimals || 0;
    } catch (error) {
        console.error('获取 coin decimals 失败:', error);
        return 0;
    }
};

export const formatBalance = (balance: number, decimals: number): string => {
    try {
        const balanceNum = BigInt(balance);
        const divisor = BigInt(10 ** decimals);
        const integerPart = balanceNum / divisor;
        const fractionalPart = balanceNum % divisor;
        
        // 将小数部分补齐到指定位数
        const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
        
        // 移除末尾的0
        const trimmedFractional = fractionalStr.replace(/0+$/, '');
        
        // 如果小数部分为空，则只返回整数部分
        if (trimmedFractional === '') {
            return integerPart.toString();
        }
        
        return `${integerPart}.${trimmedFractional}`;
    } catch (error) {
        console.error('格式化余额失败:', error);
        return '0';
    }
};