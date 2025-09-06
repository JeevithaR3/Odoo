// Modular Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, collection, doc, addDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyAWQIJirF6ap5HOE55yNL_zTiZWTzS-luo",
  authDomain: "ecoswap-4db13.firebaseapp.com",
  projectId: "ecoswap-4db13",
  storageBucket: "ecoswap-4db13.appspot.com",
  messagingSenderId: "184392888367",
  appId: "1:184392888367:web:6986d2bd7bd8c97c9f16da",
  measurementId: "G-X94Q876C3D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let uploadedImages = [];
let currentUser = null;

const form = document.getElementById("itemForm");
const chooseImagesBtn = document.getElementById("chooseImagesBtn");
const itemPhotosInput = document.getElementById("itemPhotos");
const imagePreviewContainer = document.getElementById("imagePreviewContainer");
const finalSubmitBtn = document.getElementById("finalSubmitBtn"); // Make sure you have this button in your HTML

// Listen for user login state
onAuthStateChanged(auth, user => {
  if (user) {
    currentUser = user;
    console.log("User signed in:", user.email);
  } else {
    currentUser = null;
    console.log("No user signed in");
  }
});

// Open file dialog on button click
chooseImagesBtn.addEventListener("click", () => {
  itemPhotosInput.click();
});

// Handle image uploads and previews
itemPhotosInput.addEventListener("change", event => {
  const files = Array.from(event.target.files);
  const errorField = document.getElementById("error-itemPhotos");

  if ((uploadedImages.length + files.length) > 4) {
    errorField.textContent = "You can only upload up to 4 images.";
    return;
  }
  errorField.textContent = "";

  files.forEach(file => {
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = e => {
      const imageId = Date.now() + Math.random();
      uploadedImages.push({ id: imageId, file });

      const preview = document.createElement("div");
      preview.className = "image-preview";
      preview.dataset.id = imageId;

      const img = document.createElement("img");
      img.src = e.target.result;

      const removeBtn = document.createElement("button");
      removeBtn.className = "remove-btn";
      removeBtn.innerHTML = "×";
      removeBtn.onclick = () => removeImage(imageId);

      preview.appendChild(img);
      preview.appendChild(removeBtn);
      imagePreviewContainer.appendChild(preview);
    };
    reader.readAsDataURL(file);
  });

  event.target.value = "";
});

function removeImage(imageId) {
  uploadedImages = uploadedImages.filter(img => img.id !== imageId);
  const imageDiv = document.querySelector(`.image-preview[data-id='${imageId}']`);
  if (imageDiv) imageDiv.remove();
}

// Validate form inputs
function validateForm() {
  let isValid = true;
  document.querySelectorAll(".error").forEach(e => (e.textContent = ""));

  const fields = [
    { id: "category", name: "Category" },
    { id: "itemName", name: "Item Name" },
    { id: "description", name: "Description" },
    { id: "location", name: "Location" },
    { id: "email", name: "Email" },
    { id: "phone", name: "Phone" },
    { id: "itemCondition", name: "Condition" },
    { id: "itemAction", name: "Action" }
  ];

  fields.forEach(field => {
    const input = document.getElementById(field.id);
    const error = document.getElementById(`error-${field.id}`);
    if (!input.value.trim()) {
      error.textContent = `Please enter ${field.name.toLowerCase()}.`;
      isValid = false;
    }
  });

  const email = document.getElementById("email").value.trim();
  const emailError = document.getElementById("error-email");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailPattern.test(email)) {
    emailError.textContent = "Enter a valid email address.";
    isValid = false;
  }

  const phone = document.getElementById("phone").value.trim();
  const phoneError = document.getElementById("error-phone");
  const phonePattern = /^\d{10}$/;
  if (phone && !phonePattern.test(phone)) {
    phoneError.textContent = "Enter a valid 10-digit phone number.";
    isValid = false;
  }

  const imgError = document.getElementById("error-itemPhotos");
  if (uploadedImages.length === 0) {
    imgError.textContent = "Please upload at least one image.";
    isValid = false;
  }

  return isValid;
}

// Show review info

// Handle form submission (Step 1: Validate & show review)
form.addEventListener("submit", event => {
  event.preventDefault();
  if (validateForm()) {
    showReview();
  }
});


finalSubmitBtn.addEventListener("click", async () => {
  if (!currentUser) {
    alert("Please log in to submit an item.");
    return;
  }

  finalSubmitBtn.disabled = true;
  finalSubmitBtn.textContent = "Submitting...";

  try {
    const imageCount = uploadedImages.length;

    const itemData = {
      category: document.getElementById("category").value.trim(),
      itemName: document.getElementById("itemName").value.trim(),
      description: document.getElementById("description").value.trim(),
      itemCondition: document.getElementById("itemCondition").value.trim(),
      itemAction: document.getElementById("itemAction").value.trim(),
      location: document.getElementById("location").value.trim(),
      email: document.getElementById("email").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      userId: currentUser.uid,
      imageCount: imageCount,
      createdAt: new Date()
    };

    // Reference to user's postItems collection
    const userDocRef = doc(db, "users", currentUser.uid);
    const postItemsCollectionRef = collection(userDocRef, "postItems");

    // Add the item to user's postItems (auto-generates an ID)
    const newItemDocRef = await addDoc(postItemsCollectionRef, itemData);

    // Update the newly created doc with the postitemId field (the doc ID)
    await setDoc(newItemDocRef, { postitemId: newItemDocRef.id }, { merge: true });

    // Now create/copy to global 'items' collection using same docId and include postitemId field
    const globalItemData = {
      ...itemData,
      postitemId: newItemDocRef.id,  // Include this field here too if you want
      docId: newItemDocRef.id,
    };

    const globalItemRef = doc(db, "items", newItemDocRef.id);
    await setDoc(globalItemRef, globalItemData);

    alert("Item submitted successfully!");
    window.location.href = "newitem.html";
    form.reset();
    uploadedImages = [];
    imagePreviewContainer.innerHTML = "";

  } catch (error) {
    console.error("Error submitting item:", error);
    alert("Failed to submit item. Try again later.");
  }

  finalSubmitBtn.disabled = false;
  finalSubmitBtn.textContent = "Confirm & Submit";
});
//newitem.js