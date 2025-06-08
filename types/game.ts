export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Value = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
export type Color = 'red' | 'black';

export interface Card {
  suit: Suit;
  value: Value;
  numericValue: number;
  color: Color;
  flipped: boolean;
}

export type GuessType = 'higher' | 'lower' | 'same';

export type Pile = {
  cards: Card[];
  flipped: boolean;
  disabled: boolean;
};

export type GameState = 'idle' | 'playing' | 'win' | 'lose' | 'guessing';

export type GameMode = 'casual' | 'risky' | 'no_mercy';

export interface GameContextType {
  piles: Pile[];
  gameState: GameState;
  remainingCards: number;
  currentGuess: { pileIndex: number | null; guessType: GuessType | null };
  selectedPileIndex: number | null;
  startNewGame: (mode?: GameMode) => void;
  makeGuess: (pileIndex: number, guessType: GuessType) => void;
  selectPile: (pileIndex: number) => void;
  unselectPile: () => void;
  deck: Card[];
  mode: GameMode;
  lives: number;
  guessStreak: number;
  longestGuessStreak: number;
  score: number;
  highScore: number;
}