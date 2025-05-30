import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import { Card as CardType, Suit } from '../types/game';
import { COLORS } from '../constants/colors';

interface CardProps {
  card: CardType;
  isDisabled?: boolean;
  style?: any;
  onFlipComplete?: () => void;
}

const SuitSymbol = ({ suit }: { suit: Suit }) => {
  let symbol = '';
  
  switch (suit) {
    case 'hearts':
      symbol = '♥';
      break;
    case 'diamonds':
      symbol = '♦';
      break;
    case 'clubs':
      symbol = '♣';
      break;
    case 'spades':
      symbol = '♠';
      break;
    default:
      symbol = '';
  }
  
  return (
    <Text style={[styles.suitSymbol, { color: COLORS.suit[suit] }]}>
      {symbol}
    </Text>
  );
};

const Card: React.FC<CardProps> = ({ card, isDisabled = false, style, onFlipComplete }) => {
  const { suit, value, flipped } = card;
  
  const spin = useSharedValue(flipped ? 180 : 0);
  const bounce = useSharedValue(1);
  
  React.useEffect(() => {
    if (flipped) {
      spin.value = withDelay(
        500,
        withSequence(
          withTiming(180, { duration: 300 }),
          withTiming(170, { duration: 100 }),
          withTiming(190, { duration: 100 }),
          withTiming(180, { duration: 100 }, (finished) => {
            if (finished && onFlipComplete) {
              runOnJS(onFlipComplete)();
            }
          })
        )
      );
    } else {
      bounce.value = withSequence(
        withTiming(1.1, { duration: 150 }),
        withTiming(1, { duration: 150 })
      );
    }
  }, [flipped]);
  
  const frontAnimatedStyle = useAnimatedStyle(() => {
    const interpolatedRotate = interpolate(
      spin.value,
      [0, 180],
      [0, -180],
      Extrapolate.CLAMP
    );
    return {
      transform: [
        { scale: bounce.value },
        { perspective: 1000 },
        { rotateY: `${interpolatedRotate}deg` }
      ],
      opacity: interpolate(
        spin.value,
        [0, 90, 180],
        [1, 0, 0],
        Extrapolate.CLAMP
      ),
    };
  });
  
  const backAnimatedStyle = useAnimatedStyle(() => {
    const interpolatedRotate = interpolate(
      spin.value,
      [0, 180],
      [180, 0],
      Extrapolate.CLAMP
    );
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${interpolatedRotate}deg` }
      ],
      opacity: interpolate(
        spin.value,
        [0, 90, 180],
        [0, 0, 1],
        Extrapolate.CLAMP
      ),
      backfaceVisibility: 'hidden' as const,
    };
  });
  
  const cardBackgroundColor = isDisabled
    ? COLORS.card.disabled
    : COLORS.card.background;
  
  return (
    <View style={[styles.cardContainer, style]}>
      <Animated.View
        style={[
          styles.card,
          { backgroundColor: cardBackgroundColor },
          frontAnimatedStyle
        ]}
      >
        <Text style={[styles.valueTopLeft, { color: COLORS.suit[suit] }]}>
          {value}
        </Text>
        <SuitSymbol suit={suit} />
        <Text style={[styles.valueBottomRight, { color: COLORS.suit[suit] }]}>
          {value}
        </Text>
      </Animated.View>
      
      <Animated.View
        style={[
          styles.card,
          styles.cardBack,
          backAnimatedStyle,
          { position: 'absolute' }
        ]}
      >
        <Image
          source={require('../assets/images/Playing_Cards_Back_Cover.jpg')}
          style={styles.cardBackImage}
          resizeMode="cover"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: COLORS.card.background,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    backgroundColor: COLORS.card.backside,
    borderWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cardBackImage: {
    width: '100%',
    height: '100%',
    borderRadius: 7,
  },
  valueTopLeft: {
    position: 'absolute',
    top: 5,
    left: 5,
    fontSize: 28,
    fontFamily: 'VT323',
  },
  valueBottomRight: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    fontSize: 28,
    fontFamily: 'VT323',
  },
  suitSymbol: {
    fontSize: 42,
    fontWeight: 'bold',
  },
});

export default Card;