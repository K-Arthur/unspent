import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthStore } from '../../src/hooks/useAuthStore';
import { Avatar } from '../../src/components/Avatar';
import { colors } from '../../src/constants/colors';

interface PublicProfile {
  id: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  totalSavedAmount: number;
}

export default function UserProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const router = useRouter();
  const { supabase } = useAuthStore();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!username || !supabase) return;

    const fetchProfile = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, bio, total_saved_amount')
        .eq('username', username)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setProfile({
          id: data.id,
          username: data.username,
          fullName: data.full_name,
          avatarUrl: data.avatar_url,
          bio: data.bio,
          totalSavedAmount: data.total_saved_amount,
        });
      }
      setIsLoading(false);
    };

    fetchProfile();
  }, [username, supabase]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (notFound || !profile) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFoundTitle}>User not found</Text>
        <Text style={styles.notFoundSubtitle}>@{username} doesn't exist</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: `@${username}` }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Avatar uri={profile.avatarUrl} name={profile.username} size={80} />
          <Text style={styles.username}>@{profile.username}</Text>
          {profile.fullName && <Text style={styles.fullName}>{profile.fullName}</Text>}
          {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              ${((profile.totalSavedAmount || 0) / 100).toFixed(0)}
            </Text>
            <Text style={styles.statLabel}>Total Saved</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 24,
  },
  content: {
    padding: 16,
    paddingBottom: 80,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  username: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
  },
  fullName: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  bio: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 24,
  },
  statsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  notFoundTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  notFoundSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
  },
  backButton: {
    marginTop: 24,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
