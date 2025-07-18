import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, Platform, Image } from 'react-native';
import { CircleHelp, ChartNoAxesColumn, Flame } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, FadeInDown, FadeOutUp } from 'react-native-reanimated';
``
import { useGameContext } from '../context/GameContext';
import CardPile from './CardPile';
import DeckCounter from './DeckCounter';
import { COLORS } from '../constants/colors';
import { GuessType } from '../types/game';
import GameOverModal from './GameOverModal';
import ConfirmationModal from './ConfirmationModal';
import { isGuessCorrect } from '../utils/card';
import StatsOverlay from './StatsOverlay';
import { updateStatsOnGameEnd } from '../utils/stats';
import { useReduceMotion } from '../hooks/useReduceMotion';
import { initializeAds, loadAd, showAd, incrementGamesPlayed } from '../utils/ads';

interface GameBoardProps {
  onShowRules: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ onShowRules }) => {
  const {
    piles,
    gameState,
    remainingCards,
    startNewGame,
    makeGuess,
    selectPile,
    selectedPileIndex,
    unselectPile,
    endZenGame,
    deck,
    mode,
    lives,
    guessStreak,
    longestGuessStreak,
    score,
    highScore,
  } = useGameContext();

  const [feedbackPileIndex, setFeedbackPileIndex] = useState<number | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<boolean | null>(null);
  const [showNewGameConfirm, setShowNewGameConfirm] = useState(false);
  const [showStatsOverlay, setShowStatsOverlay] = useState(false);
  const [showStreakToast, setShowStreakToast] = useState(false);
  const [streakToastValue, setStreakToastValue] = useState(0);
  const [showLifeToast, setShowLifeToast] = useState(false);
  const [lifeToastKey, setLifeToastKey] = useState(0);

  // Animated life counter
  const lifeScale = useSharedValue(1);
  const previousLives = React.useRef(lives);
  React.useEffect(() => {
    if (previousLives.current !== lives) {
      lifeScale.value = withTiming(1.2, { duration: 150 });
      setTimeout(() => {
        lifeScale.value = withTiming(1, { duration: 150, easing: Easing.elastic(1.2) });
      }, 150);
      previousLives.current = lives;
    }
  }, [lives]);
  const lifeCounterStyle = useAnimatedStyle(() => {
    return { transform: [{ scale: lifeScale.value }] };
  });

  // Animated score counter
  const scoreScale = useSharedValue(1);
  const previousScore = React.useRef(score);
  React.useEffect(() => {
    if (previousScore.current !== score) {
      scoreScale.value = withTiming(1.2, { duration: 150 });
      setTimeout(() => {
        scoreScale.value = withTiming(1, { duration: 150, easing: Easing.elastic(1.2) });
      }, 150);
      previousScore.current = score;
    }
  }, [score]);
  const scoreCounterStyle = useAnimatedStyle(() => {
    return { transform: [{ scale: scoreScale.value }] };
  });

  const reduceMotion = useReduceMotion();

  React.useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    let hapticTimeout: ReturnType<typeof setTimeout> | null = null;
    if (feedbackPileIndex !== null && guessStreak > 2) {
      setStreakToastValue(guessStreak);
      setShowStreakToast(true);
      hapticTimeout = setTimeout(() => {
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
        }
      }, 200);
      timeout = setTimeout(() => {
        setShowStreakToast(false);
      }, 2400);
    } else {
      setShowStreakToast(false);
    }
    return () => { 
      if (timeout) clearTimeout(timeout); 
      if (hapticTimeout) clearTimeout(hapticTimeout);
    };
  }, [feedbackPileIndex, guessStreak]);

  useEffect(() => {
    // Initialize ads when component mounts
    initializeAds();
    loadAd();
  }, []);

  const handleGuess = (pileIndex: number, guessType: GuessType) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const pile = piles[pileIndex];
    const topCard = pile.cards[pile.cards.length - 1];
    const nextCard = deck[0];
    let isCorrect = false;
    if (topCard && nextCard) {
      isCorrect = isGuessCorrect(topCard, nextCard, guessType);
    }
    if (isCorrect && guessType === 'same') {
      setShowLifeToast(true);
      setLifeToastKey(prev => prev + 1);
      if (Platform.OS !== 'web') {
        setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid), 200);
      }
      setTimeout(() => setShowLifeToast(false), 2400);
    }
    makeGuess(pileIndex, guessType);
    setTimeout(() => {
      setFeedbackPileIndex(pileIndex);
      setFeedbackSuccess(isCorrect);
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setTimeout(() => {
        setFeedbackPileIndex(null);
        setFeedbackSuccess(null);
      }, reduceMotion ? 700 : 800);
    }, reduceMotion ? 0 : 600);
  };

  const handleNewGameConfirm = async (won: boolean, pilesRemaining: number) => {
    updateStatsOnGameEnd(won, pilesRemaining, mode, guessStreak);
    setShowNewGameConfirm(false);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Check if we should show an ad
    const shouldShowAd = await incrementGamesPlayed();
    if (shouldShowAd) {
      await showAd();
    }

    startNewGame();
  };

  const handleBackgroundPress = () => {
    if (selectedPileIndex !== null) {
      unselectPile();
    }
  };

  const renderPiles = () => {
    const pileCount = piles.length;
    const gridStyle = pileCount === 4 ? styles.grid2x2 : styles.grid;
    const pileWrapperStyle = pileCount === 4 ? styles.pileWrapper2x2 : styles.pileWrapper;
    
    return (
      <View style={gridStyle}>
        {piles.map((pile, index) => (
          <View key={`pile-${index}`} style={pileWrapperStyle}>
            <CardPile
              pile={pile}
              index={index}
              onSelect={selectPile}
              onGuess={handleGuess}
              isSelected={selectedPileIndex === index}
              dealDelay={index}
              showFeedback={feedbackPileIndex === index && gameState !== 'idle'}
              feedbackSuccess={feedbackSuccess ?? false}
              guessStreak={feedbackPileIndex === index ? guessStreak : 0}
              showLifeToast={showLifeToast && feedbackPileIndex === index}
              gameState={gameState}
            />
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.backgroundPressable} onPress={handleBackgroundPress}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image source={require('../assets/images/glove.png')} style={{ width: 28, height: 28, marginRight: 8 }} />
            {/* <Animated.Text style={[styles.title, scoreCounterStyle]}>Score: {score}</Animated.Text> */}
            <Text style={styles.title}>Score: {score}</Text> 
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 16, gap: 4}}>
              <Animated.Text style={[{ fontFamily: 'VT323', fontSize: 28, fontWeight: 'bold', color: COLORS.text.primary }, lifeCounterStyle]}>
                {mode === 'zen' ? '∞' : lives}
              </Animated.Text>
              <Image source={require('../assets/images/heart.png')} style={{ width: 24, height: 24, marginRight: 4 }} />
            </View>
            <DeckCounter count={remainingCards} totalCards={52} mode={mode} />
          </View>
        </View>
        <View style={styles.boardContainer}>
          {renderPiles()}
        </View>
        <View style={styles.actions}>
          <Pressable
            style={[
              styles.newGameButton,
            ]}
            onPress={() => {
              if (mode === 'zen' && (gameState === 'playing' || gameState === 'guessing')) {
                endZenGame();
              } else {
                setShowNewGameConfirm(true);
              }
            }}
          >
            <Text style={[
              styles.buttonText
            ]}>
              {mode === 'zen' && (gameState === 'playing' || gameState === 'guessing') ? 'Finish Game' : 'New Game'}
            </Text>
          </Pressable>
          <View style={styles.buttonContainer}>
            <Pressable onPress={onShowRules} style={styles.tertiaryButton}>
              <CircleHelp size={20} color={COLORS.text.secondary} />
              <Text style={styles.tertiaryButtonText}>How to play</Text>
            </Pressable>
            <Pressable onPress={() => setShowStatsOverlay(true)} style={styles.tertiaryButton}>
              <ChartNoAxesColumn size={20} color={COLORS.text.secondary} />
              <Text style={styles.tertiaryButtonText}>Your stats</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
      <ConfirmationModal
        visible={showNewGameConfirm}
        title="Choose Difficulty"
        onCancel={() => setShowNewGameConfirm(false)}
        onSelectMode={(mode) => {
          setShowNewGameConfirm(false);
          startNewGame(mode);
        }}
      />
      {(gameState === 'win' || gameState === 'lose') && (
        <GameOverModal
          won={gameState === 'win'}
          onNewGame={startNewGame}
          pilesRemaining={piles.filter(p => !p.flipped).length}
          longestGuessStreak={longestGuessStreak}
          cardsRemaining={remainingCards}
          finalScore={score}
          mode={mode}
        />
      )}
      <StatsOverlay visible={showStatsOverlay} onDismiss={() => setShowStatsOverlay(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    fontFamily: 'VT323',
  },
  highScore: {
    fontSize: 18,
    color: COLORS.text.secondary,
    fontFamily: 'VT323',
    marginLeft: 12,
    marginTop: 8,
  },
  boardContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 0,
    height: '100%',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    aspectRatio: 1,
  },
  grid2x2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    aspectRatio: 1,
  },
  pileWrapper: {
    width: '30%',
    height: '40%',
    maxHeight: 280,
  },
  pileWrapper2x2: {
    width: '40%',
    height: '55%',
    maxHeight: 380,
  },
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
    alignItems: 'center',
    width: '100%',
  },
  newGameButton: {
    backgroundColor: COLORS.button.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  endGameButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    fontFamily: 'VT323',
  },
  endGameButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'VT323',
  },
  tertiaryButton: {
    marginTop: 12,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 16,
  },
  tertiaryButtonText: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textDecorationLine: 'underline',
  },
  backgroundPressable: {
    flex: 1,
  },
  lifeToast: {
    position: 'absolute',
    top: 24,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 6,
    zIndex: 200,
    shadowColor: '#111',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 120,
  },
  lifeToastText: {
    color: '#22C55E',
    fontWeight: 'bold',
    fontSize: 18,
    fontFamily: 'VT323',
  },
});

export default GameBoard;