import React, { useState } from "react";

// Apollo
import { ADD_BOOK, BOOK_ADDED } from "../queries";
import { useMutation, useSubscription } from "@apollo/client";

const NewBook = (props) => {
  const [title, setTitle] = useState("");
  const [author, setAuhtor] = useState("");
  const [published, setPublished] = useState("");
  const [genre, setGenre] = useState("");
  const [genres, setGenres] = useState([]);

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      window.alert(`${subscriptionData.data.bookAdded.title} added`);
      // console.log(subscriptionData);
    },
  });

  const [addBook, { client }] = useMutation(ADD_BOOK, {
    // refetchQueries: [
    //   { query: ALL_AUTHORS },
    //   { query: ALL_BOOKS, variables: { genre: "" } },
    // ],
    update(cache, result) {
      client.resetStore();
    },
    onError: (error) => console.log(error),
  });

  if (!props.show) {
    return null;
  }

  const submit = async (event) => {
    event.preventDefault();
    addBook({
      variables: {
        title,
        author,
        published,
        genres,
      },
    });

    console.log("add book...");

    setTitle("");
    setPublished("");
    setAuhtor("");
    setGenres([]);
    setGenre("");
  };

  const addGenre = () => {
    setGenres(genres.concat(genre));
    setGenre("");
  };

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuhtor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(Number(target.value))}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(" ")}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  );
};

export default NewBook;
