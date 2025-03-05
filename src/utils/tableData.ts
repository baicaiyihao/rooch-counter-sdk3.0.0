import { LevelConfigsTableData, RankingsTableData, RankTiersTableData, UserRewardsTableData } from "../type";
import { RoochClient } from "@roochnetwork/rooch-sdk";


export const fetchRankingsTableData = async (
    client: RoochClient,
    tableId: string
): Promise<RankingsTableData[]> => {
    // 获取第一页数据
    const firstPage = await client.listStates({
        accessPath: `/table/${tableId}`,
        stateOption: {
            decode: true,
        },
        limit: '100',
    });

    let allData: any[] = [...(firstPage.data || [])];

    if (firstPage.has_next_page) {
        let currentCursor = firstPage.next_cursor;
        let hasNextPage = true;

        while (hasNextPage === true) {
            const nextPage = await client.listStates({
                accessPath: `/table/${tableId}`,
                stateOption: {
                    decode: true,
                },
                limit: '100',
                cursor: currentCursor,
            });

            allData = [...allData, ...(nextPage.data || [])];
            hasNextPage = nextPage.has_next_page;
            currentCursor = nextPage.next_cursor;
        }
    }

    return allData.map(item => ({
        address: item?.state?.decoded_value?.value?.name,
        amount: item?.state?.decoded_value?.value?.value
    }));
};

export const fetchLevelConfigsTableData = async (
    client: RoochClient,
    tableId: string
): Promise<LevelConfigsTableData[]> => {
    // 获取第一页数据
    const firstPage = await client.listStates({
        accessPath: `/table/${tableId}`,
        stateOption: {
            decode: true,
        },
        limit: '100',
    });

    let allData: any[] = [...(firstPage.data || [])];

    if (firstPage.has_next_page) {
        let currentCursor = firstPage.next_cursor;
        let hasNextPage = true;

        while (hasNextPage === true) {
            const nextPage = await client.listStates({
                accessPath: `/table/${tableId}`,
                stateOption: {
                    decode: true,
                },
                limit: '100',
                cursor: currentCursor,
            });

            allData = [...allData, ...(nextPage.data || [])];
            hasNextPage = nextPage.has_next_page;
            currentCursor = nextPage.next_cursor;
        }
    }

    return allData.map(item => ({
        level: item?.state?.decoded_value?.value?.name,
        value: item?.state?.decoded_value?.value?.value?.value
    }));
};


export const fetchRankTiersTableData = async (
    client: RoochClient,
    tableId: string
): Promise<RankTiersTableData[]> => {
    // 获取第一页数据
    const firstPage = await client.listStates({
        accessPath: `/table/${tableId}`,
        stateOption: {
            decode: true,
        },
        limit: '100',
    });

    let allData: any[] = [...(firstPage.data || [])];

    if (firstPage.has_next_page) {
        let currentCursor = firstPage.next_cursor;
        let hasNextPage = true;

        while (hasNextPage === true) {
            const nextPage = await client.listStates({
                accessPath: `/table/${tableId}`,
                stateOption: {
                    decode: true,
                },
                limit: '100',
                cursor: currentCursor,
            });

            allData = [...allData, ...(nextPage.data || [])];
            hasNextPage = nextPage.has_next_page;
            currentCursor = nextPage.next_cursor;
        }
    }

    return allData.map(item => ({
        level: item?.state?.decoded_value?.value?.name,
        value: item?.state?.decoded_value?.value?.value?.value
    }));
};

export const fetchUserRewardsTableData = async (
    client: RoochClient,
    tableId: string
): Promise<UserRewardsTableData[]> => {
    // 获取第一页数据
    const firstPage = await client.listStates({
        accessPath: `/table/${tableId}`,
        stateOption: {
            decode: true,
        },
        limit: '100',
    });

    let allData: any[] = [...(firstPage.data || [])];

    if (firstPage.has_next_page) {
        let currentCursor = firstPage.next_cursor;
        let hasNextPage = true;

        while (hasNextPage === true) {
            const nextPage = await client.listStates({
                accessPath: `/table/${tableId}`,
                stateOption: {
                    decode: true,
                },
                limit: '100',
                cursor: currentCursor,
            });

            allData = [...allData, ...(nextPage.data || [])];
            hasNextPage = nextPage.has_next_page;
            currentCursor = nextPage.next_cursor;
        }
    }

    return allData.map(item => ({
        address: item?.state?.decoded_value?.value?.name,
        value: item?.state?.decoded_value?.value?.value?.value
    }));
};