import { Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../src/constants/colors';

export default function ReceiptsScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Savings receipts' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Savings receipts</Text>
        <Text style={styles.subtitle}>Receipt export is reserved for the monetization phase.</Text>
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
