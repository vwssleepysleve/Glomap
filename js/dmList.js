import { auth, db, rtdb } from "./firebase.js";
import {
  collection,
  getDocs,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import {
  ref,
  onValue,
  query,
  orderByChild,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

let currentUserID = null;

// Fetch the current user ID
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    alert("Please log in to access messages.");
    window.location.href = "/Glomap/login.html";
    return;
  }

  const userRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userRef);
  if (userDoc.exists()) {
    currentUserID = userDoc.data().uniqueId;
    console.log("Current User ID:", currentUserID); // Debugging log
    loadUserList(); // Load all users and sort by last conversation time
  } else {
    window.location.href = "/Glomap/profile-setup.html"; // Redirect to profile setup if the user does not exist
  }
});

// Load user list sorted by last conversation time
async function loadUserList() {
  const userList = document.getElementById("dm-users");
  userList.innerHTML = ""; // Clear the user list

  if (!currentUserID) return;

  try {
    const usersSnapshot = await getDocs(collection(db, "users"));
    const userConversations = [];

    // Fetch all users and last conversation times
    const promises = usersSnapshot.docs.map(async (doc) => {
      const user = doc.data();
      if (user.uniqueId === currentUserID) return null; // Skip the current user

      const chatID =
        currentUserID < user.uniqueId
          ? `${currentUserID}_${user.uniqueId}`
          : `${user.uniqueId}_${currentUserID}`;
      const chatRef = ref(rtdb, `messages/${chatID}/lastMessageTime`);

      return new Promise((resolve) => {
        onValue(chatRef, (snapshot) => {
          const lastMessageTime = snapshot.exists() ? snapshot.val() : null;
          resolve({
            user,
            lastMessageTime,
          });
        });
      });
    });

    const results = await Promise.all(promises);
    results
      .filter(Boolean)
      .sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0))
      .forEach(({ user }) => updateUserList(user));
  } catch (error) {
    console.error("Error loading user list:", error);
  }
}

// Update user list
function updateUserList(user) {
  const userList = document.getElementById("dm-users");

  let li = document.querySelector(`li[data-user-id="${user.uniqueId}"]`);
  if (!li) {
    li = document.createElement("li");
    li.setAttribute("data-user-id", user.uniqueId);

    const isVerified = user.isVerified; // Assuming 'isVerified' field in user document

    li.innerHTML = `
      <img src="${user.profilePic || "/Glomap/assets/images/profile-pic.jpg"}" class="user-avatar" alt="${user.userName}">
      <div class="user-info">
        <span class="user-name">${user.userName}</span>
        <span class="user-id">${user.userID}</span>
        ${isVerified ? '<i class="bi bi-patch-check-fill text-primary"></i>' : ""}
      </div>
    `;
    li.addEventListener("click", () => openChat(user));
    userList.appendChild(li);
  }
}

// Search functionality
const searchBar = document.getElementById("search-bar");
const searchResults = document.getElementById("search-results");
const closeButton = document.getElementById("close-search");

searchBar.addEventListener("input", async (e) => {
  const queryText = e.target.value.toLowerCase();
  searchResults.innerHTML = ""; // Clear previous search results

  // Hide the search results and close button if input is empty
  if (queryText === "") {
    searchResults.style.display = "none";
    closeButton.style.display = "none";
    return;
  }

  // Show the search results and close button
  searchResults.style.display = "block";
  closeButton.style.display = "block";

  const usersSnapshot = await getDocs(collection(db, "users"));

  usersSnapshot.forEach((doc) => {
    const user = doc.data();

    // Filter users based on the search input
    if (
      user.userID.toLowerCase().includes(queryText) ||
      user.userName.toLowerCase().includes(queryText)
    ) {
      const li = document.createElement("li");

      const isVerified = user.isVerified; // Assuming 'isVerified' field in user document

      li.innerHTML = `
        <img src="${user.profilePic || "/Glomap/assets/images/profile-pic.jpg"}" class="search-avatar" alt="${user.userName}">
        <div class="search-info">
          <span class="search-name">${user.userName}</span>
          <span class="search-id">${user.userID}</span>
          ${isVerified ? '<i class="bi bi-patch-check-fill text-primary"></i>' : ""}
        </div>
      `;

      li.addEventListener("click", () => openChat(user));
      searchResults.appendChild(li);
    }
  });
});

// Close search results
closeButton.addEventListener("click", () => {
  searchBar.value = ""; // Clear search bar
  searchResults.innerHTML = ""; // Clear search results
  searchResults.style.display = "none"; // Hide search results
  closeButton.style.display = "none"; // Hide the close button
});

// Open chat
function openChat(user) {
  const chatID =
    currentUserID < user.uniqueId
      ? `${currentUserID}_${user.uniqueId}`
      : `${user.uniqueId}_${currentUserID}`;

  window.location.href = `/Glomap/chat.html?chatID=${chatID}&userName=${user.userName}&profilePic=${
    user.profilePic || "/Glomap/assets/images/profile-pic.jpg"
  }`;
}
