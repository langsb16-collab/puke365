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
        className={`w-12 h-16 sm:w-16 sm:h-24 bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950 rounded-xl border-3 border-amber-600/50 shadow-2xl flex items-center justify-center overflow-hidden relative ${className}`}
        style={style}
      >
        {/* 고급스러운 데미지 패턴 */}
        <div className="absolute inset-0 opacity-30">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="card-damask" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="8" fill="#d97706" opacity="0.3"/>
                <path d="M20 12 L23 18 L29 18 L24 22 L26 28 L20 24 L14 28 L16 22 L11 18 L17 18 Z" fill="#92400e" opacity="0.4"/>
                <circle cx="20" cy="20" r="4" fill="none" stroke="#78350f" strokeWidth="0.5" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#card-damask)"/>
          </svg>
        </div>
        
        {/* 중앙 장식 */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 sm:w-12 sm:h-12 border-2 border-amber-400/30 rounded-full flex items-center justify-center">
              <span className="text-amber-300/50 text-lg sm:text-2xl">♔</span>
            </div>
            <span className="text-amber-300/40 font-black text-[8px] sm:text-[10px] italic tracking-wider">CHUANQI</span>
          </div>
        </div>
        
        {/* 코너 장식 */}
        <div className="absolute top-1 left-1 text-amber-400/20 text-xs sm:text-sm">♠</div>
        <div className="absolute top-1 right-1 text-amber-400/20 text-xs sm:text-sm">♥</div>
        <div className="absolute bottom-1 left-1 text-amber-400/20 text-xs sm:text-sm">♦</div>
        <div className="absolute bottom-1 right-1 text-amber-400/20 text-xs sm:text-sm">♣</div>
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
