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

# Search items
@app.route("/api/items/search", methods=["GET"])
def search_items():
    query_param = request.args.get("q", "")
    sql = "SELECT * FROM items WHERE itemName LIKE %s"
    cursor.execute(sql, (f"%{query_param}%",))
    results = cursor.fetchall()
    return jsonify(results)

# Add a request
@app.route("/api/requests", methods=["POST"])
def add_request():
    data = request.get_json()
    sql = "INSERT INTO requests (userId, itemName, description) VALUES (%s, %s, %s)"
    values = (1, data.get("itemName"), data.get("description", ""))
    cursor.execute(sql, values)
    db.commit()
    return jsonify({"message": "Request submitted successfully!"}), 201

# Get all requests (for reqJeevitha.html)
@app.route("/api/requests", methods=["GET"])
def get_requests():
    cursor.execute("SELECT * FROM requests ORDER BY createdAt DESC")
    requests_list = cursor.fetchall()
    return jsonify(requests_list)

# Accept a request
# Update request status
# Update request status (Accept/Reject) with optional lender info
@app.route("/api/requests/<int:request_id>", methods=["PATCH"])
def update_request(request_id):
    data = request.get_json()
    status = data.get("status", "pending")
    acceptedBy = data.get("acceptedBy")  # lender name
    providerPhone = data.get("providerPhone")
    providerAddress = data.get("providerAddress")

    sql = """
        UPDATE requests
        SET status=%s,
            acceptedBy=%s,
            providerPhone=%s,
            providerAddress=%s
        WHERE id=%s
    """
    cursor.execute(sql, (status, acceptedBy, providerPhone, providerAddress, request_id))
    db.commit()
    return jsonify({"message": f"Request {status} successfully!"})


@app.route("/")
def home():
    return "Flask backend is running 🚀"

if __name__ == "__main__":
    app.run(debug=True)
