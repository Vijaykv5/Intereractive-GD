from flask import Blueprint, request, jsonify, send_file
import google.generativeai as genai
import io
from gtts import gTTS
import os

# Initialize a Blueprint for LLM routes
llm_bp = Blueprint('llm1', __name__)

# Get Gemini API key from environment variables
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("WARNING: GEMINI_API_KEY environment variable not set")

@llm_bp.route('/api/llm', methods=['POST'])
def get_llm_response():
    try:
        data = request.get_json()
        text = data.get("text")
        topic = data.get("topic", "")  # Get the topic if provided

        if not text:
            return jsonify({"success": False, "error": "No text provided"}), 400

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
        
        # Debug print
        print(f"Sending prompt to Gemini: {prompt[:100]}...")
        
        # Generate content
        response = model.generate_content(prompt)
        
        # Debug print
        print("Received response from Gemini")
        
        # Extract the response text
        llm_reply = response.text
        
        # Ensure the response is not too long (approximately 50 words)
        words = llm_reply.split()
        if len(words) > 55:  # Allow a small buffer
            llm_reply = ' '.join(words[:50]) + '...'
        
        return jsonify({
            "success": True, 
            "response": llm_reply
        })

    except Exception as e:
        import traceback
        traceback_str = traceback.format_exc()
        print(f"Error in LLM processing: {e}")
        print(f"Traceback: {traceback_str}")
        return jsonify({"success": False, "error": f"Failed to get response from LLM: {str(e)}"}), 500

@llm_bp.route('/api/tts', methods=['POST'])
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