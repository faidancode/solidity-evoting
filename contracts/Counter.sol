// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title Counter
/// @notice Minimal counter exercise for state changes, events, and reverts.
contract Counter {
    uint256 public value;

    /// @notice Emitted when the counter increases.
    /// @param newValue The updated counter value.
    /// @param caller The address that called `increment()`.
    event Incremented(uint256 newValue, address indexed caller);

    /// @notice Emitted when the counter decreases.
    /// @param newValue The updated counter value.
    /// @param caller The address that called `decrement()`.
    event Decremented(uint256 newValue, address indexed caller);

    error CounterUnderflow();

    /// @notice Increases the stored counter value by one.
    function increment() external {
        value += 1;
        emit Incremented(value, msg.sender);
    }

    /// @notice Decreases the stored counter value by one.
    function decrement() external {
        if (value == 0) {
            revert CounterUnderflow();
        }

        unchecked {
            value -= 1;
        }

        emit Decremented(value, msg.sender);
    }

    /// @notice Returns the current counter value.
    function getValue() external view returns (uint256) {
        return value;
    }
}
