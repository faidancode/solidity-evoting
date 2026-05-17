// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Counter {
    uint256 public value;

    event Incremented(uint256 newValue, address indexed caller);

    function increment() external {
        value += 1;
        emit Incremented(value, msg.sender);
    }

    function getValue() external view returns (uint256) {
        return value;
    }
}
