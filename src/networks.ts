import { getRoochNodeUrl } from '@roochnetwork/rooch-sdk'
import { createNetworkConfig } from "@roochnetwork/rooch-sdk-kit"
import { MODULE_ADDRESS } from './config/constants.ts'
const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    mainnet: {
      url: getRoochNodeUrl("mainnet"),
      variables: {
        PackageId: MODULE_ADDRESS,
      },
    },
    devnet: {
      url: getRoochNodeUrl("devnet"),
      variables: {
        PackageId: MODULE_ADDRESS,
      },
    },
    testnet: {
      url: getRoochNodeUrl("testnet"),
      variables: {
        PackageId: MODULE_ADDRESS,
      },
    },
    localnet: {
      url: getRoochNodeUrl("localnet"),
      variables: {
        PackageId: MODULE_ADDRESS,
      },
    },
  })

export { useNetworkVariable, useNetworkVariables, networkConfig }
