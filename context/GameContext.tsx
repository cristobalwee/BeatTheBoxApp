import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { GameContextType, GameState, GuessType, Pile, Card } from '../types/game';
import { createDeck, shuffleDeck, isGuessCorrect } from '../utils/card';

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

  // Initialize a new game
  const startNewGame = () => {
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
    
    // Set game state to guessing during the guess process
    setGameState('guessing');
    setCurrentGuess({ pileIndex, guessType });
    setSelectedPileIndex(null); // Deselect pile
    
    // Need to draw a card from deck
    if (deck.length > 0) {
      const newDeck = [...deck];
      const drawnCard = newDeck.shift()!;
      
      // Get the top card of the selected pile
      const currentPile = piles[pileIndex];
      const topCard = currentPile.cards[currentPile.cards.length - 1];
      
      // Check if guess is correct
      const correct = isGuessCorrect(topCard, drawnCard, guessType);
      
      setTimeout(() => {
        // Update piles based on the guess result
        const newPiles = [...piles];
        if (correct) {
          // Add card to pile if correct
          newPiles[pileIndex] = {
            ...currentPile,
            cards: [...currentPile.cards, drawnCard],
          };
        } else {
          // Flip pile if incorrect
          newPiles[pileIndex] = {
            ...currentPile,
            cards: [...currentPile.cards, drawnCard],
            flipped: true,
            disabled: true,
          };
        }
        
        setPiles(newPiles);
        setDeck(newDeck);
        
        // Optional haptic feedback based on result
        if (Platform.OS !== 'web') {
          if (correct) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
        }
        
        // Check win/lose conditions after a short delay
        setTimeout(() => {
          // Check if all piles are flipped (lose condition)
          const allPilesFlipped = newPiles.every(pile => pile.flipped);
          
          // Check if deck is empty (potential win condition)
          const deckEmpty = newDeck.length === 0;
          
          if (allPilesFlipped) {
            setGameState('lose');
          } else if (deckEmpty) {
            setGameState('win');
          } else {
            setGameState('playing');
            setCurrentGuess({ pileIndex: null, guessType: null });
          }
        }, 800);
      }, 300); // Delay to show the card before determining outcome
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
  };
  
  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};