import { auth, db } from "./firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

export let currentUserID = null; // Current logged-in user unique ID

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    alert("Please log in to access messages.");
    window.location.href = "login.html";
    return;
  }

  // Fetch user data from Firestore to get the uniqueId
  const userRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userRef);
  if (userDoc.exists()) {
    currentUserID = userDoc.data().uniqueId; // Fetch the uniqueId for the logged-in user
    console.log("User authenticated:", currentUserID);
  }
});
