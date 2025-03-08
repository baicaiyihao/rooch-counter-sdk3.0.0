import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "@roochnetwork/rooch-sdk-kit/dist/index.css";
// import '@radix-ui/themes/styles.css';
import CheckInPage from "./pages/CheckInPage.tsx";
import RafflePage from "./pages/RafflePage.tsx";
import StakePage from "./pages/StakePage.tsx";
import LeaderboardPage from "./pages/LeaderboardPage.tsx";
import { RoochProvider, WalletProvider } from '@roochnetwork/rooch-sdk-kit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {Theme} from '@radix-ui/themes';
import { networkConfig } from "./networks";
import App from './App';
import { ErrorGuard } from "./ErrorGuard.tsx";
import { MODULE_ADDRESS } from './constants.ts'
import { Documentation } from './pages/DocumentationPage';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Theme appearance="light">
      <QueryClientProvider client={queryClient}>
            <RoochProvider networks={networkConfig} sessionConf={
              {
                appName: "fatex",
                appUrl: "https://fatex.zone",
                scopes: [`${MODULE_ADDRESS}::*::*`],
                maxInactiveInterval: 86400
              }
            } defaultNetwork='testnet'>
              <WalletProvider preferredWallets={['UniSat']} chain={'bitcoin'} autoConnect>
                <ErrorGuard/>
                <BrowserRouter>
              <Routes>
              <Route path="/" element={<App />} />
              <Route path="/check-in" element={<CheckInPage />} />
              <Route path="/raffle" element={<RafflePage/>} />
              <Route path="/stake" element={<StakePage/>} />
              <Route path="/leaderboard" element={<LeaderboardPage/>} />
              <Route path="/docs" element={<Documentation />} />
              <Route path="/docs/:file" element={<Documentation />} />

            </Routes>
          </BrowserRouter>
              </WalletProvider>
            </RoochProvider>
      </QueryClientProvider>
    </Theme>
  </React.StrictMode>
);
