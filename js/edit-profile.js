import { auth, db, storage } from "./firebase.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-storage.js";

const form = document.getElementById("edit-profile-form");
const userNameInput = document.getElementById("user-name");
const profilePicInput = document.getElementById("profile-pic");
const profilePicPreview = document.getElementById("profile-pic-preview");
const bioInput = document.getElementById("bio");
const ideasInput = document.getElementById("ideas");
const loader = document.getElementById("loader");
const editProfileContainer = document.getElementById("edit-profile-container");

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    alert("You must be logged in to edit your profile.");
    window.location.href = "/Glomap/login.html";
    return;
  }

  const userRef = doc(db, "users", user.uid);
  const docSnap = await getDoc(userRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    userNameInput.value = data.userName || "";
    bioInput.value = data.bio || "";
    ideasInput.value = data.ideas ? data.ideas.join(", ") : "";

    // Load and display current profile picture
    if (data.profilePic) {
      profilePicPreview.src = data.profilePic;
    } else {
      profilePicPreview.alt = "No profile picture uploaded";
    }
  }

  loader.style.display = "none"; // Hide loader when data is ready
  editProfileContainer.classList.remove("hidden");
  editProfileContainer.classList.add("show");
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = auth.currentUser;
  const userName = userNameInput.value.trim();
  const bio = bioInput.value.trim();
  const ideas = ideasInput.value.trim().split(",").map(item => item.trim());
  let profilePicUrl = null;

  if (profilePicInput.files[0]) {
    const profilePicRef = ref(storage, `profilePics/${user.uid}`);
    const snapshot = await uploadBytes(profilePicRef, profilePicInput.files[0]);
    profilePicUrl = await getDownloadURL(snapshot.ref());
  }

  const userRef = doc(db, "users", user.uid);
  await updateDoc(userRef, {
    userName: userName,
    bio: bio,
    ideas: ideas,
    profilePic: profilePicUrl || null
  });

  alert("Profile updated successfully!");
});
