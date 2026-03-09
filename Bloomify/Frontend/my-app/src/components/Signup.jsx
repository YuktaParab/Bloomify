import { useState } from "react";
import "./Form.css"; 
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

function Signup({ onSignupSuccess, onGoLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  let handlesubmit = (event) => {
    event.preventDefault();

    if (password === confirmPassword) {
      let auth = getAuth();

      createUserWithEmailAndPassword(auth, username, password)
        .then(() => {
          alert("Signup successful!");
          onSignupSuccess(); // ✅ Switch page using App state
        })
        .catch((error) => alert(error.message))
        .finally(() => {
          setUsername("");
          setPassword("");
          setConfirmPassword("");
        });
    } else {
      alert("Passwords don't match");
      return;
    }
  };

  return (
    <div className="container">
      <div className="form-box">
        <h2>Sign Up</h2>

        <form onSubmit={handlesubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit">Sign Up</button>

          <button
            type="button"
            onClick={onGoLogin} // ✅ Go back to Login page
            style={{ marginTop: "10px", backgroundColor: "#6c757d" }}
          >
            Go to Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
