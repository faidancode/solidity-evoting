# Repository Guide

This repository is a learning workspace for a simple voting DApp built with Solidity, Hardhat, React, and Wagmi.

## Project Goal

- Build a voting application with these rules:
  - 1 wallet = 1 vote
  - public results
  - admin-managed candidates
- Use the project as a progression from Solidity basics to a full stack Web3 app.

## Working Principles

- Keep all documentation in English.
- Prefer small, focused changes over large speculative refactors.
- Keep smart contract behavior explicit and testable.
- Treat security and access control as first-class concerns.
- Preserve the core voting rules unless the user explicitly changes them.

## Smart Contract Rules

- Use clear contract names, role names, and event names.
- Keep candidate management restricted to the admin/owner.
- Prevent double voting at the contract level.
- Emit events for important actions, especially candidate creation and votes.
- Prefer custom errors or clear revert messages for failing conditions.
- Avoid relying on hidden off-chain assumptions for core logic.

## Solidity and Hardhat Conventions

- Write contracts for readability first, then optimize if needed.
- Prefer simple storage layouts and straightforward control flow.
- Keep state variables private or public intentionally, not by accident.
- Add unit tests for every meaningful behavior:
  - happy path
  - access control failure
  - double-vote prevention
  - end-of-voting behavior
- If a helper, script, or config already exists, extend it instead of replacing it.

## Frontend Conventions

- Use React and Wagmi for wallet connection and contract interaction.
- Keep UI state aligned with contract state.
- Show user-friendly messages for pending transactions, success, and revert cases.
- Read public data from the contract instead of duplicating vote logic in the UI.

## Documentation Conventions

- Keep `docs/plan.md` checkable and phase-based.
- Keep concept docs short, practical, and connected to the voting app.
- Prefer examples that explain why a concept matters for this project.
- When you add a new concept, include the minimum Solidity or blockchain context needed to use it correctly.

## Test Expectations

- Use tests to define behavior, not just to reach coverage numbers.
- Prefer one test per rule when a rule is important.
- Make the voting contract tests readable enough for a beginner to follow.

## Suggested Learning Order

1. Solidity syntax and contract basics
2. Hardhat deployment and testing
3. Voting contract design
4. React and Wagmi integration
5. Deployment and verification

## Notes for Future Contributors

- Do not introduce secrets into the repository.
- Keep sample addresses, private keys, and RPC URLs in environment files or placeholders.
- If you change the voting model, update the docs and tests together.
