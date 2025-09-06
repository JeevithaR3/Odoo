from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

# MySQL connection
db = mysql.connector.connect(
    host="localhost",
    user="root",        # change if different
    password="dbms",    # change if different
    database="ecoswap"  # ✅ correct database name
)
cursor = db.cursor(dictionary=True)

# POST route to add a new item
@app.route("/api/items", methods=["POST"])
def add_item():
    data = request.get_json()

    sql = """INSERT INTO items 
             (userId, category, itemName, description, itemCondition, itemAction, location, email, phone, imageCount) 
             VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"""
    values = (
        1,  # test userId (make sure at least 1 user exists in `users`)
        data.get("category"),
        data.get("itemName"),
        data.get("description"),
        data.get("itemCondition"),
        data.get("itemAction"),
        data.get("location"),
        data.get("email"),
        data.get("phone"),
        data.get("imageCount", 0)
    )

    cursor.execute(sql, values)
    db.commit()

    return jsonify({"message": "Item added successfully!"}), 201

# Optional: GET route to check stored items
@app.route("/api/items", methods=["GET"])
def get_items():
    cursor.execute("SELECT * FROM items ORDER BY createdAt DESC")
    items = cursor.fetchall()
    return jsonify(items)

@app.route("/")
def home():
    return "Flask backend is running 🚀"

if __name__ == "__main__":
    app.run(debug=True)
