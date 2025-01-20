// Import Firebase modules
import { auth, db, rtdb } from "./firebase.js";
import { doc, getDoc, query, where, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import { ref, push, onValue, update } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Variables for user and chat
let currentUserID = null; // Current user's unique ID
let selectedChatID = null; // Chat ID for the selected conversation
let receiverProfilePic = null; // Profile picture of the receiver
let receiverUID = null; // Receiver's Firebase UID


// On auth state change
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    alert("Please log in to access messages.");
    window.location.href = "/Glomap/login.html";
    return;
  }

  try {
    // Fetch current user ID from Firestore
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      currentUserID = userDoc.data().uniqueId; // Get logged-in user's unique ID
    } else {
      console.error("Logged-in user data not found.");
      return;
    }

    // Fetch chat details from URL
    const params = new URLSearchParams(window.location.search);
    selectedChatID = params.get("chatID");
    const receiverUserName = params.get("userName");

    if (!selectedChatID || !receiverUserName) {
      console.error("Invalid chat or user details in URL.");
      return;
    }

    // Load receiver's details and log their Firebase UID
    // Inside auth.onAuthStateChanged block
await loadReceiverDetails(receiverUserName);

// Set up profile link redirection after receiverUID is available
setupProfileLink();


    // Load chat messages and mark unseen messages as seen
    loadMessages(selectedChatID);
    setupRealTimeSeenUpdater(selectedChatID);
  } catch (error) {
    console.error("Error during auth state initialization:", error);
  }
});

// Encrypt a message using the respective chat ID as the encryption key
function encryptMessage(message, chatID) {
  try {
    return CryptoJS.AES.encrypt(message, chatID).toString(); // Use chatID as the encryption key
  } catch (error) {
    console.error("Encryption error:", error);
    return null;
  }
}

// Decrypt a message using the respective chat ID as the encryption key
function decryptMessage(encryptedMessage, chatID) {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, chatID);
   return sanitizeHTML(bytes.toString(CryptoJS.enc.Utf8));

  } catch (error) {
    console.error("Decryption error:", error);
    return "Unable to decrypt message";
  }
}

// Fetch receiver details from Firestore
// Fetch receiver details from Firestore
async function loadReceiverDetails(receiverUserName) {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("userName", "==", receiverUserName));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      querySnapshot.forEach((doc) => {
        receiverProfilePic = doc.data().profilePic;
        receiverUID = doc.id; // Get receiver's Firebase UID

        console.log("Receiver UID:", receiverUID); // Log receiver's UID

        // Update header
        document.getElementById("selected-user-name").textContent =
          doc.data().displayName || receiverUserName;
        document.getElementById("selected-user-pic").src =
          receiverProfilePic || "/Glomap/assets/images/profile-pic.jpg";
      });
    } else {
      console.warn("No user found with the username:", receiverUserName);
    }
  } catch (error) {
    console.error("Error fetching receiver details:", error);
  }
}

// Load messages from Firebase Realtime Database
function loadMessages(chatID) {
  const chatMessagesRef = ref(rtdb, `messages/${chatID}`);
  onValue(chatMessagesRef, (snapshot) => {
    const messages = snapshot.val();
    const messagesContainer = document.getElementById("chat-messages");
    messagesContainer.innerHTML = ""; // Clear old messages

    if (messages) {
      let previousTimestamp = null; // To track the last message timestamp

      Object.keys(messages).forEach((msgKey) => {
        const msg = messages[msgKey];
        const messageDiv = document.createElement("div");

        // Decrypt message content
        const decryptedContent = decryptMessage(msg.content, chatID);

        // Convert timestamp to Date object
        const messageDate = new Date(msg.timestamp);
        const formattedDate = messageDate.toLocaleDateString();
        const formattedTime = messageDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        // Compare with the previous timestamp to decide if we need a timestamp divider
        if (
          !previousTimestamp ||
          new Date(previousTimestamp).toDateString() !== messageDate.toDateString()
        ) {
          // Add a date divider
          const dateDivider = document.createElement("div");
          dateDivider.classList.add("timestamp-divider");
          dateDivider.textContent = formattedDate === new Date().toLocaleDateString()
            ? "Today"
            : formattedDate;
          messagesContainer.appendChild(dateDivider);
        } else if (
          previousTimestamp &&
          new Date(previousTimestamp).getHours() !== messageDate.getHours()
        ) {
          // Add an hourly divider for the same day
          const hourDivider = document.createElement("div");
          hourDivider.classList.add("timestamp-divider");
          hourDivider.textContent = formattedTime;
          messagesContainer.appendChild(hourDivider);
        }

        // Check if the message is sent or received
        if (msg.senderID === currentUserID) {
          messageDiv.classList.add("message", "sent");
          messageDiv.innerHTML = `
  <div class="message-content">${sanitizeHTML(decryptedContent)}</div>
`;

        } else {
          messageDiv.classList.add("message", "received");
          messageDiv.innerHTML = `
            <img src="${receiverProfilePic || "/Glomap/assets/images/profile-pic.jpg"}" alt="Receiver Profile Pic" class="message-profile-pic">
            <div class="message-content">${decryptedContent}</div>
          `;
        }

        messagesContainer.appendChild(messageDiv);
        previousTimestamp = msg.timestamp; // Update the previous timestamp
      });

      // Auto-scroll to the latest message
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } else {
      console.warn("No messages found in this chat.");
    }
  });
}

// Real-time seen updater
function setupRealTimeSeenUpdater(chatID) {
  const chatMessagesRef = ref(rtdb, `messages/${chatID}`);
  onValue(chatMessagesRef, async (snapshot) => {
    const messages = snapshot.val();

    if (messages) {
      const updates = {}; // Store updates for unseen messages

      for (const msgKey in messages) {
        const msg = messages[msgKey];
        if (msg.receiverID === currentUserID && !msg.seen) {
          // Mark message as seen if the receiver is viewing the chat
          updates[`${msgKey}/seen`] = true;
        }
      }

      // Perform a batch update for unseen messages
      if (Object.keys(updates).length > 0) {
        await update(chatMessagesRef, updates);
        console.log("Real-time seen status updated.");
      }
    }
  });
}

// Send a message
// Send a message
// Ensure DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Select the message input and send button
  const messageInput = document.getElementById("message-input");
  const chatMessages = document.getElementById("chat-messages");
  const chatInput = document.getElementById("chat-input");
  const sendButton = document.getElementById("send-button");

  // Send a message
  sendButton.addEventListener("click", () => {
    const messageContent = messageInput.value.trim();

    // Maximum length for a message
    const MAX_MESSAGE_LENGTH = 500;

    // Validate the message
    if (messageContent === "") {
      showCustomAlert("Message cannot be empty!");
      return;
    }
    if (messageContent.length > MAX_MESSAGE_LENGTH) {
      showCustomAlert(`Message cannot exceed ${MAX_MESSAGE_LENGTH} characters.`);
      return;
    }

    try {
      // Encrypt the message
      const encryptedContent = encryptMessage(messageContent, selectedChatID);

      // Push the message to the database
      const chatMessagesRef = ref(rtdb, `messages/${selectedChatID}`);
      push(chatMessagesRef, {
        senderID: currentUserID,
        receiverID: selectedChatID.replace(currentUserID, "").replace("_", ""),
        content: encryptedContent,
        timestamp: Date.now(),
        seen: false,
      });

      // Clear the input field
      messageInput.value = "";
      messageInput.style.height = "38px";

      // Log success
      console.log("Message sent successfully!");
    } catch (error) {
      console.error("Error sending message:", error);
      showCustomAlert("Failed to send message. Please try again.");
    }
  });

  // Additional event listeners and setup
  messageInput.addEventListener("input", () => {
    const message = messageInput.value;

    // Enforce maximum length
    if (message.length > MAX_MESSAGE_LENGTH) {
      messageInput.value = message.slice(0, MAX_MESSAGE_LENGTH);
      showCustomAlert(`Message cannot exceed ${MAX_MESSAGE_LENGTH} characters.`);
    }

    // Adjust input height
    messageInput.style.height = "38px";
    messageInput.style.height = messageInput.scrollHeight + "px";
    chatMessages.style.marginBottom = chatInput.offsetHeight + "px";
  });

  messageInput.addEventListener("focus", () => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
});

// Ensure the chat messages container scrolls to the bottom when input is focused
messageInput.addEventListener("focus", () => {
  chatMessages.scrollTop = chatMessages.scrollHeight;
});





// Add event listeners to redirect to the receiver's profile
function setupProfileLink() {
  const profilePic = document.getElementById("selected-user-pic");
  const profileName = document.getElementById("selected-user-name");

  if (profilePic && profileName && receiverUID) {
    const profileLink = `/Glomap/profile.html?userID=${receiverUID}`;

    profilePic.addEventListener("click", () => {
      window.location.href = profileLink;
    });

    profileName.addEventListener("click", () => {
      window.location.href = profileLink;
    });
  }
}





function sanitizeHTML(input) {
  const div = document.createElement("div");
  div.innerText = input; // Escapes special characters
  return div.innerHTML;
}









// Function to show a customized alert
function showCustomAlert(message) {
  const alertContainer = document.createElement("div");
  alertContainer.className = "custom-alert";
  alertContainer.innerText = message;

  // Append alert to the body
  document.body.appendChild(alertContainer);

  // Remove alert after 3 seconds
  setTimeout(() => {
    alertContainer.remove();
  }, 3000);
}

// Style for the alert
const alertStyle = document.createElement("style");
alertStyle.innerHTML = `
  .custom-alert {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #f44336;
    color: #fff;
    padding: 10px 20px;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    font-size: 16px;
    animation: fadeIn 0.3s ease;
  }
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
`;
document.head.appendChild(alertStyle);

