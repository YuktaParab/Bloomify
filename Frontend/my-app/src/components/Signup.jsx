import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./Firebase";
import { motion } from "framer-motion";
import { Leaf, Mail, Lock, UserPlus, ArrowLeft } from "lucide-react";
import AnimatedButton from "./ui/AnimatedButton";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();

    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        alert("Signup Successful!");
        navigate("/");
      })
      .catch((error) => {
        alert(error.message);
      });
  };

  return (
    <div className="min-h-screen bg-(--bg) flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-125 h-125 rounded-full bg-(--accent)/10 blur-[120px]" />
      <div className="absolute -bottom-40 -left-40 w-100 h-100 rounded-full bg-(--primary)/10 blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-(--card) border border-(--border) rounded-3xl shadow-xl p-8 md:p-10 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-linear-to-br from-(--primary) to-(--secondary) flex items-center justify-center shadow-lg cursor-pointer"
            onClick={() => navigate("/")}
          >
            <Leaf className="w-8 h-8 text-white" />
          </motion.div>

          <h2 className="text-2xl font-black text-center text-(--text) mb-1">Create Account</h2>
          <p className="text-sm text-center text-(--text-muted) mb-8">Join Bloomify and start growing</p>

          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-(--text-secondary) mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text-muted)" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-(--bg-alt) border border-(--border) text-(--text) text-sm placeholder:text-(--text-muted) focus:outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-(--text-secondary) mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text-muted)" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Choose a strong password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-(--bg-alt) border border-(--border) text-(--text) text-sm placeholder:text-(--text-muted) focus:outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/20 transition-all"
                />
              </div>
            </div>

            <AnimatedButton type="submit" size="lg" className="w-full">
              <UserPlus className="w-4 h-4" /> Create Account
            </AnimatedButton>

            <AnimatedButton variant="ghost" size="md" className="w-full" onClick={() => navigate("/login")}>
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </AnimatedButton>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default Signup;
