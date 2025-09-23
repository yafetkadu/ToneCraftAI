// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
//import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-analytics.js";
//import { initializeApp } from "./firebase/firebase-app.js";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCinBCEKcbZQm-ZcmAgmuNne-YV-CDFA-Y",
  authDomain: "tonecraftai.firebaseapp.com",
  projectId: "tonecraftai",
  storageBucket: "tonecraftai.firebasestorage.app",
  messagingSenderId: "542361979930",
  appId: "1:542361979930:web:9602b2e375ff7fd8ca95a3",
  measurementId: "G-PN1D9GZNF4"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
