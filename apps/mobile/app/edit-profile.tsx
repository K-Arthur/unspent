import { Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../src/constants/colors';

export default function EditProfileScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Edit profile' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Edit profile</Text>
        <Text style={styles.subtitle}>Profile editing will be connected in Phase 1.</Text>
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
