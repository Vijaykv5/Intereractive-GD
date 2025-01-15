import React, { useState } from "react";
import { Send, Loader2 } from "lucide-react";

interface TextInputProps {
  sessionId?: string;
  participantId?: string;
}

const TextInput: React.FC<TextInputProps> = ({
  sessionId,
  participantId = "user1",
}) => {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (!sessionId) {
      setError("No active session found");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        `http://localhost:5000/sessions/${sessionId}/transcripts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            participantId,
            text: text.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save text");
      }

      const data = await response.json();
      setText("");
      setSuccessMessage("Text saved successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save text");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Add Your Discussion Point
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your message here..."
            className="w-full h-32 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-green-50 border border-green-100 rounded-lg text-green-600 text-sm">
            {successMessage}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading || !text.trim()}
            className={`
              px-6 py-3 rounded-lg flex items-center gap-2
              ${
                isLoading || !text.trim()
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-violet-600 text-white hover:bg-violet-700"
              }
            `}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TextInput;
