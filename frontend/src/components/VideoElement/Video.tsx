import React, { useRef, useState, useEffect } from 'react';
import { Video as VideoIcon, VideoOff } from 'lucide-react';


// qkpv2285;

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

  useEffect(() => {
    startStream();
    return () => {
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

  const toggleVideo = async () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(!isVideoOn);
      }
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
    </div>
  );
};

export default Video;
