/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
}

export enum HandRank {
  HighCard = 1,
  Pair = 2,
  TwoPair = 3,
  ThreeOfKind = 4,
  Straight = 5,
  Flush = 6,
  FullHouse = 7,
  FourOfKind = 8,
  StraightFlush = 9,
  RoyalFlush = 10
}

export interface HandResult {
  rank: HandRank;
  score: number;
  name: string;
  cards: Card[];
}

export type PlayerAction = 'fold' | 'check' | 'call' | 'raise' | 'all-in';

export interface PlayerStats {
  vpip: number; // Voluntarily Put chips In Pot %
  pfr: number;  // Pre-Flop Raise %
  handsPlayed: number;
  handsWon: number;
}

export interface Player {
  id: string;
  name: string;
  chips: number;
  cards: Card[];
  isDealer: boolean;
  isSmallBlind: boolean;
  isBigBlind: boolean;
  currentBet: number;
  lastAction?: PlayerAction;
  isFolded: boolean;
  isAllIn: boolean;
  isAI: boolean;
  winRate?: number;
  stats: PlayerStats;
  avatar: string;
  characterId: number;
}

export type GameStage = 'pre-flop' | 'flop' | 'turn' | 'river' | 'showdown';
export type GameMode = 'lobby' | 'tournament' | 'cash' | 'sit-and-go';

export interface PokerCharacter {
  id: number;
  name: string;
  avatar: string;
  style: string;
  description?: string;
}

export interface ChatMessage {
  playerName: string;
  message: string;
  timestamp: number;
}

export type Language = 'en' | 'ko' | 'zh';

export interface LogEntry {
  key: string;
  params?: Record<string, string | number>;
}

export interface GameState {
  mode: GameMode;
  players: Player[];
  communityCards: Card[];
  pot: number;
  sidePots: number[];
  currentBet: number;
  dealerIndex: number;
  activePlayerIndex: number;
  stage: GameStage;
  deck: Card[];
  blindLevel: number;
  smallBlind: number;
  bigBlind: number;
  logs: LogEntry[];
  timer: number; // Seconds remaining for active player
}

export const BLIND_LEVELS = [
  { sb: 50, bb: 100 },
  { sb: 100, bb: 200 },
  { sb: 200, bb: 400 },
  { sb: 400, bb: 800 },
  { sb: 800, bb: 1600 },
];
