import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
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
  FadeInUp,
  FadeOutUp,
} from 'react-native-reanimated';
import { Flame, Heart } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import Card from './Card';
import GuessOptions from './GuessOptions';
import FeedbackIndicator from './FeedbackIndicator';
import { Pile, GuessType } from '../types/game';
import { COLORS } from '../constants/colors';

interface CardPileProps {
  pile: Pile;
  index: number;
  onSelect: (index: number) => void;
  onGuess: (index: number, guessType: GuessType) => void;
  isSelected: boolean;
  dealDelay: number;
  showFeedback: boolean;
  feedbackSuccess?: boolean;
  guessStreak?: number;
  showLifeToast?: boolean;
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
  guessStreak = 0,
  showLifeToast = false,
}) => {
  const { cards, flipped, disabled } = pile;
  const isEmptyPile = cards.length === 0;

  // Animation values
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-20);
  // Add scale for selection
  const selectedScale = useSharedValue(1);

  // --- New Streak Toast Animation ---
  const streakToastVisible = showFeedback && guessStreak > 2 && !showLifeToast;
  const streakScale = useSharedValue(0.8);
  useEffect(() => {
    if (streakToastVisible || showLifeToast) {
      streakScale.value = withTiming(1.15, { duration: 180, easing: Easing.out(Easing.elastic(1.2)) });
      setTimeout(() => {
        streakScale.value = withTiming(1, { duration: 120, easing: Easing.out(Easing.elastic(1.2)) });
      }, 180);
    } else {
      streakScale.value = withTiming(0.8, { duration: 120 });
    }
  }, [streakToastVisible, showLifeToast]);
  const streakToastStyle = useAnimatedStyle(() => ({
    transform: [{ scale: streakScale.value }],
  }));

  useEffect(() => {
    if (isEmptyPile) return;

    const delay = dealDelay * 50;
    translateY.value = withDelay(
      delay,
      withTiming(0, { duration: 300, easing: Easing.out(Easing.back(1.1)) })
    );
    scale.value = withDelay(delay, withTiming(1, { duration: 300 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
  }, [dealDelay, pile, isEmptyPile]);

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
      <Animated.View style={[styles.container]}>
        <View style={styles.emptyPile} />
      </Animated.View>
    );
  }

  const topCard = cards[cards.length - 1];

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        {/* Life Toast Overlay (takes precedence over streak) */}
        {showLifeToast && (
          <Animated.View
            style={styles.streakToast}
            entering={FadeInUp.duration(200).springify().damping(90).mass(0.5).stiffness(500).withInitialValues({ transform: [{ translateY: 8 }] }).delay(300)}
            exiting={FadeOutUp.duration(500).springify().damping(120).mass(0.5).stiffness(200).delay(300)}
            pointerEvents="none"
          >
            <Heart size={16} color={COLORS.feedback.success} style={{ marginRight: 6 }} />
            <Text style={styles.streakToastText}>+1 life</Text>
          </Animated.View>
        )}
        {/* Streak Toast Overlay */}
        {streakToastVisible && (
          <Animated.View
            style={[styles.streakToast, streakToastStyle]}
            entering={FadeInUp.duration(200).springify().damping(90).mass(0.5).stiffness(500).withInitialValues({ transform: [{ translateY: 8 }] }).delay(300)}
            exiting={FadeOutUp.duration(500).springify().damping(120).mass(0.5).stiffness(200).delay(300)}
            pointerEvents="none"
          >
            <Flame size={16} color={COLORS.feedback.error} style={{ marginRight: 4 }} />
            <Text style={styles.streakToastText}>Streak x{guessStreak}</Text>
          </Animated.View>
        )}
        {/* Feedback Indicator */}
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
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  streakToast: {
    position: 'absolute',
    top: '50%',
    marginTop: -20,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 4,
    zIndex: 100,
    shadowColor: '#111',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 6,
  },
  streakToastText: {
    color: '#111',
    fontWeight: 'bold',
    fontSize: 18,
    fontFamily: 'VT323',
  },
});

export default CardPile;