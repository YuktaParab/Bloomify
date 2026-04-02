import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCDilWpvADdTTfgsiIi7WD2Q03bWIyQ5Dc",
  authDomain: "authentication04-11-2005.firebaseapp.com",
  projectId: "authentication04-11-2005",
  storageBucket: "authentication04-11-2005.firebasestorage.app",
  messagingSenderId: "264838002819",
  appId: "1:264838002819:web:b6d229ee9a0b76779bc3b6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
