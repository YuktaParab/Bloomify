// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCDilWpvADdTTfgsiIi7WD2Q03bWIyQ5Dc",
  authDomain: "authentication04-11-2005.firebaseapp.com",
  projectId: "authentication04-11-2005",
  storageBucket: "authentication04-11-2005.firebasestorage.app",
  messagingSenderId: "264838002819",
  appId: "1:264838002819:web:b6d229ee9a0b76779bc3b6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ ADD THIS LINE
export const auth = getAuth(app);

export default app;
