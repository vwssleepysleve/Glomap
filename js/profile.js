import { db } from "./firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

const profilePic = document.getElementById("profile-pic");
const username = document.getElementById("username");
const bio = document.getElementById("bio");
const portfolio = document.getElementById("portfolio");
const ideasList = document.getElementById("ideas-list");
const loader = document.getElementById("loader");
const profileContainer = document.getElementById("profile-container");
const shareProfileBtn = document.getElementById("share-profile-btn");

// Popup container
const popupContainer = document.getElementById("popup-container");
const popupMessage = document.getElementById("popup-message");
const closePopupBtn = document.getElementById("close-popup");

// Function to show custom popup
function showPopup(message, type = "info") {
  popupMessage.textContent = message;
  popupContainer.className = `popup-container ${type}`; // Set popup type for styling
  popupContainer.classList.add("show"); // Show the popup
  setTimeout(() => {
    popupContainer.classList.remove("show"); // Hide after 3 seconds
  }, 3000);
}

// Close popup manually
closePopupBtn.addEventListener("click", () => {
  popupContainer.classList.remove("show");
});

// Get userID from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const userID = urlParams.get("userID");

if (userID) {
  const userRef = doc(db, "users", userID);
  getDoc(userRef).then((docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      
      // Hide the loader and show profile container
      loader.style.display = "none";
      profileContainer.style.display = "block";
      
      profilePic.src = data.profilePic || "default-avatar.png"; // Default image if not provided
      username.textContent = data.userName || "No Username";
      bio.textContent = data.bio || "No bio provided.";
      
      if (data.portfolio) {
        portfolio.href = data.portfolio;
        portfolio.style.display = "block";  // Show if portfolio is provided
        portfolio.textContent = "Visit Portfolio";
      } else {
        portfolio.style.display = "none";  // Hide if no portfolio
      }
      
      ideasList.innerHTML = data.ideas
        ? data.ideas.map((idea) => `<li>${idea}</li>`).join("")
        : "<li>No ideas available.</li>";
    } else {
      showPopup("Profile not found.", "error");
      window.location.href = "index.html";
    }
  }).catch((error) => {
    console.error("Error fetching user data:", error);
    showPopup("An error occurred while loading the profile.", "error");
    window.location.href = "index.html";
  });
} else {
  showPopup("No user specified in URL.", "error");
  window.location.href = "index.html";
}

// Share profile functionality
shareProfileBtn.addEventListener("click", () => {
  const pageUrl = window.location.href; // Get the current page URL

  // Check if the Share API is available
  if (navigator.share) {
    navigator.share({
      title: "Profile Page",
      url: pageUrl
    }).then(() => {
      showPopup("Profile shared successfully!", "success");
    }).catch((error) => {
      console.error("Error sharing the profile:", error);
      showPopup("Error sharing the profile.", "error");
    });
  } else {
    showPopup("Share functionality is not available on this device.", "warning");
  }
});
