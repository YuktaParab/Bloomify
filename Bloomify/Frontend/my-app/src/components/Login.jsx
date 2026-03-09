import React, { useState } from "react";
import "./Form.css";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase"; // ✅ FIXED import

function Login({ onLoginSuccess, onForgot , onSignup}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // ❌ Removed: const auth = getAuth();

  const handleSubmit = (event) => {
    event.preventDefault();

    signInWithEmailAndPassword(auth, username, password)
      .then(() => {
        alert("Login successful!");
        onLoginSuccess(); // ✅ Switch screen using App state
      })
      .catch((error) => {
        alert("Login failed: " + error.message);
      })
      .finally(() => {
        setUsername("");
        setPassword("");
      });
  };

  return (
    <div className="container">
      <div className="form-box">
        <h2>Login</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email / Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          <button type="submit">Login</button>

          <div className="button-group">
            <button
              type="button"
              onClick={onForgot}
              style={{ backgroundColor: "#ffc107" }}
            >
              Forgot Password
            </button>

            <button
              type="button"
              style={{ backgroundColor: "#28a745" }}
               onClick={onSignup}
            >
              Signup
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
