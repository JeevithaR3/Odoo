import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getFirestore, collection, getDocs
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import {
  getAuth, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAWQIJirF6ap5HOE55yNL_zTiZWTzS-luo",
  authDomain: "ecoswap-4db13.firebaseapp.com",
  projectId: "ecoswap-4db13",
  storageBucket: "ecoswap-4db13.appspot.com",
  messagingSenderId: "184392888367",
  appId: "1:184392888367:web:6986d2bd7bd8c97c9f16da",
  measurementId: "G-X94Q876C3D"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function fetchUserItems(userId, searchTerm = "") {
  const userItemsCol = collection(db, `users/${userId}/postItems`);
  const snapshot = await getDocs(userItemsCol);
  let items = [];

  snapshot.forEach(doc => {
    const data = doc.data();
    const matchSearch = !searchTerm || (
      data.itemName && data.itemName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (matchSearch) {
      items.push({ id: doc.id, ...data });
    }
  });

  // 🔽 Sort by createdAt DESCENDING
  items.sort((a, b) => {
    const dateA = a.createdAt?.toDate?.() || new Date(0);
    const dateB = b.createdAt?.toDate?.() || new Date(0);
    return dateB - dateA;
  });

  return items;
}

function displayItemsGroupedByDate(items) {
  const container = document.getElementById("itemsContainer");
  container.innerHTML = "";

  const grouped = {};

  items.forEach(item => {
    const date = item.createdAt?.toDate?.().toLocaleDateString() || "Unknown Date";
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(item);
  });

  const orderedDates = [...new Set(items.map(item => {
    return item.createdAt?.toDate?.().toLocaleDateString() || "Unknown Date";
  }))];

  orderedDates.forEach(date => {
    const dateSection = document.createElement("div");
    dateSection.className = "mb-8";

    const dateHeader = document.createElement("div");
    dateHeader.className = "flex items-center mb-4";
    dateHeader.innerHTML = `
      <h2 class="text-2xl font-bold text-blue-800">${date}</h2>
      <div class="flex-grow ml-4 h-0.5 bg-gradient-to-r from-blue-400 via-blue-200 to-transparent"></div>
    `;
    dateSection.appendChild(dateHeader);

    grouped[date].forEach(item => {
      const card = document.createElement("div");
      card.className = "transition transform hover:scale-[1.01] border border-gray-200 rounded-xl p-5 mb-4 shadow-md bg-white cursor-pointer hover:shadow-lg";
      card.addEventListener("click", () => {
        window.location.href = `requestusers.html?itemId=${item.id}`;
      });

      const title = document.createElement("h3");
      title.className = "text-xl font-semibold text-gray-800 flex items-center mb-2";
      title.textContent = item.itemName || "Unnamed Item";

      if (item.accepted) {
        const circle = document.createElement("span");
        circle.className = "ml-2 w-3 h-3 rounded-full bg-green-500 inline-block";
        title.appendChild(circle);
      }

      const desc = document.createElement("p");
      desc.className = "text-sm text-gray-600 mb-2";
      desc.textContent = `📄 ${item.description || "No description provided."}`;

      const cond = document.createElement("span");
      cond.className = "inline-block text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full mr-2 mb-2";
      cond.textContent = `Condition: ${item.itemCondition || "Unknown"}`;

      const act = document.createElement("span");
      act.className = "inline-block text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full mr-2 mb-2";
      act.textContent = `Action: ${item.itemAction || "Unknown"}`;

      const loc = document.createElement("p");
      loc.className = "text-sm text-gray-500 mt-1";
      loc.textContent = `📍 Location: ${item.location || "N/A"}`;

      card.appendChild(title);
      card.appendChild(desc);
      card.appendChild(cond);
      card.appendChild(act);
      card.appendChild(loc);

      dateSection.appendChild(card);
    });

    container.appendChild(dateSection);
  });
}


onAuthStateChanged(auth, async (user) => {
  if (user) {
    const items = await fetchUserItems(user.uid);
    displayItemsGroupedByDate(items);

    document.getElementById("searchForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const searchTerm = document.getElementById("searchInput").value.trim();
      const filteredItems = await fetchUserItems(user.uid, searchTerm);
      displayItemsGroupedByDate(filteredItems);
    });
  } else {
    document.getElementById("itemsContainer").innerHTML = `
      <p class="text-center text-gray-600 mt-10">Please log in to see your posted items.</p>
    `;
  }
});