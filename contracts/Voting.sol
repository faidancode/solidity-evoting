// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title Voting
/// @notice Simple on-chain voting contract with admin-managed candidates.
contract Voting {
    /// @notice Candidate data stored on-chain.
    struct Candidate {
        string name;
        uint256 voteCount;
    }

    address public owner;
    bool public votingEnded;
    mapping(address => bool) public hasVoted;

    Candidate[] private _candidates;

    /// @notice Emitted when a candidate is added.
    /// @param candidateId The new candidate id.
    /// @param name The candidate name.
    event CandidateAdded(uint256 indexed candidateId, string name);

    /// @notice Emitted when a vote is cast.
    /// @param voter The address that voted.
    /// @param candidateId The selected candidate id.
    event Voted(address indexed voter, uint256 indexed candidateId);

    /// @notice Emitted when voting is ended by the admin.
    /// @param admin The address that ended voting.
    event VotingEnded(address indexed admin);

    error NotOwner();
    error VotingAlreadyEnded();
    error AlreadyVoted();
    error CandidateNotFound(uint256 candidateId);

    /// @notice Sets the deployer as the owner.
    constructor() {
        owner = msg.sender;
    }

    /// @dev Restricts a function to the owner.
    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert NotOwner();
        }
        _;
    }

    /// @dev Prevents actions after voting has ended.
    modifier votingOpen() {
        if (votingEnded) {
            revert VotingAlreadyEnded();
        }
        _;
    }

    /// @notice Adds a new candidate and returns its id.
    /// @param name The candidate name.
    function addCandidate(string calldata name)
        external
        onlyOwner
        votingOpen
        returns (uint256 candidateId)
    {
        _candidates.push(
            Candidate({name: name, voteCount: 0})
        );

        candidateId = _candidates.length - 1;
        emit CandidateAdded(candidateId, name);
    }

    /// @notice Casts a vote for a candidate.
    /// @param candidateId The candidate id to vote for.
    function vote(uint256 candidateId) external votingOpen {
        if (hasVoted[msg.sender]) {
            revert AlreadyVoted();
        }

        if (candidateId >= _candidates.length) {
            revert CandidateNotFound(candidateId);
        }

        hasVoted[msg.sender] = true;
        _candidates[candidateId].voteCount += 1;

        emit Voted(msg.sender, candidateId);
    }

    /// @notice Ends voting. Once ended, no more votes or candidate additions are allowed.
    function endVoting() external onlyOwner {
        if (votingEnded) {
            revert VotingAlreadyEnded();
        }

        votingEnded = true;
        emit VotingEnded(msg.sender);
    }

    /// @notice Returns how many candidates exist.
    function candidateCount() external view returns (uint256) {
        return _candidates.length;
    }

    /// @notice Returns a candidate by id.
    /// @param candidateId The candidate id.
    function getCandidate(uint256 candidateId)
        external
        view
        returns (Candidate memory)
    {
        if (candidateId >= _candidates.length) {
            revert CandidateNotFound(candidateId);
        }

        return _candidates[candidateId];
    }

    /// @notice Returns the full candidate list.
    function getCandidates() external view returns (Candidate[] memory candidates) {
        candidates = new Candidate[](_candidates.length);

        for (uint256 i = 0; i < _candidates.length; ++i) {
            candidates[i] = _candidates[i];
        }
    }
}
