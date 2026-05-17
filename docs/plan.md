# Solidity Voting DApp Learning Plan

This plan is for building and learning a simple voting DApp with Solidity, Hardhat, React, and Wagmi.

Start with:

- [Smart Contract and Blockchain Concepts](./concept/smart-contract.md)
- [Solidity Concepts](./concept/solidity.md)
- [MetaMask and Network Types](./concept/metamask.md)

## Project Rules

- 1 wallet = 1 vote
- Public results are readable by everyone
- Only the admin can manage candidates
- Vote actions must be recorded on-chain

## Phase 0 - Setup and Environment

Goal: prepare the development stack before writing contract logic.

- [x] Install `pnpm`
- [x] Install Node.js and a package manager
- [x] Run `pnpm install`
- [x] Install project dependencies for Hardhat
- [x] Confirm the root structure: `contracts/`, `scripts/`, `test/`, `frontend/`, `docs/`
- [x] Set up `hardhat.config.js` to point to the custom folder layout
- [x] Create a `.env` file from `.env.example`
- [x] Set up MetaMask for local and testnet use
- [x] Learn the difference between local chain, testnet, and mainnet
- [x] Read the disclaimer in `README.md`

Completion criteria:

- [x] You can compile an empty contract
- [x] You can run Hardhat tests locally
- [x] You can connect a wallet to a local or testnet network
- [x] You understand where contracts, tests, scripts, docs, and frontend code live

## Week 1 - Solidity Fundamentals

Goal: be able to read, write, deploy, and test basic smart contracts.

### Topics

- `pragma`, contract structure, and compiler versioning
- State variables, local variables, and visibility
- Functions, return values, and modifiers
- `require`, `revert`, and custom errors
- Events and logs
- `mapping`, `struct`, `enum`, and arrays
- `msg.sender`, `msg.value`, and `owner` patterns
- Storage vs memory vs calldata

### Build Exercises

- [ ] `Counter` contract
- [ ] `TodoList` contract
- [ ] `SimpleWallet` contract

### Skills to Prove

- [ ] You can deploy a contract with Hardhat
- [ ] You can write a unit test for a state change
- [ ] You can write a unit test for a revert condition
- [ ] You can emit and assert an event in a test

### Completion criteria

- [ ] You can explain the purpose of state variables, events, and modifiers
- [ ] You can deploy each exercise contract locally
- [ ] You can test both happy paths and failure paths

## Week 2 - Voting Smart Contract

Goal: build the core e-voting contract with on-chain rules.

### Target Behavior

- Admin can add candidates
- Each wallet can vote only once
- Votes are public and readable
- Voting can be ended by the admin
- Every vote emits an event

### Contract Requirements

- [ ] Define the candidate data structure
- [ ] Store vote counts on-chain
- [ ] Track whether an address has already voted
- [ ] Restrict candidate management to the admin
- [ ] Prevent votes after voting has ended
- [ ] Emit an event when a candidate is added
- [ ] Emit an event when a vote is cast
- [ ] Provide read functions for results and candidate data

### Tests

- [ ] owner can add candidate
- [ ] non-owner cannot add candidate
- [ ] user can vote
- [ ] user cannot vote twice
- [ ] cannot vote if voting ended
- [ ] vote event is emitted
- [ ] candidate list or result getter returns expected data

### Completion criteria

- [ ] The contract enforces 1 wallet = 1 vote
- [ ] Results can be read without privileged access
- [ ] Tests cover the main business rules

## Week 3 - React and Wagmi Integration

Goal: build a frontend that talks to the smart contract safely and clearly.

### Topics

- Connect wallet with Wagmi
- Read public contract data
- Send transactions from the UI
- Show transaction pending, success, and failure states
- Display current candidates and vote totals

### Build Tasks

- [ ] Create a voting dashboard
- [ ] Add wallet connection and network awareness
- [ ] Load candidates from the contract
- [ ] Display live vote results
- [ ] Add a vote action button
- [ ] Handle user rejections and revert messages

### Completion criteria

- [ ] A connected wallet can vote from the UI
- [ ] Public results are visible without special access
- [ ] The UI reflects contract state instead of duplicating it

## Week 4 - Deployment and Polish

Goal: make the app usable outside the local environment.

### Topics

- Deploy the contract to a testnet
- Configure frontend environment variables
- Verify the contract if applicable
- Polish the user flow and error handling
- Review gas costs and unnecessary storage writes

### Build Tasks

- [ ] Write a deployment script
- [ ] Deploy to a test network
- [ ] Connect the frontend to the deployed contract
- [ ] Add clear empty, loading, and error states
- [ ] Review contract security and access control

### Completion criteria

- [ ] The DApp works end to end on a public test network
- [ ] The UI can read and write to the deployed contract
- [ ] The project has enough documentation for another developer to continue it

## Suggested Study Loop

For each phase:

- [ ] Read the relevant concept doc
- [ ] Implement the feature
- [ ] Write tests
- [ ] Review failures and revert reasons
- [ ] Update notes with what you learned

## Final Outcome

When this plan is complete, you should be able to:

- Read and write Solidity contracts confidently
- Build and test contracts with Hardhat
- Connect a React frontend with Wagmi
- Ship a simple voting DApp with clear on-chain rules
