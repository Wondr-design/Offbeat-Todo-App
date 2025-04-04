import React, { useEffect, useState } from "react";
import supabase from "./supabase-client";
import "./App.css";

const App = () => {
  const [todoList, setTodoList] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.from("TodoList").select("*");
      if (error) throw error;
      setTodoList(data);
    } catch (error) {
      setError("Failed to fetch todos");
      console.error("Error fetching data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addTodo = async () => {
    if (newTodo.trim() === "") return;

    setIsLoading(true);
    setError(null);
    try {
      const newTodoData = {
        name: newTodo,
        isCompleted: false,
      };
      const { data, error } = await supabase
        .from("TodoList")
        .insert([newTodoData])
        .select()
        .single();

      if (error) throw error;

      // Update the state with the new todo
      setTodoList((prevTodos) => [...prevTodos, data]);
      setNewTodo("");
    } catch (error) {
      setError("Failed to add todo");
      console.error("Error adding todo item", error);
    } finally {
      setIsLoading(false);
    }
  };

  const completeTask = async (id, isCompleted) => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from("TodoList")
        .update({ isCompleted: !isCompleted })
        .eq("id", id);

      if (error) throw error;
      setTodoList((prev) =>
        prev.map((todo) =>
          todo.id === id ? { ...todo, isCompleted: !isCompleted } : todo
        )
      );
    } catch (error) {
      setError("Failed to update task");
      console.error("Error toggling task", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTask = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.from("TodoList").delete().eq("id", id);
      if (error) throw error;
      setTodoList((prev) => prev.filter((todo) => todo.id !== id));
    } catch (error) {
      setError("Failed to delete task");
      console.error("Error deleting item", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      addTodo();
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-4">Todo List</h1>
      <p className="text-gray-600 mb-4">Total tasks: {todoList.length}</p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          id="new-todo"
          aria-label="New todo item"
          value={newTodo}
          placeholder="New Todo..."
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 p-2 border rounded bg-green-c"
          disabled={isLoading}
          maxLength={100}
        />
        <button
          onClick={addTodo}
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? "Add Todo" : "Add Todo"}
        </button>
      </div>

      {isLoading && todoList.length === 0 ? (
        <p className="text-gray-500">Loading todos...</p>
      ) : todoList.length === 0 ? (
        <p className="text-gray-500">No todos yet. Add your first todo!</p>
      ) : (
        <ul className="space-y-2">
          {todoList.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center justify-between p-3 bg-regal-blue rounded shadow"
            >
              <p
                className={todo.isCompleted ? "line-through text-gray-500" : ""}
              >
                {todo.name}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => completeTask(todo.id, todo.isCompleted)}
                  disabled={isLoading}
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                >
                  {todo.isCompleted ? "Undo" : "Complete"}
                </button>
                <button
                  onClick={() => deleteTask(todo.id)}
                  disabled={isLoading}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default App;
