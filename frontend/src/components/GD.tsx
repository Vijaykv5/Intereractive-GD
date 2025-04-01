import React, { useEffect, useState } from "react";
import SpeechToText from "./SpeechRecognition/SpeechToText";
import { Clock, VideoOff } from "lucide-react";
import Video from "./VideoElement/Video";
import AnimatedParticipant from "./AnimatedParticipant";
import participant1 from '../assets/participant1.png';
import participant2 from '../assets/participant2.png';
const topics = [
  "Impact of Artificial Intelligence on Job Markets",
  "Cryptocurrencies: Future of Finance or Bubble?",
  "Role of Social Media in Shaping Public Opinion",
  "The Rise of Electric Vehicles: Opportunities and Challenges",
  "Sustainability in Fashion: Necessity or Trend?",
  "The Influence of ChatGPT on Education and Learning",
  "Work from Home vs. Office: The Future of Work",
  "Data Privacy in the Age of Surveillance Capitalism",
  "Climate Change and Its Impact on Global Economies",
  "Space Exploration: Should We Prioritize Mars Colonization?",
  "Gaming and Mental Health: Boon or Bane?",
  "India's Role in Shaping the Global Economy in 2025",
];

const GD: React.FC = () => {
  const [topic, setTopic] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(1800); // 30 minutes in seconds
  const [initialTimer, setInitialTimer] = useState<number>(10); // 10 seconds initial timer
  const [canLLMsStart, setCanLLMsStart] = useState<boolean>(false);
  const [speakingParticipant, setSpeakingParticipant] = useState<number | null>(null);
  const [participantAudio, setParticipantAudio] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    // Select a random topic on component mount
    setTopic(topics[Math.floor(Math.random() * topics.length)]);

    // Initial 10-second timer
    const initialTimerInterval = setInterval(() => {
      setInitialTimer((prev) => {
        if (prev <= 1) {
          clearInterval(initialTimerInterval);
          setCanLLMsStart(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Main countdown timer logic
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          alert("Time's up!");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Add this effect to handle participant speaking states
    const handleParticipantSpeaking = (event: MessageEvent) => {
      const data = event.data;
      if (data.type === 'participant_speaking') {
        setSpeakingParticipant(data.participantId);
        if (data.audioUrl) {
          setParticipantAudio(prev => ({
            ...prev,
            [data.participantId]: data.audioUrl
          }));
        }
      } else if (data.type === 'participant_stopped_speaking') {
        setSpeakingParticipant(null);
      }
    };

    window.addEventListener('message', handleParticipantSpeaking);
    return () => {
      clearInterval(timer);
      clearInterval(initialTimerInterval);
      window.removeEventListener('message', handleParticipantSpeaking);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Top Section with Topic and Timer */}
      <div className="relative z-10 w-full bg-gray-900/50 backdrop-blur-sm border-b border-white/10 mb-2">
        <div className="max-w-7xl mx-auto px-4 py-4 relative">
          {/* Timer */}
          <div className="absolute top-4 left-4 bg-yellow-500 text-black px-4 py-2 rounded-full flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span className="font-semibold">{formatTime(timeLeft)}</span>
          </div>

          {/* Initial Timer */}
          {!canLLMsStart && (
            <div className="absolute top-28 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-full flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">
                Starting in: {initialTimer}s
              </span>
            </div>
          )}

          {/* Profile */}
          <div className="absolute top-4 right-4 flex items-center space-x-3">
            <img
              src={JSON.parse(localStorage.getItem("user") || "{}")?.photo_url}
              alt="User profile"
              className="w-10 h-10 rounded-full border-2 border-yellow-500"
            />
            <span className="font-semibold text-white">
              {JSON.parse(localStorage.getItem("user") || "{}")?.name}
            </span>
          </div>

          {/* Topic */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-yellow-500 mb-2">
              Discussion Topic
            </h1>
            <p className="text-lg text-gray-300">{topic}</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 h-[calc(100vh-13rem)] ">
        <div className="flex gap-6 h-full ">
          {/* Left Side - Your Video */}
          <div className="w-2/3 h-full mt-16">
            <div className="h-full rounded-2xl overflow-hidden ">
              <Video width="100%" height="100%" maxWidth="none" topic={topic} />
            </div>
          </div>

          {/* Right Side - Other Participants */}
          {/* <div className="w-1/3 flex flex-col justify-center space-y-4 py-8">

            {[1, 2].map((index) => (
              <div
                key={index}
                className="h-[45%] bg-gray-900/50 rounded-2xl overflow-hidden border border-gray-800 flex items-center justify-center relative"
              >
                <div className="absolute top-3 left-3 bg-black/50 px-3 py-1 rounded-full">
                  <p className="text-white text-sm">Participant {index}</p>
                </div>
                <VideoOff className="w-8 h-8 text-gray-600" />
              </div>
            ))}
          </div>  */}

          <div className="w-1/3 flex flex-col justify-center space-y-4 py-8">
            <div className="h-[45%] bg-gray-900/50 rounded-2xl overflow-hidden border border-gray-800 relative">
              <div className="absolute top-3 left-3 bg-black/50 px-3 py-1 rounded-full z-10">
                <p className="text-white text-sm">Participant 1</p>
              </div>
              <AnimatedParticipant
                participantId={1}
                image={participant1}
                isSpeaking={speakingParticipant === 1}
                audioUrl={participantAudio[1]}
              />
            </div>
            <div className="h-[45%] bg-gray-900/50 rounded-2xl overflow-hidden border border-gray-800 relative">
              <div className="absolute top-3 left-3 bg-black/50 px-3 py-1 rounded-full z-10">
                <p className="text-white text-sm">Participant 2</p>
              </div>
              <AnimatedParticipant
                participantId={2}
                image={participant2}
                isSpeaking={speakingParticipant === 2}
                audioUrl={participantAudio[2]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Controls at Bottom */}
      <div className="relative z-10">
        <SpeechToText topic={topic} canLLMsStart={canLLMsStart} />
      </div>
    </div>
  );
};

export default GD;
