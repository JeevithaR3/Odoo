from flask import Flask, request, jsonify
import mysql.connector
from mysql.connector import Error
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # allow frontend requests from browser

# ✅ MySQL connection function
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",      # change if not local
        user="root",           # your MySQL username
        password="yourpassword",  # your MySQL password
        database="ecoswap"     # database name
    )

# ✅ API: Add a new item
@app.route("/api/items", methods=["POST"])
def add_item():
    data = request.json
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Insert item into table
        cursor.execute("""
            INSERT INTO items (userId, category, itemName, description, itemCondition, itemAction,
                               location, email, phone, imageCount)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            data["userId"],
            data["category"],
            data["itemName"],
            data["description"],
            data["itemCondition"],
            data["itemAction"],
            data["location"],
            data["email"],
            data["phone"],
            data["imageCount"]
        ))
        conn.commit()

        # Update green points
        cursor.execute("UPDATE users SET greenPoints = greenPoints + 10 WHERE id = %s", (data["userId"],))
        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({"success": True, "message": "Item added successfully!"})
    except Error as e:
        print("DB Error:", e)
        return jsonify({"success": False, "message": "Database error"}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
