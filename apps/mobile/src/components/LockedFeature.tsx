import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors } from '../constants/colors';

interface LockedFeatureProps {
  message: string;
  onUpgrade: () => void;
}

export function LockedFeature({ message, onUpgrade }: LockedFeatureProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.lock}>🔒</Text>
      <Text style={styles.message}>{message}</Text>
      <Pressable style={styles.upgradeButton} onPress={onUpgrade}>
        <Text style={styles.upgradeText}>Unlock</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  lock: {
    fontSize: 32,
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  upgradeButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  upgradeText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});