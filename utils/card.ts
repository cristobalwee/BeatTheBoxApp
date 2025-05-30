import { Card, Suit, Value, Color } from '../types/game';

export const createDeck = (): Card[] => {
  const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const values: Value[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  
  const deck: Card[] = [];
  
  for (const suit of suits) {
    for (let i = 0; i < values.length; i++) {
      const value = values[i];
      // Ace is 1, J is 11, Q is 12, K is 13
      const numericValue = value === 'A' ? 1 : 
        value === 'J' ? 11 : 
        value === 'Q' ? 12 : 
        value === 'K' ? 13 : 
        parseInt(value);
        
      const color: Color = suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black';
      
      deck.push({
        suit,
        value,
        numericValue,
        color,
        flipped: false,
      });
    }
  }
  
  return deck;
};

export const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
};

export const isGuessCorrect = (currentCard: Card, nextCard: Card, guess: 'higher' | 'lower' | 'same'): boolean => {
  if (guess === 'higher') {
    return nextCard.numericValue > currentCard.numericValue;
  } else if (guess === 'lower') {
    return nextCard.numericValue < currentCard.numericValue;
  } else { // guess === 'same'
    return nextCard.numericValue === currentCard.numericValue;
  }
};