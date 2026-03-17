import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Player, GameState, PlayerAction, GameMode, ChatMessage, Card as CardType } from './types';
import { PokerUtils } from './pokerUtils';
import { PlayerSeat } from './components/PlayerSeat';
import { Card } from './components/Card';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Settings, Users, LayoutGrid, ShoppingBag, BarChart3, MessageSquare, Smile, Timer, Globe, ChevronDown, Coins } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTranslation } from './LanguageContext';
import { POKER_CHARACTERS } from './constants';
import { CharacterSelectUI } from './components/CharacterSelectUI';
import { ChatSystem } from './components/ChatSystem';
import { CasinoLobby } from './components/CasinoLobby';
import { CardSqueeze } from './components/CardSqueeze';
import { AudioManager } from './services/AudioManager';
import { Ads } from './components/Ads';
import { io, Socket } from 'socket.io-client';

const INITIAL_CHIPS = 10000;
const PLAYER_NAMES = ['Aria', 'Borgata', 'Caesars', 'Dunes', 'Encore', 'Flamingo', 'Golden', 'HardRock', 'Imperial'];

export default function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { t, language, setLanguage } = useTranslation();
  const [lobbyView, setLobbyView] = useState<'main' | 'tournaments' | 'stats' | 'shop' | 'characters'>('main');
  const [selectedCharacter, setSelectedCharacter] = useState(POKER_CHARACTERS[0]);
  const [showStandings, setShowStandings] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [activeSqueeze, setActiveSqueeze] = useState<CardType[] | null>(null);
  const [hasSqueezed, setHasSqueezed] = useState<Set<string>>(new Set());
  const socketRef = useRef<Socket | null>(null);

  const audio = AudioManager.getInstance();

  useEffect(() => {
    // Connect to the real-time server
    socketRef.current = io();

    socketRef.current.on('game_state_update', (state: GameState) => {
      setGameState(state);
      setIsProcessing(false);
    });

    socketRef.current.on('chat_message', (msg: ChatMessage) => {
      setChatMessages(prev => [...prev.slice(-49), msg]);
    });

    socketRef.current.on('player_won', () => {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f59e0b', '#d97706']
      });
      audio.playSynthesized('win');
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const handleSendMessage = (msg: string) => {
    socketRef.current?.emit('chat_message', msg);
  };

  const onInitGame = (mode: GameMode) => {
    socketRef.current?.emit('join_game', {
      name: t(`char_${selectedCharacter.id}`),
      avatar: selectedCharacter.avatar,
      characterId: selectedCharacter.id,
      chips: INITIAL_CHIPS
    });
  };

  const handleAction = (action: PlayerAction, amount: number = 0) => {
    if (!gameState || isProcessing) return;
    setIsProcessing(true);
    audio.playSynthesized('chip');
    socketRef.current?.emit('player_action', { type: action, amount });
  };

  useEffect(() => {
    console.log('Current language:', language);
  }, [language]);

  const [betSliderValue, setBetSliderValue] = useState(0);
  const [selectedCharacterId, setSelectedCharacterId] = useState(1);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [squeezeCardIndex, setSqueezeCardIndex] = useState<number | null>(null);

  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    if (gameState?.stage === 'pre-flop') {
      audio.playSynthesized('tudum');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  }, [gameState?.stage]);

  const userPlayer = gameState?.players.find(p => p.id === socketRef.current?.id);
  const isUserTurn = gameState?.activePlayerIndex !== undefined && gameState.players[gameState.activePlayerIndex]?.id === socketRef.current?.id;

  if (!gameState) return null;

  if (gameState.mode === 'lobby') {
    return (
      <motion.div 
        animate={isShaking ? {
          x: [0, -5, 5, -5, 5, 0],
          y: [0, 5, -5, 5, -5, 0]
        } : {}}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-[#0b0b0f] text-white flex flex-col font-sans selection:bg-yellow-500/30 overflow-hidden"
      >
        {/* Top Navigation Bar - Premium Casino Style */}
        <header className="h-20 bg-black/40 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between px-8 z-50 shadow-2xl">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <button 
                  onClick={() => setLobbyView('characters')}
                  className="relative w-12 h-12 rounded-full border-2 border-[#d4af37] overflow-hidden shadow-lg"
                >
                  <img src={selectedCharacter.avatar} alt="avatar" className="w-full h-full object-cover" />
                </button>
                <div className="absolute -bottom-1 -right-1 bg-[#d4af37] text-black text-[8px] font-black px-1.5 py-0.5 rounded-full border border-black uppercase">VIP 42</div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-tighter text-white/90 italic">{t(`char_${selectedCharacter.id}`)}</span>
                  <span className="text-[8px] font-bold px-1.5 py-0.5 bg-white/10 rounded text-white/40 uppercase tracking-widest">{t(`style_${selectedCharacter.style.toLowerCase().replace('-', '_')}`)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="w-[42%] h-full bg-gradient-to-r from-yellow-400 to-yellow-600" />
                  </div>
                  <span className="text-[8px] font-bold text-yellow-500 uppercase">{t('level')} 42</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 bg-white/5 px-6 py-2 rounded-2xl border border-white/10 shadow-inner">
              <div className="flex flex-col items-end">
                <span className="text-[9px] text-white/40 uppercase font-black tracking-widest">{t('balance')}</span>
                <div className="flex items-center gap-2">
                  <Coins size={14} className="text-yellow-500" />
                  <span className="text-lg font-black text-yellow-500 font-mono tracking-tighter">{gameState.players[0].chips.toLocaleString()}{t('currency')}</span>
                </div>
              </div>
              <button className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center text-black hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/20">+</button>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <button 
                  onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
                >
                  <Globe size={16} className="text-yellow-500" />
                  <span className="text-xs font-bold uppercase">{language}</span>
                  <ChevronDown size={14} className={`transition-transform ${isLanguageOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {isLanguageOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-32 bg-neutral-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                    >
                      {(['en', 'ko', 'zh'] as const).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => {
                            setLanguage(lang);
                            setIsLanguageOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-left text-xs font-bold uppercase hover:bg-white/5 transition-colors ${language === lang ? 'text-yellow-500' : 'text-white/60'}`}
                        >
                          {lang === 'en' ? 'English' : lang === 'ko' ? '한국어' : '中文'}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button className="p-2.5 bg-white/5 text-white/40 rounded-xl border border-white/10 hover:bg-white/10 hover:text-white transition-all">
                <Settings size={18} />
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {lobbyView === 'main' && (
              <CasinoLobby 
                selectedCharacter={selectedCharacter}
                chips={gameState.players[0].chips}
                onSetView={setLobbyView}
                onInitGame={onInitGame}
                stats={gameState.players[0].stats}
              />
            )}

          {lobbyView === 'characters' && (
            <motion.div
              key="characters"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex-1"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter">{t('selectCharacter')}</h3>
                <button onClick={() => setLobbyView('main')} className="text-sm text-white/40 hover:text-white">{t('back')}</button>
              </div>
              <CharacterSelectUI 
                selectedId={selectedCharacterId} 
                onSelect={(char) => {
                  setSelectedCharacterId(char.id);
                  setLobbyView('main');
                }} 
              />
            </motion.div>
          )}

          {lobbyView === 'tournaments' && (
            <motion.div 
              key="tournaments"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold flex items-center gap-2"><Trophy className="text-yellow-500" size={20} /> {t('tournament')}</h3>
                <button onClick={() => setLobbyView('main')} className="text-sm text-white/40 hover:text-white">{t('back')}</button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {[
                  { name: 'WSOP Main Event', buyin: 10000, players: '1,240/2,000', prize: '$10M GTD', time: 'Starts in 12m' },
                  { name: 'High Roller Turbo', buyin: 25000, players: '45/100', prize: '$2M GTD', time: 'Late Reg' },
                  { name: 'Daily Deepstack', buyin: 500, players: '450/500', prize: '$250K GTD', time: 'Starting Now' },
                  { name: 'Sunday Million', buyin: 1000, players: '8,900/10,000', prize: '$1M GTD', time: 'In 2h 15m' },
                ].map((t, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer" onClick={() => onInitGame('tournament')}>
                    <div className="flex flex-col">
                      <span className="font-bold">{t.name}</span>
                      <span className="text-xs text-white/40 uppercase tracking-wider">{t.time}</span>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-white/40 uppercase">Buy-in</span>
                        <span className="text-sm font-mono text-yellow-500">${t.buyin.toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-white/40 uppercase">Prize Pool</span>
                        <span className="text-sm font-mono text-emerald-400">{t.prize}</span>
                      </div>
                      <button className="px-4 py-2 bg-yellow-500 text-black font-bold rounded-lg text-xs uppercase hover:bg-yellow-400 transition-colors">Join</button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {lobbyView === 'stats' && (
            <motion.div 
              key="stats"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex-1 bg-white/5 rounded-3xl p-8 border border-white/10"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter">{t('stats')}</h3>
                <button onClick={() => setLobbyView('main')} className="text-sm text-white/40 hover:text-white">{t('back')}</button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: t('handsPlayed'), value: gameState.players[0].stats.handsPlayed, color: 'text-white' },
                  { label: t('winRate'), value: gameState.players[0].stats.handsPlayed > 0 ? `${((gameState.players[0].stats.handsWon / gameState.players[0].stats.handsPlayed) * 100).toFixed(1)}%` : '0%', color: 'text-emerald-400' },
                  { label: t('vpip'), value: `${gameState.players[0].stats.vpip}%`, color: 'text-blue-400' },
                  { label: t('pfr'), value: `${gameState.players[0].stats.pfr}%`, color: 'text-red-400' },
                ].map((stat, i) => (
                  <div key={i} className="bg-black/40 rounded-2xl p-6 border border-white/5">
                    <p className="text-[10px] text-white/40 uppercase font-bold mb-1">{stat.label}</p>
                    <p className={`text-3xl font-black font-mono ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 h-48 bg-black/40 rounded-2xl border border-white/5 flex items-center justify-center">
                <p className="text-white/20 uppercase font-bold tracking-[0.2em]">{t('profitGraphComingSoon')}</p>
              </div>
            </motion.div>
          )}

          {lobbyView === 'shop' && (
            <motion.div 
              key="shop"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4"
            >
              {[
                { name: 'Starter Pack', price: '$4.99', chips: '50,000', bonus: '+5,000', color: 'from-blue-500 to-blue-700' },
                { name: 'Pro Bundle', price: '$19.99', chips: '250,000', bonus: '+30,000', color: 'from-purple-500 to-purple-700' },
                { name: 'Whale Pack', price: '$99.99', chips: '2,000,000', bonus: '+500,000', color: 'from-yellow-500 to-yellow-700' },
              ].map((item, i) => (
                <div key={i} className={`bg-gradient-to-br ${item.color} rounded-3xl p-6 flex flex-col justify-between border border-white/20 shadow-xl`}>
                  <div>
                    <h4 className="font-black italic uppercase text-lg">{item.name}</h4>
                    <p className="text-white/60 text-xs uppercase font-bold">{item.bonus} Bonus</p>
                  </div>
                  <div className="mt-4">
                    <p className="text-3xl font-black font-mono">${item.chips.toLocaleString()}</p>
                    <button className="mt-4 w-full py-3 bg-white text-black font-black rounded-xl uppercase text-sm hover:bg-white/90 transition-colors">{item.price}</button>
                  </div>
                </div>
              ))}
              <div className="bg-white/5 rounded-3xl p-6 border border-white/10 flex flex-col items-center justify-center text-center">
                <Smile size={48} className="text-white/20 mb-4" />
                <p className="text-white/40 text-xs uppercase font-bold">More items coming soon</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

        <footer className="h-20 bg-black/60 backdrop-blur-2xl border-t border-white/5 px-12 flex justify-around items-center z-50">
          {[
            { id: 'main', label: t('lobby'), icon: <LayoutGrid size={24} /> },
            { id: 'tournaments', label: t('tournament'), icon: <Trophy size={24} /> },
            { id: 'stats', label: t('stats'), icon: <BarChart3 size={24} /> },
            { id: 'shop', label: t('shop'), icon: <ShoppingBag size={24} /> },
            { id: 'characters', label: t('selectCharacter'), icon: <Users size={24} /> },
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setLobbyView(item.id as any)} 
              className={`flex flex-col items-center gap-1.5 transition-all duration-300 relative group ${lobbyView === item.id ? 'text-yellow-500' : 'text-white/40 hover:text-white/70'}`}
            >
              {lobbyView === item.id && (
                <motion.div layoutId="activeNav" className="absolute -top-4 w-12 h-1 bg-yellow-500 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
              )}
              <div className={`${lobbyView === item.id ? 'scale-110' : 'scale-100'} transition-transform`}>
                {item.icon}
              </div>
              <span className="text-[9px] uppercase font-black tracking-widest">{item.label}</span>
            </button>
          ))}
        </footer>
      </motion.div>
    );
  }

  const user = userPlayer;
  if (!user) return null;

  return (
    <motion.div 
      animate={isShaking ? {
        x: [0, -5, 5, -5, 5, 0],
        y: [0, 5, -5, 5, -5, 0]
      } : {}}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-yellow-500/30 overflow-hidden flex flex-col"
    >
      {/* Card Squeeze Overlay */}
      <AnimatePresence>
        {activeSqueeze && (
          <CardSqueeze 
            cards={activeSqueeze} 
            onClose={() => {
              if (socketRef.current?.id) {
                setHasSqueezed(prev => new Set(prev).add(socketRef.current!.id));
              }
              setActiveSqueeze(null);
            }} 
          />
        )}
      </AnimatePresence>

      <header className="h-16 border-b border-white/10 bg-black/80 backdrop-blur-xl flex items-center justify-between px-8 z-50">
        <div className="flex items-center gap-6">
          <button onClick={() => onInitGame('cash')} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-white/40 hover:text-white">
            <LayoutGrid size={20} />
          </button>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-yellow-500">{t('jackpot')}</span>
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            </div>
            <span className="text-lg font-black font-mono leading-none">1,245,890.00{t('currency')}</span>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <h1 className="text-[18px] font-black uppercase tracking-tighter text-[#d4af37] italic">WSOP ELITE</h1>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{t('tournament')} • {t('table')} 01</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => setShowStandings(!showStandings)} className="p-2.5 bg-yellow-500/10 text-yellow-500 rounded-xl border border-yellow-500/20 hover:bg-yellow-500/20 transition-all">
            <Trophy size={18} />
          </button>
          <div className="h-8 w-px bg-white/10" />
          <button className="p-2.5 bg-white/5 text-white/40 rounded-xl border border-white/10 hover:bg-white/10 hover:text-white transition-all">
            <Settings size={18} />
          </button>
        </div>
      </header>

      <main className="flex-1 relative flex items-center justify-center p-4">
        {/* Table Ads */}
        <Ads type="table" />

        {/* Chat System */}
        <ChatSystem 
          messages={chatMessages} 
          onSendMessage={handleSendMessage} 
          isOpen={isChatOpen} 
          onClose={() => setIsChatOpen(false)} 
        />

        {/* Hand History Panel */}
        <div className="absolute left-6 top-6 bottom-6 w-64 bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl z-40 p-4 flex flex-col hidden lg:flex">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2">
            <MessageSquare size={12} /> {t('handHistory')}
          </h3>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {gameState.logs.map((log, i) => (
              <div key={i} className="text-[11px] leading-tight p-2 rounded-lg bg-white/5 border border-white/5 text-white/70">
                {t(log.key, log.params)}
              </div>
            ))}
          </div>
        </div>

        {/* Tournament Standings Overlay */}
        <AnimatePresence>
          {showStandings && (
            <motion.div 
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="absolute right-6 top-6 bottom-6 w-80 bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl z-[100] p-6 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black italic uppercase tracking-tighter text-xl">{t('stats')}</h3>
                <button onClick={() => setShowStandings(false)} className="text-white/40 hover:text-white">{t('back')}</button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {[...gameState.players].sort((a, b) => b.chips - a.chips).map((p, i) => (
                  <div key={p.id} className={`flex items-center justify-between p-3 rounded-xl border ${p.id === 'user' ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-white/5 border-white/5'}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-white/40 w-4">{i + 1}</span>
                      <img src={p.avatar} className="w-8 h-8 rounded-full border border-white/10" alt="" />
                      <span className={`text-sm font-bold ${p.id === 'user' ? 'text-yellow-500' : 'text-white'}`}>{t(`char_${p.characterId}`)}</span>
                    </div>
                    <span className="text-xs font-mono font-bold">{p.chips.toLocaleString()}{t('currency')}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex justify-between text-[10px] uppercase font-bold text-white/40 mb-2">
                  <span>{t('nextLevelIn')}</span>
                  <span>4:20</span>
                </div>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="w-1/3 h-full bg-yellow-500" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <div className="px-4 py-2 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 flex flex-col gap-1 max-h-48 overflow-y-auto custom-scrollbar">
            <span className="text-[8px] font-black uppercase tracking-widest text-white/40 mb-1">{t('handHistory')}</span>
            {gameState.logs.slice(-5).map((log, i) => (
              <div key={i} className="text-[10px] text-white/60 font-medium border-l-2 border-yellow-500/30 pl-2 py-0.5">
                {t(log.key, log.params)}
              </div>
            ))}
          </div>
        </div>
        <div className="relative w-full max-w-5xl aspect-[2/1] bg-[#1a3a2a] rounded-[200px] border-[12px] border-[#2a1a0a] shadow-[0_0_100px_rgba(0,0,0,0.8),inset_0_0_50px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-visible">
          <div className="absolute inset-0 rounded-[188px] opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="absolute inset-2 rounded-[180px] border-2 border-white/10 pointer-events-none" />

          {/* Top Branding Logo */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none select-none z-0">
            <span className="text-[18px] font-black uppercase tracking-tighter text-[#d4af37]/60 italic">WSOP ELITE</span>
            <span className="text-[28px] font-black uppercase tracking-[6px] text-white/60 leading-none mt-1">CHUANQI PUKE</span>
          </div>

          {/* Center Watermark (Faint) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05] select-none z-0">
            <div className="flex flex-col items-center">
              <div className="relative scale-75">
                <div className="flex gap-2 mb-2">
                  <div className="w-12 h-16 bg-white/10 rounded-sm border border-white/20 rotate-[-15deg]" />
                  <div className="w-12 h-16 bg-white/10 rounded-sm border border-white/20" />
                  <div className="w-12 h-16 bg-white/10 rounded-sm border border-white/20 rotate-[15deg]" />
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="text-4xl font-black tracking-tighter text-white/40 italic">CHUANQI PUKE</span>
                </div>
              </div>
              <div className="mt-8 text-[10px] tracking-[0.3em] font-bold text-white/30 uppercase">{t('goForGold')}</div>
            </div>
          </div>

          <div className="flex gap-2 sm:gap-4 z-10">
            <AnimatePresence>
              {gameState.communityCards.map((card, i) => <Card key={`community-${i}`} card={card} className="shadow-2xl" />)}
              {Array.from({ length: 5 - gameState.communityCards.length }).map((_, i) => <div key={`empty-${i}`} className="w-12 h-16 sm:w-16 sm:h-24 rounded-lg border-2 border-white/5 bg-black/20" />)}
            </AnimatePresence>
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-16 flex flex-col items-center">
            <div className="px-6 py-2 bg-black/80 backdrop-blur-xl rounded-2xl border border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
              <div className="text-[10px] font-black uppercase tracking-widest text-white/40 text-center mb-1">{t('pot')}</div>
              <div className="text-xl font-black text-yellow-500 font-mono tracking-tighter">{gameState.pot.toLocaleString()}{t('currency')}</div>
            </div>
          </div>

          {gameState.players.map((p, i) => {
            const positions = [
              "left-1/2 top-[110%]", "left-[10%] top-[80%]", "left-[5%] top-1/2", "left-[10%] top-[20%]",
              "left-[30%] top-[-10%]", "left-[50%] top-[-15%]", "left-[70%] top-[-10%]", "left-[90%] top-[20%]", "left-[95%] top-1/2"
            ];
            return (
              <PlayerSeat 
                key={p.id} 
                player={p} 
                isActive={gameState.activePlayerIndex === i} 
                isDealer={p.isDealer} 
                showCards={gameState.stage === 'showdown' || p.id === socketRef.current?.id} 
                position={positions[i]} 
                onCardClick={p.id === socketRef.current?.id ? () => setActiveSqueeze(p.cards) : undefined}
                hasSqueezed={p.id === socketRef.current?.id ? hasSqueezed.has(p.id) : undefined}
              />
            );
          })}
        </div>

        {/* Interaction Buttons (Emoji/Chat) */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button className="p-2 bg-black/40 rounded-full border border-white/10 hover:bg-white/10 transition-colors"><Smile size={18} /></button>
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`p-2 rounded-full border transition-colors ${isChatOpen ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-black/40 text-white border-white/10 hover:bg-white/10'}`}
          >
            <MessageSquare size={18} />
          </button>
        </div>
      </main>

      <footer className="h-24 bg-neutral-900 border-t border-white/10 px-6 flex items-center justify-between z-50">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] text-white/40 uppercase">{t('yourChips')}</span>
            <span className="text-xl font-bold text-yellow-500 font-mono">{user.chips.toLocaleString()}{t('currency')}</span>
          </div>
          <div className="h-10 w-px bg-white/10" />
          <div className="flex flex-col">
            <span className="text-[10px] text-white/40 uppercase">{t('currentBet')}</span>
            <span className="text-xl font-bold text-white font-mono">{gameState.currentBet.toLocaleString()}{t('currency')}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            disabled={!isUserTurn} 
            onClick={() => handleAction('fold')} 
            className="px-8 h-14 rounded-2xl bg-red-600 hover:bg-red-500 disabled:opacity-30 disabled:cursor-not-allowed font-black uppercase tracking-tighter italic text-lg transition-all active:scale-95 shadow-lg shadow-red-900/40 border-b-4 border-red-800"
          >
            {t('fold')}
          </button>
          
          <button 
            disabled={!isUserTurn} 
            onClick={() => handleAction(gameState.currentBet === user.currentBet ? 'check' : 'call')} 
            className="px-8 h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed font-black uppercase tracking-tighter italic text-lg transition-all active:scale-95 shadow-lg shadow-blue-900/40 border-b-4 border-blue-800"
          >
            {gameState.currentBet === user.currentBet ? t('check') : t('call')}
          </button>
          
          <div className="flex flex-col gap-2 px-4 py-2 bg-black/40 rounded-2xl border border-white/10">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">{t('raise')}</span>
              <span className="text-xs font-mono font-black text-yellow-500">{Math.max(gameState.currentBet + gameState.bigBlind, betSliderValue).toLocaleString()}{t('currency')}</span>
            </div>
            <input 
              type="range" 
              min={gameState.currentBet + gameState.bigBlind} 
              max={user.chips + user.currentBet} 
              step={gameState.bigBlind}
              value={betSliderValue}
              onChange={(e) => setBetSliderValue(parseInt(e.target.value))}
              disabled={!isUserTurn}
              className="w-40 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-yellow-500"
            />
          </div>

          <button 
            disabled={!isUserTurn} 
            onClick={() => handleAction('raise', Math.max(gameState.currentBet + gameState.bigBlind, betSliderValue))} 
            className="px-8 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed font-black uppercase tracking-tighter italic text-lg transition-all active:scale-95 shadow-lg shadow-emerald-900/40 border-b-4 border-emerald-800"
          >
            {t('raise')}
          </button>

          <button 
            disabled={!isUserTurn} 
            onClick={() => handleAction('raise', user.chips + user.currentBet)} 
            className="px-8 h-14 rounded-2xl bg-yellow-500 hover:bg-yellow-400 disabled:opacity-30 disabled:cursor-not-allowed font-black uppercase tracking-tighter italic text-lg transition-all active:scale-95 shadow-lg shadow-yellow-900/40 border-b-4 border-yellow-700 text-black"
          >
            {t('allIn')}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-white/40 uppercase">{t('handEquity')}</span>
            <span className="text-sm font-bold text-indigo-400 font-mono">{user.cards.length > 0 ? (PokerUtils.calculateWinRate(user.cards, gameState.communityCards, gameState.players.filter(p => !p.isFolded && p.id !== 'user').length, 100) * 100).toFixed(1) : '0.0'}%</span>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}
