import React, { useEffect, useState } from "react";
import SpeechToText from "./SpeechRecognition/SpeechToText";
import { Clock } from 'lucide-react';
import Video from "./VideoElement/Video";
import { VideoOff } from 'lucide-react';

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

const TopicPage: React.FC = () => {
  const [topic, setTopic] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(1800); // 30 minutes in seconds

  useEffect(() => {
    // Select a random topic on component mount
    setTopic(topics[Math.floor(Math.random() * topics.length)]);

    // Countdown timer logic
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // You might want to handle completion differently
          alert("Time's up!");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-100 to-blue-100 text-gray-800">
      {/* Top Section with Topic and Timer */}
      <div className="w-full bg-white/80 backdrop-blur-sm shadow-lg mb-6">
        <div className="max-w-7xl mx-auto px-4 py-4 relative">
          {/* Timer */}
          <div className="absolute top-4 right-4 bg-violet-600 text-white px-4 py-2 rounded-full flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span className="font-semibold">{formatTime(timeLeft)}</span>
          </div>
          
          {/* Topic */}
          <div className="text-center pr-32">
            <h1 className="text-2xl font-bold text-violet-800 mb-2">Discussion Topic</h1>
            <p className="text-lg text-gray-700">{topic}</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 h-[calc(100vh-13rem)]">
        <div className="flex gap-6 h-full">
          {/* Left Side - Your Video */}
          <div className="w-2/3 h-full">
            <div className="h-full rounded-2xl overflow-hidden shadow-xl">
              <Video width="100%" height="100%" maxWidth="none" />
            </div>
          </div>

          {/* Right Side - Other Participants */}
          <div className="w-1/3 grid grid-rows-3 gap-4">
            {[1, 2, 3].map((index) => (
              <div 
                key={index}
                className="aspect-square bg-gray-800 rounded-2xl overflow-hidden shadow-xl flex items-center justify-center relative"
              >
                <div className="absolute top-3 left-3 bg-black/50 px-3 py-1 rounded-full">
                  <p className="text-white text-sm">Participant {index}</p>
                </div>
                <VideoOff className="w-8 h-8 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controls at Bottom */}
      <SpeechToText />
    </div>
  );
};

export default TopicPage;
