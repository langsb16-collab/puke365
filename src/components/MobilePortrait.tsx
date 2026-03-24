import React from 'react';
import { GameState } from '../types';
import { useTranslation } from '../LanguageContext';
import { motion, AnimatePresence } from 'motion/react';
import { Bot } from 'lucide-react';

interface MobilePortraitProps {
  gameState: GameState;
  user: any;
  isUserTurn: boolean;
  handleAction: (action: string) => void;
  handleCardClick?: (index: number) => void;
  squeezedCards?: Set<number>;
}

/**
 * 🎰 헬로포커스 스타일 모바일 포커 UI
 * 
 * 핵심 구조:
 * - Header (최소 정보)
 * - Table (세로형 타원)
 * - My Cards (하단 중앙, 크게)
 * - Actions (4열 그리드)
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
  
  // 디버깅: 게임 상태 확인
  React.useEffect(() => {
    console.log('🎮 MobilePortrait Debug:', {
      stage: gameState.stage,
      players: gameState.players.map(p => ({
        id: p.id,
        name: p.name,
        isAI: p.isAI,
        hasCards: p.cards?.length || 0,
        isFolded: p.isFolded
      }))
    });
  }, [gameState.stage, gameState.players]);

  // 플레이어 위치 (헬로포커스 스타일)
  const positions = [
    "bottom-[12%] left-1/2 -translate-x-1/2",  // 0: 본인 (하단)
    "top-[10%] left-[12%]",                     // 1: 좌상단
    "top-[10%] right-[12%]",                    // 2: 우상단  
    "top-[28%] left-[6%]",                      // 3: 좌측
    "top-[28%] right-[6%]",                     // 4: 우측
    "top-[5%] left-1/2 -translate-x-1/2",       // 5: 정중앙 상단
    "top-[46%] left-[3%]",                      // 6: 좌하
    "top-[46%] right-[3%]",                     // 7: 우하
  ];

  const SUIT_SYMBOLS: Record<string, string> = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠',
  };

  const SUIT_COLORS: Record<string, string> = {
    hearts: 'text-red-600',
    diamonds: 'text-red-600',
    clubs: 'text-gray-900',
    spades: 'text-gray-900',
  };

  return (
    <div 
      className="h-screen bg-black text-white flex flex-col overflow-hidden"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* ========== Header ========== */}
      <header className="flex justify-between items-center px-4 py-2 bg-black/60 backdrop-blur-sm border-b border-white/5 z-50">
        <div className="flex items-center gap-2">
          <span className="text-lg">☰</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-yellow-500/60 uppercase">Jackpot</span>
          <span className="text-yellow-400 text-sm font-bold font-mono">1,245,890{t('currency')}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-[10px]">{t('yourChips')}:</span>
          <span className="text-yellow-400 text-sm font-bold font-mono">{user.chips.toLocaleString()}</span>
        </div>
      </header>

      {/* ========== Table (세로형 타원) ========== */}
      <div className="flex-1 relative flex items-center justify-center">
        {/* 타원 테이블 */}
        <div 
          className="absolute inset-0 mx-auto"
          style={{
            width: '92%',
            height: '68vh',
            maxWidth: '500px',
            background: 'radial-gradient(ellipse at center, #0891b2 0%, #0e7490 50%, #155e75 100%)',
            borderRadius: '50% / 40%',
            boxShadow: 'inset 0 0 80px rgba(0,0,0,0.5), 0 15px 50px rgba(0,0,0,0.6)',
            border: '10px solid #1e293b',
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        >
          {/* 테이블 라인 */}
          <div 
            className="absolute inset-6 border-2 border-white/10 rounded-[50%/40%]"
          />
          
          {/* 테이블 로고 (중앙) */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/5 text-6xl font-black italic"
            style={{ fontSize: '5rem' }}
          >
            CHUANQI
          </div>
        </div>

        {/* ========== 중앙 팟 표시 ========== */}
        <div 
          className="absolute z-20"
          style={{
            top: '43%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="bg-black/70 backdrop-blur-xl px-5 py-2.5 rounded-full border-2 border-yellow-500/40 shadow-2xl"
          >
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-yellow-500/70 uppercase font-bold tracking-wider">TOTAL POT</span>
              <span className="text-lg font-black text-yellow-400 font-mono">
                {gameState.pot.toLocaleString()}{t('currency')}
              </span>
            </div>
          </motion.div>
        </div>

        {/* ========== 커뮤니티 카드 ========== */}
        {gameState.communityCards.length > 0 && (
          <div 
            className="absolute z-20"
            style={{
              top: '30%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="flex gap-1.5">
              {gameState.communityCards.map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotateY: 180 }}
                  animate={{ scale: 1, rotateY: 0 }}
                  transition={{ delay: i * 0.15, type: "spring" }}
                  className="w-12 h-16 bg-white rounded-lg shadow-2xl flex flex-col items-center justify-center border-2 border-gray-200"
                >
                  <span className={`text-2xl font-black ${SUIT_COLORS[card.suit]}`}>
                    {card.rank}
                  </span>
                  <span className={`text-xl ${SUIT_COLORS[card.suit]}`}>
                    {SUIT_SYMBOLS[card.suit]}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ========== 다른 플레이어들 ========== */}
        {gameState.players.map((p, i) => {
          if (p.id === 'user') return null;
          
          // 🎯 카드 공개 조건 (핵심 로직)
          // 1. showdown 단계 → 폴드하지 않은 플레이어만 공개
          // 2. 그 외 모든 경우 → 카드 뒷면
          const shouldShowCards = gameState.stage === 'showdown' && !p.isFolded;
          
          // 디버깅
          if (i === 1) {
            console.log('🎴 Card Visibility Debug:', {
              playerName: p.name,
              stage: gameState.stage,
              isFolded: p.isFolded,
              shouldShowCards,
              hasCards: p.cards?.length || 0
            });
          }
          
          return (
            <div 
              key={p.id}
              className={`absolute z-10 ${positions[i]}`}
            >
              <motion.div
                animate={{
                  scale: gameState.activePlayerIndex === i ? 1.1 : 1,
                  opacity: p.isFolded ? 0.4 : 1,
                }}
                className="flex flex-col items-center gap-1"
              >
                {/* 아바타 */}
                <div className="relative">
                  <img 
                    src={p.avatar}
                    alt={p.name}
                    className={`w-11 h-11 rounded-full border-2 ${
                      gameState.activePlayerIndex === i
                        ? 'border-yellow-400 ring-2 ring-yellow-400/40'
                        : 'border-white/30'
                    }`}
                  />
                  
                  {/* 딜러 버튼 */}
                  {p.isDealer && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full border-2 border-gray-300 flex items-center justify-center shadow-lg">
                      <span className="text-[9px] font-black text-gray-800">D</span>
                    </div>
                  )}

                  {/* AI/USER 뱃지 */}
                  {p.isAI && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center border-2 border-black">
                      <Bot size={9} className="text-white" />
                    </div>
                  )}
                </div>

                {/* 플레이어 카드 */}
                {p.cards && p.cards.length > 0 && (
                  <div className="flex gap-0.5 mt-1">
                    {p.cards.map((card: any, cardIdx: number) => (
                      <div key={cardIdx}>
                        {shouldShowCards ? (
                          // Showdown: 카드 공개
                          <div 
                            className={`
                              w-[32px] h-[44px] bg-white rounded-md shadow-lg 
                              flex flex-col items-center justify-center border border-gray-200
                              ${cardIdx === 0 ? '-rotate-3' : 'rotate-3'}
                            `}
                          >
                            <span className={`text-sm font-black ${SUIT_COLORS[card.suit]}`}>
                              {card.rank}
                            </span>
                            <span className={`text-xs ${SUIT_COLORS[card.suit]}`}>
                              {SUIT_SYMBOLS[card.suit]}
                            </span>
                          </div>
                        ) : (
                          // 플레이 중: 카드 뒷면
                          <div 
                            className={`
                              w-[32px] h-[44px] bg-gradient-to-br from-red-800 to-red-950 rounded-md shadow-lg 
                              flex items-center justify-center border border-white/20
                              ${cardIdx === 0 ? '-rotate-3' : 'rotate-3'}
                            `}
                          >
                            <div className="text-white/10 text-[6px] font-black">🃏</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* 칩 정보 */}
                <div className="bg-black/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/20">
                  <span className="text-yellow-400 text-[9px] font-bold font-mono">
                    {(p.chips / 10000).toFixed(1)}만
                  </span>
                </div>

                {/* 베팅액 */}
                {p.currentBet > 0 && (
                  <motion.div
                    initial={{ scale: 0, y: 10 }}
                    animate={{ scale: 1, y: 0 }}
                    className="bg-yellow-500/30 backdrop-blur-sm px-1.5 py-0.5 rounded-full border border-yellow-500/50"
                  >
                    <span className="text-yellow-300 text-[8px] font-bold font-mono">
                      {p.currentBet.toLocaleString()}
                    </span>
                  </motion.div>
                )}

                {/* 액션 뱃지 */}
                <AnimatePresence>
                  {p.lastAction && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className={`
                        px-1.5 py-0.5 rounded text-[7px] font-bold uppercase
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

      {/* ========== 내 카드 (하단 중앙, 크게) ========== */}
      <div className="flex justify-center gap-2.5 px-4 pb-2">
        {user.cards.map((card: any, i: number) => {
          const shouldShowCard = gameState.stage === 'showdown' || squeezedCards.has(i);
          
          return (
            <motion.div
              key={i}
              onClick={() => handleCardClick?.(i)}
              className="cursor-pointer relative"
              whileHover={{ scale: 1.05, y: -8 }}
              whileTap={{ scale: 0.95 }}
            >
              {shouldShowCard ? (
                // 오픈된 카드
                <div 
                  className={`
                    w-[70px] h-[100px] bg-white rounded-xl shadow-2xl 
                    flex flex-col items-center justify-center border-2 border-gray-200
                    ${i === 0 ? 'rotate-3' : '-rotate-3'}
                  `}
                  style={{
                    filter: 'drop-shadow(0 15px 40px rgba(0,0,0,0.7))',
                  }}
                >
                  <span className={`text-4xl font-black ${SUIT_COLORS[card.suit]}`}>
                    {card.rank}
                  </span>
                  <span className={`text-3xl ${SUIT_COLORS[card.suit]}`}>
                    {SUIT_SYMBOLS[card.suit]}
                  </span>
                </div>
              ) : (
                // 뒷면 카드
                <div 
                  className={`
                    w-[70px] h-[100px] bg-gradient-to-br from-red-800 to-red-950 rounded-xl shadow-2xl 
                    flex items-center justify-center border-3 border-white/30
                    ${i === 0 ? 'rotate-3' : '-rotate-3'}
                  `}
                  style={{
                    filter: 'drop-shadow(0 15px 40px rgba(0,0,0,0.7))',
                  }}
                >
                  <div className="text-white/20 text-xs font-black">CHUANQI</div>
                  
                  {/* TAP 인디케이터 */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-[9px] font-black px-2 py-0.5 rounded-full animate-bounce shadow-lg">
                    TAP
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* ========== 액션 버튼 (4열 그리드) ========== */}
      <footer className="px-2 pb-2">
        <div className="grid grid-cols-4 gap-1.5">
          <button
            disabled={!isUserTurn}
            onClick={() => handleAction('fold')}
            className="h-12 bg-red-600 hover:bg-red-500 active:bg-red-700 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black text-xs uppercase rounded-xl shadow-lg border-b-4 border-red-800 transition-all active:scale-95"
          >
            {t('fold')}
          </button>

          <button
            disabled={!isUserTurn}
            onClick={() => handleAction(gameState.currentBet === user.currentBet ? 'check' : 'call')}
            className="h-12 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black text-xs uppercase rounded-xl shadow-lg border-b-4 border-blue-800 transition-all active:scale-95"
          >
            {gameState.currentBet === user.currentBet ? t('check') : t('call')}
          </button>

          <button
            disabled={!isUserTurn}
            onClick={() => handleAction('raise')}
            className="h-12 bg-green-600 hover:bg-green-500 active:bg-green-700 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black text-xs uppercase rounded-xl shadow-lg border-b-4 border-green-800 transition-all active:scale-95"
          >
            {t('raise')}
          </button>

          <button
            disabled={!isUserTurn}
            onClick={() => handleAction('all-in')}
            className="h-12 bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600 disabled:opacity-30 disabled:cursor-not-allowed text-black font-black text-xs uppercase rounded-xl shadow-lg border-b-4 border-yellow-700 transition-all active:scale-95"
          >
            {t('allIn')}
          </button>
        </div>
      </footer>
    </div>
  );
};
