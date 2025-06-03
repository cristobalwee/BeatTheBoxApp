import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import { CircleHelp, ChartNoAxesColumn } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { useGameContext } from '../context/GameContext';
import CardPile from './CardPile';
import DeckCounter from './DeckCounter';
import { COLORS } from '../constants/colors';
import { GuessType } from '../types/game';
import GameOverModal from './GameOverModal';
import ConfirmationModal from './ConfirmationModal';
import { isGuessCorrect } from '../utils/card';
import StatsOverlay from './StatsOverlay';
import { updateStatsOnGameEnd } from '../utils/stats';

interface GameBoardProps {
  onShowRules: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ onShowRules }) => {
  const {
    piles,
    gameState,
    remainingCards,
    startNewGame,
    makeGuess,
    selectPile,
    selectedPileIndex,
    unselectPile,
    deck,
  } = useGameContext();

  const [feedbackPileIndex, setFeedbackPileIndex] = useState<number | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<boolean | null>(null);
  const [showNewGameConfirm, setShowNewGameConfirm] = useState(false);
  const [showStatsOverlay, setShowStatsOverlay] = useState(false);

  const handleGuess = (pileIndex: number, guessType: GuessType) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const pile = piles[pileIndex];
    const topCard = pile.cards[pile.cards.length - 1];
    const nextCard = deck[0];
    let isCorrect = false;
    if (topCard && nextCard) {
      isCorrect = isGuessCorrect(topCard, nextCard, guessType);
    }
    makeGuess(pileIndex, guessType);
    setTimeout(() => {
      setFeedbackPileIndex(pileIndex);
      setFeedbackSuccess(isCorrect);
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setTimeout(() => {
        setFeedbackPileIndex(null);
        setFeedbackSuccess(null);
      }, 800);
    }, 600);
  };

  const handleNewGameConfirm = (won: boolean, pilesRemaining: number) => {
    updateStatsOnGameEnd(won, pilesRemaining);
    setShowNewGameConfirm(false);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    startNewGame();
  };

  const handleBackgroundPress = () => {
    if (selectedPileIndex !== null) {
      unselectPile();
    }
  };

  const renderPiles = () => {
    return (
      <View style={styles.grid}>
        {piles.map((pile, index) => (
          <View key={`pile-${index}`} style={styles.pileWrapper}>
            <CardPile
              pile={pile}
              index={index}
              onSelect={selectPile}
              onGuess={handleGuess}
              isSelected={selectedPileIndex === index}
              dealDelay={index}
              showFeedback={feedbackPileIndex === index}
              feedbackSuccess={feedbackSuccess ?? false}
            />
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.backgroundPressable} onPress={handleBackgroundPress}>
        <View style={styles.header}>
          <Text style={styles.title}>Beat the Box</Text>
          <DeckCounter count={remainingCards} />
        </View>
        
        <View style={styles.boardContainer}>
          {renderPiles()}
        </View>
        
        <View style={styles.actions}>
          <Pressable
            style={styles.newGameButton}
            onPress={() => setShowNewGameConfirm(true)}
          >
            <Text style={styles.buttonText}>New Game</Text>
          </Pressable>
          
          <View style={styles.buttonContainer}>
            <Pressable onPress={onShowRules} style={styles.tertiaryButton}>
              <CircleHelp size={20} color={COLORS.text.secondary} />
              <Text style={styles.tertiaryButtonText}>How to play</Text>
            </Pressable>
            <Pressable onPress={() => setShowStatsOverlay(true)} style={styles.tertiaryButton}>
              <ChartNoAxesColumn size={20} color={COLORS.text.secondary} />
              <Text style={styles.tertiaryButtonText}>Your stats</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>

      <ConfirmationModal
        visible={showNewGameConfirm}
        title="Start New Game?"
        message="Are you sure you want to start a new game? Your current progress will be lost."
        onConfirm={() => handleNewGameConfirm(gameState === 'win', piles.filter(p => !p.flipped).length)}
        onCancel={() => setShowNewGameConfirm(false)}
      />

      {(gameState === 'win' || gameState === 'lose') && (
        <GameOverModal
          won={gameState === 'win'}
          onNewGame={startNewGame}
          pilesRemaining={piles.filter(p => !p.flipped).length}
        />
      )}

      <StatsOverlay visible={showStatsOverlay} onDismiss={() => setShowStatsOverlay(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    fontFamily: 'VT323',
  },
  boardContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 8,
    height: '100%',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    aspectRatio: 1,
  },
  pileWrapper: {
    width: '30%',
    height: '40%',
    maxHeight: 280,
  },
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
    alignItems: 'center',
    width: '100%',
  },
  newGameButton: {
    backgroundColor: COLORS.button.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    fontFamily: 'VT323',
  },
  tertiaryButton: {
    marginTop: 12,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 16,
  },
  tertiaryButtonText: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textDecorationLine: 'underline',
  },
  backgroundPressable: {
    flex: 1,
  },
});

export default GameBoard;