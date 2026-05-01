import { Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../src/constants/colors';

export default function InvitesScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Invite friends' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Invite friends</Text>
        <Text style={styles.subtitle}>Referral and invite flows will land in Phase 5.</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: colors.textSecondary,
  },
});
