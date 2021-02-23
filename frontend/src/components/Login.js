import React, { useState, useEffect } from "react";

// Apollo
import { LOGIN } from "../queries";
import { useMutation } from "@apollo/client";

const Login = (props) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [login, result] = useMutation(LOGIN, {
    onError: (error) => console.log(error),
  });
  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value;
      console.log("token ", token);
      props.setToken(token);
      window.localStorage.setItem("currentUser", token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result.data]);

  const submit = async (event) => {
    event.preventDefault();

    login({ variables: { username, password } });
    setUsername("");
    setPassword("");
  };

  if (!props.show) {
    return null;
  }
  return (
    <div>
      <form onSubmit={submit}>
        <div>
          username
          <input
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          password
          <input
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  );
};
export default Login;
