import React, { useRef, useState, useEffect } from 'react';
import { Video as VideoIcon, VideoOff } from 'lucide-react';
import axios from 'axios';


interface VideoProps {
  width?: string;
  height?: string;
  maxWidth?: string;
}

const Video: React.FC<VideoProps> = ({ 
  width = "640px", 
  height = "480px",
  maxWidth = "none"
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [error, setError] = useState<string>("");
  const [userName, setUserName] = useState('');

  useEffect(() => {
    startStream();
    const interval = setInterval(() => {
      captureScreenshot();
    }, 30000);

    return () => {
      clearInterval(interval);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false // Audio handled by SpeechToText component
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access camera");
    }
  };

  const captureScreenshot = async () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const screenshot = canvas.toDataURL('image/png');

      storeScreenshotInLocalStorage(screenshot);
    }
  };

  const storeScreenshotInLocalStorage = (screenshot: string) => {
    const existingScreenshots = JSON.parse(localStorage.getItem('screenshots') || '[]');
    existingScreenshots.push(screenshot);
    localStorage.setItem('screenshots', JSON.stringify(existingScreenshots));
    console.log('Screenshot stored in local storage:', screenshot);
  };

  const toggleVideo = async () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(!isVideoOn);
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await axios.post('/api/users', { name: userName });
      console.log(response.data.message);
    } catch (error) {
      console.error('Error storing user name:', error);
    }
  };

  return (
    <div className="w-full" style={{ maxWidth }}>
      <div className="relative rounded-2xl overflow-hidden bg-gray-900 shadow-xl aspect-video">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* Video Overlay when video is off */}
        {!isVideoOn && (
          <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
            <VideoOff size={48} className="text-gray-400" />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="absolute inset-0 bg-gray-800/90 flex items-center justify-center">
            <p className="text-white text-center px-4">{error}</p>
          </div>
        )}

        {/* Video Toggle */}
        <button
          onClick={toggleVideo}
          className={`absolute bottom-4 right-4 p-3 rounded-full transition-all shadow-lg backdrop-blur-sm ${
            isVideoOn
              ? "bg-violet-600/90 hover:bg-violet-700"
              : "bg-red-500/90 hover:bg-red-600"
          }`}
        >
          {isVideoOn ? (
            <VideoIcon className="w-6 h-6 text-white" />
          ) : (
            <VideoOff className="w-6 h-6 text-white" />
          )}
        </button>
      </div>

      {/* <div>
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            value={userName} 
            onChange={(e) => setUserName(e.target.value)} 
            placeholder="Enter your name" 
          />
          <button type="submit">Submit</button>
        </form>
      </div> */}
    </div>
  );
};

export default Video;
