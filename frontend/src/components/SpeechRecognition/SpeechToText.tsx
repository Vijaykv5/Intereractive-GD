import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Save, AlertCircle } from 'lucide-react';

interface SpeechToTextProps {
  sessionId?: string;
  participantId?: string;
}

const SpeechToText: React.FC<SpeechToTextProps> = ({ 
  sessionId,
  participantId = 'user1'  // Default value, should be provided by auth system
}) => {
  const [isListening, setIsListening] = useState(false);
  const [speechText, setSpeechText] = useState<string>("");
  const [recognition, setRecognition] = useState<any>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      try {
        const recognitionInstance = new SpeechRecognition();
        
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = 'en-US';

        recognitionInstance.onresult = (event: any) => {
          let finalTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            }
          }

          if (finalTranscript) {
            setSpeechText((prev) => prev + finalTranscript);
          }
        };

        recognitionInstance.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setError(`Error: ${event.error}`);
          setIsListening(false);
        };

        recognitionInstance.onend = () => {
          if (isListening) {
            recognitionInstance.start();
          }
        };

        setRecognition(recognitionInstance);
      } catch (err) {
        setError("Failed to initialize speech recognition");
        console.error(err);
      }
    } else {
      setError("Speech recognition is not supported in this browser");
    }
  }, [isListening]);

  const toggleListening = useCallback(() => {
    if (!recognition) {
      setError("Speech recognition is not initialized");
      return;
    }

    try {
      if (isListening) {
        recognition.stop();
      } else {
        recognition.start();
      }
      setIsListening(!isListening);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to toggle speech recognition");
      setIsListening(false);
    }
  }, [isListening, recognition]);

  // New function to save transcript to backend
  const saveTranscriptToBackend = async (text: string) => {
    if (!sessionId) return;

    try {
      const response = await fetch(`http://localhost:5000/sessions/${sessionId}/transcripts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantId,
          text,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save transcript');
      }

      // Clear the text after successful save
      setSpeechText('');
    } catch (err) {
      setError('Failed to save transcript to server');
      console.error(err);
    }
  };

  // Modify handleSave to also save to backend
  const handleSave = async () => {
    try {
      // Save to file
      const blob = new Blob([speechText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'speech-text.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Save to backend
      await saveTranscriptToBackend(speechText);
    } catch (err) {
      setError("Failed to save text");
      console.error(err);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-[0_-4px_20px_rgba(0,0,0,0.1)] p-6">
      <div className="max-w-4xl mx-auto">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="flex items-center gap-6">
          {/* Mic Control */}
          <button
            onClick={toggleListening}
            className={`p-4 rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-lg ${
              isListening
                ? "bg-red-500 hover:bg-red-600"
                : "bg-violet-600 hover:bg-violet-700"
            }`}
          >
            {isListening ? (
              <Mic className="w-6 h-6 text-white" />
            ) : (
              <MicOff className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Text Display */}
          <div className="flex-1 p-4 bg-gray-50 rounded-xl border border-gray-100 min-h-[60px] max-h-[100px] overflow-y-auto">
            {speechText ? (
              <p className="text-gray-700 whitespace-pre-wrap">{speechText}</p>
            ) : (
              <p className="text-gray-400 italic">
                {isListening
                  ? "Listening..."
                  : "Click microphone to start speaking"}
              </p>
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className={`p-4 rounded-full transition-all ${
              speechText
                ? "bg-green-500 hover:bg-green-600 cursor-pointer"
                : "bg-gray-200 cursor-not-allowed"
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