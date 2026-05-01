import { Text, StyleSheet, Pressable } from 'react-native';
import { colors } from '../constants/colors';

const voteConfig = {
  buy: {
    bg: '#E8F5E9',
    text: '#2E7D32',
    emoji: '✅',
    label: 'Buy',
    accessibilityLabel: 'Vote to buy',
  },
  pass: {
    bg: '#FFF3E0',
    text: '#E65100',
    emoji: '⏸️',
    label: 'Pass',
    accessibilityLabel: 'Vote to pass',
  },
  dupe: {
    bg: '#E3F2FD',
    text: '#0D47A1',
    emoji: '🔎',
    label: 'Dupe it',
    accessibilityLabel: 'Vote for a dupe',
  },
} as const;

interface VoteButtonProps {
  type: 'buy' | 'pass' | 'dupe';
  onPress: () => void;
  selected?: boolean;
  disabled?: boolean;
}

export function VoteButton({ type, onPress, selected, disabled }: VoteButtonProps) {
  const config = voteConfig[type];

  return (
    <Pressable
      style={[
        styles.button,
        { backgroundColor: config.bg },
        selected && styles.selected,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={config.accessibilityLabel}
      accessibilityState={{ selected: !!selected, disabled: !!disabled }}
    >
      <Text style={styles.emoji}>{config.emoji}</Text>
      <Text style={[styles.label, { color: config.text }]}>{config.label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 4,
  },
  selected: {
    borderWidth: 2,
    borderColor: colors.text,
  },
  disabled: {
    opacity: 0.35,
  },
  emoji: {
    fontSize: 22,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
  },
});