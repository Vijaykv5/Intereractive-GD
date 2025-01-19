from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient, errors
import jwt

app = Flask(__name__)
CORS(app)

# MongoDB connection setup
try:
    client = MongoClient('mongodb+srv://musicstories10:fK4TalYmpbQv5dvH@v1.lb76o.mongodb.net/?retryWrites=true&w=majority&appName=V1', serverSelectionTimeoutMS=5000)
    db = client['gd']
    users_collection = db['users']
    print("MongoDB connection successful.")
except errors.ServerSelectionTimeoutError as err:
    print("Failed to connect to MongoDB:", err)
    exit(1)

@app.route("/api/auth/google", methods=["POST"])
def google_sign_in():
    token = request.json.get("token")
    try:
        # Decode token without verification
        decoded_token = jwt.decode(token, options={"verify_signature": False})
        
        # Extract user information
        user_info = {
            "user_id": decoded_token.get("sub"),
            "email": decoded_token.get("email"),
            "name": decoded_token.get("name"),
            "picture": decoded_token.get("picture"),
        }

        # Store in MongoDB
        try:
            result = users_collection.update_one(
                {"user_id": user_info["user_id"]},
                {"$set": user_info},
                upsert=True
            )
            
            if result.modified_count > 0:
                print(f"User {user_info['email']} information updated")
            elif result.upserted_id:
                print(f"New user {user_info['email']} created")
                
            return jsonify({"success": True, "user": user_info})
        except Exception as e:
            print(f"Database error: {str(e)}")
            return jsonify({"success": False, "error": "Database error"}), 500

    except Exception as e:
        print(f"Token decoding error: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 400

if __name__ == "__main__":
    app.run(debug=True, port=8000)
