# Local Deploy and Frontend Env Notes

This note records the setup we used to connect the `Voting` contract to the React frontend.

## What Exists In The Repo

- The voting contract lives in [contracts/Voting.sol](../contracts/Voting.sol).
- The frontend reads contract configuration from [frontend/src/voting.ts](../frontend/src/voting.ts).
- The Hardhat config uses the `contracts/`, `scripts/`, and `frontend/` folder layout in [hardhat.config.js](../hardhat.config.js).

## Important Distinction

- `http://localhost:5173/` is the frontend URL.
- `0x...` wallet addresses are user accounts connected in MetaMask.
- `VITE_CONTRACT_ADDRESS` must be the deployed contract address, not a wallet address and not a URL.

Example:

```env
VITE_CONTRACT_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
VITE_CHAIN_ID=31337
```

## Why The Frontend Said "Unconfigured"

The frontend checks `import.meta.env.VITE_CONTRACT_ADDRESS` in [frontend/src/voting.ts](../frontend/src/voting.ts).

If the value is missing or invalid:

- `contractAddress` becomes `undefined`
- the dashboard shows `Unconfigured`
- the UI warns that `VITE_CONTRACT_ADDRESS` is absent

## Local Deploy Flow

1. Start the local Hardhat chain.
2. Run the deploy script.
3. Copy the printed contract address into the frontend env file.
4. Restart the frontend dev server.

Commands:

```bash
pnpm node
pnpm run deploy:local
```

The deploy script is [scripts/deploy.js](../scripts/deploy.js). It deploys `Voting` and prints the deployed address.

## Correct Env File Location

For the Vite frontend, the env file must be in the `frontend/` folder:

- use [frontend/.env](../frontend/.env)
- do not rely on the root `.env` file for Vite frontend variables

If the frontend still shows `Unconfigured`, restart the frontend dev server after updating `frontend/.env`.

## Contract Behavior Summary

The `Voting` contract already enforces the core rules:

- the deployer becomes the owner
- only the owner can add candidates
- each wallet can vote once
- votes stop after voting ends
- candidate and vote data are public through read functions

## Useful Files

- [contracts/Voting.sol](../contracts/Voting.sol)
- [scripts/deploy.js](../scripts/deploy.js)
- [frontend/src/voting.ts](../frontend/src/voting.ts)
- [frontend/src/App.tsx](../frontend/src/App.tsx)
- [frontend/.env](../frontend/.env)
