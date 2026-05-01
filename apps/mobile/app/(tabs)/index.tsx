import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/hooks/useAuthStore';
import { useWishlistStore } from '../../src/hooks/useWishlistStore';
import { colors } from '../../src/constants/colors';
import { CountdownTimer } from '../../src/components/CountdownTimer';
import { WishCard } from '../../src/components/WishCard';
import { AnimatedNumber } from '../../src/components/AnimatedNumber';
import { FAB } from '../../src/components/FAB';

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { items, isLoading: itemsLoading, refreshItems, fetchItems } = useWishlistStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchItems();
    }
  }, [isAuthenticated, user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshItems();
    setRefreshing(false);
  };

  const handleAddItem = () => {
    router.push('/add-item');
  };

  const handleItemPress = (itemId: string) => {
    router.push(`/item/${itemId}`);
  };

  const activeItems = items.filter((item) => item.status === 'cooling_off');
  const expiredItems = items.filter((item) => item.status === 'expired');
  const purchasedItems = items.filter((item) => item.status === 'purchased');

  const totalSaved = activeItems.reduce((sum, item) => sum + (item.price || 0), 0);

  if (!isAuthenticated && !authLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.onboardingPrompt}>
          <Text style={styles.title}>Welcome to Unspent</Text>
          <Text style={styles.subtitle}>
            Turn impulse-buy regret into savings wins
          </Text>
          <Pressable style={styles.ctaButton} onPress={() => router.push('/onboarding')}>
            <Text style={styles.ctaButtonText}>Get Started</Text>
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
          <Text style={styles.greeting}>Hey! 👋</Text>
          <Text style={styles.subtitle}>Here's your wish wall</Text>
        </View>

        <View style={styles.savingsCard}>
          <View style={styles.savingsHeader}>
            <Text style={styles.savingsLabel}>Total Saved</Text>
            <Text style={styles.savingsBadge}>🎉</Text>
          </View>
          <AnimatedNumber
            value={totalSaved}
            prefix="$"
            style={styles.savingsAmount}
          />
          <Text style={styles.savingsSubtext}>from passed items</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>In Cooling Off ({activeItems.length})</Text>
          {activeItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No items cooling off</Text>
              <Text style={styles.emptyStateSubtext}>Add a wish to get started</Text>
            </View>
          ) : (
            activeItems.map((item) => (
              <WishCard
                key={item.id}
                item={item}
                onPress={() => handleItemPress(item.id)}
              />
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expired ({expiredItems.length})</Text>
          {expiredItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No expired items</Text>
            </View>
          ) : (
            expiredItems.slice(0, 3).map((item) => (
              <WishCard
                key={item.id}
                item={item}
                onPress={() => handleItemPress(item.id)}
              />
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Purchased ({purchasedItems.length})</Text>
          {purchasedItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No purchases yet</Text>
            </View>
          ) : (
            purchasedItems.slice(0, 3).map((item) => (
              <WishCard
                key={item.id}
                item={item}
                onPress={() => handleItemPress(item.id)}
              />
            ))
          )}
        </View>
      </ScrollView>

      <FAB onPress={handleAddItem} icon="+" />
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
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  savingsCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  savingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  savingsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  savingsBadge: {
    fontSize: 20,
    marginLeft: 8,
  },
  savingsAmount: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.text,
  },
  savingsSubtext: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.8,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  onboardingPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
});