import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, Pressable, Platform, Dimensions, ScrollView } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
  Easing,
  runOnJS,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { COLORS } from '../constants/colors';
import AnimatedReanimated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { useReduceMotion } from '../hooks/useReduceMotion';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_TRANSLATE_Y = -SCREEN_HEIGHT + 50;
const MAX_SHEET_HEIGHT = SCREEN_HEIGHT * 0.8;
const PressAnimated = Animated.createAnimatedComponent(Pressable);

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapPoints?: number[];
  scrollable?: boolean;
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  children,
  snapPoints = [0.9],
  scrollable = true,
}) => {
  const translateY = useSharedValue(10000);
  const active = useSharedValue(false);
  const context = useSharedValue({ y: 0 });
  const isAtTop = useSharedValue(true);
  const isScrolling = useSharedValue(false);
  const [sheetHeight, setSheetHeight] = useState(0);
  const insets = useSafeAreaInsets();
  const HANDLE_HEIGHT = 40;
  const reduceMotion = useReduceMotion();
  const scrollViewRef = useRef<AnimatedReanimated.ScrollView>(null);

  const scrollTo = useCallback((destination: number) => {
    'worklet';
    active.value = destination !== insets.bottom;
    translateY.value = withSpring(destination, {
      damping: 50,
      stiffness: 400,
      mass: 1,
      restDisplacementThreshold: 0.2,
      restSpeedThreshold: 0.2,
    });
  }, [insets.bottom]);

  const handleClose = useCallback(() => {
    // Reset scroll position when closing
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: false });
    }
    scrollTo(sheetHeight + insets.bottom);
    onClose();
  }, [onClose, scrollTo, sheetHeight, insets.bottom]);

  useEffect(() => {
    if (sheetHeight > 0) {
      if (visible) {
        scrollTo(insets.bottom);
      } else {
        scrollTo(sheetHeight + insets.bottom);
      }
    } else {
      translateY.value = 10000;
    }
  }, [visible, sheetHeight, insets.bottom]);

  // Track scroll position and scrolling state
  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    isAtTop.value = offsetY <= 0;
  };

  const handleScrollBeginDrag = () => {
    isScrolling.value = true;
  };

  const handleScrollEndDrag = () => {
    // Add a small delay to ensure the scroll state is properly reset
    setTimeout(() => {
      isScrolling.value = false;
    }, 50);
  };

  // When not scrollable, always allow pan gesture
  useEffect(() => {
    if (!scrollable) {
      isAtTop.value = true;
      isScrolling.value = false;
    }
  }, [scrollable]);

  // Native gesture for scroll coordination
  const nativeGesture = Gesture.Native();
  const panGesture = Gesture.Pan()
    .onStart(() => {
      'worklet';
      // For non-scrollable sheets, always allow pan gesture
      // For scrollable sheets, only allow if at top and not scrolling
      if (scrollable && (!isAtTop.value || isScrolling.value)) {
        return;
      }
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      'worklet';
      // For non-scrollable sheets, always allow pan gesture
      // For scrollable sheets, only allow if at top and not scrolling
      if (scrollable && (!isAtTop.value || isScrolling.value)) {
        return;
      }
      // Only allow downward movement (positive translationY)
      const nextY = event.translationY + context.value.y;
      // Clamp so it can't go above insets.bottom (no upward drag)
      translateY.value = Math.max(insets.bottom, Math.min(nextY, sheetHeight + insets.bottom));
    })
    .onEnd((event) => {
      'worklet';
      // For non-scrollable sheets, always allow pan gesture
      // For scrollable sheets, only allow if at top and not scrolling
      if (scrollable && (!isAtTop.value || isScrolling.value)) {
        return;
      }
      if (event.velocityY > 500 || event.translationY > (sheetHeight + insets.bottom) * 0.2) {
        runOnJS(handleClose)();
      } else {
        scrollTo(insets.bottom);
      }
    });
  const composedGesture = scrollable ? Gesture.Simultaneous(panGesture, nativeGesture) : panGesture;

  const rBottomSheetStyle = useAnimatedStyle(() => {
    if (reduceMotion) {
      return {
        opacity: visible ? 1 : 0,
        transform: [{ translateY: 0 }],
      };
    }
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const BlurComponent = Platform.OS === 'web' ? View : BlurView;
  const blurProps = Platform.OS === 'web'
    ? { style: [styles.backdrop, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }] }
    : { style: [styles.backdrop], intensity: 15, tint: "dark" as const };

  return (
    <View style={styles.container} pointerEvents={visible ? 'auto' : 'none'}>
      {visible && (
        <PressAnimated 
          style={StyleSheet.absoluteFill}
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(300)}
          onPress={handleClose}
        >
          <BlurComponent {...blurProps} />
        </PressAnimated>
      )}
      <GestureDetector gesture={composedGesture}>
        <Animated.View
          style={[
            styles.bottomSheetContainer,
            { bottom: 0, maxHeight: MAX_SHEET_HEIGHT },
            rBottomSheetStyle,
          ]}
          onLayout={e => {
            setSheetHeight(e.nativeEvent.layout.height);
            if (!visible) {
              translateY.value = e.nativeEvent.layout.height + insets.bottom;
            }
          }}
        >
          {/* Close (X) button */}
          <Pressable
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel="Close"
            style={styles.closeButton}
            hitSlop={16}
          >
            <X color="white" size={20} />
          </Pressable>
          <View style={styles.line} />
          {scrollable && (
            <AnimatedReanimated.ScrollView
              ref={scrollViewRef}
              style={styles.contentContainer}
              contentContainerStyle={{ paddingBottom: 32 + insets.bottom }}
              bounces={true}
              showsVerticalScrollIndicator={false}
              scrollEventThrottle={16}
              onScroll={handleScroll}
              onScrollBeginDrag={handleScrollBeginDrag}
              onScrollEndDrag={handleScrollEndDrag}
              onMomentumScrollEnd={handleScrollEndDrag}
            >
              {children}
            </AnimatedReanimated.ScrollView>
          )}
          {!scrollable && (
            <View style={[styles.contentContainer, { paddingBottom: 32 + insets.bottom }]}>
              {children}
            </View>
          )}
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
    width: '100%',
    backgroundColor: '#2E334F',
    position: 'absolute',
    bottom: 0,
    borderRadius: 32,
    borderBottomEndRadius: 0,
    borderBottomStartRadius: 0,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  contentContainer: {
  },
  line: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignSelf: 'center',
    marginVertical: 15,
    borderRadius: 2,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 16,
    zIndex: 20,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BottomSheet;