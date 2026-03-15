import { Card, Suit, Rank, HandRank, HandResult } from './types';

export const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
export const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

const RANK_VALUE: Record<Rank, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

export class PokerUtils {
  static createDeck(): Card[] {
    const deck: Card[] = [];
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        deck.push({ suit, rank });
      }
    }
    return deck;
  }

  static shuffle(deck: Card[]): Card[] {
    const newDeck = [...deck];
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    return newDeck;
  }

  static evaluateHand(cards: Card[]): HandResult {
    // This is a simplified evaluator for the demo. 
    // In a real app, we'd use a more robust lookup table or Cactus Kev.
    const sorted = [...cards].sort((a, b) => RANK_VALUE[b.rank] - RANK_VALUE[a.rank]);
    
    const isFlush = SUITS.some(suit => cards.filter(c => c.suit === suit).length >= 5);
    
    const rankCounts: Record<string, number> = {};
    cards.forEach(c => rankCounts[c.rank] = (rankCounts[c.rank] || 0) + 1);
    
    const counts = Object.entries(rankCounts).sort((a, b) => b[1] - a[1] || RANK_VALUE[b[0] as Rank] - RANK_VALUE[a[0] as Rank]);
    
    const isFour = counts[0][1] === 4;
    const isThree = counts[0][1] === 3;
    const isPairs = counts.filter(c => c[1] === 2).length;
    
    // Check Straight
    const uniqueRanks = Array.from(new Set(cards.map(c => RANK_VALUE[c.rank]))).sort((a, b) => b - a);
    let straightHigh = -1;
    for (let i = 0; i <= uniqueRanks.length - 5; i++) {
      if (uniqueRanks[i] - uniqueRanks[i + 4] === 4) {
        straightHigh = uniqueRanks[i];
        break;
      }
    }
    // Ace-low straight
    if (straightHigh === -1 && [14, 5, 4, 3, 2].every(v => uniqueRanks.includes(v))) {
      straightHigh = 5;
    }

    if (isFlush && straightHigh !== -1) {
      if (straightHigh === 14) return { rank: HandRank.RoyalFlush, score: 1000, name: 'royalFlush', cards: sorted.slice(0, 5) };
      return { rank: HandRank.StraightFlush, score: 900 + straightHigh, name: 'straightFlush', cards: sorted.slice(0, 5) };
    }
    
    if (isFour) return { rank: HandRank.FourOfKind, score: 800 + RANK_VALUE[counts[0][0] as Rank], name: 'fourOfAKind', cards: sorted.slice(0, 5) };
    if (isThree && isPairs >= 1) return { rank: HandRank.FullHouse, score: 700 + RANK_VALUE[counts[0][0] as Rank], name: 'fullHouse', cards: sorted.slice(0, 5) };
    if (isFlush) return { rank: HandRank.Flush, score: 600 + RANK_VALUE[sorted[0].rank], name: 'flush', cards: sorted.slice(0, 5) };
    if (straightHigh !== -1) return { rank: HandRank.Straight, score: 500 + straightHigh, name: 'straight', cards: sorted.slice(0, 5) };
    if (isThree) return { rank: HandRank.ThreeOfKind, score: 400 + RANK_VALUE[counts[0][0] as Rank], name: 'threeOfAKind', cards: sorted.slice(0, 5) };
    if (isPairs >= 2) return { rank: HandRank.TwoPair, score: 300 + RANK_VALUE[counts[0][0] as Rank], name: 'twoPair', cards: sorted.slice(0, 5) };
    if (isPairs === 1) return { rank: HandRank.Pair, score: 200 + RANK_VALUE[counts[0][0] as Rank], name: 'pair', cards: sorted.slice(0, 5) };
    
    return { rank: HandRank.HighCard, score: 100 + RANK_VALUE[sorted[0].rank], name: 'highCard', cards: sorted.slice(0, 5) };
  }

  static calculateWinRate(playerCards: Card[], communityCards: Card[], opponentCount: number, iterations: number = 500): number {
    let wins = 0;
    const fullDeck = this.createDeck();
    const knownCards = [...playerCards, ...communityCards];
    const availableDeck = fullDeck.filter(c => !knownCards.some(k => k.rank === c.rank && k.suit === c.suit));

    for (let i = 0; i < iterations; i++) {
      const simDeck = this.shuffle([...availableDeck]);
      const simCommunity = [...communityCards];
      while (simCommunity.length < 5) {
        simCommunity.push(simDeck.pop()!);
      }

      const myResult = this.evaluateHand([...playerCards, ...simCommunity]);
      let isWinner = true;

      for (let j = 0; j < opponentCount; j++) {
        const oppCards = [simDeck.pop()!, simDeck.pop()!];
        const oppResult = this.evaluateHand([...oppCards, ...simCommunity]);
        if (oppResult.score > myResult.score) {
          isWinner = false;
          break;
        }
      }

      if (isWinner) wins++;
    }

    return wins / iterations;
  }

  /**
   * Pluribus-inspired AI Decision Engine
   * Uses CFR-lite logic: Regret matching based on Equity vs Pot Odds
   */
  static getAIDecision(
    player: any, 
    gameState: any, 
    winRate: number
  ): { action: 'fold' | 'check' | 'call' | 'raise'; amount?: number } {
    const amountToCall = gameState.currentBet - player.currentBet;
    const potOdds = amountToCall / (gameState.pot + amountToCall || 1);
    const equity = winRate;
    const aggressionFactor = Math.random(); // Simulates different AI personalities
    const stackSize = player.chips;
    const bigBlinds = stackSize / gameState.bigBlind;

    // Pre-flop specific logic (Range estimation)
    if (gameState.stage === 'pre-flop') {
      const handStrength = this.evaluateHand(player.cards).score;
      
      // Premium Hands (AA, KK, QQ, JJ, AK)
      if (handStrength >= 111) { // High pairs or high cards
        if (aggressionFactor > 0.4) {
          const raiseAmount = Math.min(stackSize, gameState.currentBet + gameState.bigBlind * 3);
          return { action: 'raise', amount: raiseAmount };
        }
        return { action: 'call' };
      }
      
      // Mid-range hands
      if (handStrength >= 108) {
        if (amountToCall > gameState.bigBlind * 4) return { action: 'fold' };
        if (aggressionFactor > 0.8) return { action: 'raise', amount: gameState.currentBet + gameState.bigBlind * 2 };
        return { action: 'call' };
      }

      // Short stack desperation
      if (bigBlinds < 10 && handStrength > 105) {
        return { action: 'raise', amount: stackSize };
      }
    }

    // Post-flop logic (CFR-lite / Equity vs Pot Odds)
    // If we have a very strong hand (Equity > 80%)
    if (equity > 0.8) {
      if (aggressionFactor > 0.3) {
        const raiseAmount = Math.min(stackSize, gameState.currentBet + Math.floor(gameState.pot * 0.75));
        return { action: 'raise', amount: raiseAmount };
      }
      return { action: amountToCall === 0 ? 'check' : 'call' };
    }

    // Strong hand (Equity > 60%)
    if (equity > 0.6) {
      if (equity > potOdds + 0.2) {
        if (aggressionFactor > 0.6) {
          const raiseAmount = Math.min(stackSize, gameState.currentBet + Math.floor(gameState.pot * 0.5));
          return { action: 'raise', amount: raiseAmount };
        }
        return { action: amountToCall === 0 ? 'check' : 'call' };
      }
      return { action: amountToCall === 0 ? 'check' : 'call' };
    }

    // Marginal hand (Equity > Pot Odds)
    if (equity > potOdds) {
      // Semi-bluffing
      if (aggressionFactor > 0.9 && gameState.stage !== 'river') {
        const raiseAmount = Math.min(stackSize, gameState.currentBet + gameState.bigBlind * 2);
        return { action: 'raise', amount: raiseAmount };
      }
      return { action: amountToCall === 0 ? 'check' : 'call' };
    }

    // Pure Bluffing
    if (aggressionFactor > 0.95 && amountToCall < gameState.pot * 0.3) {
      const raiseAmount = Math.min(stackSize, gameState.currentBet + Math.floor(gameState.pot * 0.5));
      return { action: 'raise', amount: raiseAmount };
    }

    return { action: amountToCall === 0 ? 'check' : 'fold' };
  }
}
