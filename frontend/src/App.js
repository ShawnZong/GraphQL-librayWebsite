import React, { useState } from "react";
// components
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import Login from "./components/Login";
import RecommendBooks from "./components/RecommendBooks";

// apollo
import { useApolloClient } from "@apollo/client";

const App = () => {
  const [page, setPage] = useState("authors");
  const [token, setToken] = useState(localStorage.getItem("currentUser"));
  const client = useApolloClient();

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
        <button onClick={() => setPage("recommend")}>recommend</button>
        <button onClick={logout}>logout</button>
      </div>

      <Authors show={page === "authors"} />

      <Books show={page === "books"} />

      <NewBook show={page === "add"} client={client} />

      <RecommendBooks show={page === "recommend"} />
    </div>
  );
};

export default App;
