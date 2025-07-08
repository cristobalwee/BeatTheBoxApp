import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { COLORS } from '../constants/colors';
import { useReduceMotion } from '../hooks/useReduceMotion';
import { GameMode } from '../types/game';

interface DeckCounterProps {
  count: number;
  totalCards?: number;
  mode?: GameMode;
}

const DeckCounter: React.FC<DeckCounterProps> = ({ count, totalCards = 52, mode }) => {
  const scale = useSharedValue(1);
  const previousCount = React.useRef(count);
  const reduceMotion = useReduceMotion();
  
  React.useEffect(() => {
    if (previousCount.current !== count) {
      if (reduceMotion) {
        scale.value = 1;
      } else {
        // Trigger animation when count changes
        scale.value = withTiming(1.2, { duration: 150 });
        
        setTimeout(() => {
          scale.value = withTiming(1, { 
            duration: 150, 
            easing: Easing.elastic(1.2) 
          });
        }, 150);
      }
      previousCount.current = count;
    }
  }, [count, reduceMotion]);
  
  const counterStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });
  
  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.counter, counterStyle]}>
        {mode === 'zen' ? '∞' : count}
      </Animated.Text>
      <View style={styles.deckIcon}>
        <View style={styles.card1} />
        <View style={styles.card2} />
        <View style={styles.card3} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deckIcon: {
    width: 30,
    height: 40,
    position: 'relative',
    marginLeft: 8,
  },
  card1: {
    width: 24,
    height: 34,
    backgroundColor: COLORS.card.backside,
    borderRadius: 3,
    borderWidth: 0.25,
    borderColor: '#fff',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  card2: {
    width: 24,
    height: 34,
    backgroundColor: COLORS.card.backside,
    borderRadius: 3,
    borderWidth: 0.25,
    borderColor: '#fff',
    position: 'absolute',
    top: 2,
    left: 2,
  },
  card3: {
    width: 24,
    height: 34,
    backgroundColor: COLORS.card.backside,
    borderRadius: 3,
    borderWidth: 0.25,
    borderColor: '#fff',
    position: 'absolute',
    top: 4,
    left: 4,
  },
  counter: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'VT323',
    color: COLORS.text.primary,
  },
});

export default DeckCounter;