# Phase 0 Troubleshooting: MetaMask Setup

This note collects the issues that came up while connecting MetaMask to the local Hardhat network.

## Goal

Use MetaMask with a local Hardhat node so you can:

- connect a wallet to the local chain
- see a test balance
- send transactions to contracts during development

## What Worked

The local setup was confirmed when:

- `hardhat node` was running
- MetaMask was connected to the local RPC endpoint
- the imported account showed `10000 ETH`
- RPC calls like `eth_blockNumber` succeeded

## Hardhat Local Network Settings

Use these values for the local network:

- Network Name: `Hardhat Local`
- RPC URL: `http://127.0.0.1:8545`
- Chain ID: `31337`
- Currency Symbol: `ETH`

## Importing a Hardhat Account

1. Run `pnpm node` in the repo root.
2. Copy one private key from the Hardhat node output.
3. In MetaMask, open **Add account or hardware wallet**.
4. Choose **Import account**.
5. Paste the private key and confirm.
6. Switch to the imported account on the local network.

Example local key used during setup:

```text
0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae78xxxxxxxxxxxx
```

## Common Problems and Fixes

### MetaMask suggests GoChain Testnet

This means the chain ID you entered belongs to GoChain, not Hardhat.

Fix:

- keep GoChain as a separate network if you need it
- create a new custom network for Hardhat Local
- use chain ID `31337`

### Balance shows `0 GO`

This means you are on the GoChain network or another chain that uses `GO` as its symbol.

Fix:

- switch to the Hardhat Local network
- import a Hardhat account on that network
- verify the balance becomes `10000 ETH`

### `Parse error: Unexpected end of JSON input`

This usually means MetaMask is pointed at the wrong RPC endpoint or the endpoint is not returning valid JSON-RPC.

Fix:

- ensure `hardhat node` is running
- use `http://127.0.0.1:8545`
- remove any stale custom network entry and re-add it

### MetaMask shows a chain mismatch warning

If MetaMask says the network name does not match the chain ID, the network you entered is not Hardhat.

Fix:

- do not reuse the GoChain entry
- add a new local Hardhat network

## Local Dev Checklist

- [x] Hardhat node is running
- [x] MetaMask is connected to the local node
- [x] Imported account shows fake test ETH
- [x] `eth_blockNumber` works
- [x] Local account can sign transactions

## Notes for Future You

- Do not import the Hardhat private keys into Sepolia or any real network.
- Use the Hardhat account only for local development.
- Keep GoChain and Hardhat as separate MetaMask networks.
