import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'motion/react';
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

/**
 * 🎰 카지노 수준 카드 쪼기 UX
 * 
 * 핵심 구조:
 * - 카드 뒷면 (드래그 가능)
 * - 카드 앞면 (clip-path로 부분 노출)
 * - 최대 40%만 노출
 * - 손가락 위치 추적
 * - Haptic 피드백
 */
export const CardSqueeze: React.FC<CardSqueezeProps> = ({ card, onComplete, className = '' }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const audio = AudioManager.getInstance();

  // 드래그 X축 위치 (최대 120px = 40%)
  const x = useMotionValue(0);
  
  // 40% 노출 비율 계산 (0 ~ 0.4)
  const revealPercent = useTransform(x, [0, 120], [0, 0.4]);
  
  // 카드 휘어짐 (3D 효과)
  const rotateZ = useTransform(x, [0, 120], [0, -35]);
  const rotateY = useTransform(x, [0, 120], [0, 15]);
  
  // 뒷면 투명도
  const backOpacity = useTransform(x, [0, 120], [1, 0.5]);

  // Haptic 피드백 (모바일)
  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  // 드래그 시작
  const handleDragStart = () => {
    setIsDragging(true);
    triggerHaptic();
    audio.playSynthesized('click');
  };

  // 드래그 중
  const handleDrag = (event: any, info: PanInfo) => {
    // 종이 마찰 사운드 (주기적으로)
    if (Math.abs(info.delta.x) > 3) {
      audio.playSynthesized('card');
    }
  };

  // 드래그 종료
  const handleDragEnd = () => {
    setIsDragging(false);
    const dragDistance = x.get();
    
    // 60px 이상 드래그하면 완전 공개
    if (dragDistance > 60) {
      triggerHaptic();
      setIsRevealed(true);
      audio.playSynthesized('win');
      if (onComplete) onComplete();
    } else {
      // 다시 닫힘 (스프링 애니메이션)
      x.set(0);
      audio.playSynthesized('card');
    }
  };

  return (
    <div 
      className={`relative w-48 h-72 ${className}`} 
      style={{ 
        perspective: '1500px',
        touchAction: 'none' // 스크롤 방지
      }}
    >
      {/* 드래그 중 손가락 인디케이터 */}
      {isDragging && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          exit={{ opacity: 0 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-yellow-500/30 rounded-full animate-ping pointer-events-none z-30"
        />
      )}

      {!isRevealed ? (
        <div className="relative w-full h-full">
          {/* 🃏 카드 앞면 (clip-path로 부분 노출) */}
          <motion.div 
            className="absolute inset-0 bg-white rounded-2xl border-4 border-gray-100 shadow-2xl overflow-hidden"
            style={{
              clipPath: useTransform(
                revealPercent,
                (v) => `inset(0 ${100 - v * 100}% 0 0)`
              ),
              willChange: 'clip-path', // GPU 가속
            }}
          >
            {/* 카드 내용 */}
            <div className="w-full h-full p-6 flex flex-col relative bg-gradient-to-br from-white to-gray-50">
              {/* 좌상단 숫자 */}
              <div className={`text-6xl font-black leading-none ${SUIT_COLORS[card.suit]} drop-shadow-lg`}>
                {card.rank}
              </div>
              {/* 좌상단 문양 */}
              <div className={`text-5xl leading-none mt-2 ${SUIT_COLORS[card.suit]} drop-shadow-lg`}>
                {SUIT_SYMBOLS[card.suit]}
              </div>
              
              {/* 중앙 큰 문양 */}
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10rem] opacity-20 ${SUIT_COLORS[card.suit]}`}>
                {SUIT_SYMBOLS[card.suit]}
              </div>
              
              {/* 우하단 숫자 (회전) */}
              <div className={`absolute bottom-6 right-6 text-6xl font-black ${SUIT_COLORS[card.suit]} rotate-180`}>
                {card.rank}
              </div>
              
              {/* 빛나는 효과 */}
              <motion.div 
                animate={{ x: [-200, 300] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 w-24 h-full bg-gradient-to-r from-transparent via-yellow-300/40 to-transparent skew-x-12 pointer-events-none"
              />
            </div>
          </motion.div>

          {/* 🎴 카드 뒷면 (드래그 가능) */}
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 120 }} // 최대 120px (40%)
            dragElastic={0.1}
            dragMomentum={false}
            style={{ 
              x, 
              rotateZ, 
              rotateY,
              opacity: backOpacity,
              willChange: 'transform', // GPU 가속
            }}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 cursor-grab active:cursor-grabbing z-10"
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="w-full h-full bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950 rounded-2xl border-4 border-amber-600/50 shadow-2xl flex items-center justify-center overflow-hidden relative">
              {/* 고급스러운 데미지 패턴 */}
              <div className="absolute inset-0 opacity-40">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="damask-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                      <circle cx="40" cy="40" r="15" fill="#d97706" opacity="0.3"/>
                      <path d="M40 25 L45 35 L55 35 L47 42 L50 52 L40 45 L30 52 L33 42 L25 35 L35 35 Z" fill="#92400e" opacity="0.4"/>
                      <circle cx="40" cy="40" r="8" fill="none" stroke="#78350f" strokeWidth="1" opacity="0.3"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#damask-pattern)"/>
                </svg>
              </div>
              
              {/* 중앙 문양 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* 외곽 테두리 */}
                  <div className="w-40 h-40 border-[3px] border-amber-400/40 rounded-full" />
                  
                  {/* 내부 장식 원 */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-[2px] border-amber-400/30 rounded-full" />
                  
                  {/* 중앙 심볼 */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
                    <div className="text-amber-300/60 text-5xl">♔</div>
                    <span className="text-amber-300/50 font-black text-lg italic tracking-widest">CHUANQI</span>
                  </div>
                </div>
              </div>
              
              {/* 코너 장식 */}
              <div className="absolute top-4 left-4 text-amber-400/30 text-2xl">♠</div>
              <div className="absolute top-4 right-4 text-amber-400/30 text-2xl">♥</div>
              <div className="absolute bottom-4 left-4 text-amber-400/30 text-2xl">♦</div>
              <div className="absolute bottom-4 right-4 text-amber-400/30 text-2xl">♣</div>
            </div>
          </motion.div>
        </div>
      ) : (
        /* 완전 공개된 카드 */
        <motion.div
          initial={{ scale: 0.9, opacity: 0, rotateY: 90 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          transition={{ type: "spring", damping: 20 }}
          className="w-full h-full bg-white rounded-2xl border-4 border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden"
        >
          <div className="w-full h-full p-6 flex flex-col relative bg-gradient-to-br from-white to-gray-50">
            <div className={`text-7xl font-black leading-none ${SUIT_COLORS[card.suit]}`}>
              {card.rank}
            </div>
            <div className={`text-6xl leading-none mt-4 ${SUIT_COLORS[card.suit]}`}>
              {SUIT_SYMBOLS[card.suit]}
            </div>
            
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[12rem] opacity-15 ${SUIT_COLORS[card.suit]}`}>
              {SUIT_SYMBOLS[card.suit]}
            </div>
            
            <div className={`absolute bottom-6 right-6 text-7xl font-black ${SUIT_COLORS[card.suit]} rotate-180`}>
              {card.rank}
            </div>
            
            {/* 승리 빛나는 효과 */}
            <motion.div 
              animate={{ x: [-300, 500] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
              className="absolute inset-0 w-32 h-full bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-12 pointer-events-none"
            />
          </div>
        </motion.div>
      )}

      {/* 안내 텍스트 */}
      {!isRevealed && !isDragging && (
        <motion.div 
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -bottom-16 left-1/2 -translate-x-1/2 whitespace-nowrap text-yellow-400 text-xs font-black uppercase tracking-[0.3em]"
        >
          👉 카드를 오른쪽으로 밀어보세요
        </motion.div>
      )}
    </div>
  );
};
