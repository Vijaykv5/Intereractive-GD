from flask import Blueprint, request, jsonify, send_file
from flask_cors import CORS
import google.generativeai as genai
import io
from gtts import gTTS
import os
import requests

# Initialize a Blueprint for LLM routes
llm_bp = Blueprint('llm1', __name__)
CORS(llm_bp, resources={r"/*": {"origins": "*"}})  # Enable CORS for frontend communication

# Get Gemini API key from environment variables
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("WARNING: GEMINI_API_KEY environment variable not set")

# Global variable to track if this LLM should respond
should_respond = True

def chat_with_llm2(text, topic):
    """Send message to LLM2 and get response"""
    try:
        response = requests.post(
            'http://localhost:8080/api/llm2/llm',
            json={"text": text, "topic": topic}
        )
        if response.ok:
            return response.json()
        return None
    except Exception as e:
        print(f"Error communicating with LLM2: {e}")
        return None

@llm_bp.route('/api/llm1/llm', methods=['POST'])
def get_llm_response():
    global should_respond
    try:
        data = request.get_json()
        text = data.get("text")
        topic = data.get("topic", "")
        is_user_message = data.get("is_user_message", True)

        if not text:
            return jsonify({"success": False, "error": "No text provided"}), 400

        # If this is a user message and it's not our turn, forward to LLM2
        if is_user_message and not should_respond:
            llm2_response = chat_with_llm2(text, topic)
            if llm2_response and llm2_response.get("success"):
                should_respond = True  # It will be our turn next
                return jsonify(llm2_response)
            return jsonify({"success": False, "error": "Failed to get response from LLM2"}), 500

        # If it's not our turn and it's not a user message, ignore
        if not should_respond and not is_user_message:
            return jsonify({"success": False, "error": "Not LLM1's turn"}), 400

        # Initialize the model
        model = genai.GenerativeModel('gemini-1.5-pro-latest')
        
        # Create a prompt that makes the model a discussion participant
        prompt = f"""
        You are a participant in a group discussion about "{topic}". Respond to the following message in a 
        brief way (maximum 40 words). Sometimes agree with the speaker, but also share your own insights and 
        perspectives. Be natural and conversational, like a real participant in a group discussion.
        
        Current topic: {topic}
        User says: {text}
        """
        
        # Generate content
        response = model.generate_content(prompt)
        
        # Extract the response text
        llm_reply = response.text
        
        # Ensure the response is not too long
        words = llm_reply.split()
        if len(words) > 55:
            llm_reply = ' '.join(words[:50]) + '...'
        
        # Mark that it's not our turn next
        should_respond = False
        
        return jsonify({
            "success": True, 
            "response": llm_reply,
            "model_used": "gemini-1.5-pro"
        })

    except Exception as e:
        import traceback
        traceback_str = traceback.format_exc()
        print(f"Error in LLM processing: {e}")
        print(f"Traceback: {traceback_str}")
        return jsonify({"success": False, "error": f"Failed to get response from LLM: {str(e)}"}), 500

@llm_bp.route('/api/llm1/tts', methods=['POST'])
def text_to_speech():
    """Converts text to speech using gTTS with an enhanced sweet female voice."""
    try:
        data = request.get_json()
        text = data.get("text")

        if not text:
            return jsonify({"success": False, "error": "No text provided"}), 400

        # Add some light formatting to make the speech more expressive
        formatted_text = text.replace("!", "! ").replace("?", "? ")
        
        # Using Australian English (tends to have a sweeter female voice in gTTS)
        # The 'com.au' TLD provides a different voice than standard US English
        tts = gTTS(
            text=formatted_text, 
            lang='en',
            tld='com.au',  # Australian English - softer female voice
            slow=False     # Normal speed
        )
        
        # Save the audio to a byte stream
        audio_stream = io.BytesIO()
        tts.write_to_fp(audio_stream)
        audio_stream.seek(0)
        
        # Log success
        print(f"Successfully generated speech for text: {text[:30]}...")
        
        return send_file(audio_stream, mimetype="audio/mp3")
    
    except Exception as e:
        print(f"Error in gTTS conversion: {e}")
        return jsonify({"success": False, "error": f"Text-to-speech conversion failed: {str(e)}"}), 500

# This is an alternative implementation if you want to try another option
@llm_bp.route('/api/tts/alt', methods=['POST'])
def alt_text_to_speech():
    """Alternative TTS using pyttsx3 with a sweet female voice."""
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
        
        # Select a female voice (index may vary by system)
        # Usually the second voice (index 1) is female on most systems
        engine.setProperty('voice', voices[1].id)
        
        # Set a higher pitch for a sweeter sound
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
        return jsonify({"success": False, "error": f"Alternative TTS failed: {str(e)}"}), 500