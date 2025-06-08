import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { COLORS } from '../constants/colors';
import BottomSheet from './BottomSheet';

interface GameOverModalProps {
  won: boolean;
  onNewGame: () => void;
  pilesRemaining: number;
  longestGuessStreak: number;
  cardsRemaining: number;
  finalScore: number;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ won, onNewGame, pilesRemaining, longestGuessStreak, cardsRemaining, finalScore }) => {
  const [isVisible, setVisible] = useState(true);

  return (
    <BottomSheet visible={isVisible} onClose={ () => setVisible(false) } snapPoints={[0.35]}>
      <View style={styles.content}>
        <Text style={styles.title}>
          {won ? 'You Win! 🎉' : 'Game Over'}
        </Text>
        
        <Text style={styles.message}>
          {won 
            ? "Congratulations! You've successfully beat the box!"
            : "All piles have been flipped. Better luck next time!"}
        </Text>
        
        {/* Stats Section - column layout */}
        <View style={styles.statsColumn}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Final Score</Text>
            <Text style={styles.statValue}>{finalScore}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Longest Streak</Text>
            <Text style={styles.statValue}>{longestGuessStreak}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>{won ? 'Piles Remaining' : 'Cards Remaining'}</Text>
            <Text style={styles.statValue}>{won ? pilesRemaining : cardsRemaining}</Text>
          </View>
        </View>
        <Pressable style={styles.button} onPress={onNewGame}>
          <Text style={styles.buttonText}>New Game</Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 12,
    textAlign: 'left',
    fontFamily: 'VT323',
  },
  message: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginBottom: 16,
    textAlign: 'left',
    lineHeight: 22,
  },
  statsColumn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 8,
    width: '100%',
  },
  statBox: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 8,
    maxWidth: '33%',
  },
  statLabel: {
    color: COLORS.text.secondary,
    fontSize: 20,
    fontFamily: 'VT323',
    marginBottom: 2,
    textAlign: 'center',
  },
  statValue: {
    color: COLORS.text.primary,
    fontSize: 28,
    fontFamily: 'VT323',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: COLORS.button.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'column',
    width: '100%',
  },
  buttonText: {
    color: COLORS.text.primary,
    fontSize: 24,
    width: '100%',
    fontWeight: 'bold',
    fontFamily: 'VT323',
    textAlign: 'center',
  },
  modesContainer: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  mode: {
    flex: 1,
    paddingVertical: 24,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.text.secondary,
  },
  modeText: {
    color: COLORS.text.primary,
    fontSize: 22,
    fontFamily: 'VT323',
  },
  modeSubText: {
    color: COLORS.text.secondary,
    fontSize: 22,
    fontFamily: 'VT323',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default GameOverModal;