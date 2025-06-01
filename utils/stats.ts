import AsyncStorage from '@react-native-async-storage/async-storage';

const STATS_KEY = 'user_stats';

export interface UserStats {
  gamesPlayed: number;
  gamesWon: number;
  bestPilesRemaining: number;
}

export async function getStats(): Promise<UserStats> {
  const statsString = await AsyncStorage.getItem(STATS_KEY);
  if (statsString) {
    return JSON.parse(statsString);
  }
  return { gamesPlayed: 0, gamesWon: 0, bestPilesRemaining: 0 };
}

export async function updateStatsOnGameEnd(isWin: boolean, pilesRemaining: number) {
  const stats = await getStats();
  stats.gamesPlayed += 1;
  if (isWin) {
    stats.gamesWon += 1;
    if (pilesRemaining > stats.bestPilesRemaining) {
      stats.bestPilesRemaining = pilesRemaining;
    }
  }
  await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export async function resetStats() {
  await AsyncStorage.removeItem(STATS_KEY);
} 