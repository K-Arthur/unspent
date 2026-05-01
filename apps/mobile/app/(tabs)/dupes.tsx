import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl, Image, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/hooks/useAuthStore';
import { useDupeStore } from '../../src/hooks/useDupeStore';
import { colors } from '../../src/constants/colors';
import { DupeCard } from '../../src/components/DupeCard';
import { LockedFeature } from '../../src/components/LockedFeature';

export default function DupesScreen() {
  const router = useRouter();
  const { user, isAuthenticated, isPremium } = useAuthStore();
  const { dupes, isLoading, refreshDupes, fetchDupes } = useDupeStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDupes();
    }
  }, [isAuthenticated]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshDupes();
    setRefreshing(false);
  };

  const handleUpgrade = () => {
    router.push('/upgrade');
  };

  const handleDupePress = (dupe: { id: string; link: string | null; affiliateLink?: string | null }) => {
    const url = dupe.affiliateLink ?? dupe.link;
    if (url) {
      Linking.openURL(url);
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.promptContainer}>
          <Text style={styles.title}>Dupe Finder</Text>
          <Text style={styles.subtitle}>
            Find cheaper alternatives to your wishlist items
          </Text>
          <Pressable style={styles.ctaButton} onPress={() => router.push('/onboarding')}>
            <Text style={styles.ctaButtonText}>Sign In to Use</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Dupe Finder</Text>
          <Text style={styles.subtitle}>
            Cheaper alternatives suggested by the community
          </Text>
        </View>

        {!isPremium && dupes.length > 0 && (
          <LockedFeature
            message="Unlock unlimited dupe lookups"
            onUpgrade={handleUpgrade}
          />
        )}

        <View style={styles.disclosure}>
          <Text style={styles.disclosureText}>
            We may earn a small commission if you buy through these links, at no extra cost to you.
            This helps keep Unspent free.
          </Text>
        </View>

        {dupes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No dupes found yet</Text>
            <Text style={styles.emptyStateText}>
              Vote "Dupe it" on items in court to get alternative suggestions
            </Text>
          </View>
        ) : (
          dupes.map((dupe) => (
            <DupeCard
              key={dupe.id}
              dupe={dupe}
              onPress={() => handleDupePress(dupe)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  disclosure: {
    backgroundColor: colors.accent,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  disclosureText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginTop: 24,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  promptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
