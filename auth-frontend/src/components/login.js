import React, { useState } from "react";
import { login, googleLogin, facebookLogin } from "../api/auth";

const Login = ({ setAuth }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    const data = await login(email, password);
    if (data.token) {
      localStorage.setItem("token", data.token);
      setAuth(true);
    } else {
      alert("Login failed: " + data.msg);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Login</button>
      </form>
      <button onClick={googleLogin}>Login with Google</button>
      <button onClick={facebookLogin}>Login with Facebook</button>
    </div>
  );
};

export default Login;
import { Link } from "react-router-dom";

// Inside return() in Login component
<p><Link to="/forgot-password">Forgot Password?</Link></p>