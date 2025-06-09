import React from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { COLORS } from '../constants/colors';
import BottomSheet from './BottomSheet';

interface OnboardingOverlayProps {
  visible: boolean;
  onDismiss: () => void;
}

const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({ visible, onDismiss }) => {
  return (
    <BottomSheet visible={visible} onClose={onDismiss} snapPoints={[0.9]}>
        <View 
          style={styles.scrollView}
        >
          <Text style={styles.title}>How to Play</Text>
          <Text style={styles.paragraph}>
            Beat the Box is a card game where your goal is to correctly guess whether the next card 
            from the deck will be higher, lower, or the same value as the current card.
          </Text>

          <Text style={styles.sectionTitle}>Controls:</Text>
          <Text style={styles.paragraph}>
            👆 Tap a card to see options (Higher, Lower, Same)
          </Text>
          <Text style={styles.paragraph}>
            ⬆️ Swipe up on a card to guess higher
          </Text>
          <Text style={styles.paragraph}>
            ⬇️ Swipe down on a card to guess lower
          </Text>

          <Text style={styles.sectionTitle}>Difficulty modes:</Text>
          <Text style={styles.paragraph}>
            <Text style={{ fontWeight: 'bold'}}>Casual</Text> – 1 life, take it easy.
          </Text>
          <Text style={styles.paragraph}>
            <Text style={{ fontWeight: 'bold'}}>Standard</Text> – 0 lives, tread lightly.
          </Text>
          <Text style={styles.paragraph}>
            <Text style={{ fontWeight: 'bold'}}>Brutal</Text> – 0 lives, 2 decks, no mercy.
          </Text>
          
          <Text style={styles.sectionTitle}>Rules:</Text>
          <Text style={styles.paragraph}>
            • A deck of 52 cards is shuffled and 9 cards are dealt in a 3x3 grid.
          </Text>
          <Text style={styles.paragraph}>
            • For each pile, guess if the next card will be higher, lower, or the same value.
          </Text>
          <Text style={styles.paragraph}>
            • If you guess correctly, the card is added to the pile.
          </Text>
          <Text style={styles.paragraph}>
            • Bonus: guessing the same value correctly gives you 1 extra life.
          </Text>
          <Text style={styles.paragraph}>
            • If you guess incorrectly, the pile is flipped over and can no longer be used.
          </Text>
          <Text style={styles.paragraph}>
            • You win if you successfully deal all 52 cards.
          </Text>
          <Text style={styles.paragraph}>
            • You lose if all piles are flipped over before the deck is empty.
          </Text>

          <Text style={styles.sectionTitle}>Point Scoring:</Text>
          <Text style={styles.paragraph}>
            • Every correct guess is +10 points.
          </Text>
          <Text style={styles.paragraph}>
            • After 3 correct guesses, points are multiplied by the length of the streak (i.e +10 x2)
          </Text>
          <Text style={styles.paragraph}>
            • Winning the game gives you +100 points.
          </Text>
          <Text style={styles.paragraph}>
            • Every flipped pile counts for -10 points at the end of each game.
          </Text>
          
          <Text style={styles.sectionTitle}>Card Values:</Text>
          <Text style={styles.paragraph}>
            A (Ace) = 1, 2-10 = face value, J (Jack) = 11, Q (Queen) = 12, K (King) = 13
          </Text>
        </View>
        
        <View style={styles.footer}>
          <Pressable style={styles.dismissButton} onPress={onDismiss}>
            <Text style={styles.dismissButtonText}>Got it</Text>
          </Pressable>
        </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 16,
    fontFamily: 'VT323',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 12,
    fontFamily: 'VT323',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'VT323',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  footer: {
    padding: 24,
    paddingTop: 8,
  },
  dismissButton: {
    backgroundColor: COLORS.button.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  dismissButtonText: {
    color: COLORS.text.primary,
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'VT323',
  },
});

export default OnboardingOverlay;