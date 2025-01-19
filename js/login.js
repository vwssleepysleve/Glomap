// Import Firebase services from the configuration file
import { auth, db, provider } from "/Glomap/js/firebase.js";
import {
  signInWithPopup,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

// Monitor authentication state
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is logged in:", user.displayName);
    checkUserProfile(user);
  } else {
    console.log("No user is logged in.");
  }
});

// Login button reference
const loginButton = document.getElementById("login-btn");

// Handle login with Google
loginButton.addEventListener("click", () => {
  loginButton.disabled = true; // Disable button while processing
  loginButton.textContent = "Logging in..."; // Indicate progress

  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      return signInWithPopup(auth, provider);
    })
    .then((result) => {
      const user = result.user;
      updateUserData(user); // Update Firestore with user data
      checkUserProfile(user); // Check for existing user profile
    })
    .catch((error) => {
      console.error("Login failed:", error.message);
      alert("Login failed. Please try again.");
    })
    .finally(() => {
      loginButton.textContent = "Login with Google"; // Reset button text
      loginButton.disabled = false; // Re-enable button
    });
});

// Check if user profile exists
function checkUserProfile(user) {
  const userDocRef = doc(db, "users", user.uid);
  getDoc(userDocRef)
    .then((docSnap) => {
      if (docSnap.exists()) {
        window.location.href = "/Glomap/myprofile.html"; // Redirect if profile exists
      } else {
        window.location.href = "/Glomap/index.html"; // Redirect to profile setup
      }
    })
    .catch((error) => {
      console.error("Error checking profile:", error.message);
    });
}

// Add or update user data in Firestore
function updateUserData(user) {
  const userDocRef = doc(db, "users", user.uid);
  const userData = {
    name: user.displayName || "Anonymous",
    email: user.email || "No email provided",
    photoURL: user.photoURL || "",
    uid: user.uid,
    lastLogin: new Date().toISOString(),
  };

  setDoc(userDocRef, userData, { merge: true }) // Use merge to avoid overwriting data
    .then(() => {
      console.log("User data updated successfully.");
    })
    .catch((error) => {
      console.error("Error updating user data:", error.message);
    });
}
