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
  endZenGame: () => {},
  deck: [],
  mode: 'casual',
  lives: 1,
  guessStreak: 0,
  longestGuessStreak: 0,
  score: 0,
  highScore: 0,
  zenModeHighScore: 0,
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
  const [mode, setMode] = useState<'casual' | 'standard' | 'brutal' | 'zen'>('casual');
  const [lives, setLives] = useState<number>(1);
  const [guessStreak, setGuessStreak] = useState(0);
  const [longestGuessStreak, setLongestGuessStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [zenModeHighScore, setZenModeHighScore] = useState(0);

  // Load high score from stats on mount
  useEffect(() => {
    (async () => {
      const stats = await import('../utils/stats').then(m => m.getStats());
      const statsData = await stats;
      setHighScore(statsData.highScore || 0);
      setZenModeHighScore(statsData.zenModeHighScore || 0);
    })();
  }, []);

  // Initialize a new game
  const startNewGame = (newMode?: 'casual' | 'standard' | 'brutal' | 'zen') => {
    const selectedMode = newMode || mode;
    setMode(selectedMode);
    let initialLives = 0;
    let deckCount = 1;
    let pileCount = 9;
    if (selectedMode === 'casual') initialLives = 1;
    else if (selectedMode === 'standard') initialLives = 0;
    else if (selectedMode === 'brutal') {
      initialLives = 0;
      deckCount = 1; // Changed from 2 to 1
      pileCount = 4; // Changed from 9 to 4
    }
    else if (selectedMode === 'zen') {
      initialLives = -1; // -1 indicates infinite lives (no game over)
      deckCount = 1;
      pileCount = 9;
    }
    setLives(initialLives);
    // Create and shuffle a new deck (single deck for all modes now)
    let newDeck: Card[] = [];
    for (let i = 0; i < deckCount; i++) {
      newDeck = newDeck.concat(createDeck());
    }
    newDeck = shuffleDeck(newDeck);
    // Deal cards to start (9 for casual/standard/zen, 4 for brutal)
    const initialPiles: Pile[] = [];
    const remainingDeck: Card[] = [...newDeck];
    for (let i = 0; i < pileCount; i++) {
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
    setLongestGuessStreak(0);
    setScore(0); // Reset score
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

  // Helper function to replenish deck for Zen mode
  const replenishDeck = () => {
    const newDeck = shuffleDeck(createDeck());
    setDeck(newDeck);
  };

  // End game function for Zen mode
  const endZenGame = () => {
    if (mode === 'zen') {
      // In zen mode, the current score is the final score (no pile bonuses since it's endless)
      const finalScore = score;
      
      // Update only zen mode high score - no other persistent stats
      import('../utils/stats').then(m => m.updateZenModeHighScore(finalScore));
      
      // Update zen mode high score if needed
      if (finalScore > zenModeHighScore) {
        setZenModeHighScore(finalScore);
      }
      
      setGameState('win');
    }
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
    
    // For Zen mode, ensure we always have cards to draw
    let currentDeck = [...deck];
    if (currentDeck.length === 0 && mode === 'zen') {
      currentDeck = shuffleDeck(createDeck());
      setDeck(currentDeck);
    }
    
    if (currentDeck.length > 0) {
      const newDeck = [...currentDeck];
      const drawnCard = newDeck.shift()!;
      const currentPile = piles[pileIndex];
      const topCard = currentPile.cards[currentPile.cards.length - 1];
      const correct = isGuessCorrect(topCard, drawnCard, guessType);
      setTimeout(() => {
        const newPiles = [...piles];
        let newScore = score;
        if (correct) {
          newPiles[pileIndex] = {
            ...currentPile,
            cards: [...currentPile.cards, drawnCard],
          };
          const newStreak = guessStreak + 1;
          setGuessStreak(newStreak);
          setLongestGuessStreak(prev => (newStreak > prev ? newStreak : prev));
          // Award a life for correct 'same' guess (except in Zen mode)
          if (guessType === 'same' && mode !== 'zen') {
            setLives(prevLives => prevLives + 1);
          }
          // Scoring logic
          if (newStreak >= 3) {
            newScore += newStreak * 10;
          } else {
            newScore += 10;
          }
        } else {
          if (mode === 'zen') {
            // In Zen mode, wrong guesses don't cost lives or flip piles
            newPiles[pileIndex] = {
              ...currentPile,
              cards: [...currentPile.cards, drawnCard],
            };
          } else if (lives > 0) {
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
        setScore(newScore);
        setPiles(newPiles);
        setDeck(newDeck);
        updateGuessStreak(correct);
        
        // For Zen mode, track stats differently since there's no game end
        if (mode === 'zen' && correct) {
          // Update zen mode high score if needed
          if (newScore > zenModeHighScore) {
            setZenModeHighScore(newScore);
          }
          // Update zen mode high score in persistent storage
          import('../utils/stats').then(m => m.updateZenModeHighScore(newScore));
        }
        
        if (Platform.OS !== 'web') {
          if (correct) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
        }
        setTimeout(() => {
          if (mode === 'zen') {
            // Zen mode never ends - just continue playing
            setGameState('playing');
            setCurrentGuess({ pileIndex: null, guessType: null });
          } else {
            const allPilesFlipped = newPiles.every(pile => pile.flipped);
            const deckEmpty = newDeck.length === 0;
            if (allPilesFlipped) {
              // Game lost, calculate pile penalties
              let pileScore = 0;
              newPiles.forEach(pile => {
                pileScore += pile.flipped ? -10 : 10;
              });
              let finalScore = score + pileScore;
              setScore(finalScore);
              import('../utils/stats').then(m => m.updateStatsOnGameEnd(false, 0, mode, guessStreak, finalScore));
              if (finalScore > highScore) setHighScore(finalScore);
              setGameState('lose');
            } else if (deckEmpty) {
              // Game won, calculate pile bonuses
              let pileScore = 0;
              newPiles.forEach(pile => {
                pileScore += pile.flipped ? -10 : 10;
              });
              let finalScore = score + 100 + pileScore;
              setScore(finalScore);
              import('../utils/stats').then(m => m.updateStatsOnGameEnd(true, newPiles.filter(p => !p.flipped).length, mode, guessStreak, finalScore));
              if (finalScore > highScore) setHighScore(finalScore);
              setGameState('win');
            } else {
              setGameState('playing');
              setCurrentGuess({ pileIndex: null, guessType: null });
            }
          }
        }, 800);
      }, 300);
    }
  };
  
  // Start a new game when the component first mounts
  // useEffect(() => {
  //   startNewGame();
  // }, []);

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
    endZenGame,
    deck,
    mode,
    lives,
    guessStreak,
    longestGuessStreak,
    score,
    highScore,
    zenModeHighScore,
  };
  
  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};