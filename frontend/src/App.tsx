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

/* SVG Icons for UI Richness */
const LogoIcon = () => (
  <svg className="logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

const WalletIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <line x1="2" x2="22" y1="10" y2="10" />
    <path d="M16 14h.01" />
  </svg>
)

const NetworkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </svg>
)

const ContractIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
)

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

const CheckIcon = () => (
  <svg className="toast-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const AlertIcon = () => (
  <svg className="toast-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

const LoaderIcon = () => (
  <svg className="toast-icon spinner" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
  </svg>
)

const CrownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 4 5 12h14l3-8-7 4-3-6-3 6-7-4z" />
    <path d="M5 20h14a2 2 0 0 0 2-2v-2H3v2a2 2 0 0 0 2 2z" />
  </svg>
)

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
)

const ListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
)

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const EndIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <rect x="9" y="9" width="6" height="6" rx="1" />
  </svg>
)

const VoteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 12 2 2 4-4" />
    <path d="M5 12h.01" />
    <path d="M19 12h.01" />
  </svg>
)

function App() {
  const { address, isConnected, chainId: walletChainId } = useAccount()
  const { connectors, connect, error: connectError } =
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
  const [showSuccessToast, setShowSuccessToast] = useState(false)

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

  /* Determine the current leading candidate(s) to highlight */
  const leadingCandidateIndex = useMemo(() => {
    if (candidates.length === 0) return -1
    let maxVotes = -1n
    let leadingIdx = -1
    candidates.forEach((cand, idx) => {
      if (cand.voteCount > maxVotes) {
        maxVotes = cand.voteCount
        leadingIdx = idx
      }
    })
    if (maxVotes === 0n) return -1
    return leadingIdx
  }, [candidates])

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
      setShowSuccessToast(true)
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
    setShowSuccessToast(false)
    setMessage(`Opening your wallet to ${action}...`)
    setPendingAction(action)

    try {
      const hash = await request()
      setTxHash(hash)
      setMessage(`${formatAction(action)} transaction submitted. waiting for confirmation.`)
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
    <>
      {/* Sticky Premium Navbar */}
      <nav className="app-nav">
        <div className="nav-container">
          <div className="logo-group">
            <LogoIcon />
            <span className="logo-text">DecentraVote</span>
          </div>

          <div className="nav-actions">
            {isConnected ? (
              <button 
                type="button" 
                className="btn-secondary" 
                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                onClick={() => disconnect()}
              >
                Disconnect
              </button>
            ) : null}
          </div>
        </div>
      </nav>

      <main className="app-shell">
        {/* Hero Card */}
        <section className="glass-panel hero-card animate-fade-up" style={{ '--delay': '0.1s' } as React.CSSProperties}>
          <div className="eyebrow">On-chain consensus</div>
          <h1 className="hero-title">Voting Dashboard</h1>
          <p className="hero-copy">
            Secure, transparent, and completely decentralized. Verify voting metrics directly from smart contract storage structures in real time.
          </p>

          <div className="rule-grid" aria-label="Voting rules">
            <div className="rule-pill">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              1 wallet = 1 vote
            </div>
            <div className="rule-pill">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
              Public results
            </div>
            <div className="rule-pill">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="10" r="3"/></svg>
              Admin-managed candidates
            </div>
          </div>
        </section>

        {/* Status Section */}
        <section className="status-grid animate-fade-up" style={{ '--delay': '0.2s' } as React.CSSProperties}>
          <article className="glass-panel status-card">
            <div className="card-label">
              <WalletIcon />
              Wallet Connection
            </div>
            <strong>{isConnected ? formatAddress(address) : 'Not connected'}</strong>
            <p>{isConnected ? `Active Connection: Chain ${walletChainId ?? 'unknown'}` : 'Establish a connection to cast your vote.'}</p>
          </article>

          <article className="glass-panel status-card">
            <div className="card-label">
              <NetworkIcon />
              Voting Network
            </div>
            <strong>{targetChain?.name ?? `Chain ID ${requiredChainId}`}</strong>
            <p>
              {isOnRequiredChain
                ? 'Network validation active.'
                : 'Mismatched active network. Switch chain.'}
            </p>

            {!isOnRequiredChain && isConnected ? (
              <div className="status-action">
                <button
                  type="button"
                  className="btn-mint"
                  style={{ width: '100%', padding: '0.55rem 1rem' }}
                  onClick={requestNetworkSwitch}
                  disabled={isSwitchingChain || !targetChain}
                >
                  {isSwitchingChain ? 'Switching...' : `Switch to ${targetChain?.name}`}
                </button>
              </div>
            ) : null}
          </article>

          <article className="glass-panel status-card">
            <div className="card-label">
              <ContractIcon />
              Smart Contract
            </div>
            <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.92rem' }}>
              {contractAddress ? formatAddress(contractAddress) : 'Unconfigured'}
            </strong>
            <p>
              {isContractConfigured
                ? 'Target verified and initialized.'
                : 'VITE_CONTRACT_ADDRESS environmental tag is absent.'}
            </p>
          </article>
        </section>

        {/* Connect Connectors Panel (only if not connected) */}
        {!isConnected && (
          <section className="glass-panel wallet-strip animate-fade-up" style={{ '--delay': '0.25s' } as React.CSSProperties}>
            <div className="wallet-strip-info">
              <strong>Connect Wallet</strong>
              <p>Select a provider to interface with the voting contract ABI.</p>
            </div>
            <div className="connectors">
              {connectors.map((connector) => (
                <button
                  key={connector.uid}
                  type="button"
                  className="btn-primary"
                  onClick={() => connect({ connector })}
                >
                  Connect {connector.name}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Dashboard Content Grid */}
        <section className="content-grid animate-fade-up" style={{ '--delay': '0.3s' } as React.CSSProperties}>
          
          {/* Candidates / Vote Results Panel */}
          <article className="glass-panel">
            <div className="panel-header">
              <div className="panel-title-group">
                <div className="card-label">Poll Status</div>
                <h2>
                  <ListIcon /> Live Vote Totals
                  <span className="live-indicator">LIVE</span>
                </h2>
              </div>
              <div className="meta-block">
                <span>{candidates.length} Registered Candidates</span>
                <span>{formatVoteCount(totalVotes)} On-Chain Votes</span>
              </div>
            </div>

            {!isContractConfigured ? (
              <div className="empty-state">
                <ContractIcon />
                <p>Verify contract connection by setting <code>VITE_CONTRACT_ADDRESS</code>.</p>
              </div>
            ) : candidatesLoading ? (
              <div className="loading-spinner-container">
                <div className="spinner"></div>
                <p>Accessing on-chain candidate storage...</p>
              </div>
            ) : candidates.length === 0 ? (
              <div className="empty-state">
                <InfoIcon />
                <p>No candidates are registered in this session.</p>
              </div>
            ) : (
              <div className="candidate-list">
                {candidates.map((candidate, index) => {
                  const voteTotal = Number(candidate.voteCount)
                  const share =
                    totalVotesNumber > 0 ? Math.round((voteTotal / totalVotesNumber) * 100) : 0
                  const candidateId = BigInt(index)
                  const isLeading = index === leadingCandidateIndex

                  return (
                    <article 
                      className={`candidate-card ${isLeading ? 'leading-candidate' : ''}`} 
                      key={`${candidate.name}-${index}`}
                    >
                      <div className="candidate-topline">
                        <div className="candidate-info">
                          <h3>{candidate.name}</h3>
                          <p style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            Registry Index #{index}
                            {isLeading && (
                              <span style={{ color: 'var(--accent-mint)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', fontWeight: 600 }}>
                                <CrownIcon /> Leader
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="vote-badge">
                          <div className="vote-count-num">{formatVoteCount(candidate.voteCount)}</div>
                          <div className="vote-count-label">Votes</div>
                        </div>
                      </div>

                      <div className="bar-track" aria-hidden="true">
                        <div className="bar-fill" style={{ width: `${share}%` }} />
                      </div>

                      <div className="candidate-footer">
                        <span className="share-text">{share}% of total votes</span>
                        <button
                          type="button"
                          className={isLeading ? 'btn-mint' : 'btn-primary'}
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
                          {transactionBusy && pendingAction === 'vote' ? (
                            <>
                              <LoaderIcon /> Voting...
                            </>
                          ) : (
                            <>
                              <VoteIcon /> Vote
                            </>
                          )}
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </article>

          {/* Side Info & Admin Actions Panel */}
          <article className="glass-panel">
            <div className="panel-header">
              <div className="panel-title-group">
                <div className="card-label">Governance</div>
                <h2>State & Controls</h2>
              </div>
            </div>

            <div className="stacked-cards">
              <div className="info-card">
                <InfoIcon />
                <div className="info-card-details">
                  <strong>Voting Session State</strong>
                  <p>{votingIsEnded ? 'Closed' : 'Open for consensus'}</p>
                </div>
              </div>

              <div className="info-card">
                <WalletIcon />
                <div className="info-card-details">
                  <strong>Voter Registry Status</strong>
                  <p>
                    {isConnected
                      ? hasCurrentWalletVoted
                        ? 'Wallet has cast vote'
                        : 'Wallet eligible to vote'
                      : 'Connect wallet to view status'}
                  </p>
                </div>
              </div>

              <div className="info-card">
                <ShieldIcon />
                <div className="info-card-details">
                  <strong>Contract Administrator</strong>
                  <p className="mono-address">{ownerAddress ? formatAddress(ownerAddress) : 'Fetching admin...'}</p>
                  <p>{isOwner ? 'Connected wallet is Admin.' : 'Read-only access for current user.'}</p>
                </div>
              </div>
            </div>

            {/* Admin control card */}
            {isOwner && (
              <>
                <div className="admin-section-header">
                  <ShieldIcon />
                  Admin Controls
                </div>

                <div className="admin-actions-card">
                  <form className="candidate-form" onSubmit={handleAddCandidate}>
                    <div className="input-group">
                      <input
                        type="text"
                        value={candidateName}
                        onChange={(event) => setCandidateName(event.target.value)}
                        placeholder="Register new candidate name"
                        disabled={!isContractConfigured || votingIsEnded || transactionBusy}
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn-mint"
                      style={{ width: '100%' }}
                      disabled={
                        !isContractConfigured ||
                        votingIsEnded ||
                        transactionBusy ||
                        candidateName.trim().length === 0
                      }
                    >
                      {transactionBusy && pendingAction === 'add candidate' ? (
                        <>
                          <LoaderIcon /> Adding...
                        </>
                      ) : (
                        <>
                          <PlusIcon /> Add Candidate
                        </>
                      )}
                    </button>
                  </form>

                  <button
                    type="button"
                    className="btn-warning-border"
                    onClick={handleEndVoting}
                    disabled={
                      !isContractConfigured ||
                      votingIsEnded ||
                      transactionBusy
                    }
                  >
                    {transactionBusy && pendingAction === 'end voting' ? (
                      <>
                        <LoaderIcon /> Closing...
                      </>
                    ) : (
                      <>
                        <EndIcon /> Close Voting Session
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </article>
        </section>

        {/* Global Toast Notification System */}
        <div className="toast-container" aria-live="polite">
          {transactionBusy && (
            <div className="toast toast-pending">
              <LoaderIcon />
              <div className="toast-content">
                <span className="toast-title">Transaction Pending</span>
                <span className="toast-message">{message || 'Processing transaction on blockchain...'}</span>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="toast toast-error">
              <AlertIcon />
              <div className="toast-content">
                <span className="toast-title">Transaction Failed</span>
                <span className="toast-message">{errorMessage}</span>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.7rem',
                    marginTop: '0.5rem',
                    alignSelf: 'flex-start',
                    borderRadius: '6px',
                  }}
                  onClick={() => setErrorMessage(null)}
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {showSuccessToast && txHash && (
            <div className="toast toast-success">
              <CheckIcon />
              <div className="toast-content">
                <span className="toast-title">Transaction Confirmed</span>
                <span className="toast-message">{message || 'On-chain verification success.'}</span>
                <span className="toast-tx-hash">{txHash}</span>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.7rem',
                    marginTop: '0.5rem',
                    alignSelf: 'flex-start',
                    borderRadius: '6px',
                  }}
                  onClick={() => setShowSuccessToast(false)}
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}

function formatAction(action: PendingAction) {
  if (!action) {
    return 'action'
  }
  return action
}

export default App
