import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { GameContextType, GameState, GuessType, Pile, Card } from '../types/game';
import { createDeck, shuffleDeck, isGuessCorrect } from '../utils/card';
import { updateStatsOnGameEnd, updateGuessStreak } from '../utils/stats';

const defaultGameContext: GameContextType = {
  piles: Array(9).fill({ cards: [], flipped: false, disabled: false }),
  gameState: 'idle',
  remainingCards: 0,
  currentGuess: { pileIndex: null, guessType: null },
  selectedPileIndex: null,
  startNewGame: () => {},
  makeGuess: () => {},
  selectPile: () => {},
  unselectPile: () => {},
  deck: [],
  mode: 'casual',
  lives: 2,
};

const GameContext = createContext<GameContextType>(defaultGameContext);

export const useGameContext = () => useContext(GameContext);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Game state
  const [deck, setDeck] = useState<Card[]>([]);
  const [piles, setPiles] = useState<Pile[]>(Array(9).fill({ cards: [], flipped: false, disabled: false }));
  const [gameState, setGameState] = useState<GameState>('idle');
  const [selectedPileIndex, setSelectedPileIndex] = useState<number | null>(null);
  const [currentGuess, setCurrentGuess] = useState<{ pileIndex: number | null, guessType: GuessType | null }>({
    pileIndex: null,
    guessType: null,
  });
  const [mode, setMode] = useState<'casual' | 'risky' | 'no_mercy'>('casual');
  const [lives, setLives] = useState<number>(2);
  const [guessStreak, setGuessStreak] = useState(0);

  // Initialize a new game
  const startNewGame = (newMode?: 'casual' | 'risky' | 'no_mercy') => {
    const selectedMode = newMode || mode;
    setMode(selectedMode);
    let initialLives = 0;
    if (selectedMode === 'casual') initialLives = 2;
    else if (selectedMode === 'risky') initialLives = 1;
    else initialLives = 0;
    setLives(initialLives);
    // Create and shuffle a new deck
    const newDeck = shuffleDeck(createDeck());
    // Deal 9 cards to start
    const initialPiles: Pile[] = [];
    const remainingDeck: Card[] = [...newDeck];
    for (let i = 0; i < 9; i++) {
      const card = remainingDeck.shift();
      initialPiles.push({
        cards: card ? [{ ...card, flipped: false }] : [],
        flipped: false,
        disabled: false,
      });
    }
    setDeck(remainingDeck);
    setPiles(initialPiles);
    setGameState('playing');
    setSelectedPileIndex(null);
    setCurrentGuess({ pileIndex: null, guessType: null });
    setGuessStreak(0);
    // Optional haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  // Select a pile for guessing
  const selectPile = (pileIndex: number) => {
    // Only allow selection if the pile is not disabled or flipped
    if (!piles[pileIndex].disabled && !piles[pileIndex].flipped && gameState === 'playing') {
      setSelectedPileIndex(pileIndex);
      // Optional haptic feedback
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };
  
  // Unselect the currently selected pile
  const unselectPile = () => {
    setSelectedPileIndex(null);
  };
  
  // Make a guess for a specific pile
  const makeGuess = (pileIndex: number, guessType: GuessType) => {
    // Cannot guess if game is not in playing state or pile is disabled
    if (gameState !== 'playing' || piles[pileIndex].disabled || piles[pileIndex].flipped) {
      return;
    }
    setGameState('guessing');
    setCurrentGuess({ pileIndex, guessType });
    setSelectedPileIndex(null); // Deselect pile
    if (deck.length > 0) {
      const newDeck = [...deck];
      const drawnCard = newDeck.shift()!;
      const currentPile = piles[pileIndex];
      const topCard = currentPile.cards[currentPile.cards.length - 1];
      const correct = isGuessCorrect(topCard, drawnCard, guessType);
      setTimeout(() => {
        const newPiles = [...piles];
        if (correct) {
          newPiles[pileIndex] = {
            ...currentPile,
            cards: [...currentPile.cards, drawnCard],
          };
          setGuessStreak(guessStreak + 1);
        } else {
          if (lives > 0) {
            setLives(lives - 1);
            newPiles[pileIndex] = {
              ...currentPile,
              cards: [...currentPile.cards, drawnCard],
            };
          } else {
            newPiles[pileIndex] = {
              ...currentPile,
              cards: [...currentPile.cards, drawnCard],
              flipped: true,
              disabled: true,
            };
          }
          setGuessStreak(0);
        }
        setPiles(newPiles);
        setDeck(newDeck);
        updateGuessStreak(correct);
        if (Platform.OS !== 'web') {
          if (correct) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
        }
        setTimeout(() => {
          const allPilesFlipped = newPiles.every(pile => pile.flipped);
          const deckEmpty = newDeck.length === 0;
          if (allPilesFlipped) {
            updateStatsOnGameEnd(false, 0, mode, guessStreak);
            setGameState('lose');
          } else if (deckEmpty) {
            updateStatsOnGameEnd(true, newPiles.filter(p => !p.flipped).length, mode, guessStreak);
            setGameState('win');
          } else {
            setGameState('playing');
            setCurrentGuess({ pileIndex: null, guessType: null });
          }
        }, 800);
      }, 300);
    }
  };
  
  // Start a new game when the component first mounts
  useEffect(() => {
    startNewGame();
  }, []);

  // Context value
  const value: GameContextType = {
    piles,
    gameState,
    remainingCards: deck.length,
    currentGuess,
    selectedPileIndex,
    startNewGame,
    makeGuess,
    selectPile,
    unselectPile,
    deck,
    mode,
    lives,
  };
  
  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};