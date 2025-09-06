import { db, auth } from './firebase-config.js';
import {
  collection,
  getDocs,
  doc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

const requestedItemsDiv = document.getElementById("requestedItems");

function renderItem(item) {
  const statusColor = item.status === "pending"
    ? "text-yellow-600"
    : item.status === "accept"
    ? "text-green-600"
    : "text-red-600";

  return `
    <div class="border p-4 rounded shadow-sm bg-gray-50">
      <p><strong>Item:</strong> ${item.itemName}</p>
      <p><strong>Location:</strong> ${item.location}</p>
      <p><strong>Description:</strong> ${item.description}</p>
      <p><strong>Provider ID:</strong> ${item.providerId}</p>
      <p><strong>Status:</strong> <span class="${statusColor} font-semibold">${item.status}</span></p>
      <p><strong>Requested At:</strong> ${item.requestedAt.toDate().toLocaleString()}</p>
    </div>
  `;
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    requestedItemsDiv.innerHTML = <p class="text-red-600 text-center">Please log in to view your requested items.</p>;
    return;
  }

  const requestedItemsRef = collection(db, "users", user.uid, "requesteditems");

  onSnapshot(requestedItemsRef, (snapshot) => {
    if (snapshot.empty) {
      requestedItemsDiv.innerHTML = <p class="text-center text-gray-600">No requested items found.</p>;
    } else {
      requestedItemsDiv.innerHTML = snapshot.docs.map(doc => renderItem(doc.data())).join("");
    }
  });
});