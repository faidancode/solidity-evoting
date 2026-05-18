// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";

import {Voting} from "./Voting.sol";

// Tests cover access control, one-wallet-one-vote, events, and read helpers.
contract VotingTest is Test {
    Voting voting;
    address alice;
    address bob;
    address voter;

    // Deploys a fresh voting contract for each test.
    function setUp() public {
        voting = new Voting();
        alice = makeAddr("alice");
        bob = makeAddr("bob");
        voter = makeAddr("voter");
    }

    // Checks that the deployer can add a candidate and emits the expected event.
    function test_OwnerCanAddCandidateAndEmitEvent() public {
        vm.expectEmit(true, false, false, true);
        emit Voting.CandidateAdded(0, "Alice");

        uint256 candidateId = voting.addCandidate("Alice");

        assertEq(candidateId, 0);
        assertEq(voting.candidateCount(), 1);

        Voting.Candidate memory candidate = voting.getCandidate(candidateId);
        assertEq(candidate.name, "Alice");
        assertEq(candidate.voteCount, 0);
    }

    // Rejects candidate creation from non-owners.
    function test_NonOwnerCannotAddCandidate() public {
        vm.prank(alice);
        vm.expectRevert(Voting.NotOwner.selector);
        voting.addCandidate("Alice");
    }

    // Lets a wallet vote once and records the result on-chain.
    function test_UserCanVoteAndEmitEvent() public {
        voting.addCandidate("Alice");

        vm.expectEmit(true, true, false, false);
        emit Voting.Voted(voter, 0);

        vm.prank(voter);
        voting.vote(0);

        assertTrue(voting.hasVoted(voter));

        Voting.Candidate memory candidate = voting.getCandidate(0);
        assertEq(candidate.voteCount, 1);
    }

    // Prevents the same wallet from voting twice.
    function test_UserCannotVoteTwice() public {
        voting.addCandidate("Alice");

        vm.prank(voter);
        voting.vote(0);

        vm.prank(voter);
        vm.expectRevert(Voting.AlreadyVoted.selector);
        voting.vote(0);
    }

    // Lets the owner end voting and prevents future votes.
    function test_OwnerCanEndVotingAndPreventFutureVotes() public {
        voting.addCandidate("Alice");

        vm.expectEmit(true, false, false, false);
        emit Voting.VotingEnded(address(this));

        voting.endVoting();

        assertTrue(voting.votingEnded());

        vm.prank(voter);
        vm.expectRevert(Voting.VotingAlreadyEnded.selector);
        voting.vote(0);
    }

    // Rejects voting after the admin closes voting.
    function test_CannotVoteIfVotingEnded() public {
        voting.addCandidate("Alice");
        voting.endVoting();

        vm.prank(voter);
        vm.expectRevert(Voting.VotingAlreadyEnded.selector);
        voting.vote(0);
    }

    // Rejects closing voting from non-owners.
    function test_NonOwnerCannotEndVoting() public {
        vm.prank(alice);
        vm.expectRevert(Voting.NotOwner.selector);
        voting.endVoting();
    }

    // Returns the full candidate list with stored vote counts.
    function test_GetCandidatesReturnsExpectedData() public {
        voting.addCandidate("Alice");
        voting.addCandidate("Bob");

        vm.prank(voter);
        voting.vote(1);

        Voting.Candidate[] memory candidates = voting.getCandidates();

        assertEq(candidates.length, 2);
        assertEq(candidates[0].name, "Alice");
        assertEq(candidates[0].voteCount, 0);
        assertEq(candidates[1].name, "Bob");
        assertEq(candidates[1].voteCount, 1);
    }
}
