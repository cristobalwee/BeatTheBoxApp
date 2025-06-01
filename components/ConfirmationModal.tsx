import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { COLORS } from '../constants/colors';
import BottomSheet from './BottomSheet';

interface ConfirmationModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  onConfirm,
  onCancel,
  title,
  message,
}) => {
  return (
    <BottomSheet visible={visible} onClose={onCancel} snapPoints={[0.4]}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        
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
    flexDirection: 'column',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: COLORS.button.primary,
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
  cancelText: {
    color: COLORS.text.secondary,
  },
});

export default ConfirmationModal;