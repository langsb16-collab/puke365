import React, { useState } from 'react';
import { Player } from '../types';
import { Card } from './Card';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bot } from 'lucide-react';
import { useTranslation } from '../LanguageContext';

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

interface PlayerSeatProps {
  player: Player;
  isActive: boolean;
  isDealer: boolean;
  showCards: boolean;
  position: string;
  gameStage?: string;
}

export const PlayerSeat: React.FC<PlayerSeatProps> = ({ 
  player, 
  isActive, 
  isDealer, 
  showCards,
  position,
  gameStage = ''
}) => {
  const { t } = useTranslation();
  const [peeked, setPeeked] = useState<Record<number, boolean>>({});
  
  const isFolded = player?.isFolded || false;
  
  if (!player) return null;

  const togglePeek = (i: number) => {
    setPeeked(prev => ({ ...prev, [i]: !prev[i] }));

    const flip = new Audio("/sounds/flip.mp3");
    flip.volume = 0.6;
    flip.currentTime = 0;
    flip.play().catch(() => {});

    if (navigator.vibrate) navigator.vibrate(20);
  };

  const isShowdown = gameStage === 'showdown';
  
  return (
    <div className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${position}`}>
      <motion.div 
        animate={{ 
          scale: isActive ? 1.05 : 1,
          opacity: isFolded ? 0.6 : 1
        }}
        className={`relative flex flex-col items-center gap-2`}
      >
        {/* Timer Ring */}
        {isActive && (
          <svg className="absolute -inset-4 w-36 h-36 sm:w-44 sm:h-44 -rotate-90 pointer-events-none">
            <circle
              cx="50%"
              cy="50%"
              r="48%"
              fill="none"
              stroke="rgba(234, 179, 8, 0.2)"
              strokeWidth="4"
            />
            <motion.circle
              cx="50%"
              cy="50%"
              r="48%"
              fill="none"
              stroke="#eab308"
              strokeWidth="4"
              strokeDasharray="100 100"
              initial={{ strokeDashoffset: 100 }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 15, ease: "linear" }}
            />
          </svg>
        )}

        {/* Dealer Button */}
        {isDealer && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-6 -right-6 w-8 h-8 bg-white rounded-full border-2 border-gray-300 shadow-lg flex items-center justify-center z-20"
          >
            <span className="text-[10px] font-bold text-gray-800">D</span>
          </motion.div>
        )}

        {/* Cards */}
        <div className="flex -space-x-5 mb-1">
          {(player?.cards ?? []).map((card, i) => {
            const isPeek = peeked[i];

            return (
              <motion.div
                key={`${player.id}-${i}`}
                onClick={!player.isAI ? () => togglePeek(i) : undefined}
                className="relative cursor-pointer select-none"
                animate={{
                  y: isPeek ? -12 : 0,
                  scale: isPeek ? 1.05 : 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 280,
                  damping: 18,
                }}
              >
                {/* 항상 뒷면 */}
                <Card card={card} hidden={true} />

                {/* 절반 카드 슬라이드 오픈 */}
                {!player.isAI && (
                  <motion.div
                    animate={{
                      x: isPeek ? -40 : 0,
                      y: isPeek ? 10 : 0,
                      opacity: isPeek ? 1 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 240, damping: 18 }}
                    className="absolute top-0 right-0 w-[55%] h-full overflow-hidden pointer-events-none"
                    style={{
                      borderTopRightRadius: "12px",
                      borderBottomRightRadius: "12px",
                      boxShadow: isPeek ? '0px 8px 20px rgba(0,0,0,0.4)' : 'none',
                    }}
                  >
                    {/* 진짜 카드 절반 */}
                    <div className="w-[182%] h-full flex justify-end">
                      <div className="w-[55%] h-full bg-white rounded-xl shadow-xl relative border border-gray-200">
                        {/* 숫자 + 무늬 */}
                        <div className="absolute top-2 right-2 text-right leading-none">
                          <div className={`text-xl sm:text-2xl font-black ${SUIT_COLOR[card?.suit || 'spades']}`}>
                            {card?.rank}
                          </div>
                          <div className={`text-lg sm:text-xl ${SUIT_COLOR[card?.suit || 'spades']}`}>
                            {SUIT_SYMBOL[card?.suit || 'spades']}
                          </div>
                        </div>
                        {/* 중앙 무늬 */}
                        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl sm:text-5xl opacity-10 ${SUIT_COLOR[card?.suit || 'spades']}`}>
                          {SUIT_SYMBOL[card?.suit || 'spades']}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Player Info Card */}
        <div className={`
          w-32 sm:w-40 bg-black/80 backdrop-blur-xl rounded-2xl border-2 p-2 shadow-2xl transition-all duration-300
          ${isActive ? 'border-yellow-500 ring-4 ring-yellow-500/20 -translate-y-2' : 'border-white/10'}
        `}>
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <img 
                src={player.avatar} 
                alt={player.name} 
                className={`w-10 h-10 rounded-xl object-cover border border-white/20 ${isFolded ? 'grayscale' : ''}`}
                referrerPolicy="no-referrer"
              />
              <div className={`absolute -bottom-1 -right-1 p-0.5 rounded-md border border-black ${player.isAI ? 'bg-indigo-500' : 'bg-emerald-500'}`}>
                {player.isAI ? <Bot size={10} className="text-white" /> : <User size={10} className="text-white" />}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-black text-[10px] uppercase tracking-tighter italic truncate">{t(`char_${player.characterId}`)}</div>
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-yellow-500" />
                <span className="text-yellow-500 font-mono text-[10px] font-black">{player.chips.toLocaleString()}{t('currency')}</span>
              </div>
            </div>
          </div>
          
          {player.currentBet > 0 && (
            <div className="flex justify-center mb-2">
              <div className="px-3 py-0.5 bg-yellow-500/10 rounded-full border border-yellow-500/30">
                <span className="text-yellow-500 text-[9px] font-black font-mono">{t('bet')}: {player.currentBet.toLocaleString()}{t('currency')}</span>
              </div>
            </div>
          )}

          {/* Stats Display */}
          <div className="flex justify-around border-t border-white/10 pt-1">
            <div className="flex flex-col items-center">
              <span className="text-[7px] text-white/30 uppercase font-bold tracking-widest">{t('vpip')}</span>
              <span className="text-[9px] text-white/60 font-mono font-bold">{player.stats.vpip}%</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[7px] text-white/30 uppercase font-bold tracking-widest">{t('pfr')}</span>
              <span className="text-[9px] text-white/60 font-mono font-bold">{player.stats.pfr}%</span>
            </div>
          </div>

          {/* Action Badge */}
          <AnimatePresence>
            {player.lastAction && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`
                  absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg
                  ${player.lastAction === 'fold' ? 'bg-red-500 text-white' : 
                    player.lastAction === 'raise' ? 'bg-orange-500 text-white' :
                    player.lastAction === 'all-in' ? 'bg-purple-600 text-white animate-pulse' :
                    'bg-blue-500 text-white'}
                `}
              >
                {t(player.lastAction === 'all-in' ? 'allIn' : player.lastAction)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Win Rate (AI Only for debug/demo) */}
        {player.isAI && player.winRate !== undefined && !isFolded && (
          <div className="mt-1 text-[10px] text-white/40 font-mono">
            {t('eq')}: {(player.winRate * 100).toFixed(1)}%
          </div>
        )}
      </motion.div>
    </div>
  );
};
