# Solidity Concepts

This document focuses on Solidity itself: the language, its syntax, and the patterns you will use in the voting DApp.

## What Solidity Is

Solidity is a statically typed language used to write Ethereum smart contracts.

It is used to define:

- contract storage
- business rules
- public read functions
- transaction-based state changes

## Contract Structure

Typical Solidity files contain:

- `pragma solidity` version declaration
- imports
- contract declaration
- state variables
- events
- errors
- functions
- modifiers

Example:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Counter {
    uint256 public value;

    function increment() external {
        value += 1;
    }
}
```

## Types

Solidity is strongly typed.

Common value types:

- `uint256`
- `int256`
- `bool`
- `address`
- `bytes32`

Common reference types:

- arrays
- `mapping`
- `struct`
- `string`

For the voting app, you will most likely use:

- `address` for voters and admin
- `uint256` for vote counts
- `string` for candidate names
- `mapping` for vote tracking
- `struct` for candidate metadata

## Variables and Visibility

State variables are stored on-chain.

Visibility options:

- `public`
- `internal`
- `private`
- `external` for functions

Use visibility intentionally:

- `public` when data should be readable from outside
- `private` or `internal` when implementation details should stay inside the contract

## Functions

Function types you will use often:

- `external` for user-facing transaction entry points
- `public` for functions callable both internally and externally
- `view` for read-only functions
- `pure` for functions that do not read contract state
- `payable` for functions that can receive ether

Example:

```solidity
function totalVotes() external view returns (uint256) {
    return votesCast;
}
```

## Modifiers

Modifiers wrap reusable checks around functions.

Typical use cases:

- only owner can call
- voting must still be open
- caller must not have voted already

Example:

```solidity
modifier onlyOwner() {
    require(msg.sender == owner, "Not owner");
    _;
}
```

## Events

Events let off-chain apps follow contract activity.

Example:

```solidity
event VoteCast(address indexed voter, uint256 indexed candidateId);
```

Use indexed parameters when you want easier filtering in logs.

## Errors and Reverts

Solidity lets you stop execution when a rule is broken.

Common patterns:

- `require(condition, "message")`
- `revert("message")`
- custom errors for cheaper, clearer failures

Example custom error:

```solidity
error AlreadyVoted();
```

Use errors for:

- unauthorized access
- invalid candidate id
- duplicate voting
- voting after the end

## Data Structures

### Structs

Use `struct` to bundle related fields.

```solidity
struct Candidate {
    string name;
    uint256 voteCount;
    bool exists;
}
```

### Mappings

Use `mapping` for fast key-based lookups.

```solidity
mapping(address => bool) public hasVoted;
mapping(uint256 => Candidate) public candidates;
```

Mappings are not iterable by default, so you usually keep a separate array for ordered lists.

### Enums

Use `enum` for fixed sets of states.

```solidity
enum VotingStatus {
    NotStarted,
    Active,
    Ended
}
```

## Storage, Memory, and Calldata

These keywords control where data lives.

- `storage` points to persistent state
- `memory` creates temporary mutable data
- `calldata` is read-only input for external functions

For the voting app:

- use `storage` when updating candidates
- use `calldata` for incoming names or arrays when possible
- use `memory` for temporary return data or local copies

## Inheritance and Interfaces

Inheritance lets one contract reuse another contract's logic.

Interfaces define function signatures without implementation.

Use them when:

- you want to reuse ownership logic
- you want to describe external contract behavior
- you need cleaner separation between modules

## Libraries

Libraries are reusable code units that help avoid duplication.

They are useful for:

- math helpers
- data formatting
- reusable checks

## Constructors

Constructors run once during deployment.

Use them to:

- set the owner
- initialize candidate data
- define the initial voting status

## `msg.sender`, `msg.value`, and `block.timestamp`

These are common global values.

- `msg.sender` identifies the caller
- `msg.value` is ether sent with the call
- `block.timestamp` is the current block time

Important note:

- `block.timestamp` is useful for approximate deadlines
- it should not be treated as a perfect source of truth for high-stakes time security

## Security Basics

Follow these habits:

- check permissions first
- update state before external calls
- keep external calls minimal
- avoid unbounded loops when possible
- use explicit errors for failure cases

The classic pattern is checks-effects-interactions:

1. Check conditions
2. Update state
3. Interact with external contracts

## Gas Awareness

Every storage write costs gas.

Practical rules:

- keep storage layout simple
- avoid storing data twice
- prefer smaller operations when they are equally clear
- do not optimize before the logic is correct

## How to Think About the Voting Contract

The voting contract will likely need:

- an owner/admin address
- a candidate registry
- a vote tracking map
- a voting open/closed flag
- events for candidate and vote actions

The language features above are enough to build that safely.

## Minimal Pattern Map

- `address public owner` for admin control
- `mapping(address => bool) public hasVoted` for 1 wallet = 1 vote
- `mapping(uint256 => Candidate) public candidates` for candidate storage
- `modifier onlyOwner` for admin-only functions
- `modifier votingOpen` for the voting window
- `event VoteCast(...)` for vote history

## Small Example

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleVote {
    address public owner;
    mapping(address => bool) public hasVoted;
    uint256 public yesVotes;
    uint256 public noVotes;

    error NotOwner();
    error AlreadyVoted();

    event Voted(address indexed voter, bool support);

    constructor() {
        owner = msg.sender;
    }

    function vote(bool support) external {
        if (hasVoted[msg.sender]) revert AlreadyVoted();

        hasVoted[msg.sender] = true;
        if (support) {
            yesVotes += 1;
        } else {
            noVotes += 1;
        }

        emit Voted(msg.sender, support);
    }
}
```

This example shows the main ideas you will reuse in the real voting DApp:

- capture the caller with `msg.sender`
- store the vote in contract state
- block duplicate votes
- emit an event after success
