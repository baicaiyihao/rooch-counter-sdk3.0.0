# Fate X - Rooch dApp Starter Template

Welcome to **Fate X**, a decentralized application (dApp) built using the `@roochnetwork/create-rooch` template. This dApp leverages the Rooch blockchain to provide an engaging platform for staking, daily check-ins, raffles, leaderboards, and more. It combines a user-friendly interface with powerful blockchain features to enhance user participation and reward systems.

This dApp was created using the following tools:

- **[React](https://react.dev/)** as the UI framework for a dynamic and responsive user experience.
- **[TypeScript](https://www.typescriptlang.org/)** for robust type checking and code reliability.
- **[Vite](https://vitejs.dev/)** for fast build tooling and development workflow.
- **[Radix UI](https://www.radix-ui.com/)** for pre-built, accessible UI components.
- **[ESLint](https://eslint.org/)** for maintaining code quality and consistency.
- **[@roochnetwork/rooch-sdk](https://www.npmjs.com/package/@roochnetwork/rooch-sdk)** and **[@roochnetwork/rooch-sdk-kit](https://www.npmjs.com/package/@roochnetwork/rooch-sdk-kit)** for seamless wallet integration and data loading.
- **[pnpm](https://pnpm.io/)** for efficient package management.

To get started with your wallet and test the dApp, request Gas from the [Rooch Faucet](https://rooch.network/learn/portal#receive-gas) as described in the "Receive Gas" chapter.

## Project Overview

Fate X is designed to engage users through a variety of decentralized features:
- **Staking**: Users can stake $FATE tokens to earn rewards and grow their holdings with the "Fate & Grow Stake" feature.
- **Daily Check-in**: Earn $FATE rewards and raffle entries by checking in daily, with bonuses for consecutive days.
- **Raffle System**: Participate in raffles by staking or checking in, with prizes including 1000, 500, and 150 $FATE.
- **Leaderboard**: Track your ranking based on staking and burning activities.
- **Documentation**: Access detailed guides and API references via the DOCS section.

Follow us on [Twitter](https://x.com/fatex_protocol) for the latest updates and community engagement!

## Installation

### Install Rooch CLI
Follow the instructions in the [Rooch CLI Installation Guide](https://rooch.network/zh-CN/build/getting-started/installation) to set up the Rooch CLI on your system.

### Publish Counter Package
Refer to the [Counter Package Example](https://github.com/rooch-network/rooch/tree/main/examples/counter) for guidance on publishing a package to the Rooch network.

### Local Setup
To run the dApp locally, follow these steps:

1. **Install Dependencies**:
   Run the following command to install all required packages:
   ```bash
   pnpm install