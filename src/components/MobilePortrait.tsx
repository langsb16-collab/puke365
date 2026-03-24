import React, { useState } from 'react';
import { GameState } from '../types';
import { useTranslation } from '../LanguageContext';

interface MobilePortraitProps {
  gameState: GameState;
  user: any;
  isUserTurn: boolean;
  handleAction: (action: string) => void;
  handleCardClick?: (index: number) => void;
  squeezedCards?: Set<number>;
}

/**
 * 🎰 Hello Pokers 스타일 완벽 재현
 * 
 * 핵심 디자인:
 * - 세로형 타원 테이블 (길고 슬림)
 * - 딥 블루 그라디언트 + 글로우
 * - 실제 카드 느낌 (화이트 + 그림자)
 * - 중앙 집중 구조
 * - 플레이어 원형 배치
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
  const [peeked, setPeeked] = useState<Record<number, boolean>>({});

  const togglePeek = (i: number) => {
    setPeeked(prev => ({ ...prev, [i]: !prev[i] }));
    const audio = new Audio("/sounds/flip.mp3");
    audio.volume = 0.6;
    audio.currentTime = 0;
    audio.play().catch(() => {});
    if (navigator.vibrate) navigator.vibrate(20);
  };

  const SUIT_SYMBOL: Record<string, string> = {
    hearts: "♥",
    diamonds: "♦",
    clubs: "♣",
    spades: "♠",
  };

  const SUIT_COLOR: Record<string, string> = {
    hearts: "text-red-500",
    diamonds: "text-red-500",
    clubs: "text-black",
    spades: "text-black",
  };

  // 플레이어 위치 (타원 외곽 따라 배치 - 더 정확한 좌표)
  const positions = [
    { top: '88%', left: '50%', transform: '-translate-x-1/2' }, // 0: 본인
    { top: '72%', left: '6%' },   // 1: 좌하
    { top: '48%', left: '3%' },   // 2: 좌중
    { top: '22%', left: '10%' },  // 3: 좌상
    { top: '6%', left: '50%', transform: '-translate-x-1/2' },  // 4: 상단
    { top: '22%', right: '10%' }, // 5: 우상
    { top: '48%', right: '3%' },  // 6: 우중
    { top: '72%', right: '6%' },  // 7: 우하
  ];

  if (!gameState || !user) return <div className="h-screen bg-black flex items-center justify-center text-white">Loading...</div>;

  return (
    <div 
      className="h-screen bg-gradient-to-b from-[#1a1a1a] via-[#0f0f0f] to-black text-white flex flex-col overflow-hidden relative"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* ========== Header (미니멀) ========== */}
      <header className="absolute top-0 left-0 right-0 flex justify-between items-center px-4 py-3 z-50">
        <div className="text-2xl">☰</div>
        <div className="flex flex-col items-center">
          <span className="text-yellow-400 text-[10px] uppercase tracking-wider">💰 Jackpot</span>
          <span className="text-yellow-300 text-lg font-black font-mono">
            {(1245890).toLocaleString()}{t('currency')}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-white/50 text-[9px]">{t('yourChips')}</span>
          <span className="text-yellow-400 text-base font-bold font-mono">
            {user.chips.toLocaleString()}
          </span>
        </div>
      </header>

      {/* ========== 메인 테이블 영역 ========== */}
      <div className="flex-1 flex items-center justify-center relative">
        {/* 타원 테이블 (Hello Pokers 스타일 - 더 길게) */}
        <div 
          className="relative"
          style={{
            width: '92%',
            maxWidth: '440px',
            height: '82vh',
          }}
        >
          {/* 테이블 배경 */}
          <div 
            className="absolute inset-0 rounded-[50%]"
            style={{
              background: 'radial-gradient(ellipse at center, #0a6c8f 0%, #0f3d5e 60%, #08344d 100%)',
              boxShadow: `
                inset 0 0 60px rgba(0,0,0,0.7),
                0 0 80px rgba(0,150,255,0.4),
                0 20px 60px rgba(0,0,0,0.8)
              `,
              border: '3px solid #0e5f7a',
            }}
          />

          {/* 내부 라인 */}
          <div 
            className="absolute inset-8 rounded-[50%] border-2 border-[#6ec1e4]/20"
            style={{
              boxShadow: 'inset 0 0 30px rgba(110,193,228,0.1)',
            }}
          />

          {/* 중앙 로고 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 text-center">
            <div className="text-white text-7xl font-black italic tracking-wider">
              CHUANQI
            </div>
          </div>

          {/* ========== Total Pot (중앙) ========== */}
          <div 
            className="absolute z-30"
            style={{
              top: '44%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div
              className="bg-black/80 backdrop-blur-xl px-6 py-3 rounded-full border-2 border-yellow-500/50 shadow-2xl"
            >
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-[#9fdcff] uppercase font-bold tracking-widest">TOTAL POT</span>
                <span className="text-2xl font-black text-yellow-300 font-mono">
                  {gameState.pot.toLocaleString()}{t('currency')}
                </span>
              </div>
            </div>
          </div>

          {/* ========== 커뮤니티 카드 (상단 중앙) ========== */}
          {gameState.communityCards && gameState.communityCards.length > 0 && (
            <div 
              className="absolute z-20"
              style={{
                top: '28%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="flex gap-2">
                {gameState.communityCards.map((card, i) => (
                  <div
                    key={i}
                    className="w-14 h-20 bg-white rounded-xl shadow-2xl flex flex-col items-center justify-center border-2 border-gray-100"
                    style={{
                      boxShadow: '0 8px 30px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,255,0.1)',
                    }}
                  >
                    <span className={`text-3xl font-black ${SUIT_COLOR[card.suit]}`}>
                      {card.rank}
                    </span>
                    <span className={`text-2xl ${SUIT_COLOR[card.suit]}`}>
                      {SUIT_SYMBOL[card.suit]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========== 다른 플레이어들 ========== */}
          {(gameState?.players ?? []).map((p, i) => {
            if (p.id === 'user') return null;
            
            const shouldShowCards = gameState.stage === 'showdown' && !p.isFolded;
            const pos = positions[i] || positions[1];
            
            return (
              <div 
                key={p.id}
                className="absolute z-10"
                style={{
                  top: pos.top,
                  left: pos.left,
                  right: pos.right,
                  transform: pos.transform,
                }}
              >
                <div
                  className="flex flex-col items-center gap-1"
                  style={{
                    opacity: p.isFolded ? 0.5 : 1,
                  }}
                >
                  {/* 아바타 */}
                  <div className="relative">
                    <img 
                      src={p.avatar}
                      alt={p.name}
                      className={`w-12 h-12 rounded-full border-3 ${
                        gameState.activePlayerIndex === i
                          ? 'border-yellow-400 ring-4 ring-yellow-400/50'
                          : 'border-white/40'
                      }`}
                      style={{
                        boxShadow: gameState.activePlayerIndex === i 
                          ? '0 0 20px rgba(250,204,21,0.6)' 
                          : '0 4px 12px rgba(0,0,0,0.5)',
                      }}
                    />
                    
                    {/* 딜러 버튼 */}
                    {p.isDealer && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full border-2 border-gray-400 flex items-center justify-center shadow-xl">
                        <span className="text-[10px] font-black text-gray-800">D</span>
                      </div>
                    )}
                  </div>

                  {/* 플레이어 카드 */}
                  {(p?.cards ?? []).length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {(p.cards || []).map((card: any, cardIdx: number) => (
                        <div key={cardIdx}>
                          {shouldShowCards ? (
                            // Showdown: 카드 공개
                            <div 
                              className="w-9 h-12 bg-white rounded-md shadow-xl flex flex-col items-center justify-center border border-gray-200"
                            >
                              <span className={`text-base font-black ${SUIT_COLOR[card.suit]}`}>
                                {card.rank}
                              </span>
                              <span className={`text-xs ${SUIT_COLOR[card.suit]}`}>
                                {SUIT_SYMBOL[card.suit]}
                              </span>
                            </div>
                          ) : (
                            // 플레이 중: 카드 뒷면 (Hello Pokers 스타일)
                            <div 
                              className="w-9 h-12 bg-gradient-to-br from-orange-600 via-orange-500 to-orange-700 rounded-md shadow-xl border border-orange-400/50 relative overflow-hidden"
                            >
                              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-transparent" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-yellow-200/40 text-xl">👑</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 칩 정보 */}
                  <div className="bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full border border-white/20">
                    <span className="text-yellow-300 text-[10px] font-bold font-mono">
                      {(p.chips / 10000).toFixed(1)}만
                    </span>
                  </div>

                  {/* 베팅액 */}
                  {p.currentBet > 0 && (
                    <div
                      className="bg-yellow-500/30 backdrop-blur-sm px-2 py-1 rounded-full border border-yellow-500/50"
                    >
                      <span className="text-yellow-200 text-[9px] font-bold font-mono">
                        {p.currentBet.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========== 내 카드 (하단 중앙, 크게) ========== */}
      <div className="flex justify-center gap-3 px-4 pb-3 z-40">
        {(user?.cards ?? []).map((card: any, i: number) => {
          const isPeek = peeked[i];

          return (
            <div
              key={i}
              onClick={() => togglePeek(i)}
              className="cursor-pointer relative"
              style={{
                transform: isPeek ? 'translateY(-10px) scale(1.04)' : 'none',
                transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              {/* 항상 뒷면 카드 */}
              <div 
                className="w-16 h-[88px] bg-gradient-to-br from-orange-600 via-orange-500 to-orange-700 rounded-2xl shadow-2xl flex items-center justify-center border-3 border-orange-400/50 relative overflow-hidden"
              >
                <div className="absolute inset-0 opacity-30">
                  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id={`card-pattern-${i}`} x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                        <circle cx="15" cy="15" r="5" fill="#fbbf24" opacity="0.4"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill={`url(#card-pattern-${i})`}/>
                  </svg>
                </div>
                
                <div className="relative z-10 flex flex-col items-center gap-1">
                  <div className="text-yellow-200/60 text-3xl">👑</div>
                  <div className="text-yellow-200/50 text-[10px] font-black italic tracking-wider">CHUANQI</div>
                </div>
              </div>

              {/* 55% 평면 슬라이드 오픈 */}
              <div
                className="absolute top-0 right-0 w-[55%] h-full overflow-hidden pointer-events-none"
                style={{
                  transform: isPeek ? 'translate(-38px, 6px) rotate(-6deg)' : 'none',
                  opacity: isPeek ? 1 : 0,
                  transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              >
                {/* 실제 카드 절반 */}
                <div className="w-[200%] h-full flex justify-end">
                  <div className="w-[55%] h-full bg-white rounded-2xl shadow-2xl relative border border-gray-100">
                    {/* 숫자 + 무늬 */}
                    <div className="absolute top-2 right-2 text-right leading-none">
                      <div className={`text-xl font-black ${SUIT_COLOR[card?.suit || 'spades']}`}>
                        {card?.rank}
                      </div>
                      <div className={`text-lg ${SUIT_COLOR[card?.suit || 'spades']}`}>
                        {SUIT_SYMBOL[card?.suit || 'spades']}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========== 액션 버튼 (4열 그리드, Hello Pokers 스타일) ========== */}
      <footer className="px-3 pb-3 z-40">
        <div className="grid grid-cols-4 gap-2">
          <button
            disabled={!isUserTurn}
            onClick={() => handleAction('fold')}
            className="h-14 bg-gradient-to-b from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:from-red-700 active:to-red-800 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black text-sm uppercase rounded-2xl shadow-lg border-b-4 border-red-900 transition-all active:scale-95"
          >
            {t('fold')}
          </button>

          <button
            disabled={!isUserTurn}
            onClick={() => handleAction(gameState.currentBet === user.currentBet ? 'check' : 'call')}
            className="h-14 bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 active:from-blue-700 active:to-blue-800 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black text-sm uppercase rounded-2xl shadow-lg border-b-4 border-blue-900 transition-all active:scale-95"
          >
            {gameState.currentBet === user.currentBet ? t('check') : t('call')}
          </button>

          <button
            disabled={!isUserTurn}
            onClick={() => handleAction('raise')}
            className="h-14 bg-gradient-to-b from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 active:from-green-700 active:to-green-800 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black text-sm uppercase rounded-2xl shadow-lg border-b-4 border-green-900 transition-all active:scale-95"
          >
            {t('raise')}
          </button>

          <button
            disabled={!isUserTurn}
            onClick={() => handleAction('all-in')}
            className="h-14 bg-gradient-to-b from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 active:from-yellow-600 active:to-yellow-700 disabled:opacity-30 disabled:cursor-not-allowed text-black font-black text-sm uppercase rounded-2xl shadow-lg border-b-4 border-yellow-700 transition-all active:scale-95"
          >
            {t('allIn')}
          </button>
        </div>
      </footer>
    </div>
  );
};
