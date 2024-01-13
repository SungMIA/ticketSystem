// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDXDoFINNoooEMNYMS-4ZqqnQAwtJ_HFXU",
  authDomain: "ticket-system-1cb42.firebaseapp.com",
  projectId: "ticket-system-1cb42",
  storageBucket: "ticket-system-1cb42.appspot.com",
  messagingSenderId: "247562937550",
  appId: "1:247562937550:web:6e50acd59cf2b493011c9f",
  measurementId: "G-1TXK3L9RKD",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

const analytics = getAnalytics(app);
