import React from 'react';
import { Card as CardType } from '../types';

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
      <div
        className={`w-12 h-16 sm:w-16 sm:h-24 bg-gradient-to-br from-orange-600 via-orange-500 to-orange-600 rounded-xl border-3 border-orange-400 shadow-2xl flex items-center justify-center overflow-hidden relative ${className}`}
        style={style}
      >
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="card-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="3" fill="#fff" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#card-pattern)"/>
          </svg>
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <span className="text-white text-3xl sm:text-4xl">👑</span>
        </div>
      </div>
    );
  }

  return (
    <div
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
    </div>
  );
};
