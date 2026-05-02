import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/hooks/useAuthStore';
import { useCourtStore } from '../../src/hooks/useCourtStore';
import { colors } from '../../src/constants/colors';
import { CourtCard } from '../../src/components/CourtCard';

export default function CourtScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { courtItems, refreshCourtItems, fetchCourtItems } = useCourtStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCourtItems();
    }
  }, [isAuthenticated]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshCourtItems();
    setRefreshing(false);
  };

  const handleItemPress = (itemId: string) => {
    router.push(`/court/${itemId}`);
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.promptContainer}>
          <Text style={styles.title}>The Court</Text>
          <Text style={styles.subtitle}>
            Join your friends to vote on wishlist items
          </Text>
          <Pressable style={styles.ctaButton} onPress={() => router.push('/onboarding')}>
            <Text style={styles.ctaButtonText}>Sign In to Join</Text>
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
          <Text style={styles.title}>The Court</Text>
          <Text style={styles.subtitle}>
            Community votes on cooling-off items
          </Text>
        </View>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#2E7D32' }]} />
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#E65100' }]} />
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#0D47A1' }]} />
            <Text style={styles.legendText}>Dupe it</Text>
          </View>
        </View>

        {courtItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No items in court</Text>
            <Text style={styles.emptyStateText}>
              Add items to your wish wall and put them up for community voting
            </Text>
          </View>
        ) : (
          courtItems.map((item) => (
            <CourtCard
              key={item.id}
              item={item}
              onPress={() => handleItemPress(item.id)}
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
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 24,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
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
