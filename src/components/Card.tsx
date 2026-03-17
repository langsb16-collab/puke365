import React from 'react';
import { Card as CardType } from '../types';
import { motion } from 'motion/react';

interface CardProps {
  card?: CardType;
  hidden?: boolean;
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

export const Card: React.FC<CardProps> = ({ card, hidden, className = '' }) => {
  if (hidden || !card) {
    return (
      <motion.div
        initial={{ rotateY: 180 }}
        animate={{ rotateY: 180 }}
        className={`w-12 h-16 sm:w-16 sm:h-24 bg-gradient-to-br from-red-800 to-red-950 rounded-lg border-2 border-white/20 shadow-xl flex items-center justify-center overflow-hidden ${className}`}
      >
        <div className="w-full h-full opacity-20 flex flex-wrap gap-1 p-1">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="w-2 h-2 bg-white rounded-full" />
          ))}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 sm:w-12 sm:h-12 border-2 border-white/30 rounded-full flex items-center justify-center">
            <span className="text-white/40 font-bold text-xs">WSOP</span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      className={`w-12 h-16 sm:w-16 sm:h-24 bg-white rounded-lg border-2 border-gray-200 shadow-xl flex flex-col p-1 sm:p-2 relative overflow-hidden ${className}`}
    >
      <div className={`text-xs sm:text-lg font-bold leading-none ${SUIT_COLORS[card.suit]}`}>
        {card.rank}
      </div>
      <div className={`text-xs sm:text-lg leading-none ${SUIT_COLORS[card.suit]}`}>
        {SUIT_SYMBOLS[card.suit]}
      </div>
      
      <div className={`absolute bottom-1 right-1 sm:bottom-2 sm:right-2 text-lg sm:text-3xl opacity-20 ${SUIT_COLORS[card.suit]}`}>
        {SUIT_SYMBOLS[card.suit]}
      </div>

      {/* Card Shine Effect */}
      <motion.div 
        animate={{ x: [-100, 200] }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: "linear" }}
        className="absolute inset-0 w-8 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 pointer-events-none"
      />
    </motion.div>
  );
};
