import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Pressable, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/colors';
import BottomSheet from './BottomSheet';
import { getStats, resetStats, UserStats } from '../utils/stats';

interface StatsOverlayProps {
  visible: boolean;
  onDismiss: () => void;
}

const StatsOverlay: React.FC<StatsOverlayProps> = ({ visible, onDismiss }) => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  const loadStats = async () => {
    setLoading(true);
    const s = await getStats();
    setStats(s);
    setLoading(false);
  };

  useEffect(() => {
    if (visible) {
      loadStats();
    }
  }, [visible]);

  const handleReset = async () => {
    setResetting(true);
    await resetStats();
    await loadStats();
    setResetting(false);
  };

  const winPercentage = stats && stats.gamesPlayed > 0
    ? ((stats.gamesWon / stats.gamesPlayed) * 100).toFixed(1)
    : '0';

  return (
    <BottomSheet visible={visible} onClose={onDismiss} snapPoints={[0.45]}>
      <View style={styles.container}>
        <Text style={styles.title}>Your Stats</Text>
        {loading || !stats ? (
          <ActivityIndicator color={COLORS.button.primary} />
        ) : (
          <>
            <Text style={styles.stat}>Games Played: <Text style={styles.value}>{stats.gamesPlayed}</Text></Text>
            <Text style={styles.stat}>Games Won: <Text style={styles.value}>{stats.gamesWon}</Text></Text>
            <Text style={styles.stat}>Win %: <Text style={styles.value}>{winPercentage}</Text></Text>
            <Text style={styles.stat}>Best Piles Remaining: <Text style={styles.value}>{stats.bestPilesRemaining}</Text></Text>
            <Pressable style={styles.resetButton} onPress={handleReset} disabled={resetting}>
              <Text style={styles.resetButtonText}>{resetting ? 'Resetting...' : 'Reset Stats'}</Text>
            </Pressable>
          </>
        )}
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 16,
    fontFamily: 'VT323',
  },
  stat: {
    fontSize: 20,
    color: COLORS.text.secondary,
    marginBottom: 10,
    fontFamily: 'VT323',
  },
  value: {
    color: COLORS.text.primary,
    fontWeight: 'bold',
  },
  resetButton: {
    marginTop: 24,
    backgroundColor: COLORS.button.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  resetButtonText: {
    color: COLORS.text.primary,
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'VT323',
  },
});

export default StatsOverlay; 