// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDV2NrpD_G-RwVJJAvDds6LwfVhXpI1XeU",
  authDomain: "mis-gastos-app-7400f.firebaseapp.com",
  projectId: "mis-gastos-app-7400f",
  storageBucket: "mis-gastos-app-7400f.firebasestorage.app",
  messagingSenderId: "319352542884",
  appId: "1:319352542884:web:c24011386eed5bf301b831"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);