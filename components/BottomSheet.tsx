import React, { useCallback, useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, Platform, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
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
  const translateY = useSharedValue(0);
  const active = useSharedValue(false);
  const context = useSharedValue({ y: 0 });

  const scrollTo = useCallback((destination: number) => {
    'worklet';
    active.value = destination !== 0;
    translateY.value = withSpring(destination, {
      damping: 20,
      stiffness: 300,
      mass: 0.8,
    });
  }, []);

  useEffect(() => {
    if (visible) {
      const snapPoint = snapPoints[0];
      scrollTo(-(SCREEN_HEIGHT * snapPoint));
    } else {
      scrollTo(0);
    }
  }, [visible]);

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      translateY.value = event.translationY + context.value.y;
      translateY.value = Math.max(MAX_TRANSLATE_Y, translateY.value);
    })
    .onEnd((event) => {
      if (event.velocityY > 500 || event.translationY > SCREEN_HEIGHT * 0.2) {
        runOnJS(onClose)();
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
      opacity: withSpring(
        interpolate(
          translateY.value,
          [0, -SCREEN_HEIGHT * 0.4],
          [0, 0.7],
          Extrapolate.CLAMP
        ),
        { damping: 15, stiffness: 200 }
      ),
    };
  });

  const BlurComponent = Platform.OS === 'web' ? View : BlurView;
  const blurProps = Platform.OS === 'web'
    ? { style: [styles.backdrop, rBackdropStyle, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }] }
    : { style: [styles.backdrop, rBackdropStyle], intensity: 15, tint: "dark" };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
        <BlurComponent {...blurProps} />
      </Pressable>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.bottomSheetContainer, rBottomSheetStyle]}>
          <View style={styles.line} />
          {children}
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
  },
  bottomSheetContainer: {
    height: SCREEN_HEIGHT,
    width: '100%',
    backgroundColor: COLORS.background,
    position: 'absolute',
    top: SCREEN_HEIGHT,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  line: {
    width: 75,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignSelf: 'center',
    marginVertical: 15,
    borderRadius: 2,
  },
});

export default BottomSheet;