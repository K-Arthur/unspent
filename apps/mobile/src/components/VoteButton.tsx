import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors } from '../constants/colors';

interface VoteButtonProps {
  type: 'buy' | 'pass' | 'dupe';
  onPress: () => void;
  selected?: boolean;
  disabled?: boolean;
}

export function VoteButton({ type, onPress, selected, disabled }: VoteButtonProps) {
  const labels = {
    buy: { text: '🟢 Buy', color: colors.buy },
    pass: { text: '🟡 Pass', color: colors.pass },
    dupe: { text: '🔵 Dupe it', color: colors.dupe },
  };

  return (
    <Pressable
      style={[
        styles.button,
        { backgroundColor: labels[type].color },
        selected && styles.selected,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.text}>{labels[type].text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    borderWidth: 3,
    borderColor: colors.text,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
});