import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Coins, Timer, Users, BarChart3, ShoppingBag, ArrowRight, Zap, Star, MessageSquare, Sparkles } from 'lucide-react';
import { useTranslation } from '../LanguageContext';
import { PokerCharacter } from '../types';
import { Ads } from './Ads';
import { AudioManager } from '../services/AudioManager';

interface CasinoLobbyProps {
  selectedCharacter: PokerCharacter;
  chips: number;
  onSetView: (view: any) => void;
  onInitGame: (mode: any) => void;
  stats: { handsPlayed: number; handsWon: number };
}

export const CasinoLobby: React.FC<CasinoLobbyProps> = ({
  selectedCharacter,
  chips,
  onSetView,
  onInitGame,
  stats
}) => {
  const { t } = useTranslation();
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    // Play welcome sound on mount
    const audio = AudioManager.getInstance();
    audio.playSynthesized('welcome');

    // Hide welcome message after 5 seconds
    const timer = setTimeout(() => setShowWelcome(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-7xl mx-auto w-full space-y-8 pb-12 relative">
      {/* Welcome Message Overlay (Unity Style) */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
          >
            <div className="bg-black/80 backdrop-blur-2xl border-2 border-yellow-500/50 rounded-[40px] px-12 py-6 shadow-[0_0_100px_rgba(234,179,8,0.3)] flex flex-col items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Sparkles className="text-yellow-500" size={32} />
              </motion.div>
              <h1 className="text-2xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 text-center">
                {t('welcome_message')}
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent rounded-full mt-2" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 0. LOGO FADE IN & GLOW (Advanced Effect) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="flex flex-col items-center justify-center py-4 relative"
      >
        <div className="absolute inset-0 bg-yellow-500/5 blur-[120px] rounded-full pointer-events-none" />
        <h1 className="text-7xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/20 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
          HOLDEM <span className="text-yellow-500">HUB</span>
        </h1>
        <div className="flex items-center gap-4 mt-2">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/20" />
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">{t('goForGold')}</span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/20" />
        </div>
      </motion.div>

      {/* 1. JACKPOT MARQUEE - High Impact */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative h-32 rounded-[40px] bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#1a1a2e] border-2 border-yellow-500/30 overflow-hidden flex items-center justify-between px-16 shadow-[0_0_80px_rgba(234,179,8,0.15)] group"
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-transparent to-yellow-500/5" />
        
        <div className="flex items-center gap-8 relative z-10">
          <div className="relative">
            <div className="absolute -inset-4 bg-yellow-500/20 rounded-full blur-xl animate-pulse" />
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-black shadow-[0_0_30px_rgba(234,179,8,0.5)]">
              <Trophy size={32} />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-[0.4em] text-yellow-500/80 mb-1">{t('globalJackpot')}</span>
            <div className="flex items-baseline gap-3">
              <h2 className="text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-500 to-yellow-700 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                1,245,890.00
              </h2>
              <span className="text-2xl font-black text-yellow-500/60 italic">{t('currency')}</span>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-4 relative z-10">
          <div className="flex flex-col items-end mr-4">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{t('lastWinner')}</span>
            <span className="text-sm font-bold text-white/80 italic">@Texas_Shark</span>
          </div>
          <div className="flex -space-x-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-[#1a1a2e] bg-yellow-500 flex items-center justify-center text-black shadow-lg">
                <Coins size={16} />
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 2. MAIN EVENT & CASH GAMES - Left Column */}
        <div className="lg:col-span-8 space-y-8">
          {/* Main Event Card - WSOP Style */}
          <motion.button
            whileHover={{ scale: 1.01, y: -5 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onSetView('tournaments')}
            className="relative w-full h-80 rounded-[50px] overflow-hidden group shadow-2xl border border-white/5"
          >
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511193311914-0346f16efe90?q=80&w=2073&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-1000 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-red-900/40 via-transparent to-transparent" />
            
            <div className="absolute top-8 left-8 flex items-center gap-3">
              <div className="px-4 py-1.5 bg-red-600 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-600/40 animate-pulse">
                {t('liveNow')}
              </div>
              <div className="px-4 py-1.5 bg-black/60 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                10M {t('guaranteed')}
              </div>
            </div>

            <div className="absolute bottom-10 left-10 text-left">
              <h3 className="text-6xl font-black uppercase tracking-tighter italic leading-none mb-2 drop-shadow-2xl">
                {t('wsopMainEvent')}
              </h3>
              <p className="text-white/60 text-lg font-medium uppercase tracking-[0.2em] mb-6">
                {t('worldSeries')} • {t('buyIn')} 10,000{t('currency')}
              </p>
              <div className="flex items-center gap-4">
                <div className="px-8 py-3 bg-yellow-500 text-black font-black rounded-2xl uppercase text-sm tracking-widest shadow-xl shadow-yellow-500/20 group-hover:bg-yellow-400 transition-all flex items-center gap-2">
                  {t('playNow')} <ArrowRight size={16} />
                </div>
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=player${i}`} className="w-8 h-8 rounded-full border-2 border-black" alt="" />
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-black bg-zinc-800 flex items-center justify-center text-[8px] font-bold">+1.2k</div>
                </div>
              </div>
            </div>
          </motion.button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cash Game Card */}
            <motion.button
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onInitGame('cash')}
              className="relative h-64 rounded-[40px] bg-gradient-to-br from-emerald-600 to-emerald-950 p-10 flex flex-col justify-end overflow-hidden shadow-2xl group border border-emerald-500/30"
            >
              <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                <Coins size={240} className="text-white -mr-10 -mt-10" />
              </div>
              <div className="relative z-10 text-left">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Zap size={16} className="text-yellow-400" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/80">{t('instantAction')}</span>
                </div>
                <h3 className="text-4xl font-black uppercase tracking-tighter italic leading-none mb-2">{t('cashGame')}</h3>
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest">{t('noLimitHoldem')} • {t('blinds')} 50/100</p>
              </div>
            </motion.button>

            {/* Sit & Go Card */}
            <motion.button
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onInitGame('sit-and-go')}
              className="relative h-64 rounded-[40px] bg-gradient-to-br from-blue-600 to-blue-950 p-10 flex flex-col justify-end overflow-hidden shadow-2xl group border border-blue-500/30"
            >
              <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                <Timer size={240} className="text-white -mr-10 -mt-10" />
              </div>
              <div className="relative z-10 text-left">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Users size={16} className="text-blue-400" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/80">{t('sixMaxTurbo')}</span>
                </div>
                <h3 className="text-4xl font-black uppercase tracking-tighter italic leading-none mb-2">{t('sitAndGo')}</h3>
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest">{t('buyIn')} 500{t('currency')} • {t('fastJoin')}</p>
              </div>
            </motion.button>
          </div>
        </div>

        {/* 3. QUICK JOIN & STATS - Right Column */}
        <div className="lg:col-span-4 space-y-8">
          {/* Quick Join Section - Glassmorphism */}
          <div className="bg-white/5 backdrop-blur-xl rounded-[50px] p-10 border border-white/10 shadow-2xl space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-3xl rounded-full -mr-16 -mt-16" />
            
            <div className="flex items-center justify-between relative z-10">
              <h3 className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-3">
                <Zap size={20} className="text-yellow-500" /> {t('quickJoin')}
              </h3>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="space-y-4 relative z-10">
              {[100, 500, 1000, 5000].map((buyin, idx) => (
                <motion.button 
                  key={buyin}
                  whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.08)' }}
                  onClick={() => onInitGame('cash')}
                  className="w-full h-16 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between px-6 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${idx === 0 ? 'bg-emerald-500/20 text-emerald-400' : idx === 1 ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                      <Star size={18} fill="currentColor" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-xs font-black font-mono text-white/90">{buyin.toLocaleString()}{t('currency')}</span>
                      <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">{t('buyIn')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-white/20 group-hover:text-yellow-500 transition-colors">{t('joinNow')}</span>
                    <ArrowRight size={14} className="text-white/10 group-hover:text-yellow-500 transition-all" />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Lobby Ad Banner */}
          <Ads type="lobby" className="shadow-2xl" />

          {/* Stats Summary - Dark Luxury */}
          <div className="bg-gradient-to-br from-zinc-900 to-black rounded-[50px] p-10 border border-white/10 shadow-2xl space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-3">
                <BarChart3 size={20} className="text-blue-500" /> {t('yourStats')}
              </h3>
              <button onClick={() => onSetView('stats')} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all">
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-3xl p-5 border border-white/5">
                <p className="text-[9px] text-white/40 uppercase font-black tracking-widest mb-2">{t('handsPlayed')}</p>
                <p className="text-2xl font-black font-mono tracking-tighter">{stats.handsPlayed}</p>
              </div>
              <div className="bg-white/5 rounded-3xl p-5 border border-white/5">
                <p className="text-[9px] text-white/40 uppercase font-black tracking-widest mb-2">{t('winRate')}</p>
                <p className="text-2xl font-black font-mono tracking-tighter text-emerald-400">
                  {stats.handsPlayed > 0 ? `${((stats.handsWon / stats.handsPlayed) * 100).toFixed(1)}%` : '0%'}
                </p>
              </div>
              <div className="col-span-2 bg-gradient-to-r from-yellow-500/10 to-transparent rounded-3xl p-6 border border-yellow-500/10 flex items-center justify-between">
                <div>
                  <p className="text-[9px] text-yellow-500/60 uppercase font-black tracking-widest mb-2">{t('totalProfit')}</p>
                  <p className="text-2xl font-black font-mono tracking-tighter text-yellow-500">+3,240.00{t('currency')}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 flex items-center justify-center">
                  <Trophy size={20} className="text-yellow-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. TABLE TYPES / SECONDARY MODES - Bottom Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { id: 'private', title: t('privateTable'), icon: <Users />, color: 'from-purple-600 to-purple-950', action: () => null },
          { id: 'stats', title: t('stats'), icon: <BarChart3 />, color: 'from-zinc-700 to-zinc-900', action: () => onSetView('stats') },
          { id: 'shop', title: t('shop'), icon: <ShoppingBag size={24} />, color: 'from-yellow-600 to-yellow-900', action: () => onSetView('shop') },
          { id: 'social', title: t('social'), icon: <MessageSquare size={24} />, color: 'from-emerald-600 to-emerald-900', action: () => null },
        ].map(mode => (
          <motion.button
            key={mode.id}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={mode.action}
            className={`relative h-32 rounded-[32px] bg-gradient-to-br ${mode.color} p-6 flex flex-col justify-between overflow-hidden shadow-xl border border-white/10 group`}
          >
            <div className="absolute top-2 right-2 opacity-10 group-hover:scale-110 transition-transform duration-500">{mode.icon}</div>
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-2">{mode.icon}</div>
            <h4 className="text-sm font-black uppercase tracking-tighter italic leading-none">{mode.title}</h4>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

