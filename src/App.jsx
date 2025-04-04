import React, { useEffect, useState } from "react";
import supabase from "./supabase-client";
import "./App.css";
const App = () => {
  const [todoList, setTodoList] = useState([]); // To read my todo list and list them in a component
  const [newTodo, setNewTodo] = useState(""); // To create a new todo list and add it to my List component

  useEffect(() => {
    fetchTodos();
  }, []);
  const fetchTodos = async () => {
    const { data, error } = await supabase.from("TodoList").select("*");
    if (error) {
      console.log("Error fetching data", error);
    } else {
      setTodoList(data);
    }
  };

  const addTodo = async () => {
    if (newTodo.trim() === "") {
      return;
    }
    const newTodoData = {
      name: newTodo,
      isCompleted: false,
    };
    const { data, error } = await supabase
      .from("TodoList")
      .insert([newTodoData])
      /* The `.single()` method in the code snippet is used in conjunction with the `insert` operation
      from Supabase to indicate that only a single record should be returned after the insertion
      operation is completed. This method is used to retrieve a single record from the result of the
      insert operation. */
      .single();

    if (error) {
      console.log("Error adding todo item", error);
    } else {
      setTodoList((prev) => [...prev, data]);
      setNewTodo("");
    }
  };

  const completeTask = async (id, isCompleted) => {
    const { data, error } = await supabase
      .from("TodoList")
      .update({ isCompleted: !isCompleted })
      .eq("id", id);

    if (error) {
      console.log("Error toggling task", error);
    } else {
      const updatedTodoList = todoList.map((todo) =>
        todo.id === id ? { ...todo, isCompleted: !isCompleted } : todo
      );
      setTodoList(updatedTodoList);
    }
  };

  const deleteTask = async (id) => {
    const { error } = await supabase.from("TodoList").delete().eq("id", id);

    if (error) {
      console.log("Error deleting item", error);
    } else {
      setTodoList((prev) => prev.filter((todo) => todo.id !== id));
    }
  };
  return (
    <>
      <span>
        <h1>Todo List</h1>
        <h3>{todoList.length}</h3>
      </span>
      <div className="">
        <input
          type="text"
          value={newTodo}
          placeholder="New Todo..."
          onChange={(e) => setNewTodo(e.target.value)}
        />
        <button onClick={addTodo}>Add Todo Item</button>
      </div>

      <ul>
        {todoList.map((todo) => (
          <li key={todo.id}>
            <p>{todo.name}</p>
            <button onClick={() => completeTask(todo.id, todo.isCompleted)}>
              {todo.isCompleted ? "Undo" : "Complete Task"}
            </button>
            {"     "}
            <button onClick={() => deleteTask(todo.id)}>Delete Task</button>
          </li>
        ))}
      </ul>
    </>
  );
};

export default App;
