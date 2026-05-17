# Smart Contract and Blockchain Concepts

This document explains the blockchain concepts you need to understand before building the voting DApp.

If you are new to Solidity syntax, read [Solidity Concepts](./solidity.md) after this document.

## What a Blockchain Is

A blockchain is a shared database maintained by many computers instead of one server.

Key ideas:

- Data is grouped into blocks.
- Blocks are linked together in order.
- Many network participants keep copies of the same history.
- The network agrees on the valid version of history using a consensus mechanism.

For a voting app, the main benefit is transparency: anyone can verify the result, and the rules are enforced by the chain.

## Consensus

Consensus is the process a blockchain uses to agree on the next valid block.

### Proof of Work

- Miners compete to solve a computational puzzle.
- The winner gets to add the next block.
- It is secure, but energy intensive.

### Proof of Stake

- Validators lock stake and are selected to propose or attest blocks.
- It is more energy efficient than Proof of Work.
- Ethereum uses Proof of Stake today.

For application builders, the important takeaway is simple: your contract runs on top of a network that already has rules for ordering and finalizing transactions.

## Smart Contracts

A smart contract is code stored on the blockchain that runs deterministically inside the EVM.

Properties:

- It has addressable state.
- It cannot call private server APIs.
- It must produce the same result for the same inputs.
- Its state changes only when transactions are executed.

In this project, the voting logic belongs on-chain because the rules must be public and tamper resistant.

## EVM Basics

The Ethereum Virtual Machine is the execution environment for Ethereum smart contracts.

You can think of it as:

- the runtime that executes contract bytecode
- the layer that defines gas usage
- the place where storage and transaction execution rules live

Solidity is compiled into EVM bytecode before deployment.

## Account Model

Ethereum has two main account types:

- Externally Owned Accounts, controlled by private keys
- Contract Accounts, controlled by code

Important fields:

- balance
- nonce
- code
- storage

For the voting app:

- wallets are externally owned accounts
- the voting contract is a contract account

## Transactions and State

A transaction is a signed request that changes blockchain state.

When a user votes:

1. The wallet signs the transaction.
2. The network includes it in a block.
3. The contract updates its state.
4. The change becomes part of the public history.

This is why voting logic should not live only in React state or a database.

## `msg.sender` and Execution Context

`msg.sender` is the immediate caller of the current contract function.

In practice:

- if a wallet calls the contract directly, `msg.sender` is that wallet
- if one contract calls another, `msg.sender` is the calling contract

For the voting app, `msg.sender` is commonly used to:

- check whether the caller is the owner
- prevent the same wallet from voting twice
- record who cast a vote

Related values:

- `msg.value` is the amount of ether sent with the call
- `msg.data` is the raw calldata

## State Variables

State variables live on-chain in contract storage.

Examples:

- candidate list
- vote counts
- `hasVoted` flags
- admin address
- voting status

Because storage is persistent, it is the right place for critical voting data.

## Events

Events are logs written during a transaction.

Use events when you want:

- off-chain apps to react to contract changes
- a clean transaction history
- frontend listeners to update the UI

For example, the voting contract should emit:

- `CandidateAdded`
- `Voted`
- `VotingEnded`

Events do not replace state. They complement it.

## Access Control

Access control decides who is allowed to perform an action.

Common patterns:

- owner-only functions
- role-based access
- allowlists

For this project, the admin should be the only account allowed to add candidates and end the vote.

## Storage, Memory, and Calldata

Solidity uses different data locations.

- `storage` is persistent on-chain data
- `memory` is temporary data used during execution
- `calldata` is read-only function input data

Use the right location to avoid bugs and wasted gas.

## Why Public Results Matter

Public results mean anyone can read the vote totals directly from the chain.

That gives you:

- transparency
- auditability
- fewer trust assumptions

For the voting app, the contract should expose read functions that return candidate names, vote counts, and voting status.

## Common Smart Contract Pitfalls

- Storing too much data on-chain
- Using loops over unbounded user data
- Forgetting access control
- Confusing off-chain UI state with on-chain truth
- Relying on timestamps for strict security guarantees

## How This Applies to the Voting DApp

The contract should enforce the rules directly:

- only the admin can add candidates
- each address can vote only once
- voting stops when the election ends
- results remain readable after voting ends

The frontend should only help users interact with those rules, not replace them.
