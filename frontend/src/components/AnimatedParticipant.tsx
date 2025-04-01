import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import lip1 from "../assets/lip1.png";
// import lip2 from "../assets/lip2.png";


interface AnimatedParticipantProps {
  participantId: number;
  image: string;
  isSpeaking: boolean;
  audioUrl?: string;
}

const AnimatedParticipant: React.FC<AnimatedParticipantProps> = ({
  participantId,
  image,
  isSpeaking,
  audioUrl,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play();
    }
  }, [audioUrl]);

  useEffect(() => {
    setIsAnimating(isSpeaking);
  }, [isSpeaking]);

  return (
    <div className="relative h-full w-full">
      <audio ref={audioRef} className="hidden" />
      <motion.div
        className="relative h-full w-full"
        animate={{
          scale: isAnimating ? [1, 1.02, 1] : 1,
          rotate: isAnimating ? [0, 0.5, -0.5, 0] : 0,
        }}
        transition={{
          duration: 0.4,
          repeat: isAnimating ? Infinity : 0,
          ease: "easeInOut",
        }}
      >
        {/* Base participant image */}
        <img
          src={image}
          alt={`Participant ${participantId}`}
          className="w-full h-full object-cover"
        />

        {/* Animated lip overlay */}
        <motion.img
          src={lip1}
          alt="Lip animation"
          className="absolute bottom-[40%] left-[38%] transform -translate-x-1/2 w-[90px] h-auto z-10"
          initial={{ scale: 1, translateY: 0 }}
          animate={isAnimating ? {
            scale: [1, 1.1, 0.95, 1],
            translateY: [0, -1, 0.5, 0],
          } : {
            scale: 1,
            translateY: 0
          }}
          transition={isAnimating ? {
            duration: 0.4,
            repeat: Infinity,
            ease: "easeInOut",
          } : {
            duration: 0.2,
            ease: "easeOut"
          }}
          style={{
            mixBlendMode: "normal",
            objectFit: "contain"
          }}
        />
      </motion.div>
    </div>
  );
};

export default AnimatedParticipant; 