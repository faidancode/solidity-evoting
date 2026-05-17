// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title TodoList
/// @notice Simple todo list exercise for structs, arrays, and custom errors.
contract TodoList {
    struct Todo {
        string text;
        bool completed;
        address creator;
    }

    Todo[] private todos;

    /// @notice Emitted when a todo is created.
    /// @param id The new todo id.
    /// @param text The todo text.
    /// @param creator The address that created the todo.
    event TodoAdded(uint256 indexed id, string text, address indexed creator);

    /// @notice Emitted when a todo is toggled.
    /// @param id The toggled todo id.
    /// @param completed The new completion state.
    /// @param caller The address that toggled the todo.
    event TodoToggled(uint256 indexed id, bool completed, address indexed caller);

    error TodoNotFound(uint256 id);
    error EmptyTodoText();

    /// @notice Adds a new todo item and returns its id.
    function addTodo(string calldata text) external returns (uint256 id) {
        if (bytes(text).length == 0) {
            revert EmptyTodoText();
        }

        todos.push(
            Todo({text: text, completed: false, creator: msg.sender})
        );

        id = todos.length - 1;
        emit TodoAdded(id, text, msg.sender);
    }

    /// @notice Flips the completion status of an existing todo.
    function toggleTodo(uint256 id) external {
        if (id >= todos.length) {
            revert TodoNotFound(id);
        }

        Todo storage todo = todos[id];
        todo.completed = !todo.completed;

        emit TodoToggled(id, todo.completed, msg.sender);
    }

    /// @notice Returns a todo item by id.
    function getTodo(uint256 id) external view returns (Todo memory) {
        if (id >= todos.length) {
            revert TodoNotFound(id);
        }

        return todos[id];
    }

    /// @notice Returns how many todo items exist.
    function todoCount() external view returns (uint256) {
        return todos.length;
    }
}
