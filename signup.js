// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// Firebase config
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

// Handle Sign Up
const signUp = document.getElementById('submit');
signUp.addEventListener('click', async (event) => {
  event.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const location = document.getElementById('location').value.trim();

  if (!name || !email || !password || !location) {
    alert("All fields are required!");
    return;
  }
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userData = {
      userId: user.uid,
      name: name,
      email: email,
      location: location,
      createdAt: new Date()
    };

    await setDoc(doc(db, "users", user.uid), userData);

    alert("Account created successfully!");
    window.location.href = 'login.html'; // redirect to home or login
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      alert("Email already in use. Try logging in.");
    } else {
      alert("Signup failed: " + error.message);
      console.error("Signup error:", error);
    }
  }
});
