
const requestedItemsDiv = document.getElementById("requestedItems");

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    requestedItemsDiv.innerHTML = `<p class="text-red-600">Please log in to view requested items.</p>`;
    return;
  }

  const providerId = user.uid;

  // Get provider profile (name only)
  const providerDoc = await db.collection("users").doc(providerId).get();
  const providerData = providerDoc.data();
  const providerName = providerData?.name || "Unknown";

  // Get provider’s posted items
  const providerPostsSnap = await db
    .collection("users")
    .doc(providerId)
    .collection("postItems")
    .get();
  const providerPosts = providerPostsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  db.collection("requesteditems").onSnapshot((snapshot) => {
    requestedItemsDiv.innerHTML = "";

    snapshot.forEach(doc => {
      const data = doc.data();
      const docId = doc.id;

      // Find match
      const matchedPost = providerPosts.find(post =>
        post.itemName.trim().toLowerCase() === data.itemName.trim().toLowerCase() &&
        post.category.trim().toLowerCase() === data.category.trim().toLowerCase()
      );

      let html = `
        <div class="border p-4 rounded shadow bg-white mb-4">
          <p><strong>Requested Item:</strong> ${data.itemName}</p>
          <p><strong>Category:</strong> ${data.category || "-"}</p>
          <p><strong>Location:</strong> ${data.location}</p>
          <p><strong>Description:</strong> ${data.description}</p>
      `;

      if (data.status === "accept") {
        html += `
          <p class="text-green-600 font-bold mt-2">✅ Accepted by ${data.acceptedBy}</p>
          <p><strong>Provider Phone:</strong> ${data.providerPhone}</p>
          <p><strong>Provider Address:</strong> ${data.providerAddress}</p>
        `;
      } else if (matchedPost) {
        html += `
          <button class="accept-btn bg-green-600 text-white px-3 py-1 rounded mt-2" data-id="${docId}" data-postid="${matchedPost.id}">
            Accept
          </button>
        `;
      } else {
        html += `
          <button class="bg-gray-400 text-white px-3 py-1 rounded mt-2 cursor-not-allowed" disabled>
            Accept (Post Required)
          </button>
        `;
      }

      html += `</div>`;
      requestedItemsDiv.innerHTML += html;
    });

    // Accept button logic
    document.querySelectorAll(".accept-btn").forEach(btn => {
      btn.onclick = async () => {
        const docId = btn.getAttribute("data-id");

        // Find matched post again to be safe
        const requestDoc = await db.collection("requesteditems").doc(docId).get();
        const requestData = requestDoc.data();

        const matchedPost = providerPosts.find(post =>
          post.itemName.trim().toLowerCase() === requestData.itemName.trim().toLowerCase() &&
          post.category.trim().toLowerCase() === requestData.category.trim().toLowerCase()
        );

        const providerPhone = matchedPost?.phone || "No phone";
        const providerAddress = matchedPost?.location || "No address";

        await db.collection("requesteditems").doc(docId).update({
          status: "accept",
          reqProviderId: providerId,
          acceptedBy: providerName,
          providerPhone: providerPhone,
          providerAddress: providerAddress
        });

        alert(" Request accepted!");
      };
    });
  });
});
