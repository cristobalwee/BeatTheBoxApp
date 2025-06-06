import AsyncStorage from '@react-native-async-storage/async-storage';

const STATS_KEY = 'user_stats';

export interface UserStats {
  gamesPlayed: number;
  gamesWon: number;
  bestPilesRemaining: number;
  longestWinStreak: number;
  currentWinStreak: number;
  longestGuessStreak: number;
  currentGuessStreak: number;
  modeStats: {
    [mode: string]: {
      gamesPlayed: number;
      gamesWon: number;
    };
  };
}

export async function getStats(): Promise<UserStats> {
  const statsString = await AsyncStorage.getItem(STATS_KEY);
  if (statsString) {
    return JSON.parse(statsString);
  }
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    bestPilesRemaining: 0,
    longestWinStreak: 0,
    currentWinStreak: 0,
    longestGuessStreak: 0,
    currentGuessStreak: 0,
    modeStats: {
      casual: { gamesPlayed: 0, gamesWon: 0 },
      risky: { gamesPlayed: 0, gamesWon: 0 },
      no_mercy: { gamesPlayed: 0, gamesWon: 0 },
    },
  };
}

export async function updateStatsOnGameEnd(isWin: boolean, pilesRemaining: number, mode: string, guessStreak: number) {
  const stats = await getStats();
  stats.gamesPlayed += 1;
  stats.modeStats[mode] = stats.modeStats[mode] || { gamesPlayed: 0, gamesWon: 0 };
  stats.modeStats[mode].gamesPlayed += 1;
  if (isWin) {
    stats.gamesWon += 1;
    stats.modeStats[mode].gamesWon += 1;
    stats.currentWinStreak += 1;
    if (stats.currentWinStreak > stats.longestWinStreak) {
      stats.longestWinStreak = stats.currentWinStreak;
    }
    if (pilesRemaining > stats.bestPilesRemaining) {
      stats.bestPilesRemaining = pilesRemaining;
    }
  } else {
    stats.currentWinStreak = 0;
  }
  // Guess streaks
  if (guessStreak > stats.longestGuessStreak) {
    stats.longestGuessStreak = guessStreak;
  }
  stats.currentGuessStreak = 0;
  await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export async function updateGuessStreak(isCorrect: boolean) {
  const stats = await getStats();
  if (isCorrect) {
    stats.currentGuessStreak += 1;
    if (stats.currentGuessStreak > stats.longestGuessStreak) {
      stats.longestGuessStreak = stats.currentGuessStreak;
    }
  } else {
    stats.currentGuessStreak = 0;
  }
  await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export async function resetStats() {
  await AsyncStorage.removeItem(STATS_KEY);
} 