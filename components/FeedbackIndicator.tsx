import React, { useEffect } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Check, X } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { COLORS } from '../constants/colors';
import { useReduceMotion } from '../hooks/useReduceMotion';

interface FeedbackIndicatorProps {
  success: boolean;
  style?: ViewStyle;
}

const FeedbackIndicator: React.FC<FeedbackIndicatorProps> = ({ success, style }) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);
  const translateY = useSharedValue(0);
  const reduceMotion = useReduceMotion();

  useEffect(() => {
    if (reduceMotion) {
      // Instantly show, then hide after the same duration
      opacity.value = 1;
      scale.value = 1;
      translateY.value = 0;
      const timeout = setTimeout(() => {
        opacity.value = 0;
      }, 700); // 100ms show + 600ms delay
      return () => clearTimeout(timeout);
    } else {
      // Show animation sequence
      opacity.value = withSequence(
        withTiming(1, { duration: 100 }),
        withDelay(
          600,
          withTiming(0, { duration: 200 })
        )
      );
      scale.value = withSequence(
        withTiming(1.2, { 
          duration: 200,
          easing: Easing.out(Easing.back(2))
        }),
        withTiming(1, { 
          duration: 100
        }),
        withDelay(
          400,
          withTiming(0.8, { duration: 200 })
        )
      );
      translateY.value = withSequence(
        withTiming(-5, { duration: 200 }),
        withDelay(
          400,
          withTiming(-15, { duration: 200 })
        )
      );
    }
  }, [success, reduceMotion]);
  
  const animatedStyle = useAnimatedStyle(() => {
    if (reduceMotion) {
      return {
        opacity: opacity.value,
        transform: [
          { scale: 1 },
          { translateY: 0 }
        ],
      };
    }
    return {
      opacity: opacity.value,
      transform: [
        { scale: scale.value },
        { translateY: translateY.value }
      ],
    };
  });
  
  return (
    <Animated.View 
      style={[
        styles.container, 
        success ? styles.success : styles.error,
        animatedStyle,
        style
      ]}
    >
      {success ? (
        <Check size={16} color="white" />
      ) : (
        <X size={16} color="white" />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 36,
    height: 36,
    borderRadius: 64,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    zIndex: 1000,
  },
  success: {
    backgroundColor: COLORS.feedback.success,
  },
  error: {
    backgroundColor: COLORS.feedback.error,
  },
});

export default FeedbackIndicator;