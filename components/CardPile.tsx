import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  GestureDetector,
  Gesture,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

import Card from './Card';
import GuessOptions from './GuessOptions';
import FeedbackIndicator from './FeedbackIndicator';
import { Pile, GuessType } from '../types/game';

interface CardPileProps {
  pile: Pile;
  index: number;
  onSelect: (index: number) => void;
  onGuess: (index: number, guessType: GuessType) => void;
  isSelected: boolean;
  dealDelay: number;
  showFeedback: boolean;
  feedbackSuccess?: boolean;
}

const CardPile: React.FC<CardPileProps> = ({
  pile,
  index,
  onSelect,
  onGuess,
  isSelected,
  dealDelay,
  showFeedback,
  feedbackSuccess = false,
}) => {
  const { cards, flipped, disabled } = pile;
  const isEmptyPile = cards.length === 0;

  // Animation values
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-20);
  // Add scale for selection
  const selectedScale = useSharedValue(1);

  useEffect(() => {
    const delay = dealDelay * 100;
    translateY.value = withDelay(
      delay,
      withTiming(0, { duration: 300, easing: Easing.out(Easing.back(1.1)) })
    );
    scale.value = withDelay(delay, withTiming(1, { duration: 300 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
  }, [dealDelay]);

  // Animate scale up/down on selection
  useEffect(() => {
    if (isSelected) {
      selectedScale.value = withTiming(1.08, { duration: 180, easing: Easing.out(Easing.cubic) });
    } else {
      selectedScale.value = withTiming(1, { duration: 180, easing: Easing.out(Easing.cubic) });
    }
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { scale: scale.value * selectedScale.value },
      ],
      opacity: opacity.value,
      zIndex: isSelected ? 10 : 1,
    };
  });

  // --- Gesture Handlers ---
  // Only use a single Tap and a single Pan gesture for best iOS compatibility

  // Tap: select the pile
  const tap = Gesture.Tap()
    .maxDistance(10)
    .onEnd(() => {
      if (!disabled && !isSelected && !isEmptyPile) {
        runOnJS(onSelect)(index);
      }
    });

  // Pan: up = higher, down = lower
  const pan = Gesture.Pan()
    .minDistance(15)
    .onEnd((event) => {
      if (disabled || isEmptyPile) return;
      const translationY = event.translationY;
      if (Math.abs(translationY) > 30) {
        const guess: GuessType = translationY < 0 ? 'higher' : 'lower';
        runOnJS(onGuess)(index, guess);
      }
    });

  // Compose gestures: allow both tap and pan simultaneously
  // This is the most robust and least crash-prone approach
  const gesture = Gesture.Simultaneous(tap, pan);

  if (isEmptyPile) {
    return (
      <Animated.View style={[styles.container, animatedStyle]}>
        <View style={styles.emptyPile} />
      </Animated.View>
    );
  }

  const topCard = cards[cards.length - 1];

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <View style={styles.feedbackIndicatorContainer}>
        {showFeedback && (
          <FeedbackIndicator
            success={!!feedbackSuccess}
          />
        )}
        </View>
        <Card
          card={topCard}
          isDisabled={disabled}
        />

        {isSelected && (
          <GuessOptions
            onSelect={(guessType) => onGuess(index, guessType)}
          />
        )}
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  emptyPile: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#666',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  feedbackIndicatorContainer: {
    position: 'absolute',
    width: '100%',
    top: -20,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
});

export default CardPile;