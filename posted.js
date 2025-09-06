// posted.js
async function loadPostedItems() {
  const container = document.getElementById("itemsContainer");
  container.innerHTML = "<p>Loading...</p>";

  try {
    const response = await fetch("http://127.0.0.1:5000/api/items");
    const items = await response.json();

    if (items.length === 0) {
      container.innerHTML = "<p>No items posted yet.</p>";
      return;
    }

    container.innerHTML = items
      .map(item => `
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-4">
          <h3 class="text-xl font-semibold mb-2">${item.itemName}</h3>
          <p class="text-gray-600 dark:text-gray-300 mb-1"><strong>Category:</strong> ${item.category}</p>
          <p class="text-gray-600 dark:text-gray-300 mb-1"><strong>Description:</strong> ${item.description}</p>
          <p class="text-gray-600 dark:text-gray-300 mb-1"><strong>Condition:</strong> ${item.itemCondition || "N/A"}</p>
          <p class="text-gray-600 dark:text-gray-300 mb-1"><strong>Action:</strong> ${item.itemAction || "N/A"}</p>
          <p class="text-gray-600 dark:text-gray-300 mb-1"><strong>Location:</strong> ${item.location || "N/A"}</p>
          <p class="text-gray-600 dark:text-gray-300 mb-1"><strong>Email:</strong> ${item.email || "N/A"}</p>
          <p class="text-gray-600 dark:text-gray-300 mb-1"><strong>Phone:</strong> ${item.phone || "N/A"}</p>
          <p class="text-gray-600 dark:text-gray-300"><strong>Images:</strong> ${item.imageCount || 0}</p>
        </div>
      `)
      .join("");
  } catch (error) {
    console.error(error);
    container.innerHTML = "<p>Error loading items.</p>";
  }
}

// Load items on page load
document.addEventListener("DOMContentLoaded", loadPostedItems);
