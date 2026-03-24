import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'motion/react';
import { Card as CardType } from '../types';
import { AudioManager } from '../services/AudioManager';

interface CardSqueezeProps {
  card: CardType;
  onComplete?: () => void;
  className?: string;
}

const SUIT_SYMBOLS: Record<string, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const SUIT_COLORS: Record<string, string> = {
  hearts: 'text-red-600',
  diamonds: 'text-blue-600',
  clubs: 'text-gray-900',
  spades: 'text-gray-900',
};

export const CardSqueeze: React.FC<CardSqueezeProps> = ({ card, onComplete, className = '' }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const audio = AudioManager.getInstance();

  // Map drag position to rotation and reveal - 40% reveal threshold
  const rotateZ = useTransform(x, [0, 100], [0, 35]);
  const rotateX = useTransform(y, [0, -100], [0, -25]);
  const rotateY = useTransform(x, [0, 100], [0, 15]); // Add Y-axis rotation for 3D effect
  const revealWidth = useTransform(x, [0, 100], ["0%", "40%"]); // 40% reveal on horizontal drag
  const revealHeight = useTransform(y, [0, -100], ["0%", "40%"]); // 40% reveal on vertical drag
  
  // Opacity of the back card as we squeeze
  const backOpacity = useTransform(x, [0, 100], [1, 0.6]); // Keep more opacity for realistic effect

  // Finger position follow
  const fingerX = useMotionValue(0);
  const fingerY = useMotionValue(0);

  const handleDragStart = (event: any, info: any) => {
    setIsDragging(true);
    audio.playSynthesized('click');
  };

  const handleDrag = (event: any, info: any) => {
    // Play a subtle scratch sound occasionally
    if (Math.abs(info.delta.x) > 2 || Math.abs(info.delta.y) > 2) {
      audio.playSynthesized('card');
    }
    
    // Update finger position relative to the card
    fingerX.set(info.point.x);
    fingerY.set(info.point.y);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    // Reveal only when dragged enough (40% threshold)
    if (x.get() > 80 || y.get() < -80) {
      setIsRevealed(true);
      audio.playSynthesized('win');
      if (onComplete) onComplete();
    } else {
      // Spring back animation
      x.set(0);
      y.set(0);
      audio.playSynthesized('card');
    }
  };

  return (
    <div className={`relative w-48 h-72 ${className}`} style={{ perspective: '1500px' }}>
      {/* Finger Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            style={{ x: fingerX, y: fingerY }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.7, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed z-[300] w-20 h-20 -ml-10 -mt-10 pointer-events-none"
          >
            <div className="w-full h-full bg-gradient-to-br from-orange-300 to-orange-500 rounded-full shadow-2xl border-4 border-white/30 opacity-70 blur-[1px]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-white/30 rounded-full animate-ping" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isRevealed && (
          <motion.div
            drag
            dragConstraints={{ left: 0, right: 100, top: -100, bottom: 0 }}
            dragElastic={0.1}
            style={{ x, y, rotateZ, rotateX, rotateY }}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 z-20 cursor-grab active:cursor-grabbing"
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            {/* Card Back */}
            <motion.div 
              style={{ opacity: backOpacity }}
              className="w-full h-full bg-gradient-to-br from-red-800 to-red-950 rounded-2xl border-4 border-white/30 shadow-2xl flex items-center justify-center overflow-hidden"
            >
              <div className="w-full h-full opacity-20 flex flex-wrap gap-2 p-4">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div key={i} className="w-4 h-4 bg-white rounded-full" />
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 border-4 border-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white/30 font-black text-2xl italic tracking-tighter">CHUANQI</span>
                </div>
              </div>
            </motion.div>

            {/* Partial Reveal Mask (The "Squeeze" effect - 40% reveal) */}
            <motion.div 
              style={{ width: revealWidth, height: revealHeight }}
              className="absolute top-0 left-0 overflow-hidden rounded-2xl border-4 border-yellow-400/70 bg-white shadow-[0_10px_50px_rgba(0,0,0,0.5)] pointer-events-none"
            >
              <div className="w-48 h-72 p-4 flex flex-col relative bg-gradient-to-br from-white to-gray-50">
                <div className={`text-5xl font-black leading-none ${SUIT_COLORS[card.suit]} drop-shadow-lg`}>
                  {card.rank}
                </div>
                <div className={`text-4xl leading-none mt-2 ${SUIT_COLORS[card.suit]} drop-shadow-lg`}>
                  {SUIT_SYMBOLS[card.suit]}
                </div>
                <div className={`absolute bottom-4 right-4 text-9xl opacity-10 ${SUIT_COLORS[card.suit]}`}>
                  {SUIT_SYMBOLS[card.suit]}
                </div>
                
                {/* Enhanced Shine Effect */}
                <motion.div 
                  animate={{ x: [-150, 350] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 w-24 h-full bg-gradient-to-r from-transparent via-yellow-300/50 to-transparent skew-x-12 pointer-events-none blur-[1px]"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fully Revealed Card */}
      {isRevealed && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0, rotateY: 90 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          className="w-full h-full bg-white rounded-2xl border-4 border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col p-6 relative overflow-hidden"
        >
          <div className={`text-6xl font-black leading-none ${SUIT_COLORS[card.suit]}`}>
            {card.rank}
          </div>
          <div className={`text-5xl leading-none mt-4 ${SUIT_COLORS[card.suit]}`}>
            {SUIT_SYMBOLS[card.suit]}
          </div>
          
          <div className={`absolute bottom-6 right-6 text-[10rem] opacity-10 ${SUIT_COLORS[card.suit]}`}>
            {SUIT_SYMBOLS[card.suit]}
          </div>
          
          {/* Shine effect */}
          <motion.div 
            animate={{ x: [-200, 400] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
            className="absolute inset-0 w-32 h-full bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-12 pointer-events-none"
          />
        </motion.div>
      )}

      {/* Instruction Text */}
      {!isRevealed && !isDragging && (
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 whitespace-nowrap text-yellow-400 text-xs font-black uppercase tracking-[0.3em] animate-pulse">
          👆 드래그하여 카드 쪼이기
        </div>
      )}
    </div>
  );
};
