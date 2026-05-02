import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCourtStore } from '../../src/hooks/useCourtStore';
import { useAuthStore } from '../../src/hooks/useAuthStore';
import { colors } from '../../src/constants/colors';
import { CountdownTimer } from '../../src/components/CountdownTimer';
import { Avatar } from '../../src/components/Avatar';
import { VoteButton } from '../../src/components/VoteButton';

const REASON_OPTIONS = [
  { key: 'already_have', label: 'Already have something similar', emoji: '🔄' },
  { key: 'wait_for_sale', label: 'Wait for a sale', emoji: '⏰' },
  { key: 'bad_reviews', label: 'Has bad reviews', emoji: '⭐' },
  { key: 'too_expensive', label: 'Too expensive', emoji: '💸' },
  { key: 'found_cheaper', label: 'Found a cheaper option', emoji: '💰' },
  { key: 'dont_need', label: "Don't really need it", emoji: '🤔' },
];

export default function CourtItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { courtItems, voteOnItem } = useCourtStore();
  const { isAuthenticated } = useAuthStore();
  
  const [showReasons, setShowReasons] = useState(false);
  const [selectedVote, setSelectedVote] = useState<'buy' | 'pass' | 'dupe' | null>(null);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);

  const item = courtItems.find((i) => i.id === id);

  useEffect(() => {
    if (item?.userVote) {
      setSelectedVote(item.userVote);
    }
  }, [item]);

  if (!item) {
    return (
      <View style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Item not found</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const handleVote = async () => {
    if (!isAuthenticated) {
      router.push('/onboarding');
      return;
    }

    if (!selectedVote) {
      Alert.alert('Select Vote', 'Please select a vote option first');
      return;
    }

    setVoting(true);

    const { error } = await voteOnItem(item.id, selectedVote, selectedReason || undefined);

    setVoting(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    Alert.alert(
      'Vote Submitted! 🎉',
      `You voted to ${selectedVote.toUpperCase()} this item.`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const totalVotes = item.voteCounts.buy + item.voteCounts.pass + item.voteCounts.dupe;
  const hasVoted = item.userVote !== null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.userRow}>
          <Avatar uri={item.userAvatar} name={item.username} size={40} />
          <Text style={styles.username}>@{item.username}</Text>
        </View>
      </View>

      <View style={styles.itemCard}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
        ) : (
          <View style={[styles.itemImage, styles.placeholder]}>
            <Text style={styles.placeholderText}>📦</Text>
          </View>
        )}
        
        <View style={styles.itemDetails}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          {item.description && (
            <Text style={styles.itemDescription}>{item.description}</Text>
          )}
          <Text style={styles.itemPrice}>${(item.price / 100).toFixed(2)}</Text>
          
          <View style={styles.timer}>
            <Text style={styles.timerLabel}>Verdict in:</Text>
            <CountdownTimer endTime={item.cooldownEndsAt} />
          </View>
        </View>
      </View>

      <View style={styles.voteSection}>
        <Text style={styles.sectionTitle}>Your Vote</Text>
        
        {!isAuthenticated ? (
          <View style={styles.signInPrompt}>
            <Text style={styles.signInText}>
              Sign in to cast your vote and help your friend decide!
            </Text>
            <Pressable
              style={styles.signInButton}
              onPress={() => router.push('/onboarding')}
            >
              <Text style={styles.signInButtonText}>Sign In</Text>
            </Pressable>
          </View>
        ) : hasVoted && !showReasons ? (
          <View style={styles.votedState}>
            <Text style={styles.votedText}>
              You voted: <Text style={styles.votedType}>{item.userVote?.toUpperCase()}</Text>
            </Text>
            <Pressable
              style={styles.changeVoteButton}
              onPress={() => setShowReasons(true)}
            >
              <Text style={styles.changeVoteText}>Change Vote</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.voteButtons}>
              <VoteButton
                type="buy"
                onPress={() => {
                  setSelectedVote('buy');
                  setShowReasons(true);
                }}
                selected={selectedVote === 'buy'}
                disabled={false}
              />
              <VoteButton
                type="pass"
                onPress={() => {
                  setSelectedVote('pass');
                  setShowReasons(true);
                }}
                selected={selectedVote === 'pass'}
                disabled={false}
              />
              <VoteButton
                type="dupe"
                onPress={() => {
                  setSelectedVote('dupe');
                  setShowReasons(true);
                }}
                selected={selectedVote === 'dupe'}
                disabled={false}
              />
            </View>

            {showReasons && selectedVote && (
              <View style={styles.reasonsSection}>
                <Text style={styles.reasonsTitle}>
                  Why are you voting {selectedVote.toUpperCase()}?
                </Text>
                <View style={styles.reasonOptions}>
                  {REASON_OPTIONS.map((reason) => (
                    <Pressable
                      key={reason.key}
                      style={[
                        styles.reasonChip,
                        selectedReason === reason.key && styles.reasonChipSelected,
                      ]}
                      onPress={() => setSelectedReason(reason.key)}
                    >
                      <Text style={styles.reasonEmoji}>{reason.emoji}</Text>
                      <Text
                        style={[
                          styles.reasonLabel,
                          selectedReason === reason.key && styles.reasonLabelSelected,
                        ]}
                      >
                        {reason.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </>
        )}
      </View>

      <View style={styles.communitySection}>
        <Text style={styles.sectionTitle}>
          Community Votes ({totalVotes})
        </Text>
        
        <View style={styles.voteTally}>
          <View style={styles.tallyRow}>
            <View style={styles.tallyItem}>
              <View style={[styles.tallyDot, { backgroundColor: '#2E7D32' }]} />
              <Text style={styles.tallyLabel}>Buy</Text>
              <Text style={styles.tallyCount}>{item.voteCounts.buy}</Text>
            </View>
            <View style={styles.tallyItem}>
              <View style={[styles.tallyDot, { backgroundColor: '#E65100' }]} />
              <Text style={styles.tallyLabel}>Pass</Text>
              <Text style={styles.tallyCount}>{item.voteCounts.pass}</Text>
            </View>
            <View style={styles.tallyItem}>
              <View style={[styles.tallyDot, { backgroundColor: '#0D47A1' }]} />
              <Text style={styles.tallyLabel}>Dupe</Text>
              <Text style={styles.tallyCount}>{item.voteCounts.dupe}</Text>
            </View>
          </View>
        </View>
      </View>

      {showReasons && selectedVote && (
        <Pressable
          style={[styles.submitVote, voting && styles.submitVoteDisabled]}
          onPress={handleVote}
          disabled={voting}
        >
          <Text style={styles.submitVoteText}>
            {voting ? 'Submitting...' : `Vote ${selectedVote.toUpperCase()}`}
          </Text>
        </Pressable>
      )}
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
    marginBottom: 20,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginLeft: 12,
  },
  itemCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  itemImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.accent,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 64,
  },
  itemDetails: {
    padding: 16,
  },
  itemTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  timer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 8,
  },
  voteSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  voteButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  reasonsSection: {
    marginTop: 20,
  },
  reasonsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 12,
  },
  reasonOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reasonChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  reasonChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  reasonEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  reasonLabel: {
    fontSize: 12,
    color: colors.text,
  },
  reasonLabelSelected: {
    fontWeight: '600',
  },
  submitVote: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  submitVoteDisabled: {
    opacity: 0.6,
  },
  submitVoteText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  communitySection: {
    marginBottom: 24,
  },
  voteTally: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  tallyRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tallyItem: {
    alignItems: 'center',
  },
  tallyDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  tallyLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  tallyCount: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 4,
  },
  signInPrompt: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  signInText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  signInButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  votedState: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  votedText: {
    fontSize: 16,
    color: colors.text,
  },
  votedType: {
    fontWeight: '700',
    color: colors.primary,
  },
  changeVoteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  changeVoteText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
