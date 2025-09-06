const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
const serviceAccount = require("./firebaseauthenti.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve all static files (HTML, JS, CSS) from root directory
app.use(express.static(__dirname));

// Serve HTML pages
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "newitems.html"));
});

app.get("/reqitem", (req, res) => {
  res.sendFile(path.join(__dirname, "reqitem.html"));
});

// Handle new item submission with image uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post("/submit-item", upload.array("images", 4), async (req, res) => {
  try {
    const {
      itemName,
      itemDescription,
      itemCategory,
      itemCondition,
      itemAction,
      location,
      email,
      phone,
      userId
    } = req.body;

    const images = req.files;

    const itemData = {
      itemName,
      itemDescription,
      itemCategory,
      itemCondition,
      itemAction,
      location,
      email,
      phone,
      userId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      imageCount: images.length,
    };

    await db.collection("items").add(itemData);

    res.status(200).json({ success: true, message: "Item stored in Firestore!" });
  } catch (error) {
    console.error("Error submitting item:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// Handle requested item submission under user subcollection
app.post("/submit-request", async (req, res) => {
  try {
    const {
      category,
      itemName,
      description,
      condition,
      location,
      email,
      phone,
      userId
    } = req.body;

    if (!itemName || !email || !phone || !userId) {
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    const requestData = {
      category,
      itemName,
      description,
      condition,
      location,
      email,
      phone,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };

    // Store under users/{userId}/request_items
    await db.collection("users")
      .doc(userId)
      .collection("request_items")
      .add(requestData);

    res.status(200).json({ success: true, message: "Requested item submitted successfully!" });
  } catch (error) {
    console.error("Error submitting requested item:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});


// ✅ NEW APIs

// Fetch all available items
app.get("/api/items", async (req, res) => {
  try {
    const snapshot = await db.collection("items").get();
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Submit a new request for an unavailable item
app.post("/api/request-item", async (req, res) => {
  try {
    const { itemName, userId } = req.body;

    await db.collection("requests").add({
      itemName,
      userId,
      status: "pending",
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(200).json({ message: "Item requested successfully." });
  } catch (error) {
    console.error("Request item error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Accept a provider and auto-reject others for a given item
app.post("/api/accept-provider", async (req, res) => {
  try {
    const { itemName, providerName } = req.body;

    const snapshot = await db.collection("requests")
      .where("itemName", "==", itemName)
      .get();

    const batch = db.batch();

    snapshot.docs.forEach(doc => {
      const ref = db.collection("requests").doc(doc.id);
      const data = doc.data();
      if (data.status === "pending") {
        const newStatus = data.userId === providerName ? "accepted" : "rejected";
        batch.update(ref, { status: newStatus });
      }
    });

    await batch.commit();
    res.status(200).json({ message: "Request accepted and others rejected." });
  } catch (error) {
    console.error("Accept provider error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`EcoSwap server running at http://localhost:${PORT}`);
});
