import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { COLORS } from '../constants/colors';
import BottomSheet from './BottomSheet';

interface GameOverModalProps {
  won: boolean;
  onNewGame: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ won, onNewGame }) => {
  return (
    <BottomSheet visible={true} onClose={onNewGame} snapPoints={[0.35]}>
      <View style={styles.content}>
        <Text style={styles.title}>
          {won ? '🎉 You Win! 🎉' : 'Game Over'}
        </Text>
        
        <Text style={styles.message}>
          {won 
            ? "Congratulations! You've successfully beat the box!"
            : "All piles have been flipped. Better luck next time!"}
        </Text>
        
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
    marginBottom: 24,
    textAlign: 'left',
    lineHeight: 22,
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
});

export default GameOverModal;