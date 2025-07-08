import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import {
//   InterstitialAd,
//   AdEventType,
//   TestIds,
// } from 'react-native-google-mobile-ads';

const GAMES_PLAYED_KEY = 'games_played_count';
const AD_INTERVAL = 2; // Show ad every 2 games

// Your actual ad unit IDs - replace with your real IDs
// const AD_UNIT_IDS = {
//   ios: __DEV__ 
//     ? TestIds.INTERSTITIAL 
//     : 'ca-app-pub-4969606297904886~5150724012', // Replace with your iOS interstitial ID
//   android: __DEV__ 
//     ? TestIds.INTERSTITIAL 
//     : 'ca-app-pub-4969606297904886~3347511713', // Replace with your Android interstitial ID
// };

// let interstitialAd: InterstitialAd | null = null;
// let isAdLoaded = false;

export const initializeAds = () => {
  // Temporarily disabled for Expo Go compatibility
  // react-native-google-mobile-ads requires a development build
  console.log('Ads initialization disabled - requires development build');
  return;
  
  // const adUnitId = Platform.select(AD_UNIT_IDS);
  // if (!adUnitId) return;

  // console.log('Initializing ads with unit ID:', adUnitId);
  
  // interstitialAd = InterstitialAd.createForAdRequest(adUnitId, {
  //   requestNonPersonalizedAdsOnly: true,
  //   keywords: ['game', 'card game', 'puzzle'],
  // });

  // const unsubscribeLoaded = interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
  //   console.log('Interstitial ad loaded');
  //   isAdLoaded = true;
  // });

  // const unsubscribeClosed = interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
  //   console.log('Interstitial ad closed');
  //   isAdLoaded = false;
  //   // Load the next ad
  //   loadAd();
  // });

  // const unsubscribeError = interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
  //   console.error('Interstitial ad error:', error);
  //   isAdLoaded = false;
  // });

  // // Load the first ad
  // loadAd();

  // // Return cleanup function
  // return () => {
  //   unsubscribeLoaded();
  //   unsubscribeClosed();
  //   unsubscribeError();
  // };
};

export const loadAd = () => {
  // Temporarily disabled for Expo Go compatibility
  console.log('Ad loading disabled - requires development build');
  return;
  
  // if (!interstitialAd) {
  //   console.log('Interstitial ad not initialized');
  //   return;
  // }

  // console.log('Loading interstitial ad...');
  // interstitialAd.load();
};

export const showAd = async (): Promise<boolean> => {
  // Temporarily disabled for Expo Go compatibility
  console.log('Ad showing disabled - requires development build');
  return false;
  
  // if (!interstitialAd) {
  //   console.log('Interstitial ad not initialized');
  //   return false;
  // }

  // if (!isAdLoaded) {
  //   console.log('Interstitial ad not loaded');
  //   return false;
  // }

  // try {
  //   console.log('Showing interstitial ad...');
  //   await interstitialAd.show();
  //   return true;
  // } catch (error) {
  //   console.error('Error showing ad:', error);
  //   return false;
  // }
};

export const incrementGamesPlayed = async (): Promise<boolean> => {
  try {
    const gamesPlayed = await AsyncStorage.getItem(GAMES_PLAYED_KEY);
    const newCount = (parseInt(gamesPlayed || '0') + 1) % AD_INTERVAL;
    await AsyncStorage.setItem(GAMES_PLAYED_KEY, newCount.toString());
    return newCount === 0; // Return true if it's time to show an ad
  } catch (error) {
    console.error('Error incrementing games played:', error);
    return false;
  }
};

// Banner ad unit IDs for future use
export const getBannerAdUnitId = () => {
  return Platform.select({
    ios: __DEV__ ? TestIds.BANNER : 'ca-app-pub-4969606297904886~5150724012', // Replace with your iOS banner ID
    android: __DEV__ ? TestIds.BANNER : 'ca-app-pub-4969606297904886~3347511713', // Replace with your Android banner ID
  });
}; 