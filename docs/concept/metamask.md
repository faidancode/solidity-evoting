# MetaMask and Network Types

This document explains how to use MetaMask for the voting DApp and how to think about local chain, testnet, and mainnet.

## What MetaMask Does

MetaMask is a wallet extension and mobile app that lets you:

- create and manage accounts
- sign transactions
- connect to Ethereum-compatible networks
- interact with dApps like this voting project

For this repository, MetaMask is the wallet used to test contract interactions from the browser.

## Basic MetaMask Setup

1. Install the MetaMask browser extension.
2. Create or import a wallet.
3. Save your Secret Recovery Phrase offline and never commit it.
4. Add the network you want to use.
5. Import or select the account you will use for testing.

## Local Chain

A local chain is a blockchain running on your machine.

Typical examples:

- Hardhat Network
- Anvil
- other local Ethereum simulators

Use a local chain when you want:

- fast feedback
- free transactions
- complete control over accounts and state
- safe contract testing

For the voting app, local chain is where you practice contract behavior before touching a public network.

## Testnet

A testnet is a public blockchain used for testing.

Examples:

- Sepolia

Use a testnet when you want:

- real wallet interaction
- public transaction history
- realistic network behavior
- a safe place to try deployment before mainnet

For the voting app, testnet is the right place to validate the full DApp after local testing passes.

## Mainnet

Mainnet is the real production blockchain.

Use mainnet when:

- the app is production ready
- security has been reviewed
- the contract and frontend are fully tested

For this learning project, mainnet is out of scope.

## The Practical Difference

### Local Chain

- Fast
- Free
- Resettable
- Best for development and unit tests

### Testnet

- Public
- Uses test ETH instead of real ETH
- Good for deployment rehearsal
- Good for frontend integration testing

### Mainnet

- Public and permanent
- Uses real value
- Higher security and operational risk
- Requires production-grade confidence

## How This Applies to the Voting DApp

For this project, the recommended workflow is:

1. Build and test on a local chain.
2. Connect MetaMask to the local chain.
3. Deploy to a testnet.
4. Connect MetaMask to the testnet.
5. Only consider mainnet if the project were ever moved beyond learning.

## What to Check in MetaMask for This Repo

- The selected network matches the contract deployment target.
- The selected account has enough gas on the active network.
- The account is the admin when you need to add candidates.
- The account has not already voted when testing the one-wallet-one-vote rule.

## Common Mistakes

- Mixing up testnet and mainnet RPC URLs
- Using the wrong account
- Forgetting to switch MetaMask networks
- Assuming frontend state is the same as on-chain state
- Importing a real private key into a shared or insecure machine

## Related Docs

- [Smart Contract and Blockchain Concepts](./smart-contract.md)
- [Solidity Concepts](./solidity.md)
