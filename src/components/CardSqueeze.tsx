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

  // Map drag position to rotation and reveal
  const rotateZ = useTransform(x, [0, 100], [0, 25]);
  const rotateX = useTransform(y, [0, -100], [0, -20]);
  const revealWidth = useTransform(x, [0, 150], ["0%", "100%"]);
  const revealHeight = useTransform(y, [0, -150], ["0%", "100%"]);
  
  // Opacity of the back card as we squeeze
  const backOpacity = useTransform(x, [0, 100], [1, 0.3]);

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
    if (x.get() > 100 || y.get() < -100) {
      setIsRevealed(true);
      audio.playSynthesized('win');
      if (onComplete) onComplete();
    } else {
      x.set(0);
      y.set(0);
      audio.playSynthesized('card');
    }
  };

  return (
    <div className={`relative w-48 h-72 perspective-1000 ${className}`}>
      {/* Finger Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            style={{ x: fingerX, y: fingerY }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.8, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed z-[300] w-16 h-16 -ml-8 -mt-8 pointer-events-none"
          >
            <div className="w-full h-full bg-gradient-to-br from-orange-200 to-orange-400 rounded-full shadow-2xl border-2 border-white/20 opacity-60 blur-[2px]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 bg-white/20 rounded-full animate-ping" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isRevealed && (
          <motion.div
            drag
            dragConstraints={{ left: 0, right: 150, top: -150, bottom: 0 }}
            style={{ x, y, rotateZ, rotateX }}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 z-20 cursor-grab active:cursor-grabbing"
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

            {/* Partial Reveal Mask (The "Squeeze" effect) */}
            <motion.div 
              style={{ width: revealWidth, height: revealHeight }}
              className="absolute top-0 left-0 overflow-hidden rounded-2xl border-4 border-white/50 bg-white shadow-2xl pointer-events-none"
            >
              <div className="w-48 h-72 p-4 flex flex-col relative">
                <div className={`text-5xl font-black leading-none ${SUIT_COLORS[card.suit]}`}>
                  {card.rank}
                </div>
                <div className={`text-4xl leading-none mt-2 ${SUIT_COLORS[card.suit]}`}>
                  {SUIT_SYMBOLS[card.suit]}
                </div>
                <div className={`absolute bottom-4 right-4 text-9xl opacity-10 ${SUIT_COLORS[card.suit]}`}>
                  {SUIT_SYMBOLS[card.suit]}
                </div>
                
                {/* Shine Effect */}
                <motion.div 
                  animate={{ x: [-100, 300] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 w-20 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 pointer-events-none"
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
      {!isRevealed && (
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap text-white/40 text-[10px] font-black uppercase tracking-[0.3em] animate-bounce">
          Drag to Squeeze
        </div>
      )}
    </div>
  );
};
