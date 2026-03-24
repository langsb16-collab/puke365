import React from 'react';
import { GameState } from '../types';
import { Card } from './Card';
import { useTranslation } from '../LanguageContext';
import { motion, AnimatePresence } from 'motion/react';
import { User, Bot } from 'lucide-react';

interface MobilePortraitProps {
  gameState: GameState;
  user: any;
  isUserTurn: boolean;
  handleAction: (action: string) => void;
  handleCardClick?: (index: number) => void;
  squeezedCards?: Set<number>;
}

/**
 * 🎰 헬로포커스 스타일 모바일 세로 UI
 * 
 * 핵심:
 * - 세로형 타원 테이블
 * - 중앙 집중 레이아웃
 * - 큰 내 카드
 * - 최소 정보
 */
export const MobilePortrait: React.FC<MobilePortraitProps> = ({
  gameState,
  user,
  isUserTurn,
  handleAction,
  handleCardClick,
  squeezedCards = new Set()
}) => {
  const { t } = useTranslation();

  // 플레이어 위치 (헬로포커스 스타일 - 세로형)
  const mobilePositions = [
    "bottom-[20%] left-1/2 -translate-x-1/2",  // 0: 본인 (하단 중앙)
    "top-[8%] left-[15%]",                      // 1: 좌측 상단
    "top-[8%] right-[15%]",                     // 2: 우측 상단
    "top-[25%] left-[8%]",                      // 3: 좌측 중상단
    "top-[25%] right-[8%]",                     // 4: 우측 중상단
    "top-[45%] left-[5%]",                      // 5: 좌측 중단
    "top-[45%] right-[5%]",                     // 6: 우측 중단
    "top-[5%] left-1/2 -translate-x-1/2",       // 7: 정중앙 상단
    "top-[15%] left-1/2 -translate-x-1/2"       // 8: 중앙 상단
  ];

  return (
    <div 
      className="h-screen flex flex-col bg-black text-white relative overflow-hidden"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* 최소한의 헤더 */}
      <header className="h-12 bg-black/60 backdrop-blur-sm border-b border-white/5 flex items-center justify-between px-3 z-50">
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 rounded-full bg-yellow-500 animate-pulse" />
          <span className="text-yellow-500 text-sm font-bold font-mono">
            {gameState.pot.toLocaleString()}{t('currency')}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-xs">{t('yourChips')}:</span>
          <span className="text-yellow-500 text-sm font-bold font-mono">
            {user.chips.toLocaleString()}{t('currency')}
          </span>
        </div>
      </header>

      {/* 테이블 영역 (세로형 타원) */}
      <div className="flex-1 relative flex items-center justify-center p-2">
        {/* 세로형 타원 테이블 */}
        <div 
          className="absolute inset-0 mx-auto"
          style={{
            width: '92%',
            height: '65vh',
            maxWidth: '500px',
            background: 'radial-gradient(ellipse at center, #0f766e 0%, #064e3b 70%, #022c22 100%)',
            borderRadius: '50% / 35%',
            boxShadow: 'inset 0 0 60px rgba(0,0,0,0.6), 0 10px 40px rgba(0,0,0,0.5)',
            border: '8px solid #1f2937',
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        >
          {/* 테이블 라인 */}
          <div 
            className="absolute inset-4 border-2 border-white/10 rounded-[50%/35%]"
          />
        </div>

        {/* 중앙 팟 표시 */}
        <div 
          className="absolute z-20"
          style={{
            top: '45%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="bg-black/60 backdrop-blur-xl px-6 py-3 rounded-full border-2 border-yellow-500/30"
          >
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-yellow-500/60 uppercase font-bold">TOTAL POT</span>
              <span className="text-xl font-black text-yellow-500 font-mono">
                {gameState.pot.toLocaleString()}{t('currency')}
              </span>
            </div>
          </motion.div>
        </div>

        {/* 커뮤니티 카드 (중앙 상단) */}
        {gameState.communityCards.length > 0 && (
          <div 
            className="absolute z-20"
            style={{
              top: '32%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="flex gap-2">
              {gameState.communityCards.map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotateY: 180 }}
                  animate={{ scale: 1, rotateY: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card 
                    card={card} 
                    hidden={false} 
                    className="w-[50px] h-[70px] shadow-2xl" 
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* 다른 플레이어들 (간소화) */}
        {gameState.players.map((p, i) => {
          if (p.id === 'user') return null;
          
          return (
            <div 
              key={p.id}
              className={`absolute z-10 ${mobilePositions[i]}`}
            >
              <motion.div 
                animate={{ 
                  scale: gameState.activePlayerIndex === i ? 1.1 : 1,
                  opacity: p.isFolded ? 0.4 : 1
                }}
                className="flex flex-col items-center gap-1"
              >
                {/* 아바타 */}
                <div className="relative">
                  <img 
                    src={p.avatar} 
                    alt={p.name}
                    className={`w-12 h-12 rounded-full border-2 ${
                      gameState.activePlayerIndex === i 
                        ? 'border-yellow-500 ring-2 ring-yellow-500/30' 
                        : 'border-white/20'
                    }`}
                  />
                  {/* AI 뱃지 */}
                  {p.isAI && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center border border-black">
                      <Bot size={10} className="text-white" />
                    </div>
                  )}
                </div>

                {/* 칩 정보 */}
                <div className="bg-black/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/10">
                  <span className="text-yellow-500 text-[10px] font-bold font-mono">
                    {p.chips.toLocaleString()}
                  </span>
                </div>

                {/* 베팅액 */}
                {p.currentBet > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-yellow-500/20 backdrop-blur-sm px-2 py-0.5 rounded-full border border-yellow-500/30"
                  >
                    <span className="text-yellow-500 text-[9px] font-bold font-mono">
                      {p.currentBet.toLocaleString()}
                    </span>
                  </motion.div>
                )}

                {/* 딜러 버튼 */}
                {p.isDealer && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full border-2 border-gray-300 flex items-center justify-center shadow-lg">
                    <span className="text-[8px] font-black text-gray-800">D</span>
                  </div>
                )}

                {/* 액션 뱃지 */}
                <AnimatePresence>
                  {p.lastAction && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`
                        px-2 py-0.5 rounded-full text-[8px] font-bold uppercase
                        ${p.lastAction === 'fold' ? 'bg-red-500 text-white' :
                          p.lastAction === 'raise' ? 'bg-green-500 text-white' :
                          p.lastAction === 'all-in' ? 'bg-purple-600 text-white' :
                          'bg-blue-500 text-white'}
                      `}
                    >
                      {t(p.lastAction === 'all-in' ? 'allIn' : p.lastAction)}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* 내 카드 (하단 중앙, 크게) */}
      <div className="flex justify-center gap-3 px-4 pb-2">
        {user.cards.map((card: any, i: number) => {
          const shouldShowCard = gameState.stage === 'showdown' || squeezedCards.has(i);
          return (
            <motion.div 
              key={i}
              onClick={() => handleCardClick?.(i)}
              className="cursor-pointer relative"
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card 
                card={card}
                hidden={!shouldShowCard}
                className={`
                  w-20 h-28
                  ${i === 0 ? 'rotate-2' : '-rotate-2'}
                  shadow-2xl
                `}
                style={{
                  transform: 'scale(1.2)',
                  filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.6))',
                }}
              />
              {!shouldShowCard && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce z-30 shadow-lg">
                  TAP
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* 액션 버튼 (4열 그리드, 원색) */}
      <footer className="bg-neutral-900/95 backdrop-blur-sm border-t border-white/10 px-2 pb-3 pt-2">
        <div className="grid grid-cols-4 gap-2">
          <button 
            disabled={!isUserTurn}
            onClick={() => handleAction('fold')}
            className="h-14 rounded-xl bg-red-600 hover:bg-red-500 active:bg-red-700 disabled:opacity-30 disabled:cursor-not-allowed font-black uppercase text-xs transition-all active:scale-95 shadow-lg shadow-red-900/40 border-b-4 border-red-800"
          >
            {t('fold')}
          </button>

          <button 
            disabled={!isUserTurn}
            onClick={() => handleAction(gameState.currentBet === user.currentBet ? 'check' : 'call')}
            className="h-14 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed font-black uppercase text-xs transition-all active:scale-95 shadow-lg shadow-blue-900/40 border-b-4 border-blue-800"
          >
            {gameState.currentBet === user.currentBet ? t('check') : t('call')}
          </button>

          <button 
            disabled={!isUserTurn}
            onClick={() => handleAction('raise')}
            className="h-14 rounded-xl bg-green-600 hover:bg-green-500 active:bg-green-700 disabled:opacity-30 disabled:cursor-not-allowed font-black uppercase text-xs transition-all active:scale-95 shadow-lg shadow-green-900/40 border-b-4 border-green-800"
          >
            {t('raise')}
          </button>

          <button 
            disabled={!isUserTurn}
            onClick={() => handleAction('all-in')}
            className="h-14 rounded-xl bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600 disabled:opacity-30 disabled:cursor-not-allowed font-black uppercase text-xs transition-all active:scale-95 shadow-lg shadow-yellow-900/40 border-b-4 border-yellow-700 text-black"
          >
            {t('allIn')}
          </button>
        </div>
      </footer>
    </div>
  );
};
