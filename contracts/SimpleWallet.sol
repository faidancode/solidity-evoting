// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title SimpleWallet
 * @notice Basic wallet exercise for ownership, deposits, and withdrawals.
 */
contract SimpleWallet {
    address public owner;

    /// @notice Emitted when ETH is deposited.
    /// @param from The deposit sender.
    /// @param amount The amount deposited in wei.
    event Deposited(address indexed from, uint256 amount);

    /// @notice Emitted when the owner withdraws ETH.
    /// @param to The withdrawal recipient.
    /// @param amount The amount withdrawn in wei.
    event Withdrawn(address indexed to, uint256 amount);

    error NotOwner();

    error InvalidAmount();

    error InsufficientBalance();

    error TransferFailed();

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

    /// @notice Accepts plain ETH transfers.
    receive() external payable {
        _deposit();
    }

    /// @notice Deposits ETH through a named function.
    function deposit() external payable {
        _deposit();
    }

    /// @notice Withdraws ETH to the owner.
    /// @param amount The amount to withdraw in wei.
    function withdraw(uint256 amount) external onlyOwner {
        if (amount == 0) {
            revert InvalidAmount();
        }

        if (address(this).balance < amount) {
            revert InsufficientBalance();
        }

        (bool success, ) = payable(owner).call{value: amount}("");
        if (!success) {
            revert TransferFailed();
        }

        emit Withdrawn(owner, amount);
    }

    /// @notice Returns the wallet balance.
    /// @return The contract balance in wei.
    function balance() external view returns (uint256) {
        return address(this).balance;
    }

    /// @dev Shared deposit logic for `receive()` and `deposit()`.
    function _deposit() internal {
        if (msg.value == 0) {
            revert InvalidAmount();
        }

        emit Deposited(msg.sender, msg.value);
    }
}
