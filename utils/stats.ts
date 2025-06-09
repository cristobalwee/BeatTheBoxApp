import AsyncStorage from '@react-native-async-storage/async-storage';

const STATS_KEY = 'user_stats';
const STATS_VERSION = 2; // Increment this if you change the structure

export interface UserStats {
  version?: number;
  gamesPlayed: number;
  gamesWon: number;
  bestPilesRemaining: number;
  longestWinStreak: number;
  currentWinStreak: number;
  longestGuessStreak: number;
  currentGuessStreak: number;
  highScore: number;
  modeStats: {
    [mode: string]: {
      gamesPlayed: number;
      gamesWon: number;
    };
  };
}

function getDefaultStats(): UserStats {
  return {
    version: STATS_VERSION,
    gamesPlayed: 0,
    gamesWon: 0,
    bestPilesRemaining: 0,
    longestWinStreak: 0,
    currentWinStreak: 0,
    longestGuessStreak: 0,
    currentGuessStreak: 0,
    highScore: 0,
    modeStats: {
      casual: { gamesPlayed: 0, gamesWon: 0 },
      standard: { gamesPlayed: 0, gamesWon: 0 },
      brutal: { gamesPlayed: 0, gamesWon: 0 },
    },
  };
}

export async function getStats(): Promise<UserStats> {
  const statsString = await AsyncStorage.getItem(STATS_KEY);
  let stats: UserStats = getDefaultStats();

  if (statsString) {
    try {
      const parsed = JSON.parse(statsString);
      // Migrate or fill missing fields
      stats = { ...stats, ...parsed };
      // Ensure all modeStats exist
      stats.modeStats = stats.modeStats || {};
      ['casual', 'standard', 'brutal'].forEach(mode => {
        if (!stats.modeStats[mode]) {
          stats.modeStats[mode] = { gamesPlayed: 0, gamesWon: 0 };
        }
      });
      // Add any other migration logic here if you change the structure in the future
      // Update version if missing or outdated
      if (!stats.version || stats.version < STATS_VERSION) {
        stats.version = STATS_VERSION;
        await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
      }
    } catch (e) {
      // If parsing fails, reset to default
      stats = getDefaultStats();
      await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
    }
  } else {
    // No stats found, save defaults
    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
  }

  return stats;
}

export async function updateStatsOnGameEnd(isWin: boolean, pilesRemaining: number, mode: string, guessStreak: number, score?: number) {
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
  if (score !== undefined && score > (stats.highScore || 0)) {
    stats.highScore = score;
  }
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