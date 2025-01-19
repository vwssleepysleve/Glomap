// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-storage.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js"; // Realtime DB

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAC2a5SqnPLDFp-sUC7qZVCtihzoG6Wb7o",
  authDomain: "inert-app.firebaseapp.com",
  projectId: "inert-app",
  storageBucket: "inert-app.appspot.com",
  messagingSenderId: "760213891256",
  appId: "1:760213891256:web:468215fbd38b9f499b6c4d",
  measurementId: "G-7PKDN1NTY7",
  databaseURL: "https://inert-app-default-rtdb.asia-southeast1.firebasedatabase.app", // Corrected URL
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const rtdb = getDatabase(app); // Initialize Realtime Database
const provider = new GoogleAuthProvider();

// Export services
export { auth, db, storage, rtdb, provider };
