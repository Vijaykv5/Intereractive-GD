from flask import Blueprint, request, jsonify, send_file
from flask_cors import CORS
import io
from gtts import gTTS
import os
import requests
import json
from openai import OpenAI

# Initialize a Blueprint for LLM routes
llm_bp = Blueprint('llm2', __name__)
CORS(llm_bp, resources={r"/*": {"origins": "*"}})  # Enable CORS for frontend communication

# Get OpenRouter API key from environment variables
OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')
if not OPENROUTER_API_KEY:
    print("WARNING: OPENROUTER_API_KEY environment variable not set")
else:
    print(f"Using OpenRouter API key: {OPENROUTER_API_KEY[:8]}...")  # Print first 8 chars for debugging

# Initialize OpenAI client with OpenRouter base URL
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY,
)

# Global variable to track if this LLM should respond
should_respond = False

def chat_with_llm1(text, topic):
    """Send message to LLM1 and get response"""
    try:
        response = requests.post(
            'http://localhost:8080/api/llm1/llm',
            json={"text": text, "topic": topic, "is_user_message": False}
        )
        if response.ok:
            return response.json()
        return None
    except Exception as e:
        print(f"Error communicating with LLM1: {e}")
        return None

@llm_bp.route('/api/llm2/llm', methods=['POST'])
def get_llm_response():
    global should_respond
    try:
        data = request.get_json()
        text = data.get("text")
        topic = data.get("topic")
        is_user_message = data.get("is_user_message", True)

        if not text:
            return jsonify({"success": False, "error": "No text provided"}), 400

        if not OPENROUTER_API_KEY:
            return jsonify({
                "success": False, 
                "error": "OpenRouter API key not configured. Please check your environment variables."
            }), 500

        # If this is a user message and it's not our turn, forward to LLM1
        if is_user_message and not should_respond:
            llm1_response = chat_with_llm1(text, topic)
            if llm1_response and llm1_response.get("success"):
                should_respond = True  # It will be our turn next
                return jsonify(llm1_response)
            return jsonify({"success": False, "error": "Failed to get response from LLM1"}), 500

        # If it's not our turn and it's not a user message, ignore
        if not should_respond and not is_user_message:
            return jsonify({"success": False, "error": "Not LLM2's turn"}), 400

        prompt = f"""
        You are a participant in a group discussion about "{topic}". Respond to the following message in a 
        brief way (maximum 60 words). Sometimes agree with the speaker, you can also disagree, but also share your own insights and 
        perspectives. Be natural and conversational, like a real participant in a group discussion.
        
        Current topic: {topic}
        User says: {text}
        """
        
        try:
            completion = client.chat.completions.create(
                extra_headers={
                    "HTTP-Referer": "http://localhost:5173",
                    "X-Title": "Interactive-GD"
                },
                model="meta-llama/llama-3.2-3b-instruct:free",
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=100
            )
            
            llm_reply = completion.choices[0].message.content
            print("Successfully received response from Llama")
            
        except Exception as e:
            print(f"Error calling OpenRouter API: {str(e)}")
            return jsonify({
                "success": False,
                "error": f"Failed to get response from LLM: {str(e)}"
            }), 500
        
        # Ensure the response is not too long
        words = llm_reply.split()
        if len(words) > 55:
            llm_reply = ' '.join(words[:50]) + '...'
        
        # Mark that it's not our turn next
        should_respond = False
        
        return jsonify({
            "success": True, 
            "response": llm_reply,
            "model_used": "llama-3.2-3b"
        })

    except Exception as e:
        import traceback
        traceback_str = traceback.format_exc()
        print(f"Error in LLM processing: {e}")
        print(f"Traceback: {traceback_str}")
        return jsonify({
            "success": False, 
            "error": f"Failed to get response from LLM: {str(e)}"
        }), 500

@llm_bp.route('/api/llm2/tts', methods=['POST'])
def text_to_speech():
    """Converts text to speech using pyttsx3 with a deep male voice."""
    try:
        import pyttsx3
        import tempfile
        import os
        
        data = request.get_json()
        text = data.get("text")

        if not text:
            return jsonify({"success": False, "error": "No text provided"}), 400

        # Initialize the pyttsx3 engine
        engine = pyttsx3.init()
        
        # Get available voices
        voices = engine.getProperty('voices')
        
        # Select a male voice (usually the first voice is male)
        engine.setProperty('voice', voices[0].id)
        
        # Set a lower pitch for a deeper voice
        engine.setProperty('rate', 150)  # Speed
        engine.setProperty('volume', 0.9)  # Volume
        
        # Create a temporary file
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.mp3')
        temp_filename = temp_file.name
        temp_file.close()
        
        # Save to the temporary file
        engine.save_to_file(text, temp_filename)
        engine.runAndWait()
        
        # Return the file
        return send_file(temp_filename, mimetype="audio/mp3")
        
    except Exception as e:
        print(f"Error in pyttsx3 conversion: {e}")
        return jsonify({"success": False, "error": f"Text-to-speech conversion failed: {str(e)}"}), 500
