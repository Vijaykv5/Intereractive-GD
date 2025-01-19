import React, { useState, useEffect, useCallback } from "react";
import { Mic, MicOff, Save, AlertCircle } from "lucide-react";
import ChatgptResponse from '../response/ChatgptResponse';

interface SpeechToTextProps {
  sessionId?: string;
  participantId?: string;
}

const SpeechToText: React.FC<SpeechToTextProps> = ({
  sessionId,
  participantId = "user1", // Default value, should be provided by auth system
}) => {
  const [isListening, setIsListening] = useState(false);
  const [speechText, setSpeechText] = useState<string>("");
  const [recognition, setRecognition] = useState<any>(null);
  const [error, setError] = useState<string>("");
  
  // Add a ref to track the actual recognition state
  const recognitionStateRef = React.useRef<boolean>(false);

  useEffect(() => {
    // Initialize speech recognition
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognitionInstance = new SpeechRecognition();

        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = "en-US";

        recognitionInstance.onstart = () => {
          recognitionStateRef.current = true;
          setIsListening(true);
          setError("");
        };

        recognitionInstance.onresult = (event: any) => {
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + " ";
            }
          }

          if (finalTranscript) {
            setSpeechText((prev) => prev + finalTranscript);
          }
        };

        recognitionInstance.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          // Don't show error for aborted cases (manual stop)
          if (event.error !== 'aborted') {
            setError(`Error: ${event.error}`);
          }
          recognitionStateRef.current = false;
          setIsListening(false);
        };

        recognitionInstance.onend = () => {
          recognitionStateRef.current = false;
          setIsListening(false);
        };

        setRecognition(recognitionInstance);
      } catch (err) {
        setError("Failed to initialize speech recognition");
        console.error(err);
      }
    } else {
      setError("Speech recognition is not supported in this browser");
    }

    // Cleanup function
    return () => {
      if (recognition) {
        recognition.stop();
        recognitionStateRef.current = false;
      }
    };
  }, []); // Remove isListening from dependencies

  const toggleListening = useCallback(() => {
    if (!recognition) {
      setError("Speech recognition is not initialized");
      return;
    }

    try {
      if (recognitionStateRef.current) {
        recognition.stop();
      } else {
        recognition.start();
      }
    } catch (err) {
      console.error(err);
      setError("Failed to toggle speech recognition");
      setIsListening(false);
      recognitionStateRef.current = false;
    }
  }, [recognition]); // Only depend on recognition

  const saveTranscriptToBackend = async (text: string) => {
    if (!sessionId) return;

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
            text,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save transcript");
      }

      setSpeechText("");
    } catch (err) {
      setError("Failed to save transcript to server");
      console.error(err);
    }
  };

  const handleSave = async () => {
    try {
      const blob = new Blob([speechText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "speech-text.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      await saveTranscriptToBackend(speechText);
    } catch (err) {
      setError("Failed to save text");
      console.error(err);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 shadow-[0_-4px_20px_rgba(0,0,0,0.3)] p-6">
      <ChatgptResponse userSpeech={speechText} />
      <div className="max-w-4xl mx-auto">
        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-800 rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="flex items-center gap-6">
          <button
            onClick={toggleListening}
            className={`p-4 rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-lg ${
              isListening
                ? "bg-red-600 hover:bg-red-700"
                : "bg-yellow-500 hover:bg-yellow-600"
            }`}
          >
            {isListening ? (
              <Mic className="w-6 h-6 text-white" />
            ) : (
              <MicOff className="w-6 h-6 text-black" />
            )}
          </button>

          <div className="flex-1 p-4 bg-gray-800 rounded-xl border border-gray-700 min-h-[60px] max-h-[100px] overflow-y-auto">
            {speechText ? (
              <p className="text-gray-300 whitespace-pre-wrap">{speechText}</p>
            ) : (
              <p className="text-gray-500 italic">
                {isListening
                  ? "Listening..."
                  : "Click microphone to start speaking"}
              </p>
            )}
          </div>

          <button
            onClick={handleSave}
            className={`p-4 rounded-full transition-all ${
              speechText
                ? "bg-green-600 hover:bg-green-700 cursor-pointer"
                : "bg-gray-700 cursor-not-allowed"
            }`}
            disabled={!speechText}
          >
            <Save className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpeechToText;
