import { getAddress, isAddress, zeroAddress } from 'viem'

export const votingAbi = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'AlreadyVoted',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'candidateId',
        type: 'uint256',
      },
    ],
    name: 'CandidateNotFound',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NotOwner',
    type: 'error',
  },
  {
    inputs: [],
    name: 'VotingAlreadyEnded',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'candidateId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'name',
        type: 'string',
      },
    ],
    name: 'CandidateAdded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'voter',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'candidateId',
        type: 'uint256',
      },
    ],
    name: 'Voted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'admin',
        type: 'address',
      },
    ],
    name: 'VotingEnded',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'name',
        type: 'string',
      },
    ],
    name: 'addCandidate',
    outputs: [
      {
        internalType: 'uint256',
        name: 'candidateId',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'candidateCount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'endVoting',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'candidateId',
        type: 'uint256',
      },
    ],
    name: 'getCandidate',
    outputs: [
      {
        components: [
          {
            internalType: 'string',
            name: 'name',
            type: 'string',
          },
          {
            internalType: 'uint256',
            name: 'voteCount',
            type: 'uint256',
          },
        ],
        internalType: 'struct Voting.Candidate',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getCandidates',
    outputs: [
      {
        components: [
          {
            internalType: 'string',
            name: 'name',
            type: 'string',
          },
          {
            internalType: 'uint256',
            name: 'voteCount',
            type: 'uint256',
          },
        ],
        internalType: 'struct Voting.Candidate[]',
        name: 'candidates',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'hasVoted',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'candidateId',
        type: 'uint256',
      },
    ],
    name: 'vote',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'votingEnded',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

const DEFAULT_CHAIN_ID = 31337

const configuredContractAddress = import.meta.env.VITE_CONTRACT_ADDRESS?.trim()
export const contractAddress =
  configuredContractAddress && isAddress(configuredContractAddress)
    ? getAddress(configuredContractAddress)
    : undefined

const configuredChainId = Number(import.meta.env.VITE_CHAIN_ID ?? DEFAULT_CHAIN_ID)
export const requiredChainId =
  Number.isFinite(configuredChainId) && configuredChainId > 0
    ? configuredChainId
    : DEFAULT_CHAIN_ID

export const zeroVotingAddress = zeroAddress

export function formatAddress(address?: string | null) {
  if (!address) {
    return 'Not connected'
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatVoteCount(voteCount: bigint | number | null | undefined) {
  if (voteCount === null || voteCount === undefined) {
    return '0'
  }

  return voteCount.toString()
}

export function formatErrorMessage(error: unknown) {
  if (!error) {
    return null
  }

  if (typeof error === 'object' && error !== null) {
    const maybeError = error as {
      shortMessage?: string
      message?: string
      details?: string
    }

    return (
      maybeError.shortMessage ??
      maybeError.details ??
      maybeError.message ??
      'Unexpected error'
    )
  }

  if (typeof error === 'string') {
    return error
  }

  return 'Unexpected error'
}
