import { StyleSheet, Pressable, Text, View } from 'react-native';
import { colors } from '../constants/colors';

interface FABProps {
  onPress: () => void;
  icon?: string;
}

export function FAB({ onPress, icon = '+' }: FABProps) {
  return (
    <Pressable
      style={styles.fab}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Add new item"
      accessibilityHint="Opens form to add a new wish list item"
    >
      <Text style={styles.icon}>{icon}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    fontSize: 28,
    fontWeight: '300',
    color: colors.text,
  },
});