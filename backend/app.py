from flask import Flask
from flask_cors import CORS
from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS

# MongoDB Setup
MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    print("WARNING: MONGO_URI environment variable not set")

client = MongoClient(MONGO_URI)
db = client["gd"]  # Database name

# Import and register blueprints
from auth_routes import auth_bp
from llm1 import llm_bp
from user_data import user_data_bp

app.register_blueprint(auth_bp)
app.register_blueprint(llm_bp)
app.register_blueprint(user_data_bp)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8080) 