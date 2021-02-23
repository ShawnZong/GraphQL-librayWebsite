import React, { useState, useEffect } from "react";
// components
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import Login from "./components/Login";

// apollo
import { useApolloClient } from "@apollo/client";

const App = () => {
  const [page, setPage] = useState("authors");
  const [token, setToken] = useState(null);
  const client = useApolloClient();
  // useEffect(() => {
  //   setToken(JSON.parse(window.localStorage.getItem("currentUser")));
  // }, []);
  const logout = async () => {
    setToken(null);
    localStorage.clear();
    client.resetStore();
  };
  if (!token) {
    return (
      <div>
        <div>
          <button onClick={() => setPage("authors")}>authors</button>
          <button onClick={() => setPage("books")}>books</button>
          <button onClick={() => setPage("login")}>login</button>
        </div>

        <Authors show={page === "authors"} />

        <Books show={page === "books"} />

        <Login show={page === "login"} setToken={setToken} />
      </div>
    );
  }
  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        <button onClick={() => setPage("add")}>add book</button>
        <button onClick={logout}>logout</button>
      </div>

      <Authors show={page === "authors"} />

      <Books show={page === "books"} />

      <NewBook show={page === "add"} />
    </div>
  );
};

export default App;
