import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { ArrowUp, ArrowDown, Equal } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { GuessType } from '../types/game';
import { COLORS } from '../constants/colors';

interface GuessOptionsProps {
  onSelect: (guessType: GuessType) => void;
}

const GuessOptions: React.FC<GuessOptionsProps> = ({ onSelect }) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  React.useEffect(() => {
    opacity.value = withTiming(1, { duration: 150 });
    scale.value = withSpring(1, {
      damping: 12,
      stiffness: 100,
    });
  }, []);

  const containerStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <View style={styles.optionsRow}>
        <Pressable
          style={[styles.optionButton, { backgroundColor: COLORS.button.higher }]}
          onPress={() => onSelect('higher')}
        >
          <ArrowUp color="white" size={24} />
        </Pressable>
        <Pressable
          style={[styles.optionButton, { backgroundColor: COLORS.button.same }]}
          onPress={() => onSelect('same')}
        >
          <Equal color="black" size={24} />
        </Pressable>
        <Pressable
          style={[styles.optionButton, { backgroundColor: COLORS.button.lower }]}
          onPress={() => onSelect('lower')}
        >
          <ArrowDown color="white" size={24} />
        </Pressable>
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
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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