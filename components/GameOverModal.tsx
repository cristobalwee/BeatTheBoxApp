import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Pressable, Share } from 'react-native';
import { COLORS } from '../constants/colors';
import BottomSheet from './BottomSheet';
import { GameMode } from '../types/game';

interface GameOverModalProps {
  won: boolean;
  onNewGame: () => void;
  pilesRemaining: number;
  longestGuessStreak: number;
  cardsRemaining: number;
  finalScore: number;
  mode?: GameMode;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ won, onNewGame, pilesRemaining, longestGuessStreak, cardsRemaining, finalScore, mode }) => {
  const [isVisible, setVisible] = useState(true);

  const handleShare = async () => {
    const modeText = mode ? ` (${mode} mode)` : '';
    let shareMessage: string;
    let shareTitle: string;
    
    if (mode === 'zen') {
      shareMessage = `🧘 Beat The Box Zen Session${modeText}\n\nFinal Score: ${finalScore}\nLongest Streak: ${longestGuessStreak}\n\nFind your zen with Beat The Box! 🃏`;
      shareTitle = 'Beat The Box Zen Session';
    } else if (won) {
      shareMessage = `🎉 I Beat the Box!${modeText}\n\nFinal Score: ${finalScore}\nLongest Streak: ${longestGuessStreak}\nPiles Remaining: ${pilesRemaining}\n\nCan you beat the box? 🃏`;
      shareTitle = 'Beat The Box Victory!';
    } else {
      shareMessage = `💀 Beat The Box${modeText}\n\nFinal Score: ${finalScore}\nLongest Streak: ${longestGuessStreak}\nCards Remaining: ${cardsRemaining}\n\nTry to beat my score! 🃏`;
      shareTitle = 'Beat The Box Game Over';
    }

    try {
      await Share.share({
        message: shareMessage,
        title: shareTitle,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <BottomSheet visible={isVisible} onClose={ () => setVisible(false) } snapPoints={[0.35]} scrollable={false}>
      <View style={styles.content}>
        <Text style={styles.title}>
          {mode === 'zen' ? 'Game finished 🧘' : (won ? 'You Win! 🎉' : 'Game Over')}
        </Text>
        
        <Text style={styles.message}>
          {mode === 'zen' 
            ? "You've completed your zen meditation session. Your final score represents your focus and patience."
            : (won 
              ? "Congratulations! You've successfully beat the box!"
              : "All piles have been flipped. Better luck next time!")}
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
          {mode !== 'zen' && (
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{won ? 'Piles Remaining' : 'Cards Remaining'}</Text>
              <Text style={styles.statValue}>{won ? pilesRemaining : cardsRemaining}</Text>
            </View>
          )}
        </View>
        <Pressable style={styles.button} onPress={handleShare}>
          <Text style={styles.buttonText}>Share Score</Text>
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
    flexWrap: 'wrap',
  },
  statBox: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 150,
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
  closeButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'column',
    width: '100%',
    marginTop: 8,
  },
  closeButtonText: {
    color: '#FFF',
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