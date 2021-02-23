import React, { useState } from "react";

// Apollo
import { ALL_BOOKS } from "../queries";
import { useQuery } from "@apollo/client";

const NavGenres = ({ setFilterGenre }) => {
  return (
    <div>
      <button onClick={() => setFilterGenre("")}>all genres</button>
      <button onClick={() => setFilterGenre("test")}>test</button>
      <button onClick={() => setFilterGenre("test1")}>test1</button>
    </div>
  );
};

const Books = (props) => {
  const [filterGenre, setFilterGenre] = useState("");
  const result = useQuery(ALL_BOOKS, { variables: { genre: filterGenre } });

  if (!props.show) {
    return null;
  }

  if (result.loading) {
    return <div>loading...</div>;
  }

  const books = result.data.allBooks;
  return (
    <div>
      <h2>books</h2>
      {filterGenre ? (
        <p>
          in genre <b>{filterGenre}</b>
        </p>
      ) : null}
      <NavGenres setFilterGenre={setFilterGenre} />
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Books;
