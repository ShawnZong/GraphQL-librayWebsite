import React, { useState } from "react";

// Apollo
import { useQuery, useMutation } from "@apollo/client";
import { ALL_AUTHORS, EDIT_AUTHOR } from "../queries";

// react-selct
import Select from "react-select";

const Authors = (props) => {
  const [name, setName] = useState("");
  const [born, setBorn] = useState("");

  const result = useQuery(ALL_AUTHORS);
  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  });

  if (!props.show) {
    return null;
  }
  if (result.loading) {
    return <div>loading...</div>;
  }
  const authors = result.data.allAuthors;
  const options = authors.map((author) => {
    return {
      value: author.name,
      label: author.name,
    };
  });
  const setBirthyear = async (event) => {
    event.preventDefault();
    editAuthor({ variables: { name, setBornTo: born } });
    setName("");
    setBorn("");
  };

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Set birthday</h2>
      <form onSubmit={setBirthyear}>
        <div>
          <Select onChange={({ value }) => setName(value)} options={options} />
        </div>
        <div>
          born
          <input
            type="number"
            value={born}
            onChange={({ target }) => setBorn(Number(target.value))}
          />
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  );
};

export default Authors;
