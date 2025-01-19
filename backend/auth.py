from flask import Flask, request, jsonify
from flask_cors import CORS
from google.oauth2 import id_token
from google.auth.transport import requests

app = Flask(__name__)
CORS(app)

# Replace with your Google Client ID
GOOGLE_CLIENT_ID = "236465284909-ef5p23aaadb9c6qlc5e2t75qmtvh96e9.apps.googleusercontent.com"

@app.route("/api/auth/google", methods=["POST"])
def google_sign_in():
    token = request.json.get("token")
    try:
        # Verify the token with Google's server
        id_info = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)

        # Extract user information
        user_info = {
            "user_id": id_info["sub"],
            "email": id_info["email"],
            "name": id_info["name"],
            "picture": id_info["picture"],
        }
        print(user_info)
        return jsonify({"success": True, "user": user_info})
    except ValueError as e:
        return jsonify({"success": False, "error": str(e)}), 400
        print(e)

if __name__ == "__main__":
    app.run(debug=True)
