import React from 'react';
import { GameState } from '../types';
import { PlayerSeat } from './PlayerSeat';
import { Card } from './Card';
import { useTranslation } from '../LanguageContext';
import { motion } from 'framer-motion';

interface MobileLandscapeProps {
  gameState: GameState;
  user: any;
  isUserTurn: boolean;
  handleAction: (action: string) => void;
  handleCardClick?: (index: number) => void;
  squeezedCards?: Set<number>;
}

/**
 * 모바일 가로 화면 전용 게임 UI
 * 목표: 시야 확보 + 전략 플레이
 */
export const MobileLandscape: React.FC<MobileLandscapeProps> = ({
  gameState,
  user,
  isUserTurn,
  handleAction,
  handleCardClick,
  squeezedCards = new Set()
}) => {
  const { t } = useTranslation();

  // 플레이어 위치 (가로 모드 최적화)
  const landscapePositions = [
    "right-[5%] bottom-[15%]",   // 0: 본인 (우하단)
    "left-[5%] bottom-[30%]",    // 1: 좌측 하단
    "left-[5%] top-[45%]",       // 2: 좌측 중앙
    "left-[5%] top-[20%]",       // 3: 좌측 상단
    "left-[25%] top-[5%]",       // 4: 중앙 좌측 상단
    "left-1/2 top-[2%]",         // 5: 정중앙 상단
    "right-[25%] top-[5%]",      // 6: 중앙 우측 상단
    "right-[5%] top-[20%]",      // 7: 우측 상단
    "right-[5%] top-[45%]"       // 8: 우측 중앙
  ];

  return (
    <div 
      className="h-screen flex bg-[#0B0F19] text-white overflow-hidden"
      style={{
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      {/* 테이블 영역 (전체 화면) */}
      <div 
        className="flex-1 relative flex items-center justify-center"
        style={{
          background: 'radial-gradient(ellipse at center, #0F766E 0%, #0B0F19 70%)',
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
              <Card card={card} hidden={false} className="w-10 h-14" />
            </motion.div>
          ))}
        </div>

        {/* 팟 정보 (중앙 상단) */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-xl border border-yellow-500/30">
          <div className="flex flex-col items-center">
            <span className="text-[8px] text-white/40 uppercase">{t('pot')}</span>
            <span className="text-sm font-bold text-yellow-500 font-mono">
              {gameState.pot.toLocaleString()}{t('currency')}
            </span>
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
              position={landscapePositions[i]}
              onCardClick={undefined}
              hasSqueezed={new Set()}
            />
          );
        })}
      </div>

      {/* 사이드 컨트롤 패널 */}
      <div className="w-[200px] flex flex-col justify-between bg-neutral-900 border-l border-white/10 p-2">
        {/* 상단: 내 정보 */}
        <div className="space-y-2">
          {/* 내 칩 */}
          <div className="bg-black/40 backdrop-blur-xl rounded-xl p-3 border border-white/10">
            <span className="text-[9px] text-white/40 uppercase block">{t('yourChips')}</span>
            <span className="text-lg font-bold text-yellow-500 font-mono">
              {user.chips.toLocaleString()}{t('currency')}
            </span>
          </div>

          {/* 현재 베팅 */}
          <div className="bg-black/40 backdrop-blur-xl rounded-xl p-3 border border-white/10">
            <span className="text-[9px] text-white/40 uppercase block">{t('currentBet')}</span>
            <span className="text-sm font-bold text-white font-mono">
              {gameState.currentBet.toLocaleString()}{t('currency')}
            </span>
          </div>

          {/* 내 카드 (작게 표시) */}
          <div className="flex gap-2 justify-center">
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
                      w-12 h-16
                      ${i === 0 ? 'rotate-2' : '-rotate-2'}
                      hover:scale-110 transition-transform
                    `}
                  />
                  {!shouldShowCard && (
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-[8px] font-black px-1 rounded z-30">
                      TAP
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 하단: 액션 버튼 (세로 배치) */}
        <div className="flex flex-col gap-2">
          <button 
            disabled={!isUserTurn}
            onClick={() => handleAction('fold')}
            className="h-12 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-30 disabled:cursor-not-allowed font-black uppercase text-xs transition-all active:scale-95 shadow-lg"
          >
            {t('fold')}
          </button>

          <button 
            disabled={!isUserTurn}
            onClick={() => handleAction(gameState.currentBet === user.currentBet ? 'check' : 'call')}
            className="h-12 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed font-black uppercase text-xs transition-all active:scale-95 shadow-lg"
          >
            {gameState.currentBet === user.currentBet ? t('check') : t('call')}
          </button>

          <button 
            disabled={!isUserTurn}
            onClick={() => handleAction('raise')}
            className="h-12 rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-30 disabled:cursor-not-allowed font-black uppercase text-xs transition-all active:scale-95 shadow-lg"
          >
            {t('raise')}
          </button>

          <button 
            disabled={!isUserTurn}
            onClick={() => handleAction('all-in')}
            className="h-12 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-30 disabled:cursor-not-allowed font-black uppercase text-xs transition-all active:scale-95 shadow-lg animate-pulse"
          >
            {t('allIn')}
          </button>
        </div>
      </div>
    </div>
  );
};
