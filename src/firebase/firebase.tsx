import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBAbt-fi9v2hrVm3UeGO6mWbs7YHnFN1v4",
  authDomain: "postpulse-6dc00.firebaseapp.com",
  projectId: "postpulse-6dc00",
  storageBucket: "postpulse-6dc00.firebasestorage.app",
  messagingSenderId: "1032194204628",
  appId: "1:1032194204628:web:9439c9b07c87944e8eec41",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
