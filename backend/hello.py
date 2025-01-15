from flask import Flask, jsonify
from flask_cors import CORS
from pymongo import MongoClient

app = Flask(__name__)
CORS(app)

# MongoDB connection
client = MongoClient("mongodb+srv://musicstories10:@v1.lb76o.mongodb.net/")
db = client["hello_world_db"]
collection = db["messages"]

# Insert a sample message (if not already in the database)
if collection.count_documents({}) == 0:
    collection.insert_one({"message": "hi"})

@app.route('/message', methods=['GET'])
def get_message():
    # Fetch the message from the database
    message_data = collection.find_one({}, {"_id": 0, "message": 1})
    return jsonify(message_data)

if __name__ == '__main__':
    app.run(debug=True)
