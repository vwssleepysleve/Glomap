import { auth, db } from "./firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

const profilePic = document.getElementById("profile-pic");
const username = document.getElementById("username");
const bio = document.getElementById("bio");
const portfolio = document.getElementById("portfolio");
const ideasList = document.getElementById("ideas-list");
const shareProfileBtn = document.getElementById("share-profile-btn");
const loader = document.getElementById("loader");
const profileContainer = document.getElementById("profile-container");

// Default profile picture URL
const defaultProfilePic = "/Glomap/assets/images/profile-pic.jpg"; // Replace with the actual path

// Create a new element for displaying the unique user ID
const userIdElement = document.createElement("p");
userIdElement.id = "user-id";

const profileInfo = document.getElementById("profile-info");
profileInfo.insertBefore(userIdElement, username); // Insert user ID above the username

// Create a new element for the verification badge using Bootstrap icons
const verificationBadge = document.createElement("span");
verificationBadge.className = "verification-badge";
verificationBadge.innerHTML = '<i class="bi bi-check-circle-fill"></i>'; // Bootstrap check-circle icon
verificationBadge.style.display = "none"; // Initially hidden
profileInfo.insertBefore(verificationBadge, username); // Insert badge above username

// Function to show loader and hide profile content until data is loaded
function showLoader() {
  loader.style.display = "flex";
    profileContainer.style.display = "none";
    }

    // Function to hide loader and display profile content
    function hideLoader() {
      loader.style.display = "none";
        profileContainer.style.display = "flex";
        }

        // Check auth status
        auth.onAuthStateChanged(async (user) => {
          showLoader(); // Show loader while data is being fetched

            if (user) {
                const userRef = doc(db, "users", user.uid);
                    const docSnap = await getDoc(userRef);

                        if (docSnap.exists()) {
                              const data = docSnap.data();

                                    // Set profile picture
                                          profilePic.src = data.profilePic || defaultProfilePic;

                                                // Set user ID
                                                      userIdElement.textContent = ` @${data.userID || "No User ID"}`;

                                                            // Set username
                                                                  username.textContent = data.userName || "No Username";

                                                                        // Set bio with placeholder if not available
                                                                              bio.textContent = data.bio || "Bio not available.";

                                                                                    // Set portfolio link
                                                                                          if (data.portfolio) {
                                                                                                  portfolio.href = data.portfolio;
                                                                                                          portfolio.textContent = "Visit Portfolio";
                                                                                                                } else {
                                                                                                                        portfolio.textContent = "Portfolio not available.";
                                                                                                                                portfolio.href = "#";
                                                                                                                                      }

                                                                                                                                            // Set ideas list
                                                                                                                                                  ideasList.innerHTML = data.ideas
                                                                                                                                                          ? data.ideas.map((idea) => `<li>${idea}</li>`).join("")
                                                                                                                                                                  : "<li>No ideas available.</li>";

                                                                                                                                                                        // Display verification badge if the user is verified
                                                                                                                                                                              if (data.verified) {
                                                                                                                                                                                      verificationBadge.style.display = "inline-flex"; // Show the badge
                                                                                                                                                                                            } else {
                                                                                                                                                                                                    verificationBadge.style.display = "none"; // Hide the badge
                                                                                                                                                                                                          }

                                                                                                                                                                                                                // Generate shareable profile link
                                                                                                                                                                                                                      shareProfileBtn.addEventListener("click", () => {
                                                                                                                                                                                                                              const profileURL = `${window.location.origin}/Glomap/profile.html?userID=${user.uid}`;

                                                                                                                                                                                                                                      // Check if the Share API is available
                                                                                                                                                                                                                                              if (navigator.share) {
                                                                                                                                                                                                                                                        navigator.share({
                                                                                                                                                                                                                                                                    title: `${data.userName}'s Profile`,
                                                                                                                                                                                                                                                                                url: profileURL
                                                                                                                                                                                                                                                                                          }).then(() => {
                                                                                                                                                                                                                                                                                                      console.log("Profile shared successfully");
                                                                                                                                                                                                                                                                                                                }).catch((error) => {
                                                                                                                                                                                                                                                                                                                            console.error("Error sharing the profile:", error);
                                                                                                                                                                                                                                                                                                                                      });
                                                                                                                                                                                                                                                                                                                                              } else {
                                                                                                                                                                                                                                                                                                                                                        showPopup("Share functionality is not available on this device.");
                                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                                      });

                                                                                                                                                                                                                                                                                                                                                                            hideLoader(); // Hide loader after data is loaded
                                                                                                                                                                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                                                                                                                                                                     showPopup("No profile found. Redirecting to profile setup.");
                                                                                                                                                                                                                                                                                                                                                                                           window.location.href = "/Glomap/profile-setup.html";
                                                                                                                                                                                                                                                                                                                                                                                               }
                                                                                                                                                                                                                                                                                                                                                                                                 } else {
                                                                                                                                                                                                                                                                                                                                                                                                     showPopup("You are not logged in!");
                                                                                                                                                                                                                                                                                                                                                                                                         window.location.href = "/Glomap/login.html";
                                                                                                                                                                                                                                                                                                                                                                                                           }
                                                                                                                                                                                                                                                                                                                                                                                                           });





                                                                                                                                                                                                                                                                                                                                                                                                           // Get Popup Elements
                                                                                                                                                                                                                                                                                                                                                                                                           const popup = document.getElementById("custom-popup");
                                                                                                                                                                                                                                                                                                                                                                                                           const popupMessage = document.getElementById("popup-message");
                                                                                                                                                                                                                                                                                                                                                                                                           const popupCloseBtn = document.getElementById("popup-close-btn");

                                                                                                                                                                                                                                                                                                                                                                                                           // Function to Show Popup
                                                                                                                                                                                                                                                                                                                                                                                                           function showPopup(message) {
                                                                                                                                                                                                                                                                                                                                                                                                             popupMessage.textContent = message;
                                                                                                                                                                                                                                                                                                                                                                                                               popup.classList.remove("hidden");
                                                                                                                                                                                                                                                                                                                                                                                                               }

                                                                                                                                                                                                                                                                                                                                                                                                               // Function to Hide Popup
                                                                                                                                                                                                                                                                                                                                                                                                               function hidePopup() {
                                                                                                                                                                                                                                                                                                                                                                                                                 popup.classList.add("hidden");
                                                                                                                                                                                                                                                                                                                                                                                                                 }

                                                                                                                                                                                                                                                                                                                                                                                                                 // Event Listener for Close Button
                                                                                                                                                                                                                                                                                                                                                                                                                 popupCloseBtn.addEventListener("click", hidePopup);

                                                                                                                                                                                                                                                                                                                                                                                                                 // Example Usage
                                                                                                                                                                                                                                                                                                                                                                                                                 // showPopup("This is a test message."); // Uncomment this line to test
                                                                                                                                                                                                                                                                                                                                                                                                                 