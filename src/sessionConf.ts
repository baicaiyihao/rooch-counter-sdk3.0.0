import { getRoochNodeUrl } from '@roochnetwork/rooch-sdk'
import { createNetworkConfig } from "@roochnetwork/rooch-sdk-kit"

import { MODULE_ADDRESS} from './config/constants.ts'

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    mainnet: {
      url: getRoochNodeUrl("mainnet"),
      variables: {
        counterPackageId: MODULE_ADDRESS,
      },
    },
    devnet: {
      url: getRoochNodeUrl("devnet"),
      variables: {
        counterPackageId: MODULE_ADDRESS,
      },
    },
    testnet: {
      url: getRoochNodeUrl("testnet"),
      variables: {
        counterPackageId: MODULE_ADDRESS,
      },
    },
    localnet: {
      url: getRoochNodeUrl("localnet"),
      variables: {
        counterPackageId: MODULE_ADDRESS,
      },
    },
  })

export { useNetworkVariable, useNetworkVariables, networkConfig }
