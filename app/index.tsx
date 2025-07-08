import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, SafeAreaView, Animated } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';

import { GameProvider } from '../context/GameContext';
import GameBoard from '../components/GameBoard';
import OnboardingOverlay from '../components/OnboardingOverlay';
import { getOnboardingViewed, saveOnboardingViewed } from '../utils/storage';

export default function App() {
  const [showRules, setShowRules] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    async function checkOnboarding() {
      try {
        const viewed = await getOnboardingViewed();
        if (!viewed) {
          setShowRules(true);
        }
        
        // Add a small delay to ensure smooth transition from splash screen
        setTimeout(() => {
          setInitialLoad(false);
          
          // Fade in the main content smoothly
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }).start();
        }, 300);
      } catch (error) {
        console.error('Error checking onboarding:', error);
        setInitialLoad(false);
      }
    }
    checkOnboarding();
  }, [fadeAnim]);
  
  const handleDismissRules = async () => {
    setShowRules(false);
    try {
      await saveOnboardingViewed();
    } catch (error) {
      console.error('Error saving onboarding state:', error);
    }
  };
  
  const handleShowRules = () => {
    setShowRules(true);
  };

  if (initialLoad) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        {/* The splash screen will be shown by Expo during this time */}
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <GestureHandlerRootView style={styles.container}>
        <StatusBar style="light" />
        <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}>
          <GameProvider>
            <GameBoard onShowRules={handleShowRules} />
            <OnboardingOverlay 
              visible={showRules} 
              onDismiss={handleDismissRules} 
            />
          </GameProvider>
        </Animated.View>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#222639',
  },
  container: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#222639',
  },
});