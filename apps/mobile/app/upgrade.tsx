import { useState } from 'react';
import { Alert, View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useAuthStore } from '../src/hooks/useAuthStore';
import { useSubscriptionStore } from '../src/hooks/useSubscriptionStore';
import { colors } from '../src/constants/colors';
import { SUBSCRIPTION_PLANS } from '@unspent/shared/constants';

export default function UpgradeScreen() {
  const router = useRouter();
  const { isPremium } = useAuthStore();
  const { createCheckoutSession, isLoading } = useSubscriptionStore();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');

  const handleSubscribe = async () => {
    const { url, error } = await createCheckoutSession(selectedPlan);

    if (error) {
      Alert.alert('Checkout unavailable', error.message);
      return;
    }

    if (url) {
      await WebBrowser.openAuthSessionAsync(url, 'unspent://upgrade');
    }
  };

  if (isPremium) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.emoji}>👑</Text>
          <Text style={styles.title}>You're Premium!</Text>
          <Text style={styles.subtitle}>
            Thank you for supporting Unspent
          </Text>
        </View>

        <View style={styles.featuresList}>
          {Object.entries({
            'Unlimited friends': 'Connect with as many friends as you want',
            'Unlimited dupe lookups': 'Find cheaper alternatives anytime',
            'Premium share cards': 'Share your savings wins in style',
            'Priority support': 'Get help faster when you need it',
          }).map(([feature, description]) => (
            <View key={feature} style={styles.featureItem}>
              <Text style={styles.featureCheck}>✓</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureName}>{feature}</Text>
                <Text style={styles.featureDesc}>{description}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.emoji}>✨</Text>
        <Text style={styles.title}>Unlock Premium</Text>
        <Text style={styles.subtitle}>
          Get the most out of Unspent
        </Text>
      </View>

      <View style={styles.planSelector}>
        <Pressable
          style={[
            styles.planCard,
            selectedPlan === 'monthly' && styles.planCardSelected,
          ]}
          onPress={() => setSelectedPlan('monthly')}
        >
          <View style={styles.planHeader}>
            <Text style={styles.planName}>Monthly</Text>
            <Text style={styles.planPrice}>
              ${SUBSCRIPTION_PLANS.monthly.price / 100}/mo
            </Text>
          </View>
          {selectedPlan === 'monthly' && (
            <View style={styles.planCheck}>
              <Text style={styles.planCheckText}>✓</Text>
            </View>
          )}
        </Pressable>

        <Pressable
          style={[
            styles.planCard,
            selectedPlan === 'yearly' && styles.planCardSelected,
          ]}
          onPress={() => setSelectedPlan('yearly')}
        >
          <View style={styles.planHeader}>
            <View>
              <Text style={styles.planName}>Yearly</Text>
              <Text style={styles.savingsBadge}>Save 33%</Text>
            </View>
            <Text style={styles.planPrice}>
              ${SUBSCRIPTION_PLANS.yearly.price / 100}/yr
            </Text>
          </View>
          {selectedPlan === 'yearly' && (
            <View style={styles.planCheck}>
              <Text style={styles.planCheckText}>✓</Text>
            </View>
          )}
        </Pressable>
      </View>

      <View style={styles.featuresList}>
        {Object.entries({
          'Unlimited friends': 'Connect with as many friends as you want',
          'Unlimited dupe lookups': 'Find cheaper alternatives anytime',
          'Premium share cards': 'Share your savings wins in style',
          'Priority support': 'Get help faster when you need it',
        }).map(([feature, description]) => (
          <View key={feature} style={styles.featureItem}>
            <Text style={styles.featureCheck}>✓</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureName}>{feature}</Text>
              <Text style={styles.featureDesc}>{description}</Text>
            </View>
          </View>
        ))}
      </View>

      <Pressable
        style={[styles.subscribeButton, isLoading && styles.subscribeButtonDisabled]}
        onPress={handleSubscribe}
        disabled={isLoading}
      >
        <Text style={styles.subscribeButtonText}>
          {isLoading ? 'Loading...' : `Subscribe for $${selectedPlan === 'monthly' ? SUBSCRIPTION_PLANS.monthly.price / 100 : SUBSCRIPTION_PLANS.yearly.price / 100}`}
        </Text>
      </Pressable>

      <Text style={styles.disclaimer}>
        Cancel anytime. Subscription renews automatically.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  planSelector: {
    gap: 12,
    marginBottom: 24,
  },
  planCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  planCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  planHeader: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  savingsBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 4,
  },
  planCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planCheckText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  featuresList: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  featureCheck: {
    fontSize: 18,
    color: '#2E7D32',
    marginRight: 12,
  },
  featureText: {
    flex: 1,
  },
  featureName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  featureDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  subscribeButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  subscribeButtonDisabled: {
    opacity: 0.6,
  },
  subscribeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  disclaimer: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
