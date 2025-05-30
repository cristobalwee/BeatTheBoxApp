import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Platform, SafeAreaView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';

import { GameProvider } from '../context/GameContext';
import GameBoard from '../components/GameBoard';
import OnboardingOverlay from '../components/OnboardingOverlay';
import { getOnboardingViewed, saveOnboardingViewed } from '../utils/storage';

export default function App() {
  const [showRules, setShowRules] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  
  useEffect(() => {
    async function checkOnboarding() {
      const viewed = await getOnboardingViewed();
      if (!viewed) {
        setShowRules(true);
      }
      setInitialLoad(false);
    }
    checkOnboarding();
  }, []);
  
  const handleDismissRules = async () => {
    setShowRules(false);
    await saveOnboardingViewed();
  };
  
  const handleShowRules = () => {
    setShowRules(true);
  };

  if (initialLoad) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <GestureHandlerRootView style={styles.container}>
        <StatusBar style="light" />
        <GameProvider>
          <GameBoard onShowRules={handleShowRules} />
          <OnboardingOverlay 
            visible={showRules} 
            onDismiss={handleDismissRules} 
          />
        </GameProvider>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#222639',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
  },
});