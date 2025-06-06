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
  Easing,
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
  let symbol: React.ReactNode = '';
  
  switch (suit) {
    case 'hearts':
      symbol = (
        <Image
          source={require('../assets/images/heart.png')}
          style={styles.suitSymbol}
        />
      );
      break;
    case 'diamonds':
      symbol = (
        <Image
          source={require('../assets/images/diamond.png')}
          style={styles.suitSymbol}
        />
      );
      break;
    case 'clubs':
      symbol = (
        <Image
          source={require('../assets/images/club.png')}
          style={styles.suitSymbol}
        />
      );
      break;
    case 'spades':
      symbol = (
        <Image
          source={require('../assets/images/spade.png')}
          style={styles.suitSymbol}
        />
      );
      break;
    default:
      symbol = '';
  }
  
  return symbol;
};

const Card: React.FC<CardProps> = ({ card, isDisabled = false, style, onFlipComplete }) => {
  const { suit, value, flipped } = card;
  
  const spin = useSharedValue(flipped ? 180 : 0);
  const bounce = useSharedValue(1);
  
  // --- Deal Animation ---
  const dealTranslateY = useSharedValue(0);
  const dealOpacity = useSharedValue(1);
  const prevCardRef = React.useRef(card);

  // Sync spin with flipped prop
  React.useEffect(() => {
    if (flipped) {
      spin.value = withTiming(180, { duration: 400 });
    } else {
      spin.value = withTiming(0, { duration: 400 });
    }
  }, [flipped]);

  React.useLayoutEffect(() => {
    if (prevCardRef.current !== card) {
      dealTranslateY.value = -50;
      dealOpacity.value = 0;
      dealTranslateY.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.back(1.1)) });
      dealOpacity.value = withTiming(1, { duration: 400 });
    }
  }, [card, dealTranslateY, dealOpacity]);

  React.useEffect(() => {
    // If the card identity changes, trigger deal animation
    if (prevCardRef.current !== card) {
      prevCardRef.current = card;
      if (isDisabled) {
        spin.value = withDelay(
          1000,
          withSequence(
            withTiming(180, { duration: 500 }),
            withTiming(175, { duration: 200 }),
            withTiming(185, { duration: 200 }),
            withTiming(180, { duration: 200 }, (finished) => {
              if (finished && onFlipComplete) {
                runOnJS(onFlipComplete)();
              }
            })
          )
        );
      } else {
        spin.value = 0;
      }
    }
  }, [card, isDisabled]);
  
  const frontAnimatedStyle = useAnimatedStyle(() => {
    const interpolatedRotate = interpolate(
      spin.value,
      [0, 180],
      [0, -180],
      Extrapolate.CLAMP
    );
    return {
      transform: [
        { translateY: dealTranslateY.value },
        { scale: bounce.value },
        { perspective: 1000 },
        { rotateY: `${interpolatedRotate}deg` }
      ],
      opacity: dealOpacity.value * interpolate(
        spin.value,
        [0, 90, 180],
        [1, 0, 0],
        Extrapolate.CLAMP
      ),
      backfaceVisibility: 'hidden',
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
        { translateY: dealTranslateY.value },
        { perspective: 1000 },
        { rotateY: `${interpolatedRotate}deg` }
      ],
      opacity: dealOpacity.value * interpolate(
        spin.value,
        [0, 90, 180],
        [0, 0, 1],
        Extrapolate.CLAMP
      ),
      position: 'absolute',
      width: '100%',
      height: '100%',
      top: 0,
      left: 0,
      backfaceVisibility: 'hidden',
    };
  });
  
  const cardBackgroundColor = isDisabled
    ? COLORS.card.disabled
    : COLORS.card.background;
  
  return (
    <View style={[styles.cardContainer, style]}>
      {/* Card Back */}
      <Animated.View
        style={[
          styles.card,
          styles.cardBack,
          backAnimatedStyle
        ]}
      >
        <Image source={require('../assets/images/glove-purple.png')} style={{ width: 32, height: 32, opacity: 0.8 }} />
      </Animated.View>
      {/* Card Front */}
      <Animated.View
        style={[
          styles.card,
          { backgroundColor: cardBackgroundColor },
          frontAnimatedStyle
        ]}
      >
        <Text style={[styles.value,styles.valueTopLeft, { color: COLORS.suit[suit] }]}> 
          {value}
        </Text>
        <SuitSymbol suit={suit} />
        <Text style={[styles.value, styles.valueBottomRight, { color: COLORS.suit[suit] }]}> 
          {value}
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
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
    borderWidth: 2,
    borderColor: '#bbb',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cardBackImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    opacity: 0.8,
  },
  value: {
    position: 'absolute',
    fontSize: 32,
    fontFamily: 'VT323',
  },
  valueTopLeft: {
    top: 6,
    left: 6,
  },
  valueBottomRight: {
    bottom: 6,
    right: 6,
  },
  suitSymbol: {
    width: 48,
    height: 48,
  },
  backText: {
    color: '#fff',
    fontSize: 32,
    fontFamily: 'VT323',
    opacity: 0.4
  },
});

export default Card;