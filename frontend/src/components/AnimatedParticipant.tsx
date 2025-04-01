import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

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
  const [mouthShape, setMouthShape] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const mouthShapeInterval = useRef<number | null>(null);

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play();
    }
  }, [audioUrl]);

  useEffect(() => {
    if (isSpeaking) {
      setIsAnimating(true);
      // Start mouth shape animation
      mouthShapeInterval.current = window.setInterval(() => {
        setMouthShape(prev => (prev + 1) % 4); // Cycle through 4 mouth shapes
      }, 150); // Change mouth shape every 150ms
    } else {
      setIsAnimating(false);
      setMouthShape(0); // Reset to closed mouth
      if (mouthShapeInterval.current) {
        window.clearInterval(mouthShapeInterval.current);
        mouthShapeInterval.current = null;
      }
    }

    return () => {
      if (mouthShapeInterval.current) {
        window.clearInterval(mouthShapeInterval.current);
      }
    };
  }, [isSpeaking]);

  // Define mouth shapes
  const mouthShapes = {
    0: { height: 4, width: 20 }, // Closed mouth
    1: { height: 8, width: 24 }, // Slightly open
    2: { height: 12, width: 28 }, // Open
    3: { height: 8, width: 24 }, // Slightly open (alternate)
  };

  return (
    <div className="relative h-full w-full">
      <audio ref={audioRef} className="hidden" />
      <motion.div
        className="relative h-full w-full"
        animate={{
          scale: isAnimating ? [1, 1.02, 1] : 1,
          rotate: isAnimating ? [0, 1, -1, 0] : 0,
        }}
        transition={{
          duration: 0.5,
          repeat: isAnimating ? Infinity : 0,
          ease: "easeInOut",
        }}
      >
        <img
          src={image}
          alt={`Participant ${participantId}`}
          className="w-full h-full object-cover"
        />
        {/* Enhanced lip sync animation overlay */}
        <motion.div
          className="absolute bottom-[15%] left-1/2 transform -translate-x-1/2 bg-black/30 rounded-full"
          animate={{
            height: mouthShapes[mouthShape as keyof typeof mouthShapes].height,
            width: mouthShapes[mouthShape as keyof typeof mouthShapes].width,
          }}
          transition={{
            duration: 0.1,
            ease: "easeInOut",
          }}
        />
        {/* Additional lip movement indicators */}
        {isAnimating && (
          <>
            <motion.div
              className="absolute bottom-[20%] left-[45%] w-2 h-2 bg-black/30 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 0.3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute bottom-[20%] right-[45%] w-2 h-2 bg-black/30 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 0.3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.1,
              }}
            />
          </>
        )}
      </motion.div>
    </div>
  );
};

export default AnimatedParticipant; 