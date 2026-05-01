import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { colors } from '../constants/colors';
import { Avatar } from './Avatar';
import { CountdownTimer } from './CountdownTimer';

interface CourtCardProps {
  item: {
    id: string;
    title: string;
    description?: string | null;
    imageUrl?: string | null;
    price: number;
    username: string;
    userAvatar?: string | null;
    voteCounts: { buy: number; pass: number; dupe: number };
    userVote?: 'buy' | 'pass' | 'dupe' | null;
    cooldownEndsAt: string;
  };
  onPress: () => void;
}

export function CourtCard({ item, onPress }: CourtCardProps) {
  const total = item.voteCounts.buy + item.voteCounts.pass + item.voteCounts.dupe;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Avatar uri={item.userAvatar} name={item.username} size={32} />
        <Text style={styles.username}>@{item.username}</Text>
      </View>

      <View style={styles.content}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Text style={styles.placeholderText}>📦</Text>
          </View>
        )}
        <View style={styles.details}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.price}>${(item.price / 100).toFixed(2)}</Text>
          <CountdownTimer endTime={item.cooldownEndsAt} />
        </View>
      </View>

      <View style={styles.votes}>
        <View style={styles.voteCount}>
          <View style={[styles.voteDot, { backgroundColor: '#2E7D32' }]} />
          <Text style={styles.voteCountText}>{item.voteCounts.buy}</Text>
        </View>
        <View style={styles.voteCount}>
          <View style={[styles.voteDot, { backgroundColor: '#E65100' }]} />
          <Text style={styles.voteCountText}>{item.voteCounts.pass}</Text>
        </View>
        <View style={styles.voteCount}>
          <View style={[styles.voteDot, { backgroundColor: '#0D47A1' }]} />
          <Text style={styles.voteCountText}>{item.voteCounts.dupe}</Text>
        </View>
      </View>

      <Text style={styles.totalVotes}>{total} votes</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  username: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginLeft: 8,
  },
  content: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: colors.accent,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 28,
  },
  details: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginVertical: 4,
  },
  votes: {
    flexDirection: 'row',
    gap: 16,
  },
  voteCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voteDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  voteCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  totalVotes: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
  },
});