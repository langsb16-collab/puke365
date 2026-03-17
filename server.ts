import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { PokerUtils } from "./src/pokerUtils.js";
import { GameState, Player, Card, BLIND_LEVELS, GameMode } from "./src/types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PLAYER_NAMES = ['Aria', 'Borgata', 'Caesars', 'Dunes', 'Encore', 'Flamingo', 'Golden', 'HardRock', 'Imperial'];

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // Game State Management (Server-Authoritative)
  let gameState: GameState | null = null;
  const players: Map<string, Player> = new Map();
  let handCount = 0;

  function startNewHand(mode: GameMode = 'cash') {
    const activePlayers = Array.from(players.values()).filter(p => p.chips > 0);
    if (activePlayers.length < 2) return;

    handCount++;
    const blindLevel = BLIND_LEVELS[Math.min(Math.floor(handCount / 5), BLIND_LEVELS.length - 1)];
    
    // Create and shuffle deck
    const deck = PokerUtils.createDeck();
    
    // Reset players for new hand
    const updatedPlayers = activePlayers.map((p, i) => ({
      ...p,
      cards: [deck.pop()!, deck.pop()!],
      isDealer: i === 0,
      isSmallBlind: i === 1,
      isBigBlind: i === 2 || (activePlayers.length === 2 && i === 0),
      currentBet: 0,
      isFolded: false,
      isAllIn: false,
      isSqueezed: false,
    }));

    // Post blinds
    updatedPlayers.forEach(p => {
      if (p.isSmallBlind) {
        const amount = Math.min(p.chips, blindLevel.sb);
        p.chips -= amount;
        p.currentBet = amount;
      }
      if (p.isBigBlind) {
        const amount = Math.min(p.chips, blindLevel.bb);
        p.chips -= amount;
        p.currentBet = amount;
      }
    });

    gameState = {
      players: updatedPlayers,
      communityCards: [],
      pot: updatedPlayers.reduce((sum, p) => sum + p.currentBet, 0),
      sidePots: [],
      activePlayerIndex: (updatedPlayers.findIndex(p => p.isBigBlind) + 1) % updatedPlayers.length,
      stage: 'pre-flop',
      dealerIndex: 0,
      currentBet: blindLevel.bb,
      deck: [], // Not used on client
      smallBlind: blindLevel.sb,
      bigBlind: blindLevel.bb,
      blindLevel: Math.floor(handCount / 5),
      logs: [{ key: 'log_new_hand', params: { sb: blindLevel.sb, bb: blindLevel.bb } }],
      mode,
      timer: 15
    };

    broadcastGameState();
    
    // If it's AI's turn, trigger it
    checkAITurn();
  }

  function broadcastGameState() {
    if (!gameState) return;
    io.sockets.sockets.forEach((socket) => {
      socket.emit("game_state_update", sanitizeGameState(gameState!, socket.id));
    });
  }

  function checkAITurn() {
    if (!gameState || gameState.stage === 'showdown') return;
    const currentPlayer = gameState.players[gameState.activePlayerIndex];
    if (currentPlayer && currentPlayer.isAI && !currentPlayer.isFolded && !currentPlayer.isAllIn) {
      setTimeout(() => handleAIAction(), 1000);
    }
  }

  function handleAIAction() {
    if (!gameState) return;
    const currentPlayer = gameState.players[gameState.activePlayerIndex];
    const winRate = PokerUtils.calculateWinRate(currentPlayer.cards, gameState.communityCards, gameState.players.filter(p => !p.isFolded && p.id !== currentPlayer.id).length, 100);
    const action = PokerUtils.getAIDecision(currentPlayer, gameState, winRate);
    processAction(currentPlayer.id, { type: action.action, amount: action.amount });
  }

  function processAction(playerId: string, action: { type: string, amount?: number }) {
    if (!gameState) return;
    const playerIndex = gameState.players.findIndex(p => p.id === playerId);
    if (playerIndex !== gameState.activePlayerIndex) return;

    const player = gameState.players[playerIndex];
    let amount = action.amount || 0;

    switch (action.type) {
      case 'fold':
        player.isFolded = true;
        gameState.logs.push({ key: 'playerFolded', params: { name: player.name } });
        break;
      case 'check':
        gameState.logs.push({ key: 'playerChecked', params: { name: player.name } });
        break;
      case 'call':
        const callAmount = Math.max(...gameState.players.map(p => p.currentBet)) - player.currentBet;
        const actualCall = Math.min(player.chips, callAmount);
        player.chips -= actualCall;
        player.currentBet += actualCall;
        gameState.pot += actualCall;
        if (player.chips === 0) player.isAllIn = true;
        gameState.logs.push({ key: 'playerCalled', params: { name: player.name, amount: actualCall } });
        break;
      case 'raise':
        const raiseTo = amount;
        const addedBet = raiseTo - player.currentBet;
        player.chips -= addedBet;
        player.currentBet = raiseTo;
        gameState.pot += addedBet;
        if (player.chips === 0) player.isAllIn = true;
        gameState.logs.push({ key: 'playerRaised', params: { name: player.name, amount: raiseTo } });
        break;
    }

    // Move to next player
    moveToNextPlayer();
  }

  function moveToNextPlayer() {
    if (!gameState) return;
    
    const activePlayers = gameState.players.filter(p => !p.isFolded && !p.isAllIn);
    const allBetsEqual = gameState.players.every(p => p.isFolded || p.isAllIn || p.currentBet === Math.max(...gameState.players.map(pl => pl.currentBet)));
    
    if (activePlayers.length <= 1 || (allBetsEqual && gameState.players[gameState.activePlayerIndex].currentBet > 0)) {
      advanceStage();
    } else {
      let nextTurn = (gameState.activePlayerIndex + 1) % gameState.players.length;
      while (gameState.players[nextTurn].isFolded || gameState.players[nextTurn].isAllIn) {
        nextTurn = (nextTurn + 1) % gameState.players.length;
      }
      gameState.activePlayerIndex = nextTurn;
      broadcastGameState();
      checkAITurn();
    }
  }

  function advanceStage() {
    if (!gameState) return;

    // Reset current bets
    gameState.players.forEach(p => p.currentBet = 0);

    const deck = PokerUtils.createDeck(); // In a real app, we'd keep the deck state

    switch (gameState.stage) {
      case 'pre-flop':
        gameState.communityCards = [deck.pop()!, deck.pop()!, deck.pop()!];
        gameState.stage = 'flop';
        break;
      case 'flop':
        gameState.communityCards.push(deck.pop()!);
        gameState.stage = 'turn';
        break;
      case 'turn':
        gameState.communityCards.push(deck.pop()!);
        gameState.stage = 'river';
        break;
      case 'river':
        gameState.stage = 'showdown';
        determineWinner();
        return;
    }

    gameState.activePlayerIndex = gameState.players.findIndex(p => !p.isFolded && !p.isAllIn);
    broadcastGameState();
    checkAITurn();
  }

  function determineWinner() {
    if (!gameState) return;
    const activePlayers = gameState.players.filter(p => !p.isFolded);
    const results = activePlayers.map(p => ({
      player: p,
      evaluation: PokerUtils.evaluateHand([...p.cards, ...gameState!.communityCards])
    }));

    results.sort((a, b) => b.evaluation.score - a.evaluation.score);
    const winner = results[0].player;
    winner.chips += gameState.pot;
    
    gameState.logs.push({ key: 'playerWon', params: { name: winner.name, amount: gameState.pot, hand: results[0].evaluation.name } });
    
    broadcastGameState();

    // Start new hand after delay
    setTimeout(() => startNewHand(gameState!.mode), 5000);
  }

  // Socket.io Logic
  io.on("connection", (socket) => {
    console.log("Player connected:", socket.id);

    socket.on("join_game", (playerData: Partial<Player>) => {
      const player: Player = {
        id: socket.id,
        name: playerData.name || "Guest",
        chips: playerData.chips || 10000,
        cards: [],
        isDealer: false,
        isSmallBlind: false,
        isBigBlind: false,
        currentBet: 0,
        isFolded: false,
        isAllIn: false,
        isAI: false,
        avatar: playerData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${socket.id}`,
        characterId: playerData.characterId || 1,
        stats: playerData.stats || { vpip: 0, pfr: 0, handsPlayed: 0, handsWon: 0 }
      };
      players.set(socket.id, player);
      
      // If game hasn't started, start it
      if (!gameState && players.size >= 2) {
        // Add some AI players if needed
        if (players.size < 6) {
          for (let i = 0; i < 3; i++) {
            const aiId = `ai_${i}`;
            const aiPlayer: Player = {
              id: aiId,
              name: `AI ${PLAYER_NAMES[i]}`,
              chips: 10000,
              cards: [],
              isDealer: false,
              isSmallBlind: false,
              isBigBlind: false,
              currentBet: 0,
              isFolded: false,
              isAllIn: false,
              isAI: true,
              avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${aiId}`,
              characterId: i + 2,
              stats: { vpip: 30, pfr: 20, handsPlayed: 100, handsWon: 15 }
            };
            players.set(aiId, aiPlayer);
          }
        }
        startNewHand();
      } else if (gameState) {
        socket.emit("game_state_update", sanitizeGameState(gameState, socket.id));
      }
    });

    socket.on("player_action", (action: { type: string, amount?: number }) => {
      processAction(socket.id, action);
    });

    socket.on("chat_message", (msg: string) => {
      const player = players.get(socket.id);
      if (player) {
        io.emit("chat_message", {
          playerName: player.name,
          message: msg,
          timestamp: Date.now()
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("Player disconnected:", socket.id);
      players.delete(socket.id);
      io.emit("player_left", socket.id);
    });
  });

  // Helper to hide other players' cards
  function sanitizeGameState(state: GameState, socketId: string): GameState {
    return {
      ...state,
      players: state.players.map(p => {
        if (p.id === socketId || state.stage === 'showdown') {
          return p;
        }
        return { ...p, cards: [] }; // Hide cards of other players
      })
    };
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
