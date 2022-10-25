// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDuLk51Q8RLXxujeWkpGT3ZoH6T4iz2yC4",
  authDomain: "jasontest-306a4.firebaseapp.com",
  projectId: "jasontest-306a4",
  storageBucket: "jasontest-306a4.appspot.com",
  messagingSenderId: "869870501679",
  appId: "1:869870501679:web:efcb865f14c5a0b2326bda",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const database = getFirestore(app);
