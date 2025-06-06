import React from 'react';
import { StyleSheet, View, Text, Pressable, Image } from 'react-native';
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
    <BottomSheet visible={visible} onClose={onCancel || (() => {})} snapPoints={[0.4]}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {onSelectMode ? (
          <View style={styles.buttonContainer}>
            <Pressable style={[styles.button, styles.confirmButton]} onPress={() => onSelectMode('casual')}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Image source={require('../assets/images/heart-outline.png')} style={{ width: 36, height: 36, marginRight: -10 }} />
                <Image source={require('../assets/images/heart-outline.png')} style={{ width: 36, height: 36, marginLeft: -10 }} />
              </View>
              <Text style={styles.buttonText}>Casual</Text>
              <Text style={styles.buttonSubText}>2 lives</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.confirmButton]} onPress={() => onSelectMode('risky')}>
              <Image source={require('../assets/images/heart-outline.png')} style={{ width: 36, height: 36, marginBottom: 8 }} />
              <Text style={styles.buttonText}>Risky</Text>
              <Text style={styles.buttonSubText}>1 life</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.confirmButton]} onPress={() => onSelectMode('no_mercy')}>
              <Image source={require('../assets/images/heart-outline-empty.png')} style={{ width: 36, height: 36, marginBottom: 8 }} />
              <Text style={styles.buttonText}>No Mercy</Text>
              <Text style={styles.buttonSubText}>0 lives</Text>
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
  },
  button: {
    flex: 1,
    paddingVertical: 24,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
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
  },
  cancelText: {
    color: COLORS.text.secondary,
  },
});

export default ConfirmationModal;