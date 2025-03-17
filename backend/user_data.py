from flask import Blueprint, request, jsonify
from bson import ObjectId
import json
from datetime import datetime
import base64
import traceback
import logging

# Create a Blueprint for user data routes
user_data_bp = Blueprint('user_data', __name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_user_speech_collection(db):
    """Returns the user_speech collection from the database."""
    return db["user_speech"]

@user_data_bp.route('/api/user/speech', methods=['POST'])
def store_speech():
    """Store user's speech text in MongoDB."""
    try:
        logger.info("Speech storage request received")
        
        try:
            from auth import db
            logger.info("Successfully imported db from auth")
        except ImportError as ie:
            logger.error(f"Failed to import db from auth: {ie}")
            return jsonify({"success": False, "error": "Server configuration error"}), 500
        
        data = request.get_json()
        logger.info(f"Received data: {data}")
        
        user_id = data.get("user_id")
        speech_text = data.get("text")
        topic = data.get("topic", "")
        
        logger.info(f"Processing speech for user {user_id}, topic: {topic}")
        
        if not user_id or not speech_text:
            logger.error("Missing required data")
            return jsonify({"success": False, "error": "Missing required data"}), 400
            
        collection = get_user_speech_collection(db)
        logger.info(f"Retrieved collection: {collection.name}")
        
        # Find user's document or create a new one
        user_speech_doc = collection.find_one({"user_id": user_id})
        logger.info(f"Found existing user document: {bool(user_speech_doc)}")
        
        speech_entry = {
            "timestamp": datetime.utcnow(),
            "text": speech_text
        }
        
        if user_speech_doc:
            # Update existing document - combine $set and $push in one update operation
            logger.info("Updating existing document")
            result = collection.update_one(
                {"user_id": user_id},
                {
                    "$set": {"topic": topic},
                    "$push": {"speech_entries": speech_entry}
                }
            )
            logger.info(f"Update result: matched={result.matched_count}, modified={result.modified_count}")
        else:
            # Create new document with the desired structure
            logger.info("Creating new document")
            result = collection.insert_one({
                "user_id": user_id,
                "topic": topic,
                "speech_entries": [speech_entry],
                "screenshots": []
            })
            logger.info(f"Insert result: inserted_id={result.inserted_id}")
            
        return jsonify({"success": True, "message": "Speech stored successfully"})
        
    except Exception as e:
        logger.error(f"Error storing speech: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500

@user_data_bp.route('/api/user/screenshot', methods=['POST'])
def store_screenshot():
    """Store screenshot image in MongoDB."""
    try:
        # Log the request
        logger.info("Screenshot upload request received")
        
        try:
            from auth import db
            logger.info("Successfully imported db from auth")
        except ImportError as ie:
            logger.error(f"Failed to import db from auth: {ie}")
            return jsonify({"success": False, "error": "Server configuration error"}), 500
        
        data = request.get_json()
        user_id = data.get("user_id")
        image_data = data.get("image_data")  # Base64 encoded image
        topic = data.get("topic", "")
        
        if not user_id or not image_data:
            return jsonify({"success": False, "error": "Missing required data"}), 400
        
        # Print the first 100 characters to debug (avoid logging entire image)
        print(f"Received image data from user {user_id}, length: {len(image_data)} chars")
        
        # Check if image data is too large
        if len(image_data) > 1024 * 1024 * 5:  # 5MB limit
            print("Image data exceeds size limit, compressing...")
            # We'll trim the data for now (in production you'd compress it instead)
            image_data = image_data[:1024 * 1024 * 2]  # Trim to 2MB
            
        collection = get_user_speech_collection(db)
        
        # Find user's document or create a new one
        user_speech_doc = collection.find_one({"user_id": user_id})
        
        screenshot_entry = {
            "timestamp": datetime.utcnow(),
            "image_data": image_data
        }
        
        try:
            if user_speech_doc:
                # Update existing document - update topic and push to screenshots array
                collection.update_one(
                    {"user_id": user_id},
                    {
                        "$set": {"topic": topic},
                        "$push": {"screenshots": screenshot_entry}
                    }
                )
            else:
                # Create new document with the desired structure
                collection.insert_one({
                    "user_id": user_id,
                    "topic": topic,
                    "speech_entries": [],
                    "screenshots": [screenshot_entry]
                })
                
            print(f"Successfully stored screenshot for user {user_id}")
            return jsonify({"success": True})
            
        except Exception as db_error:
            print(f"Database error when storing screenshot: {db_error}")
            if "document too large" in str(db_error).lower():
                # MongoDB has a 16MB document size limit
                return jsonify({
                    "success": False, 
                    "error": "Screenshot too large for database storage"
                }), 413
            raise
            
    except Exception as e:
        print(f"Error storing screenshot: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500

@user_data_bp.route('/api/user/test', methods=['GET'])
def test_endpoint():
    """Test endpoint to verify API is working."""
    return jsonify({
        "success": True,
        "message": "User data API is working correctly"
    })

@user_data_bp.route('/api/user/<user_id>/data', methods=['GET'])
def get_user_data(user_id):
    """Get user's data (without image data for performance)."""
    try:
        from auth import db
        
        if not user_id:
            return jsonify({"success": False, "error": "User ID required"}), 400
            
        collection = get_user_speech_collection(db)
        user_data = collection.find_one({"user_id": user_id})
        
        if not user_data:
            return jsonify({"success": False, "error": "User not found"}), 404
            
        # Remove large binary data from response
        if "screenshots" in user_data:
            for screenshot in user_data["screenshots"]:
                if "image_data" in screenshot:
                    screenshot["image_data"] = f"[Binary data, length: {len(screenshot['image_data'])}]"
        
        # Convert MongoDB ObjectId to string
        user_data["_id"] = str(user_data["_id"])
        
        return jsonify({
            "success": True,
            "data": user_data
        })
        
    except Exception as e:
        print(f"Error retrieving user data: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500

@user_data_bp.route('/api/user/test-speech', methods=['GET'])
def test_speech_storage():
    """Test speech storage API."""
    try:
        from auth import db
        
        # Test data
        test_user_id = "test_user_123"
        test_speech = "This is a test speech entry."
        test_topic = "Test Topic"
        
        # Get collection
        collection = get_user_speech_collection(db)
        
        # Create test entry
        speech_entry = {
            "timestamp": datetime.utcnow(),
            "text": test_speech
        }
        
        # Check if test user exists
        test_user = collection.find_one({"user_id": test_user_id})
        
        if test_user:
            # Update existing user
            result = collection.update_one(
                {"user_id": test_user_id},
                {
                    "$set": {"topic": test_topic},
                    "$push": {"speech_entries": speech_entry}
                }
            )
            operation = "updated"
        else:
            # Create new user
            result = collection.insert_one({
                "user_id": test_user_id,
                "topic": test_topic,
                "speech_entries": [speech_entry],
                "screenshots": []
            })
            operation = "created"
            
        # Get the result
        test_user = collection.find_one({"user_id": test_user_id})
        
        if test_user:
            # Remove ObjectId for JSON serialization
            test_user["_id"] = str(test_user["_id"])
            
            return jsonify({
                "success": True,
                "message": f"Test user {operation} successfully",
                "user_data": test_user
            })
        else:
            return jsonify({
                "success": False,
                "error": "Failed to retrieve test user after operation"
            }), 500
            
    except Exception as e:
        logger.error(f"Error in test speech storage: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500