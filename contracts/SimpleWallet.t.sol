// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";

import {SimpleWallet} from "./SimpleWallet.sol";

// Tests focus on ownership, deposits, and safe withdrawals.
contract WalletOwner {
    SimpleWallet public wallet;

    // Deploys the wallet with this contract as owner.
    function deployWallet() external {
        wallet = new SimpleWallet();
    }

    // Accepts ETH sent by the wallet during withdrawal.
    receive() external payable {}
}

contract SimpleWalletTest is Test {
    SimpleWallet wallet;
    WalletOwner owner;
    address alice;

    // Deploys a fresh wallet owned by the helper contract.
    function setUp() public {
        owner = new WalletOwner();
        alice = makeAddr("alice");
        owner.deployWallet();
        wallet = owner.wallet();
    }

    // Checks that deployment records the owner correctly.
    function test_ConstructorSetsOwner() public view {
        assertEq(wallet.owner(), address(owner));
    }

    // Checks that deposits increase the wallet balance.
    function test_DepositUpdatesBalanceAndEmitsEvent() public {
        vm.deal(address(this), 1 ether);

        vm.expectEmit(true, false, false, true);
        emit SimpleWallet.Deposited(address(this), 1 ether);

        wallet.deposit{value: 1 ether}();

        assertEq(wallet.balance(), 1 ether);
    }

    // Checks that plain ETH transfers are accepted.
    function test_ReceiveFunctionAcceptsEther() public {
        vm.deal(address(this), 1 ether);

        (bool success, ) = address(wallet).call{value: 1 ether}("");
        assertTrue(success);
        assertEq(wallet.balance(), 1 ether);
    }

    // Prevents non-owners from withdrawing funds.
    function test_NonOwnerCannotWithdraw() public {
        vm.deal(address(this), 1 ether);
        wallet.deposit{value: 1 ether}();

        vm.prank(alice);
        vm.expectRevert(SimpleWallet.NotOwner.selector);
        wallet.withdraw(0.5 ether);
    }

    // Lets the owner withdraw funds to the owner address.
    function test_OwnerCanWithdraw() public {
        vm.deal(address(this), 1 ether);
        wallet.deposit{value: 1 ether}();

        uint256 beforeBalance = address(owner).balance;

        vm.prank(address(owner));
        wallet.withdraw(0.4 ether);

        assertEq(wallet.balance(), 0.6 ether);
        assertEq(address(owner).balance, beforeBalance + 0.4 ether);
    }
}
