import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, Text, Pressable, Platform, Dimensions, ScrollView } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { COLORS } from '../constants/colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_TRANSLATE_Y = -SCREEN_HEIGHT + 50;

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapPoints?: number[];
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  children,
  snapPoints = [0.9],
}) => {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const active = useSharedValue(false);
  const context = useSharedValue({ y: 0 });
  const opacity = useSharedValue(0);
  const [isRendered, setIsRendered] = useState(false);

  const scrollTo = useCallback((destination: number, shouldAnimate = true) => {
    'worklet';
    active.value = destination !== SCREEN_HEIGHT;
    
    if (shouldAnimate) {
      translateY.value = withSpring(destination, {
        damping: 50,
        stiffness: 400,
        mass: 1,
        restDisplacementThreshold: 0.2,
        restSpeedThreshold: 0.2,
      });
      opacity.value = withTiming(destination === SCREEN_HEIGHT ? 0 : 0.7, {
        duration: 250
      });
    } else {
      translateY.value = destination;
      opacity.value = destination === SCREEN_HEIGHT ? 0 : 0.7;
    }
  }, []);

  const handleClose = useCallback(() => {
    scrollTo(SCREEN_HEIGHT);
    setTimeout(() => {
      setIsRendered(false);
      onClose();
    }, 300);
  }, [onClose, scrollTo]);

  useEffect(() => {
    if (visible && !isRendered) {
      setIsRendered(true);
      requestAnimationFrame(() => {
        const snapPoint = snapPoints[0];
        scrollTo(-(SCREEN_HEIGHT * snapPoint));
      });
    } else if (!visible && isRendered) {
      handleClose();
    }
  }, [visible, isRendered]);

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      translateY.value = event.translationY + context.value.y;
      translateY.value = Math.max(MAX_TRANSLATE_Y, Math.min(translateY.value, SCREEN_HEIGHT));
      
      opacity.value = interpolate(
        translateY.value,
        [SCREEN_HEIGHT, SCREEN_HEIGHT * 0.7],
        [0, 0.7],
        Extrapolate.CLAMP
      );
    })
    .onEnd((event) => {
      if (event.velocityY > 500 || event.translationY > SCREEN_HEIGHT * 0.2) {
        runOnJS(handleClose)();
      } else {
        const snapPoint = snapPoints[0];
        scrollTo(-(SCREEN_HEIGHT * snapPoint));
      }
    });

  const rBottomSheetStyle = useAnimatedStyle(() => {
    const borderRadius = interpolate(
      translateY.value,
      [MAX_TRANSLATE_Y + 50, MAX_TRANSLATE_Y],
      [25, 5],
      Extrapolate.CLAMP
    );

    return {
      borderRadius,
      transform: [{ translateY: translateY.value }],
    };
  });

  const rBackdropStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const BlurComponent = Platform.OS === 'web' ? View : BlurView;
  const blurProps = Platform.OS === 'web'
    ? { style: [styles.backdrop, rBackdropStyle, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }] }
    : { style: [styles.backdrop, rBackdropStyle], intensity: 15, tint: "dark" as const };

  if (!isRendered) return null;

  return (
    <View style={styles.container} pointerEvents={visible ? 'auto' : 'none'}>
      <Pressable style={StyleSheet.absoluteFill} onPress={handleClose}>
        <Animated.View style={StyleSheet.absoluteFill}>
          <BlurComponent {...blurProps} />
        </Animated.View>
      </Pressable>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.bottomSheetContainer, rBottomSheetStyle]}>
          <View style={styles.line} />
          <ScrollView style={styles.contentContainer}>
            {children}
          </ScrollView>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Platform.OS === 'web' ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
  },
  bottomSheetContainer: {
    height: SCREEN_HEIGHT,
    width: '100%',
    backgroundColor: '#2E334F',
    position: 'absolute',
    top: SCREEN_HEIGHT,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  contentContainer: {
    flex: 1,
  },
  line: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignSelf: 'center',
    marginVertical: 15,
    borderRadius: 2,
  },
});

export default BottomSheet;