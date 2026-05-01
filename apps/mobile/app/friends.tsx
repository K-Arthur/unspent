import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, FlatList, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useFriendsStore } from '../src/hooks/useFriendsStore';
import { useAuthStore } from '../src/hooks/useAuthStore';
import { colors } from '../src/constants/colors';
import { Avatar } from '../src/components/Avatar';

export default function FriendsScreen() {
  const router = useRouter();
  const { friends, pendingRequests, isLoading, fetchFriends, searchUsers, sendRequest, respondToRequest } = useFriendsStore();
  const { isAuthenticated } = useAuthStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFriends();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const search = setTimeout(async () => {
      if (searchQuery.trim().length >= 3) {
        setSearching(true);
        const results = await searchUsers(searchQuery);
        setSearchResults(results);
        setSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(search);
  }, [searchQuery]);

  const handleSendRequest = async (userId: string) => {
    const { error } = await sendRequest(userId);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Request Sent', 'Friend request sent!');
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const handleRespond = async (requesterId: string, accept: boolean) => {
    const { error } = await respondToRequest(requesterId, accept);
    if (error) {
      Alert.alert('Error', error.message);
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.prompt}>
          <Text style={styles.title}>Friends</Text>
          <Text style={styles.subtitle}>Sign in to add friends</Text>
          <Pressable style={styles.button} onPress={() => router.push('/onboarding')}>
            <Text style={styles.buttonText}>Sign In</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by username..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
        />
        
        {searchResults.length > 0 && (
          <View style={styles.searchResults}>
            {searchResults.map((user) => (
              <Pressable
                key={user.id}
                style={styles.resultItem}
                onPress={() => handleSendRequest(user.id)}
              >
                <Avatar uri={user.avatarUrl} name={user.username} size={40} />
                <View style={styles.resultInfo}>
                  <Text style={styles.resultUsername}>@{user.username}</Text>
                  {user.fullName && (
                    <Text style={styles.resultName}>{user.fullName}</Text>
                  )}
                </View>
                <Text style={styles.addButton}>+ Add</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {pendingRequests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Friend Requests</Text>
          {pendingRequests.map((request) => (
            <View key={request.id} style={styles.requestItem}>
              <Avatar uri={request.avatarUrl} name={request.username} size={40} />
              <View style={styles.requestInfo}>
                <Text style={styles.requestUsername}>@{request.username}</Text>
              </View>
              <View style={styles.requestButtons}>
                <Pressable
                  style={[styles.requestButton, styles.acceptButton]}
                  onPress={() => handleRespond(request.id, true)}
                >
                  <Text style={styles.acceptText}>Accept</Text>
                </Pressable>
                <Pressable
                  style={[styles.requestButton, styles.rejectButton]}
                  onPress={() => handleRespond(request.id, false)}
                >
                  <Text style={styles.rejectText}>Decline</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Friends ({friends.length})</Text>
        
        {friends.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No friends yet</Text>
            <Text style={styles.emptySubtext}>
              Search for friends by username to connect
            </Text>
          </View>
        ) : (
          <FlatList
            data={friends}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable style={styles.friendItem}>
                <Avatar uri={item.avatarUrl} name={item.username} size={48} />
                <View style={styles.friendInfo}>
                  <Text style={styles.friendUsername}>@{item.username}</Text>
                  {item.fullName && (
                    <Text style={styles.friendName}>{item.fullName}</Text>
                  )}
                </View>
              </Pressable>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchSection: {
    padding: 16,
  },
  searchInput: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  searchResults: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.accent,
  },
  resultInfo: {
    flex: 1,
    marginLeft: 12,
  },
  resultUsername: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  resultName: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  addButton: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  section: {
    padding: 16,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 8,
  },
  requestInfo: {
    flex: 1,
    marginLeft: 12,
  },
  requestUsername: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  requestButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  requestButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  acceptButton: {
    backgroundColor: '#2E7D32',
  },
  acceptText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.surface,
  },
  rejectButton: {
    backgroundColor: colors.accent,
  },
  rejectText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 8,
  },
  friendInfo: {
    flex: 1,
    marginLeft: 12,
  },
  friendUsername: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  friendName: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  prompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
