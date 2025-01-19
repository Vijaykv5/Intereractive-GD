from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient, errors  # Import errors for exception handling
from auth import auth_bp  # Import the authentication blueprint

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# MongoDB connection setup
try:
    client = MongoClient('mongodb+srv://musicstories10:fK4TalYmpbQv5dvH@v1.lb76o.mongodb.net/?retryWrites=true&w=majority&appName=V1', serverSelectionTimeoutMS=5000)
    print("MongoDB connection successful.")
    client.server_info()  # Forces a call to the server to check the connection
    db = client['gd']  # Replace with your database name
    users_collection = db['users']  # Collection to store user names
except errors.ServerSelectionTimeoutError as err:
    print("Failed to connect to MongoDB:", err)
    exit(1)  # Exit if the connection fails

# Existing code...

# New endpoint to store user names
@app.route('/api/users', methods=['POST'])
def store_user_name():
    data = request.get_json()
    user_name = data.get('name')
    
    if user_name:
        try:
            # Insert user name into MongoDB
            users_collection.insert_one({"name": user_name})
            print(f"User name received: {user_name}")
            return jsonify({"message": "User name stored successfully!"}), 201
        except Exception as e:
            print("Error inserting user name:", e)
            return jsonify({"error": "Failed to store user name."}), 500
    else:
        return jsonify({"error": "Name is required!"}), 400

# Register the authentication blueprint
app.register_blueprint(auth_bp)

if __name__ == '__main__':
    app.run(debug=True, port=8000)

