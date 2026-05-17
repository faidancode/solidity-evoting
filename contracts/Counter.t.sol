// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";

import {Counter} from "./Counter.sol";

// Tests cover the happy path, event emission, and revert behavior.
contract CounterTest is Test {
    Counter counter;

    // Deploys a fresh counter for each test.
    function setUp() public {
        counter = new Counter();
    }

    // Checks the default counter value.
    function test_InitialValue() public view {
        assertEq(counter.value(), 0);
        assertEq(counter.getValue(), 0);
    }

    // Verifies increment updates state and emits an event.
    function test_IncrementUpdatesValue() public {
        vm.expectEmit(true, false, false, true);
        emit Counter.Incremented(1, address(this));

        counter.increment();
        assertEq(counter.value(), 1);
        assertEq(counter.getValue(), 1);
    }

    // Verifies decrement updates state and emits an event.
    function test_DecrementUpdatesValue() public {
        counter.increment();

        vm.expectEmit(true, false, false, true);
        emit Counter.Decremented(0, address(this));

        counter.decrement();
        assertEq(counter.value(), 0);
        assertEq(counter.getValue(), 0);
    }

    // Prevents decrementing below zero.
    function test_DecrementRevertsAtZero() public {
        vm.expectRevert(Counter.CounterUnderflow.selector);
        counter.decrement();
    }
}
