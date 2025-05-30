import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { COLORS } from '../constants/colors';

interface DeckCounterProps {
  count: number;
  totalCards?: number;
}

const DeckCounter: React.FC<DeckCounterProps> = ({ count, totalCards = 52 }) => {
  const scale = useSharedValue(1);
  const previousCount = React.useRef(count);
  
  React.useEffect(() => {
    if (previousCount.current !== count) {
      // Trigger animation when count changes
      scale.value = withTiming(1.2, { duration: 150 });
      
      setTimeout(() => {
        scale.value = withTiming(1, { 
          duration: 150, 
          easing: Easing.elastic(1.2) 
        });
      }, 150);
      
      previousCount.current = count;
    }
  }, [count]);
  
  const counterStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });
  
  return (
    <View style={styles.container}>
      <View style={styles.deckIcon}>
        <View style={styles.card1} />
        <View style={styles.card2} />
        <View style={styles.card3} />
      </View>
      <Animated.Text style={[styles.counter, counterStyle]}>
        {count}
      </Animated.Text>
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
    marginRight: 5,
  },
  card1: {
    width: 24,
    height: 34,
    backgroundColor: COLORS.card.backside,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#000',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  card2: {
    width: 24,
    height: 34,
    backgroundColor: COLORS.card.backside,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#000',
    position: 'absolute',
    top: 2,
    left: 2,
  },
  card3: {
    width: 24,
    height: 34,
    backgroundColor: COLORS.card.backside,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#000',
    position: 'absolute',
    top: 4,
    left: 4,
  },
  counter: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
});

export default DeckCounter;