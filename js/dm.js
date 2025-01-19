import { auth, db, rtdb } from "./firebase.js";
import { collection, query, where, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

let currentUserID = null;

// Fetch user details on login
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    alert("Please log in to access messages.");
    window.location.href = "login.html";
    return;
  }

  const userRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userRef);
  if (userDoc.exists()) {
    currentUserID = userDoc.data().uniqueId;
    loadDMList();
  }
});

// Search functionality
document.getElementById("search-bar").addEventListener("input", async (e) => {
  const queryText = e.target.value.toLowerCase();
  const q = query(collection(db, "users"), where("userID", ">=", queryText));
  const querySnapshot = await getDocs(q);

  const results = document.getElementById("search-results");
  results.innerHTML = "";

  querySnapshot.forEach((doc) => {
    const user = doc.data();
    const li = document.createElement("li");
    li.textContent = `${user.userName} (${user.userID})`;
    li.addEventListener("click", () => {
      sessionStorage.setItem("selectedUser", JSON.stringify(user));
      window.location.href = "chat_interface.html";
    });
    results.appendChild(li);
  });
});

// Load DM list
function loadDMList() {
  const dmList = document.getElementById("dm-users");
  dmList.innerHTML = "";

  const userChatsRef = ref(rtdb, `messages`);
  onValue(userChatsRef, (snapshot) => {
    const chats = snapshot.val();
    if (chats) {
      Object.keys(chats).forEach((chatID) => {
        if (chatID.includes(currentUserID)) {
          const otherUserID = chatID.replace(currentUserID, "").replace("_", "");
          getDoc(doc(db, "users", otherUserID)).then((doc) => {
            const user = doc.data();
            const li = document.createElement("li");
            li.textContent = `${user.userName} (${user.userID})`;
            li.addEventListener("click", () => {
              sessionStorage.setItem("selectedUser", JSON.stringify(user));
              window.location.href = "chat_interface.html";
            });
            dmList.appendChild(li);
          });
        }
      });
    }
  });
}
