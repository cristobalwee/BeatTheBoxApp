import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { ArrowUp, ArrowDown, Equal } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  withDelay,
} from 'react-native-reanimated';
import { GuessType } from '../types/game';
import { COLORS } from '../constants/colors';
import { useReduceMotion } from '../hooks/useReduceMotion';

interface GuessOptionsProps {
  onSelect: (guessType: GuessType) => void;
}

const BUTTONS = [
  { type: 'higher' as GuessType, icon: <ArrowUp color="white" size={24} />, bg: COLORS.button.higher },
  { type: 'same' as GuessType, icon: <Equal color="black" size={24} />, bg: COLORS.button.same },
  { type: 'lower' as GuessType, icon: <ArrowDown color="white" size={24} />, bg: COLORS.button.lower },
];

const GuessOptions: React.FC<GuessOptionsProps> = ({ onSelect }) => {
  const reduceMotion = useReduceMotion();
  // Overlay fade
  const overlayOpacity = useSharedValue(0);
  // Button scales
  const buttonScales = BUTTONS.map(() => useSharedValue(0.9));

  React.useEffect(() => {
    if (reduceMotion) {
      overlayOpacity.value = 1;
      buttonScales.forEach((scale) => (scale.value = 1));
    } else {
      overlayOpacity.value = withTiming(1, { duration: 180 });
      BUTTONS.forEach((_, i) => {
        buttonScales[i].value = withDelay(
          80 * i,
          withSpring(1, { damping: 12, stiffness: 90 })
        );
      });
    }
  }, [reduceMotion]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, overlayStyle]}>
      <View style={styles.optionsColumn}>
        {BUTTONS.map((btn, i) => {
          const animatedBtnStyle = useAnimatedStyle(() => ({
            transform: [{ scale: buttonScales[i].value }],
          }));
          return (
            <Animated.View key={btn.type} style={[styles.animatedButton, animatedBtnStyle]}>
              <Pressable
                style={[styles.optionButton, { backgroundColor: btn.bg }]}
                onPress={() => onSelect(btn.type)}
              >
                {btn.icon}
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
  },
  optionsColumn: {
    flexDirection: 'column',
    gap: 12,
    alignItems: 'center',
  },
  animatedButton: {
    width: '100%',
    alignItems: 'center',
  },
  optionButton: {
    width: 40,
    height: 40,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default GuessOptions;