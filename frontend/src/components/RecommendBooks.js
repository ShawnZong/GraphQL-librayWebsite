import React, { useEffect, useState } from "react";

// Apollo
import { ALL_BOOKS, ME } from "../queries";
import { useQuery, useLazyQuery } from "@apollo/client";

const RecommendBooks = (props) => {
  const user = useQuery(ME);
  const [getBooks, result] = useLazyQuery(ALL_BOOKS);
  const [books, setBooks] = useState(null);

  useEffect(() => {
    if (user.data) {
      getBooks({ variables: { genre: user.data.me.favoriteGenre } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.loading]);

  useEffect(() => {
    if (result.data) {
      setBooks(result.data.allBooks);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result.loading]);

  if (!props.show) {
    return null;
  }

  if (user.loading || result.loading || books === null) {
    return <div>loading...</div>;
  }

  console.log("user", user.data);
  console.log("result", result.data);
  return (
    <div>
      <h2>Recommendations</h2>
      <p>
        books in your favorite genre <b>{user.data.me.favoriteGenre}</b>
      </p>
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

export default RecommendBooks;
