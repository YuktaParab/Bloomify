import { useState } from "react";
import "./Form.css";  
import { sendPasswordResetEmail } from "firebase/auth";  
import { auth } from "../Firebase";

function ForgotPassword({ onBackToLogin }) {
  const [email, setEmail] = useState("");  

  let handleClick = () => {
    sendPasswordResetEmail(auth, email)
      .then(() => {
        alert("Email sent successfully");
        onBackToLogin(); // ✅ Replace navigation
      })
      .catch((error) => {
        alert(error.message);
      })
      .finally(() => {
        setEmail("");
      });
  };

  return (
    <div className="container">
      <div className="form-box">
        <h2>Forgot Password</h2>

        <div className="form-group">
          <label>Username (Email)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
          />
        </div>

        <button onClick={handleClick}>
          Send Reset Email
        </button>
      </div>
    </div>
  );
}

export default ForgotPassword;
