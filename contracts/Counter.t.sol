// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";

import {Counter} from "./Counter.sol";

contract CounterTest is Test {
    Counter counter;

    function setUp() public {
        counter = new Counter();
    }

    function test_InitialValue() public view {
        assertEq(counter.value(), 0);
        assertEq(counter.getValue(), 0);
    }

    function test_IncrementUpdatesValue() public {
        counter.increment();
        assertEq(counter.value(), 1);
        assertEq(counter.getValue(), 1);
    }
}
