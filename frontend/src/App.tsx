import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type { Address, Hex } from 'viem'
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'

import {
  contractAddress,
  formatAddress,
  formatErrorMessage,
  formatVoteCount,
  requiredChainId,
  votingAbi,
  zeroVotingAddress,
} from './voting'

type Candidate = {
  name: string
  voteCount: bigint
}

type PendingAction = 'vote' | 'add candidate' | 'end voting' | null

function App() {
  const { address, isConnected, chainId: walletChainId } = useAccount()
  const { connectors, connect, error: connectError, status: connectStatus } =
    useConnect()
  const { disconnect } = useDisconnect()
  const { chains, switchChain, isPending: isSwitchingChain } = useSwitchChain()
  const { writeContractAsync, isPending: isWriting } = useWriteContract()
  const votingChainId = requiredChainId as 1 | 31337 | 11155111

  const [candidateName, setCandidateName] = useState('')
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)
  const [txHash, setTxHash] = useState<Hex | undefined>()
  const [message, setMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const isContractConfigured = Boolean(contractAddress)
  const isOnRequiredChain = walletChainId === requiredChainId
  const targetChain = chains.find((chain) => chain.id === requiredChainId)

  const {
    data: candidateRows,
    error: candidatesError,
    isLoading: candidatesLoading,
    refetch: refetchCandidates,
  } = useReadContract({
    address: contractAddress ?? zeroVotingAddress,
    abi: votingAbi,
    functionName: 'getCandidates',
    chainId: votingChainId,
    query: {
      enabled: isContractConfigured,
    },
  })

  const {
    data: ownerAddress,
    refetch: refetchOwner,
  } = useReadContract({
    address: contractAddress ?? zeroVotingAddress,
    abi: votingAbi,
    functionName: 'owner',
    chainId: votingChainId,
    query: {
      enabled: isContractConfigured,
    },
  })

  const {
    data: votingEnded,
    refetch: refetchVotingEnded,
  } = useReadContract({
    address: contractAddress ?? zeroVotingAddress,
    abi: votingAbi,
    functionName: 'votingEnded',
    chainId: votingChainId,
    query: {
      enabled: isContractConfigured,
    },
  })

  const {
    data: hasVoted,
    refetch: refetchHasVoted,
  } = useReadContract({
    address: contractAddress ?? zeroVotingAddress,
    abi: votingAbi,
    functionName: 'hasVoted',
    args: [address ?? zeroVotingAddress],
    chainId: votingChainId,
    query: {
      enabled: isContractConfigured && Boolean(address),
    },
  })

  const {
    isLoading: isWaitingForReceipt,
    isSuccess: receiptSucceeded,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
    query: {
      enabled: Boolean(txHash),
    },
  })

  const candidates = useMemo<Candidate[]>(() => {
    return (candidateRows ?? []).map((candidate) => ({
      name: candidate.name,
      voteCount: candidate.voteCount,
    }))
  }, [candidateRows])

  const totalVotes = useMemo(() => {
    return candidates.reduce((sum, candidate) => sum + candidate.voteCount, 0n)
  }, [candidates])

  const isOwner =
    Boolean(ownerAddress) &&
    Boolean(address) &&
    ownerAddress?.toLowerCase() === address?.toLowerCase()

  const votingIsEnded = Boolean(votingEnded)
  const hasCurrentWalletVoted = Boolean(hasVoted)
  const transactionBusy = isWriting || isWaitingForReceipt

  useEffect(() => {
    if (!receiptSucceeded) {
      return
    }

    void Promise.all([
      refetchCandidates(),
      refetchOwner(),
      refetchVotingEnded(),
      refetchHasVoted(),
    ])

    if (pendingAction) {
      setMessage(`${formatAction(pendingAction)} confirmed on chain.`)
    }

    setPendingAction(null)
    setCandidateName('')
  }, [
    pendingAction,
    receiptSucceeded,
    refetchCandidates,
    refetchHasVoted,
    refetchOwner,
    refetchVotingEnded,
  ])

  useEffect(() => {
    if (candidatesError) {
      setErrorMessage(formatErrorMessage(candidatesError))
    }
  }, [candidatesError])

  useEffect(() => {
    if (receiptError) {
      setErrorMessage(formatErrorMessage(receiptError))
    }
  }, [receiptError])

  useEffect(() => {
    if (connectError) {
      setErrorMessage(formatErrorMessage(connectError))
    }
  }, [connectError])

  async function submitTransaction(
    action: PendingAction,
    request: () => Promise<Hex>,
  ) {
    if (!contractAddress) {
      setErrorMessage('Set VITE_CONTRACT_ADDRESS before using the dashboard.')
      return
    }

    if (!isConnected) {
      setErrorMessage('Connect a wallet first.')
      return
    }

    if (!isOnRequiredChain) {
      setErrorMessage(
        `Switch to ${
          targetChain?.name ?? `chain ${requiredChainId}`
        } before submitting a transaction.`,
      )
      return
    }

    setErrorMessage(null)
    setMessage(`Opening the wallet to ${action}...`)
    setPendingAction(action)

    try {
      const hash = await request()
      setTxHash(hash)
      setMessage(`${formatAction(action)} submitted. Waiting for confirmation.`)
    } catch (error) {
      setPendingAction(null)
      setTxHash(undefined)
      setErrorMessage(formatErrorMessage(error))
      setMessage(null)
    }
  }

  async function handleVote(candidateId: bigint) {
    await submitTransaction('vote', () =>
      writeContractAsync({
        address: contractAddress as Address,
        abi: votingAbi,
        functionName: 'vote',
        args: [candidateId],
      }),
    )
  }

  async function handleAddCandidate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedName = candidateName.trim()

    if (!trimmedName) {
      setErrorMessage('Enter a candidate name.')
      return
    }

    await submitTransaction('add candidate', () =>
      writeContractAsync({
        address: contractAddress as Address,
        abi: votingAbi,
        functionName: 'addCandidate',
        args: [trimmedName],
      }),
    )
  }

  async function handleEndVoting() {
    await submitTransaction('end voting', () =>
      writeContractAsync({
        address: contractAddress as Address,
        abi: votingAbi,
        functionName: 'endVoting',
      }),
    )
  }

  function requestNetworkSwitch() {
    if (!targetChain) {
      return
    }

    switchChain({ chainId: targetChain.id })
  }

  const totalVotesNumber = Number(totalVotes)

  return (
    <main className="app-shell">
      <section className="hero-card">
        <div className="eyebrow">Week 3 React and Wagmi Integration</div>
        <h1>Voting dashboard</h1>
        <p className="hero-copy">
          Read public results from the Voting contract, connect a wallet, and
          vote with on-chain feedback.
        </p>

        <div className="rule-grid" aria-label="Voting rules">
          <div className="rule-pill">1 wallet = 1 vote</div>
          <div className="rule-pill">Public results</div>
          <div className="rule-pill">Admin-managed candidates</div>
        </div>
      </section>

      <section className="status-grid">
        <article className="status-card">
          <div className="card-label">Wallet</div>
          <strong>{isConnected ? formatAddress(address) : 'Not connected'}</strong>
          <p>{isConnected ? `Chain ${walletChainId ?? 'unknown'}` : 'Connect to vote.'}</p>

          <div className="button-row">
            {isConnected ? (
              <button type="button" className="secondary-button" onClick={() => disconnect()}>
                Disconnect
              </button>
            ) : null}
          </div>
        </article>

        <article className="status-card">
          <div className="card-label">Network</div>
          <strong>{targetChain?.name ?? `Chain ${requiredChainId}`}</strong>
          <p>
            {isOnRequiredChain
              ? 'Connected to the configured voting network.'
              : 'Switch networks before sending a transaction.'}
          </p>

          <div className="button-row">
            {!isOnRequiredChain ? (
              <button
                type="button"
                onClick={requestNetworkSwitch}
                disabled={!isConnected || isSwitchingChain || !targetChain}
              >
                {isSwitchingChain ? 'Switching...' : `Switch to ${targetChain?.name ?? requiredChainId}`}
              </button>
            ) : null}
          </div>
        </article>

        <article className="status-card">
          <div className="card-label">Contract</div>
          <strong>{contractAddress ?? 'Unset'}</strong>
          <p>
            {isContractConfigured
              ? 'Frontend is connected to the contract ABI.'
              : 'Set VITE_CONTRACT_ADDRESS to enable reads and writes.'}
          </p>
        </article>
      </section>

      <section className="wallet-strip">
        <div>
          <div className="card-label">Connection status</div>
          <strong>{connectStatus}</strong>
          <p>
            {isContractConfigured
              ? 'Public data still loads even before connecting a wallet.'
              : 'Configure the contract address first.'}
          </p>
        </div>

        <div className="connectors">
          {connectors.map((connector) => (
            <button
              key={connector.uid}
              type="button"
              onClick={() => connect({ connector })}
            >
              {connector.name}
            </button>
          ))}
        </div>
      </section>

      <section className="content-grid">
        <article className="panel">
          <div className="panel-header">
            <div>
              <div className="card-label">Results</div>
              <h2>Live vote totals</h2>
            </div>
            <div className="meta-block">
              <span>{candidates.length} candidates</span>
              <span>{formatVoteCount(totalVotes)} total votes</span>
            </div>
          </div>

          {!isContractConfigured ? (
            <div className="empty-state">
              Set `VITE_CONTRACT_ADDRESS` to load candidates from the chain.
            </div>
          ) : candidatesLoading ? (
            <div className="empty-state">Loading candidates from the blockchain...</div>
          ) : candidates.length === 0 ? (
            <div className="empty-state">No candidates have been added yet.</div>
          ) : (
            <div className="candidate-list">
              {candidates.map((candidate, index) => {
                const voteTotal = Number(candidate.voteCount)
                const share =
                  totalVotesNumber > 0 ? Math.round((voteTotal / totalVotesNumber) * 100) : 0
                const candidateId = BigInt(index)

                return (
                  <article className="candidate-card" key={`${candidate.name}-${index}`}>
                    <div className="candidate-topline">
                      <div>
                        <h3>{candidate.name}</h3>
                        <p>Candidate #{index}</p>
                      </div>
                      <div className="vote-count">{formatVoteCount(candidate.voteCount)}</div>
                    </div>

                    <div className="bar-track" aria-hidden="true">
                      <div className="bar-fill" style={{ width: `${share}%` }} />
                    </div>

                    <div className="candidate-footer">
                      <span>{share}% of recorded votes</span>
                      <button
                        type="button"
                        onClick={() => handleVote(candidateId)}
                        disabled={
                          !isContractConfigured ||
                          !isConnected ||
                          !isOnRequiredChain ||
                          votingIsEnded ||
                          hasCurrentWalletVoted ||
                          transactionBusy
                        }
                      >
                        {transactionBusy && pendingAction === 'vote'
                          ? 'Voting...'
                          : 'Vote'}
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <div className="card-label">Vote State</div>
              <h2>Wallet and admin status</h2>
            </div>
          </div>

          <div className="stacked-cards">
            <div className="info-card">
              <strong>Voting</strong>
              <p>{votingIsEnded ? 'Voting has ended.' : 'Voting is open.'}</p>
            </div>

            <div className="info-card">
              <strong>Your wallet</strong>
              <p>
                {isConnected
                  ? hasCurrentWalletVoted
                    ? 'This wallet has already voted.'
                    : 'This wallet has not voted yet.'
                  : 'Connect a wallet to read your vote status.'}
              </p>
            </div>

            <div className="info-card">
              <strong>Admin</strong>
              <p>{ownerAddress ? formatAddress(ownerAddress) : 'Loading owner...'}</p>
              <p>{isOwner ? 'Connected wallet is the admin.' : 'Only the owner can add candidates.'}</p>
            </div>
          </div>

          <div className="admin-panel">
            <div className="card-label">Admin actions</div>
            <form className="candidate-form" onSubmit={handleAddCandidate}>
              <input
                type="text"
                value={candidateName}
                onChange={(event) => setCandidateName(event.target.value)}
                placeholder="Candidate name"
                disabled={!isOwner || !isContractConfigured || votingIsEnded || transactionBusy}
              />
              <button
                type="submit"
                disabled={
                  !isOwner ||
                  !isContractConfigured ||
                  votingIsEnded ||
                  transactionBusy ||
                  candidateName.trim().length === 0
                }
              >
                {transactionBusy && pendingAction === 'add candidate'
                  ? 'Adding...'
                  : 'Add candidate'}
              </button>
            </form>

            <button
              type="button"
              className="secondary-button"
              onClick={handleEndVoting}
              disabled={
                !isOwner ||
                !isContractConfigured ||
                votingIsEnded ||
                transactionBusy
              }
            >
              {transactionBusy && pendingAction === 'end voting'
                ? 'Ending voting...'
                : 'End voting'}
            </button>
          </div>
        </article>
      </section>

      {(message || errorMessage) && (
        <section className="feedback-panel" aria-live="polite">
          {message ? <p className="success-message">{message}</p> : null}
          {errorMessage ? <p className="error-message">{errorMessage}</p> : null}
        </section>
      )}

      {receiptSucceeded && txHash ? (
        <section className="feedback-panel">
          <p className="success-message">Transaction confirmed.</p>
          <p className="muted-copy">{txHash}</p>
        </section>
      ) : null}

      {candidatesError ? (
        <section className="feedback-panel">
          <p className="error-message">{formatErrorMessage(candidatesError)}</p>
        </section>
      ) : null}
    </main>
  )
}

function formatAction(action: PendingAction) {
  if (!action) {
    return 'Action'
  }

  return action.charAt(0).toUpperCase() + action.slice(1)
}

export default App
