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

interface FeedbackIndicatorProps {
  success: boolean;
  style?: ViewStyle;
}

const FeedbackIndicator: React.FC<FeedbackIndicatorProps> = ({ success, style }) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);
  const translateY = useSharedValue(0);

  useEffect(() => {
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
  }, [success]); // Re-run animation when success prop changes
  
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: translateY.value }
    ],
  }));
  
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
    width: 24,
    height: 24,
    borderRadius: 12,
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
  },
  success: {
    backgroundColor: COLORS.feedback.success,
  },
  error: {
    backgroundColor: COLORS.feedback.error,
  },
});

export default FeedbackIndicator;