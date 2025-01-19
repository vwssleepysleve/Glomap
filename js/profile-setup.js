import { auth, db, storage } from "./firebase.js";
import { doc, setDoc, getDoc, query, collection, where, getDocs } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-storage.js";

// Generate a unique ID using the crypto API (more secure and less predictable than UUID)
function generateUniqueId() {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

const form = document.getElementById("profile-setup-form");
const userIdInput = document.getElementById("user-id");
const userNameInput = document.getElementById("user-name");
const profilePicInput = document.getElementById("profile-pic");
const bioInput = document.getElementById("bio");
const portfolioInput = document.getElementById("portfolio");
const ideasInput = document.getElementById("ideas");

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    showAlert("You must be logged in to set up your profile.");
    window.location.href = "/Glomap/login.html";
    return;
  }

  const userRef = doc(db, "users", user.uid);
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    const data = docSnap.data();

    userIdInput.value = data.userID || "";
    userNameInput.value = data.userName || "";
    bioInput.value = data.bio || "";
    portfolioInput.value = data.portfolio || "";
    ideasInput.value = data.ideas ? data.ideas.join(", ") : "";

    // Add verification badge if the user is verified
    const profileHeader = document.getElementById("profile-header");
    if (data.verified) {
      profileHeader.innerHTML += `
        <span class="verification-badge">
          <i class="verification-icon"></i> Verified
        </span>
      `;
    }
  } else {
    showAlert("User profile not found.");
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) {
    showAlert("You must be logged in to save your profile.");
    return;
  }

  const userID = userIdInput.value.trim();
  const userName = userNameInput.value.trim();
  const bio = bioInput.value.trim();
  const portfolio = portfolioInput.value.trim();
  const ideas = ideasInput.value.split(",").map((idea) => idea.trim()).filter(Boolean);

  // **Validation**
  if (!userID || !/^[a-zA-Z0-9_-]{1,15}$/.test(userID)) {
    showAlert("Invalid User ID. It must be less than 15 characters and can only contain letters, numbers, underscores, and hyphens.");
    return;
  }

  if (!userName || userName.length > 20) {
    showAlert("Invalid User Name. It must be less than 20 characters.");
    return;
  }

  // **Check for unique User ID**
  const q = query(collection(db, "users"), where("userID", "==", userID));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    showAlert("User ID is already taken. Please choose a different one.");
    return;
  }

  let profilePicUrl = null;
  if (profilePicInput.files.length > 0) {
    const file = profilePicInput.files[0];
    const storageRef = ref(storage, `profilePics/${user.uid}`);
    await uploadBytes(storageRef, file);
    profilePicUrl = await getDownloadURL(storageRef);
  } else {
    showAlert("Profile picture is required.");
    return;
  }

  // Generate multiple unique IDs using the crypto API
  const uniqueUserId = generateUniqueId(); // Secure random ID generation
  const encryptionKey = generateUniqueId();  // Another unique key for encryption
  const sessionKey = generateUniqueId();     // Unique session key for session management
  const apiKey = generateUniqueId();         // A unique API key for future integration
  const accessKey = generateUniqueId();      // A key to manage future access control

  const userRef = doc(db, "users", user.uid); // Store the user's data with Firebase UID
  await setDoc(userRef, {
    userID,
    userName,
    bio,
    portfolio,
    ideas,
    profilePic: profilePicUrl,
    email: user.email,
    verified: false, // Default to false
    uniqueId: uniqueUserId,
    encryptionKey,
    sessionKey,
    apiKey,
    accessKey,
  });

  showAlert("Profile saved successfully!");
  window.location.href = "/Glomap/myprofile.html";
});

// Custom Modal Functions
// Custom Modal Functions
function showAlert(message) {
  const alertMessage = document.getElementById('alert-message');
  alertMessage.textContent = message;
  document.getElementById('custom-alert').style.display = 'flex';

  // Adding event listener to the OK button to close the modal
  const okButton = document.getElementById('alert-ok');
  if (okButton) {
    okButton.addEventListener('click', closeAlert);
  }
}

function closeAlert() {
  const alertModal = document.getElementById('custom-alert');
  if (alertModal) {
    alertModal.style.display = 'none';
  }
}

function showConfirm(message) {
  const confirmMessage = document.getElementById('confirm-message');
  confirmMessage.textContent = message;
  document.getElementById('custom-confirm').style.display = 'flex';

  // Adding event listener to the OK button to close the modal
  const confirmOkButton = document.getElementById('confirm-ok');
  if (confirmOkButton) {
    confirmOkButton.addEventListener('click', () => closeConfirm(true));
  }

  // Adding event listener to the Cancel button to close the modal without confirmation
  const confirmCancelButton = document.getElementById('confirm-cancel');
  if (confirmCancelButton) {
    confirmCancelButton.addEventListener('click', () => closeConfirm(false));
  }
}

function closeConfirm(confirmed) {
  const confirmModal = document.getElementById('custom-confirm');
  if (confirmModal) {
    confirmModal.style.display = 'none';
  }

  if (confirmed) {
    console.log("Confirmed action!");
  } else {
    console.log("Cancelled action!");
  }
}
