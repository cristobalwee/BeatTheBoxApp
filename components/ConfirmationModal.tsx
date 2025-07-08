import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Heart, HeartOff, Skull, Sprout } from 'lucide-react-native';
import { COLORS } from '../constants/colors';
import BottomSheet from './BottomSheet';
import { GameMode } from '../types/game';

interface ConfirmationModalProps {
  visible: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  title: string;
  message?: string;
  onSelectMode?: (mode: GameMode) => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  onConfirm,
  onCancel,
  title,
  message,
  onSelectMode,
}) => {
  return (
    <BottomSheet visible={visible} onClose={onCancel || (() => {})} snapPoints={[0.4]} scrollable={false}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {onSelectMode ? (
          <View style={styles.buttonContainer}>
            <Pressable style={[styles.button, styles.confirmButton]} onPress={() => onSelectMode('casual')}>
              <Heart size={30} color={COLORS.text.primary} style={{ marginBottom: 8 }} />
              <Text style={styles.buttonText}>Casual</Text>
              <Text style={styles.buttonSubText}>2 lives, you can take it easy</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.confirmButton]} onPress={() => onSelectMode('standard')}>
              <HeartOff size={30} color={COLORS.text.primary} style={{ marginBottom: 8 }} />
              <Text style={styles.buttonText}>Standard</Text>
              <Text style={styles.buttonSubText}>No lives, every guess counts</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.confirmButton]} onPress={() => onSelectMode('brutal')}>
              <Skull size={30} color={COLORS.text.primary} style={{ marginBottom: 8 }} />
              <Text style={styles.buttonText}>Brutal</Text>
              <Text style={styles.buttonSubText}>No lives, 4 piles – be careful!</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.confirmButton]} onPress={() => onSelectMode('zen')}>
              <Sprout size={30} color={COLORS.text.primary} style={{ marginBottom: 8 }} />
              <Text style={styles.buttonText}>Zen</Text>
              <Text style={styles.buttonSubText}>Endless lives, endless cards</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {message && <Text style={styles.message}>{message}</Text>}
            <View style={styles.buttonContainer}>
              <Pressable 
                style={[styles.button, styles.confirmButton]} 
                onPress={onConfirm}
              >
                <Text style={styles.buttonText}>Confirm</Text>
              </Pressable>
              <Pressable 
                style={[styles.button, styles.cancelButton]} 
                onPress={onCancel}
              >
                <Text style={[styles.buttonText, styles.cancelText]}>Cancel</Text>
              </Pressable>
            </View>
          </>
        )}
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 24,
    color: COLORS.text.primary,
    marginBottom: 16,
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
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    flexWrap: 'wrap',
  },
  button: {
    flex: 1,
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 150,
    flexGrow: 1,
    flexShrink: 1,
    gap: 4
  },
  confirmButton: {
    backgroundColor: COLORS.card.backside,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.text.secondary,
  },
  buttonText: {
    color: COLORS.text.primary,
    fontSize: 24,
    fontFamily: 'VT323',
  },
  buttonSubText: {
    color: COLORS.text.secondary,
    fontSize: 16,
    textAlign: 'center',
  },
  cancelText: {
    color: COLORS.text.secondary,
  },
});

export default ConfirmationModal;