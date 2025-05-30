import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_VIEWED_KEY = 'beatTheBox_onboardingViewed';

export const saveOnboardingViewed = async () => {
  try {
    await AsyncStorage.setItem(ONBOARDING_VIEWED_KEY, 'true');
    return true;
  } catch (error) {
    console.error('Error saving onboarding status:', error);
    return false;
  }
};

export const getOnboardingViewed = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_VIEWED_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error getting onboarding status:', error);
    return false;
  }
};