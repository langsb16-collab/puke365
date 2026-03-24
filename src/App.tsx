import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Player, GameState, BLIND_LEVELS, PlayerAction, GameMode, ChatMessage } from './types';
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
import { CardSqueeze } from './components/CardSqueeze';
import { AudioManager } from './services/AudioManager';
import { useOrientation, useDeviceType } from './hooks/useOrientation';
import { MobilePortrait } from './components/MobilePortrait';
import { MobileLandscape } from './components/MobileLandscape';

const INITIAL_CHIPS = 10000;
const PLAYER_NAMES = ['Aria', 'Borgata', 'Caesars', 'Dunes', 'Encore', 'Flamingo', 'Golden', 'HardRock', 'Imperial'];

export default function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { t, language, setLanguage } = useTranslation();
  const [lobbyView, setLobbyView] = useState<'main' | 'tournaments' | 'stats' | 'shop' | 'characters'>('main');
  const [betSliderValue, setBetSliderValue] = useState(0);
  const [showStandings, setShowStandings] = useState(false);
  const [selectedCharacterId, setSelectedCharacterId] = useState(1);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(true); // Changed to true by default
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [squeezeCardIndex, setSqueezeCardIndex] = useState<number | null>(null);
  const [squeezedCards, setSqueezedCards] = useState<Set<number>>(new Set());
  const audioManager = useRef<AudioManager>(AudioManager.getInstance());
  
  // 🚨 모바일 방향 감지 훅
  const isLandscape = useOrientation();
  const deviceType = useDeviceType();

  const selectedCharacter = POKER_CHARACTERS.find(c => c.id === selectedCharacterId) || POKER_CHARACTERS[0];

  const initGame = useCallback((mode: GameMode = 'lobby') => {
    const players: Player[] = [
      {
        id: 'user',
        name: selectedCharacter.name,
        chips: INITIAL_CHIPS,
        cards: [], // ✅ 반드시 빈 배열로 초기화
        isDealer: false,
        isSmallBlind: false,
        isBigBlind: false,
        currentBet: 0,
        isFolded: false,
        isAllIn: false,
        isAI: false,
        avatar: selectedCharacter.avatar,
        characterId: selectedCharacter.id,
        stats: { vpip: 24, pfr: 18, handsPlayed: 120, handsWon: 45 }
      },
      ...PLAYER_NAMES.slice(0, 8).map((name, i) => {
        const randomChar = POKER_CHARACTERS[Math.floor(Math.random() * POKER_CHARACTERS.length)];
        return {
          id: `ai-${i}`,
          name: randomChar.name, // Use character name for AI too
          chips: INITIAL_CHIPS,
          cards: [], // ✅ 반드시 빈 배열로 초기화
          isDealer: false,
          isSmallBlind: false,
          isBigBlind: false,
          currentBet: 0,
          isFolded: false,
          isAllIn: false,
          isAI: true,
          avatar: randomChar.avatar,
          characterId: randomChar.id,
          stats: { 
            vpip: Math.floor(Math.random() * 20) + 15, 
            pfr: Math.floor(Math.random() * 15) + 10, 
            handsPlayed: 1000, 
            handsWon: 250 
          }
        };
      })
    ];

    const initialState: GameState = {
      mode,
      players,
      communityCards: [],
      pot: 0,
      sidePots: [],
      currentBet: 0,
      dealerIndex: 0,
      activePlayerIndex: 1,
      stage: 'pre-flop',
      deck: PokerUtils.createDeck(),
      blindLevel: 0,
      smallBlind: BLIND_LEVELS[0].sb,
      bigBlind: BLIND_LEVELS[0].bb,
      logs: [{ key: 'log_welcome' }],
      timer: 15
    };

    setGameState(initialState);
    if (mode !== 'lobby') {
      startNewHand(initialState);
    }
  }, []);

  useEffect(() => {
    initGame('lobby');
    // Play welcome sound
    audioManager.current.playSynthesized('welcome');
  }, [initGame]);

  const startNewHand = (state: GameState) => {
    // Reset squeezed cards for new hand
    setSqueezedCards(new Set());
    setSqueezeCardIndex(null);
    
    const deck = PokerUtils.shuffle(PokerUtils.createDeck());
    const dealerIndex = (state.dealerIndex + 1) % state.players.length;
    const sbIndex = (dealerIndex + 1) % state.players.length;
    const bbIndex = (dealerIndex + 2) % state.players.length;
    const firstPlayerIndex = (dealerIndex + 3) % state.players.length;

    const players = state.players.map((p, i) => {
      const card1 = deck.pop();
      const card2 = deck.pop();
      if (!card1 || !card2) {
        console.error('Deck empty during card dealing');
        return { ...p, cards: [] };
      }
      return {
        ...p,
        cards: [card1, card2],
        isDealer: i === dealerIndex,
        isSmallBlind: i === sbIndex,
        isBigBlind: i === bbIndex,
        currentBet: i === sbIndex ? state.smallBlind : i === bbIndex ? state.bigBlind : 0,
        isFolded: p.chips <= 0,
        isAllIn: false,
        lastAction: undefined,
        winRate: undefined,
      };
    });

    // Deduct blinds
    players[sbIndex].chips -= state.smallBlind;
    players[bbIndex].chips -= state.bigBlind;

    setGameState({
      ...state,
      players,
      deck,
      communityCards: [],
      pot: state.smallBlind + state.bigBlind,
      currentBet: state.bigBlind,
      stage: 'pre-flop',
      activePlayerIndex: firstPlayerIndex,
      timer: 15,
      logs: [{ key: 'log_new_hand', params: { sb: state.smallBlind, bb: state.bigBlind } }, ...state.logs.slice(0, 5)],
    });
  };

  const handleAction = async (action: PlayerAction, amount: number = 0) => {
    if (!gameState || isProcessing) return;
    setIsProcessing(true);
    
    // Play chip sound for bet actions
    if (action !== 'fold') {
      audioManager.current.playSynthesized('chip');
    }

    const newState = { ...gameState };
    const player = newState.players[newState.activePlayerIndex];
    
    let actualBet = 0;
    if (action === 'fold') {
      player.isFolded = true;
      player.lastAction = 'fold';
    } else if (action === 'call' || action === 'check') {
      actualBet = newState.currentBet - player.currentBet;
      if (actualBet > player.chips) actualBet = player.chips;
      player.chips -= actualBet;
      player.currentBet += actualBet;
      newState.pot += actualBet;
      player.lastAction = actualBet === 0 ? 'check' : 'call';
    } else if (action === 'raise') {
      const raiseAmount = amount;
      actualBet = raiseAmount - player.currentBet;
      if (actualBet >= player.chips) {
        actualBet = player.chips;
        player.isAllIn = true;
      }
      player.chips -= actualBet;
      player.currentBet += actualBet;
      newState.pot += actualBet;
      newState.currentBet = player.currentBet;
      player.lastAction = player.isAllIn ? 'all-in' : 'raise';
    }

    // Move to next player
    let nextIndex = (newState.activePlayerIndex + 1) % newState.players.length;
    let attempts = 0;
    while ((newState.players[nextIndex].isFolded || newState.players[nextIndex].isAllIn) && attempts < newState.players.length) {
      nextIndex = (nextIndex + 1) % newState.players.length;
      attempts++;
    }

    newState.activePlayerIndex = nextIndex;
    newState.timer = 15;
    
    const activePlayers = newState.players.filter(p => !p.isFolded);
    const allMatched = activePlayers.every(p => p.currentBet === newState.currentBet || p.isAllIn);
    
    if (allMatched || activePlayers.length === 1) {
      await advanceStage(newState);
    } else {
      setGameState(newState);
      setIsProcessing(false);
    }
  };

  const advanceStage = async (state: GameState) => {
    const newState = { ...state };
    newState.players.forEach(p => p.currentBet = 0);
    newState.currentBet = 0;

    if (newState.stage === 'pre-flop') {
      newState.stage = 'flop';
      newState.communityCards = [newState.deck.pop()!, newState.deck.pop()!, newState.deck.pop()!];
      // Play card sound
      audioManager.current.playSynthesized('card');
    } else if (newState.stage === 'flop') {
      newState.stage = 'turn';
      newState.communityCards.push(newState.deck.pop()!);
      // Play card sound
      audioManager.current.playSynthesized('card');
    } else if (newState.stage === 'turn') {
      newState.stage = 'river';
      newState.communityCards.push(newState.deck.pop()!);
      // Play card sound
      audioManager.current.playSynthesized('card');
    } else {
      await resolveHand(newState);
      return;
    }

    newState.players.forEach(p => {
      if (p.isAI && !p.isFolded) {
        p.winRate = PokerUtils.calculateWinRate(p.cards, newState.communityCards, newState.players.filter(op => !op.isFolded && op.id !== p.id).length);
      }
    });

    newState.activePlayerIndex = (newState.dealerIndex + 1) % newState.players.length;
    while (newState.players[newState.activePlayerIndex].isFolded) {
      newState.activePlayerIndex = (newState.activePlayerIndex + 1) % newState.players.length;
    }

    setGameState(newState);
    setIsProcessing(false);
  };

  const resolveHand = async (state: GameState) => {
    const activePlayers = state.players.filter(p => !p.isFolded);
    
    // Simple side pot logic: if anyone is all-in, we should ideally split the pot.
    // For now, we'll implement a basic version that handles the main pot.
    // Real side pots require tracking contributions per player.
    
    let winningPlayer: Player | null = null;
    let bestHandName = '';

    if (activePlayers.length === 1) {
      winningPlayer = activePlayers[0];
      bestHandName = 'everyoneFolded';
    } else {
      const results = activePlayers.map(p => ({
        player: p,
        result: PokerUtils.evaluateHand([...p.cards, ...state.communityCards])
      }));
      results.sort((a, b) => b.result.score - a.result.score);
      winningPlayer = results[0].player;
      bestHandName = results[0].result.name;
    }

    if (winningPlayer) {
      winningPlayer.chips += state.pot;
      state.logs = [{ 
        key: 'log_win', 
        params: { 
          name: t(`char_${winningPlayer.characterId}`), 
          amount: state.pot.toLocaleString(), 
          currency: t('currency'),
          hand: t(bestHandName)
        } 
      }, ...state.logs];
      if (winningPlayer.id === 'user') {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        // Play win sound
        audioManager.current.playSynthesized('win');
        winningPlayer.stats.handsWon++;
      }
      winningPlayer.stats.handsPlayed++;
    }

    setGameState({ ...state, pot: 0, stage: 'showdown' });
    setTimeout(() => {
      // Check for tournament end
      const playersWithChips = state.players.filter(p => p.chips > 0);
      if (playersWithChips.length === 1) {
        state.logs = [{ 
          key: 'log_tournament_over', 
          params: { name: t(`char_${playersWithChips[0].characterId}`) } 
        }, ...state.logs];
        setGameState({ ...state, mode: 'lobby' });
      } else {
        startNewHand(state);
      }
      setIsProcessing(false);
    }, 3000);
  };

  useEffect(() => {
    if (!gameState || isProcessing || gameState.stage === 'showdown' || gameState.mode === 'lobby') return;
    const activePlayer = gameState.players[gameState.activePlayerIndex];
    if (activePlayer.isAI) {
      const timer = setTimeout(() => {
        const winRate = activePlayer.winRate || 0.4;
        const decision = PokerUtils.getAIDecision(activePlayer, gameState, winRate);
        handleAction(decision.action as PlayerAction, decision.amount);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState, isProcessing]);

  const handleCardClick = (cardIndex: number) => {
    if (!gameState || gameState.stage === 'showdown') return;
    const userPlayer = gameState.players.find(p => p.id === 'user');
    if (!userPlayer || userPlayer.isAI) return;
    
    // Set the card to be squeezed
    setSqueezeCardIndex(cardIndex);
    audioManager.current.playSynthesized('click');
  };

  const handleSqueezeComplete = () => {
    if (squeezeCardIndex !== null) {
      setSqueezedCards(prev => new Set(prev).add(squeezeCardIndex));
      setSqueezeCardIndex(null);
    }
  };

  const handleSendMessage = (message: string) => {
    const newMessage: ChatMessage = {
      playerName: selectedCharacter.name,
      message,
      timestamp: Date.now()
    };
    setChatMessages(prev => [...prev, newMessage]);
    
    // Enhanced AI reaction with varied responses
    setTimeout(() => {
      const aiResponses = [
        "Nice hand!",
        "Good luck! 🍀",
        "Let's see what you got 🃏",
        "All in! 💰",
        "Bluff? 🤔",
        "GG! 👍",
        "Great play! 🔥",
        "Tough luck 😅",
        "You got this! 💪",
        "Fold or fight? 🎰",
        "Nice call! 👏",
        "Risky move! 😱",
        "Smart play 🧠",
        "Let's raise it! 📈",
      ];
      
      const randomAIPlayer = gameState.players.filter(p => p.isAI && !p.isFolded)[Math.floor(Math.random() * gameState.players.filter(p => p.isAI && !p.isFolded).length)];
      
      if (randomAIPlayer && Math.random() > 0.3) { // 70% chance of AI response
        const aiResponse: ChatMessage = {
          playerName: t(`char_${randomAIPlayer.characterId}`),
          message: aiResponses[Math.floor(Math.random() * aiResponses.length)],
          timestamp: Date.now()
        };
        setChatMessages(prev => [...prev, aiResponse]);
      }
    }, 1500 + Math.random() * 2000); // Random delay between 1.5-3.5 seconds
  };

  // Early return AFTER all hooks
  if (!gameState) return <div>Loading...</div>;

  if (gameState.mode === 'lobby') {
    return (
      <div className="min-h-screen bg-[#0b0b0f] text-white flex flex-col font-sans selection:bg-yellow-500/30 overflow-hidden">
        {/* Top Navigation Bar - Premium Casino Style */}
        {/* Fixed Language Selector - Always Visible on All Screens */}
        <div className="fixed top-24 right-4 md:top-4 md:right-[17rem] lg:right-[18rem] z-[100]">
          <div className="relative">
            <button 
              onClick={() => setIsLanguageOpen(!isLanguageOpen)}
              className="flex items-center gap-2 px-2 py-1.5 md:px-3 md:py-2 bg-black/60 backdrop-blur-xl border border-yellow-500/30 rounded-xl hover:bg-black/80 hover:border-yellow-500/50 transition-all shadow-lg shadow-yellow-500/20"
            >
              <Globe size={14} className="text-yellow-500 md:w-4 md:h-4" />
              <span className="text-[10px] md:text-xs font-bold uppercase text-white">{language}</span>
              <ChevronDown size={12} className={`text-yellow-500 md:w-3.5 md:h-3.5 transition-transform ${isLanguageOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {isLanguageOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-32 bg-neutral-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[110]"
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
        </div>

        <header className="h-20 bg-black/40 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between px-8 z-50 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="relative group scale-[0.65] origin-left">
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <button 
                  onClick={() => setLobbyView('characters')}
                  className="relative w-12 h-12 rounded-full border-2 border-[#d4af37] overflow-hidden shadow-lg"
                >
                  <img src={selectedCharacter.avatar} alt="avatar" className="w-full h-full object-cover" />
                </button>
                <div className="absolute -bottom-1 -right-1 bg-[#d4af37] text-black text-[8px] font-black px-1.5 py-0.5 rounded-full border border-black uppercase">VIP 42</div>
              </div>
              <div className="flex flex-col scale-[0.65] origin-left">
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

          <div className="flex items-center gap-3 bg-white/5 px-6 py-2 rounded-2xl border border-white/10 shadow-inner min-w-[240px]">
            <div className="flex items-center gap-2 w-full">
              <Coins size={16} className="text-yellow-500 flex-shrink-0" />
              <div className="flex flex-col flex-1">
                <span className="text-[9px] text-white/40 uppercase font-black tracking-widest">{t('balance')}</span>
                <span className="text-lg font-black text-yellow-500 font-mono tracking-tighter whitespace-nowrap">{gameState.players[0].chips.toLocaleString()}{t('currency')}</span>
              </div>
              <button className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center text-black hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/20 flex-shrink-0">+</button>
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {lobbyView === 'main' && (
              <motion.main 
                key="main"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full max-w-none px-4 lg:px-8 space-y-8"
              >
                {/* Global Jackpot Banner */}
                <div className="relative h-16 md:h-20 lg:h-24 rounded-2xl md:rounded-3xl bg-gradient-to-r from-[#1a1a2e] to-[#16213e] border border-yellow-500/30 overflow-hidden flex items-center justify-between px-4 md:px-8 lg:px-12 shadow-[0_0_50px_rgba(234,179,8,0.1)]">
                  <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #d4af37 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                  <div className="flex items-center gap-2 md:gap-4 lg:gap-6 relative z-10">
                    <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full bg-yellow-500 flex items-center justify-center text-black shadow-lg shadow-yellow-500/40 animate-pulse">
                      <Trophy size={16} className="md:w-5 md:h-5 lg:w-6 lg:h-6" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] lg:tracking-[0.3em] text-yellow-500/60">{t('globalJackpot')}</span>
                      <h2 className="text-xl md:text-3xl lg:text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-500 drop-shadow-sm">1,245,890.00{t('currency')}</h2>
                    </div>
                  </div>
                  <div className="hidden md:flex gap-2 relative z-10">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                        <Coins size={16} className="text-white/20" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Main Game Modes */}
                  <div className="lg:col-span-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <motion.button
                        whileHover={{ scale: 1.02, y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setLobbyView('tournaments')}
                        className="relative h-48 md:h-60 lg:h-72 rounded-3xl md:rounded-[40px] bg-gradient-to-br from-red-600 to-red-950 p-6 md:p-8 lg:p-10 flex flex-col justify-end overflow-hidden shadow-2xl group border border-red-500/30"
                      >
                        {/* Poker Table Background Image */}
                        <div className="absolute inset-0 opacity-30 group-hover:opacity-40 transition-opacity duration-700"
                             style={{
                               backgroundImage: 'url(https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=800&q=80)',
                               backgroundSize: 'cover',
                               backgroundPosition: 'center'
                             }} />
                        <div className="absolute inset-0 bg-gradient-to-t from-red-950 via-red-900/50 to-transparent" />
                        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                          <Trophy size={300} className="text-white -mr-10 -mt-10" />
                        </div>
                        <div className="relative z-10 text-left">
                          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                            <span className="px-2 py-0.5 md:px-3 md:py-1 bg-white/20 backdrop-blur-md rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-wider md:tracking-widest">Live Now</span>
                            <span className="px-2 py-0.5 md:px-3 md:py-1 bg-yellow-500 text-black rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-wider md:tracking-widest">10M {t('gtd')}</span>
                          </div>
                          <h3 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter italic leading-none mb-1 md:mb-2">{t('tournament')}</h3>
                          <p className="text-white/60 text-xs md:text-sm font-medium uppercase tracking-wide md:tracking-widest">{t('wsopMainEvent')} • {t('worldSeries')}</p>
                        </div>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02, y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => initGame('cash')}
                        className="relative h-48 md:h-60 lg:h-72 rounded-3xl md:rounded-[40px] bg-gradient-to-br from-emerald-600 to-emerald-950 p-6 md:p-8 lg:p-10 flex flex-col justify-end overflow-hidden shadow-2xl group border border-emerald-500/30"
                      >
                        {/* Poker Chips Background Image */}
                        <div className="absolute inset-0 opacity-30 group-hover:opacity-40 transition-opacity duration-700"
                             style={{
                               backgroundImage: 'url(https://images.unsplash.com/photo-1571988840298-3b5301d5109b?w=800&q=80)',
                               backgroundSize: 'cover',
                               backgroundPosition: 'center'
                             }} />
                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-900/50 to-transparent" />
                        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                          <Coins size={300} className="text-white -mr-10 -mt-10" />
                        </div>
                        <div className="relative z-10 text-left">
                          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                            <span className="px-2 py-0.5 md:px-3 md:py-1 bg-white/20 backdrop-blur-md rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-wider md:tracking-widest">{t('instantAction')}</span>
                          </div>
                          <h3 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter italic leading-none mb-1 md:mb-2">{t('cashGame')}</h3>
                          <p className="text-white/60 text-xs md:text-sm font-medium uppercase tracking-wide md:tracking-widest">{t('noLimitHoldem')} • {t('blinds')} 50/100</p>
                        </div>
                      </motion.button>
                    </div>

                    {/* Secondary Game Modes */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
                      {[
                        { id: 'sit-and-go', title: t('sitAndGo'), icon: <Timer />, color: 'from-blue-600 to-blue-950', action: () => initGame('sit-and-go'), bg: 'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=400&q=80' },
                        { id: 'private', title: t('privateTable'), icon: <Users />, color: 'from-purple-600 to-purple-950', action: () => null, bg: 'https://images.unsplash.com/photo-1596524430615-b46475ddff6e?w=400&q=80' },
                        { id: 'stats', title: t('stats'), icon: <BarChart3 />, color: 'from-zinc-700 to-zinc-900', action: () => setLobbyView('stats'), bg: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80' },
                        { id: 'shop', title: t('shop'), icon: <ShoppingBag />, color: 'from-yellow-600 to-yellow-900', action: () => setLobbyView('shop'), bg: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=400&q=80' },
                      ].map(mode => (
                        <motion.button
                          key={mode.id}
                          whileHover={{ y: -5 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={mode.action}
                          className={`relative h-24 md:h-28 lg:h-32 rounded-2xl md:rounded-3xl bg-gradient-to-br ${mode.color} p-4 md:p-5 lg:p-6 flex flex-col justify-between overflow-hidden shadow-xl border border-white/10 group`}
                        >
                          <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity"
                               style={{
                                 backgroundImage: `url(${mode.bg})`,
                                 backgroundSize: 'cover',
                                 backgroundPosition: 'center'
                               }} />
                          <div className="absolute inset-0 bg-gradient-to-br ${mode.color} opacity-70" />
                          <div className="absolute top-1 right-1 md:top-2 md:right-2 opacity-10 group-hover:scale-110 transition-transform duration-500 z-10 scale-75 md:scale-100">{mode.icon}</div>
                          <div className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 rounded-lg bg-white/10 flex items-center justify-center mb-1 md:mb-2 relative z-10 scale-75 md:scale-90 lg:scale-100">{mode.icon}</div>
                          <h4 className="text-[10px] md:text-xs lg:text-sm font-black uppercase tracking-tighter italic leading-none relative z-10">{mode.title}</h4>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Sidebar: Quick Play & Stats */}
                  <div className="lg:col-span-4 space-y-8">
                    {/* Quick Play Section */}
                    <div className="bg-white/5 rounded-[40px] p-8 border border-white/10 shadow-2xl space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-black uppercase tracking-tighter italic flex items-center gap-2">
                          <Timer size={18} className="text-yellow-500" /> {t('quickPlay')}
                        </h3>
                        <span className="text-[10px] font-bold text-white/40 uppercase">{t('fastJoin')}</span>
                      </div>
                      <div className="space-y-3">
                        {[100, 500, 1000].map(buyin => (
                          <button 
                            key={buyin}
                            onClick={() => initGame('cash')}
                            className="w-full h-14 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 flex items-center justify-between px-6 transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <Coins size={16} className="text-yellow-500 group-hover:scale-110 transition-transform" />
                              <span className="font-bold font-mono">{buyin.toLocaleString()}{t('currency')} {t('buyIn')}</span>
                            </div>
                            <span className="text-[10px] font-black uppercase text-white/20 group-hover:text-yellow-500 transition-colors">{t('join')}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Player Stats Summary */}
                    <div className="bg-gradient-to-br from-zinc-900 to-black rounded-[40px] p-8 border border-white/10 shadow-2xl space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-black uppercase tracking-tighter italic flex items-center gap-2">
                          <BarChart3 size={18} className="text-blue-500" /> {t('yourStats')}
                        </h3>
                        <button onClick={() => setLobbyView('stats')} className="text-[10px] font-bold text-blue-500 uppercase hover:underline">{t('viewAll')}</button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                          <p className="text-[9px] text-white/40 uppercase font-bold mb-1">{t('handsPlayed')}</p>
                          <p className="text-xl font-black font-mono">{gameState.players[0].stats.handsPlayed}</p>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                          <p className="text-[9px] text-white/40 uppercase font-bold mb-1">{t('winRate')}</p>
                          <p className="text-xl font-black font-mono text-emerald-400">
                            {gameState.players[0].stats.handsPlayed > 0 ? `${((gameState.players[0].stats.handsWon / gameState.players[0].stats.handsPlayed) * 100).toFixed(1)}%` : '0%'}
                          </p>
                        </div>
                        <div className="col-span-2 bg-white/5 rounded-2xl p-4 border border-white/5 flex items-center justify-between">
                          <div>
                            <p className="text-[9px] text-white/40 uppercase font-bold mb-1">{t('totalProfit')}</p>
                            <p className="text-xl font-black font-mono text-yellow-500">+3,240.00{t('currency')}</p>
                          </div>
                          <div className="w-16 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                            <BarChart3 size={16} className="text-emerald-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.main>
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
                  <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer" onClick={() => initGame('tournament')}>
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
      </div>
    );
  }

  const user = gameState?.players?.find(p => p?.id === 'user') || null;
  const isUserTurn = user && gameState?.activePlayerIndex === gameState?.players?.findIndex(p => p?.id === 'user') && !isProcessing;

  // 🚨 모바일 전용 UI 분기
  if (deviceType === 'mobile') {
    if (!user) return <div>Loading user...</div>;
    
    return (
      <>
        {/* Card Squeeze Overlay */}
        <AnimatePresence>
          {squeezeCardIndex !== null && user && user.cards[squeezeCardIndex] && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[200] flex items-center justify-center"
              onClick={() => setSqueezeCardIndex(null)}
            >
              <div onClick={(e) => e.stopPropagation()}>
                <CardSqueeze 
                  card={user.cards[squeezeCardIndex]} 
                  onComplete={handleSqueezeComplete}
                  className="scale-75"
                />
              </div>
              <button
                onClick={() => setSqueezeCardIndex(null)}
                className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 모바일 UI: 방향에 따라 자동 전환 */}
        {isLandscape ? (
          <MobileLandscape 
            gameState={gameState}
            user={user}
            isUserTurn={isUserTurn}
            handleAction={handleAction}
            handleCardClick={handleCardClick}
            squeezedCards={squeezedCards}
          />
        ) : (
          <MobilePortrait 
            gameState={gameState}
            user={user}
            isUserTurn={isUserTurn}
            handleAction={handleAction}
            handleCardClick={handleCardClick}
            squeezedCards={squeezedCards}
          />
        )}
      </>
    );
  }

  // 데스크톱 UI (기존 유지)
  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] text-white font-sans selection:bg-yellow-500/30 overflow-x-hidden flex flex-col">
      {/* Responsive Header - Hidden on mobile, compact on tablet, full on desktop */}
      <header className="h-12 md:h-14 lg:h-16 border-b border-white/10 bg-black/80 backdrop-blur-xl flex items-center justify-between px-3 md:px-6 lg:px-8 z-50">
        <div className="flex items-center gap-2 md:gap-4 lg:gap-6">
          <button onClick={() => initGame('lobby')} className="p-1.5 md:p-2 hover:bg-white/5 rounded-xl transition-colors text-white/40 hover:text-white">
            <LayoutGrid size={16} className="md:w-5 md:h-5" />
          </button>
          <div className="h-6 md:h-8 w-px bg-white/10 hidden md:block" />
          <div className="flex flex-col">
            <div className="flex items-center gap-1 md:gap-2">
              <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-yellow-500">{t('jackpot')}</span>
              <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-red-500 animate-pulse" />
            </div>
            <span className="text-sm md:text-base lg:text-lg font-black font-mono leading-none">1,245,890{t('currency')}</span>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <h1 className="text-xs md:text-sm lg:text-[18px] font-black uppercase tracking-tighter text-[#d4af37] italic">WSOP ELITE</h1>
          <div className="flex items-center gap-2 md:gap-3">
            <span className="text-[8px] md:text-[10px] text-white/40 uppercase font-bold tracking-widest">{t('tournament')} • {t('table')} 01</span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={() => setShowStandings(!showStandings)} className="p-1.5 md:p-2 lg:p-2.5 bg-yellow-500/10 text-yellow-500 rounded-xl border border-yellow-500/20 hover:bg-yellow-500/20 transition-all">
            <Trophy size={14} className="md:w-4 md:h-4 lg:w-[18px] lg:h-[18px]" />
          </button>
        </div>
      </header>

      <main className="flex-1 relative flex items-center justify-center p-2 md:p-4 w-full overflow-y-auto overflow-x-hidden">
        {/* Chat System - Hidden on mobile, slide panel on tablet, fixed on desktop */}
        <div className="hidden lg:block">
          <ChatSystem 
            messages={chatMessages} 
            onSendMessage={handleSendMessage} 
            isOpen={isChatOpen} 
            onClose={() => setIsChatOpen(false)} 
          />
        </div>

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
                      <span className={`text-sm font-bold ${p.id === 'user' ? 'text-yellow-500' : 'text-white'}`}>{p.name}</span>
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
        {/* Poker Table - PC Full Display, Mobile Scrollable */}
        <div className="relative w-[95vw] md:w-full md:max-w-none lg:w-[85vw] aspect-[16/10] md:aspect-[2/1] bg-[#1a3a2a] rounded-[100px] md:rounded-[150px] lg:rounded-[200px] border-[8px] md:border-[10px] lg:border-[12px] border-[#2a1a0a] shadow-[0_0_50px_rgba(0,0,0,0.8),inset_0_0_30px_rgba(0,0,0,0.5)] md:shadow-[0_0_100px_rgba(0,0,0,0.8),inset_0_0_50px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-visible">
          <div className="absolute inset-0 rounded-[92px] md:rounded-[140px] lg:rounded-[188px] opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
          <div className="absolute inset-1 md:inset-2 rounded-[85px] md:rounded-[135px] lg:rounded-[180px] border-2 border-white/10 pointer-events-none" />

          {/* Top Branding Logo - Responsive sizing */}
          <div className="absolute top-6 md:top-10 lg:top-12 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none select-none z-0">
            <span className="text-[10px] md:text-sm lg:text-[18px] font-black uppercase tracking-tighter text-[#d4af37]/60 italic">WSOP ELITE</span>
            <span className="text-base md:text-xl lg:text-[28px] font-black uppercase tracking-[3px] md:tracking-[5px] lg:tracking-[6px] text-white/60 leading-none mt-0.5 md:mt-1">CHUANQI PUKE</span>
          </div>

          {/* Center Watermark (Faint) - Hidden on mobile */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05] select-none z-0 hidden md:flex">
            <div className="flex flex-col items-center">
              <div className="relative scale-50 md:scale-65 lg:scale-75">
                <div className="flex gap-1 md:gap-2 mb-1 md:mb-2">
                  <div className="w-8 h-12 md:w-10 md:h-14 lg:w-12 lg:h-16 bg-white/10 rounded-sm border border-white/20 rotate-[-15deg]" />
                  <div className="w-8 h-12 md:w-10 md:h-14 lg:w-12 lg:h-16 bg-white/10 rounded-sm border border-white/20" />
                  <div className="w-8 h-12 md:w-10 md:h-14 lg:w-12 lg:h-16 bg-white/10 rounded-sm border border-white/20 rotate-[15deg]" />
                </div>
                <div className="absolute -bottom-3 md:-bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter text-white/40 italic">CHUANQI PUKE</span>
                </div>
              </div>
              <div className="mt-4 md:mt-6 lg:mt-8 text-[8px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em] font-bold text-white/30 uppercase">{t('goForGold')}</div>
            </div>
          </div>

          {/* Community Cards - Responsive sizing */}
          <div className="flex gap-1 sm:gap-2 md:gap-3 lg:gap-4 z-10">
            <AnimatePresence>
              {gameState.communityCards.map((card, i) => <Card key={`community-${i}`} card={card} className="shadow-2xl w-10 h-14 sm:w-12 sm:h-16 md:w-14 md:h-20 lg:w-16 lg:h-24" />)}
              {Array.from({ length: 5 - gameState.communityCards.length }).map((_, i) => <div key={`empty-${i}`} className="w-10 h-14 sm:w-12 sm:h-16 md:w-14 md:h-20 lg:w-16 lg:h-24 rounded-lg border-2 border-white/5 bg-black/20" />)}
            </AnimatePresence>
          </div>

          {/* Pot Display - Responsive sizing */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-10 md:translate-y-12 lg:translate-y-16 flex flex-col items-center">
            <div className="px-3 py-1.5 md:px-5 md:py-2 lg:px-6 lg:py-2 bg-black/80 backdrop-blur-xl rounded-xl md:rounded-2xl border border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.2)] md:shadow-[0_0_30px_rgba(234,179,8,0.2)]">
              <div className="text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-white/40 text-center mb-0.5 md:mb-1">{t('pot')}</div>
              <div className="text-sm md:text-lg lg:text-xl font-black text-yellow-500 font-mono tracking-tighter">{gameState.pot.toLocaleString()}{t('currency')}</div>
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
                showCards={gameState.stage === 'showdown'} 
                position={positions[i]}
                onCardClick={p.id === 'user' ? handleCardClick : undefined}
                hasSqueezed={p.id === 'user' ? squeezedCards : undefined}
              />
            );
          })}
        </div>

        {/* Card Squeeze Overlay */}
        <AnimatePresence>
          {squeezeCardIndex !== null && user && user.cards[squeezeCardIndex] && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[200] flex items-center justify-center"
              onClick={() => setSqueezeCardIndex(null)}
            >
              <div onClick={(e) => e.stopPropagation()}>
                <CardSqueeze 
                  card={user.cards[squeezeCardIndex]} 
                  onComplete={handleSqueezeComplete}
                  className="scale-75 md:scale-90 lg:scale-100"
                />
              </div>
              <button
                onClick={() => setSqueezeCardIndex(null)}
                className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

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

      {/* Responsive Footer - Simplified on mobile, full on desktop */}
      <footer className="h-20 md:h-22 lg:h-24 bg-neutral-900 border-t border-white/10 px-2 md:px-4 lg:px-6 flex items-center justify-between z-50 relative">
        {/* Exit Game Button - Hidden on small mobile, visible on md+ */}
        <button 
          onClick={() => initGame('lobby')}
          className="hidden md:flex absolute -top-12 lg:-top-16 right-3 md:right-4 lg:right-6 px-3 py-2 md:px-5 md:py-2.5 lg:px-6 lg:py-3 bg-gradient-to-r from-neutral-800 to-neutral-900 hover:from-neutral-700 hover:to-neutral-800 text-white/80 hover:text-white rounded-lg md:rounded-xl border-2 border-[#d4af37] font-bold uppercase tracking-wider text-xs md:text-sm transition-all shadow-lg hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:w-4 md:h-4"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          <span className="hidden md:inline">{t('exitGame')}</span>
        </button>

        {/* Left: Chip Info - Compact on mobile */}
        <div className="flex items-center gap-2 md:gap-4 lg:gap-6">
          <div className="flex flex-col">
            <span className="text-[8px] md:text-[9px] lg:text-[10px] text-white/40 uppercase">{t('yourChips')}</span>
            <span className="text-base md:text-lg lg:text-xl font-bold text-yellow-500 font-mono">{user.chips.toLocaleString()}{t('currency')}</span>
          </div>
          <div className="h-8 md:h-10 w-px bg-white/10" />
          <div className="flex flex-col">
            <span className="text-[8px] md:text-[9px] lg:text-[10px] text-white/40 uppercase">{t('currentBet')}</span>
            <span className="text-base md:text-lg lg:text-xl font-bold text-white font-mono">{gameState.currentBet.toLocaleString()}{t('currency')}</span>
          </div>
        </div>

        {/* Center: Action Buttons - Responsive sizing */}
        <div className="flex items-center gap-1.5 md:gap-2 lg:gap-3">
          <button 
            disabled={!isUserTurn} 
            onClick={() => handleAction('fold')} 
            className="px-3 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-xl md:rounded-2xl bg-red-600 hover:bg-red-500 disabled:opacity-30 disabled:cursor-not-allowed font-black uppercase tracking-tighter italic text-xs md:text-base lg:text-lg transition-all active:scale-95 shadow-lg shadow-red-900/40 border-b-2 md:border-b-4 border-red-800"
          >
            {t('fold')}
          </button>
          
          <button 
            disabled={!isUserTurn} 
            onClick={() => handleAction(gameState.currentBet === user.currentBet ? 'check' : 'call')} 
            className="px-3 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-xl md:rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed font-black uppercase tracking-tighter italic text-xs md:text-base lg:text-lg transition-all active:scale-95 shadow-lg shadow-blue-900/40 border-b-2 md:border-b-4 border-blue-800"
          >
            {gameState.currentBet === user.currentBet ? t('check') : t('call')}
          </button>
          
          {/* Raise Slider - Hidden on small mobile, shown on md+ */}
          <div className="hidden md:flex flex-col gap-2 px-4 py-2 bg-black/40 rounded-2xl border border-white/10">
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
              className="w-32 lg:w-40 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-yellow-500"
            />
          </div>

          <button 
            disabled={!isUserTurn} 
            onClick={() => handleAction('raise', Math.max(gameState.currentBet + gameState.bigBlind, betSliderValue))} 
            className="px-3 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-xl md:rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed font-black uppercase tracking-tighter italic text-xs md:text-base lg:text-lg transition-all active:scale-95 shadow-lg shadow-emerald-900/40 border-b-2 md:border-b-4 border-emerald-800"
          >
            {t('raise')}
          </button>

          <button 
            disabled={!isUserTurn} 
            onClick={() => handleAction('raise', user.chips + user.currentBet)} 
            className="px-3 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-xl md:rounded-2xl bg-yellow-500 hover:bg-yellow-400 disabled:opacity-30 disabled:cursor-not-allowed font-black uppercase tracking-tighter italic text-xs md:text-base lg:text-lg transition-all active:scale-95 shadow-lg shadow-yellow-900/40 border-b-2 md:border-b-4 border-yellow-700 text-black"
          >
            {t('allIn')}
          </button>
        </div>

        {/* Right: Hand Equity - Hidden on small mobile */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[8px] md:text-[9px] lg:text-[10px] text-white/40 uppercase">{t('handEquity')}</span>
            <span className="text-xs md:text-sm font-bold text-indigo-400 font-mono">{user.cards.length > 0 ? (PokerUtils.calculateWinRate(user.cards, gameState.communityCards, gameState.players.filter(p => !p.isFolded && p.id !== 'user').length, 100) * 100).toFixed(1) : '0.0'}%</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
