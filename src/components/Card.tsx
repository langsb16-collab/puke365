import React from 'react';
import { Card as CardType } from '../types';
import { motion } from 'motion/react';

interface CardProps {
  card?: CardType;
  hidden?: boolean;
  className?: string;
  style?: React.CSSProperties;
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

export const Card: React.FC<CardProps> = ({ card, hidden, className = '', style }) => {
  if (hidden || !card) {
    return (
      <motion.div
        initial={{ rotateY: 180 }}
        animate={{ rotateY: 180 }}
        className={`w-12 h-16 sm:w-16 sm:h-24 bg-gradient-to-br from-red-800 to-red-950 rounded-xl border-3 border-white/30 shadow-2xl flex items-center justify-center overflow-hidden ${className}`}
        style={style}
      >
        <div className="w-full h-full opacity-20 grid grid-cols-3 gap-1 p-1">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="w-2 h-2 bg-white rounded-full" />
          ))}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 sm:w-14 sm:h-14 border-3 border-white/20 rounded-full flex items-center justify-center">
            <span className="text-white/30 font-black text-[10px] sm:text-xs italic tracking-tighter">CHUANQI</span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      className={`w-12 h-16 sm:w-16 sm:h-24 bg-white rounded-xl border-2 border-gray-100 shadow-2xl flex flex-col p-1.5 sm:p-2.5 relative overflow-hidden ${className}`}
      style={style}
    >
      {/* 좌상단 숫자 */}
      <div className={`text-sm sm:text-2xl font-black leading-none ${SUIT_COLORS[card.suit]} drop-shadow-sm`}>
        {card.rank}
      </div>
      {/* 좌상단 문양 */}
      <div className={`text-sm sm:text-xl leading-none ${SUIT_COLORS[card.suit]}`}>
        {SUIT_SYMBOLS[card.suit]}
      </div>
      
      {/* 중앙 큰 문양 */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl sm:text-6xl opacity-15 ${SUIT_COLORS[card.suit]}`}>
        {SUIT_SYMBOLS[card.suit]}
      </div>

      {/* 우하단 (회전) */}
      <div className={`absolute bottom-1.5 right-1.5 sm:bottom-2.5 sm:right-2.5 text-sm sm:text-2xl font-black ${SUIT_COLORS[card.suit]} rotate-180`}>
        {card.rank}
      </div>

      {/* 빛나는 효과 */}
      <motion.div 
        animate={{ x: [-100, 200] }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: "linear" }}
        className="absolute inset-0 w-8 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 pointer-events-none"
      />
    </motion.div>
  );
};
