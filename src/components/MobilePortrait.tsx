import React from 'react';
import { GameState } from '../types';
import { PlayerSeat } from './PlayerSeat';
import { Card } from './Card';
import { useTranslation } from '../LanguageContext';
import { motion } from 'motion/react';

interface MobilePortraitProps {
  gameState: GameState;
  user: any;
  isUserTurn: boolean;
  handleAction: (action: string) => void;
  handleCardClick?: (index: number) => void;
  squeezedCards?: Set<number>;
}

/**
 * 모바일 세로 화면 전용 게임 UI
 * 목표: 한손 조작 최적화 + 카드 집중
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

  // 플레이어 위치 (세로 모드 최적화)
  const portraitPositions = [
    "left-1/2 bottom-[5%]",      // 0: 본인 (하단 중앙)
    "left-[15%] top-[40%]",      // 1: 왼쪽 중앙
    "left-[10%] top-[20%]",      // 2: 왼쪽 상단
    "left-[30%] top-[5%]",       // 3: 중앙 왼쪽 상단
    "left-1/2 top-[2%]",         // 4: 정중앙 상단
    "right-[30%] top-[5%]",      // 5: 중앙 오른쪽 상단
    "right-[10%] top-[20%]",     // 6: 오른쪽 상단
    "right-[15%] top-[40%]",     // 7: 오른쪽 중앙
    "left-1/2 bottom-[25%]"      // 8: 예비
  ];

  return (
    <div 
      className="h-screen flex flex-col bg-[#0B0F19] text-white relative overflow-hidden"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* 상단 정보 바 */}
      <header className="h-14 bg-black/40 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-3 z-50">
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="text-[9px] text-white/40 uppercase">{t('pot')}</span>
            <span className="text-sm font-bold text-yellow-500 font-mono">
              {gameState.pot.toLocaleString()}{t('currency')}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-white/40 uppercase">{t('yourChips')}</span>
            <span className="text-sm font-bold text-yellow-500 font-mono">
              {user.chips.toLocaleString()}{t('currency')}
            </span>
          </div>
        </div>
      </header>

      {/* 테이블 영역 (중앙) */}
      <div 
        className="flex-1 relative flex items-center justify-center"
        style={{
          background: 'radial-gradient(ellipse at center, #0F766E 0%, #0B0F19 70%)',
        }}
      >
        {/* 테이블 */}
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{
            width: '90%',
            maxWidth: '600px',
            margin: '0 auto',
          }}
        >
          {/* 커뮤니티 카드 */}
          <div className="flex gap-2 justify-center">
            {gameState.communityCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotateY: 180 }}
                animate={{ scale: 1, rotateY: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card card={card} hidden={false} className="w-12 h-16" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* 다른 플레이어들 */}
        {gameState.players.map((p, i) => {
          if (p.id === 'user') return null;
          return (
            <PlayerSeat 
              key={p.id}
              player={p}
              isActive={gameState.activePlayerIndex === i}
              isDealer={p.isDealer}
              showCards={gameState.stage === 'showdown'}
              position={portraitPositions[i]}
              onCardClick={undefined}
              hasSqueezed={new Set()}
            />
          );
        })}
      </div>

      {/* 내 카드 영역 (크게 표시) */}
      <div className="flex justify-center gap-3 pb-3 px-4">
        {user.cards.map((card: any, i: number) => {
          const shouldShowCard = gameState.stage === 'showdown' || squeezedCards.has(i);
          return (
            <div 
              key={i}
              onClick={() => handleCardClick?.(i)}
              className="cursor-pointer relative"
            >
              <Card 
                card={card}
                hidden={!shouldShowCard}
                className={`
                  w-20 h-28
                  ${i === 0 ? 'rotate-3' : '-rotate-3'}
                  hover:scale-110 hover:-translate-y-2 transition-transform
                `}
              />
              {!shouldShowCard && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-[10px] font-black px-2 rounded animate-bounce z-30">
                  TAP
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 액션 버튼 (크게 표시) */}
      <footer className="bg-neutral-900 border-t border-white/10 px-3 pb-4 pt-3">
        <div className="flex flex-col gap-2">
          {/* 칩 정보 */}
          <div className="flex items-center justify-between text-[10px] text-white/60 px-2">
            <span>{t('currentBet')}: {gameState.currentBet.toLocaleString()}{t('currency')}</span>
            <span>{t('stage')}: {t(gameState.stage)}</span>
          </div>

          {/* 액션 버튼 그리드 */}
          <div className="grid grid-cols-4 gap-2">
            <button 
              disabled={!isUserTurn}
              onClick={() => handleAction('fold')}
              className="h-14 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-30 disabled:cursor-not-allowed font-black uppercase text-sm transition-all active:scale-95 shadow-lg"
            >
              {t('fold')}
            </button>

            <button 
              disabled={!isUserTurn}
              onClick={() => handleAction(gameState.currentBet === user.currentBet ? 'check' : 'call')}
              className="h-14 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed font-black uppercase text-sm transition-all active:scale-95 shadow-lg"
            >
              {gameState.currentBet === user.currentBet ? t('check') : t('call')}
            </button>

            <button 
              disabled={!isUserTurn}
              onClick={() => handleAction('raise')}
              className="h-14 rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-30 disabled:cursor-not-allowed font-black uppercase text-sm transition-all active:scale-95 shadow-lg"
            >
              {t('raise')}
            </button>

            <button 
              disabled={!isUserTurn}
              onClick={() => handleAction('all-in')}
              className="h-14 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-30 disabled:cursor-not-allowed font-black uppercase text-sm transition-all active:scale-95 shadow-lg animate-pulse"
            >
              {t('allIn')}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
