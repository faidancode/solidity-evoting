// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";

import {TodoList} from "./TodoList.sol";

// Tests show how todo state changes and custom errors behave.
contract TodoListTest is Test {
    TodoList todoList;

    // Deploys a fresh todo list for each test.
    function setUp() public {
        todoList = new TodoList();
    }

    // Checks that adding a todo stores the expected data.
    function test_AddTodoStoresDataAndEmitsEvent() public {
        vm.expectEmit(true, false, false, true);
        emit TodoList.TodoAdded(0, "Learn Solidity", address(this));

        uint256 id = todoList.addTodo("Learn Solidity");

        assertEq(id, 0);
        assertEq(todoList.todoCount(), 1);

        TodoList.Todo memory todo = todoList.getTodo(id);
        assertEq(todo.text, "Learn Solidity");
        assertEq(todo.completed, false);
        assertEq(todo.creator, address(this));
    }

    // Checks that toggling flips the completion flag.
    function test_ToggleTodoFlipsCompletedState() public {
        todoList.addTodo("Write tests");

        vm.expectEmit(true, false, false, true);
        emit TodoList.TodoToggled(0, true, address(this));

        todoList.toggleTodo(0);

        TodoList.Todo memory todo = todoList.getTodo(0);
        assertTrue(todo.completed);
    }

    // Rejects empty todo text.
    function test_AddTodoRevertsOnEmptyText() public {
        vm.expectRevert(TodoList.EmptyTodoText.selector);
        todoList.addTodo("");
    }

    // Rejects unknown todo ids.
    function test_GetTodoRevertsWhenIdIsMissing() public {
        vm.expectRevert(abi.encodeWithSelector(TodoList.TodoNotFound.selector, 0));
        todoList.getTodo(0);
    }
}
