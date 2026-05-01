import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { colors } from '../constants/colors';
import { CountdownTimer } from './CountdownTimer';

interface WishCardProps {
  item: {
    id: string;
    title: string;
    description?: string | null;
    imageUrl?: string | null;
    price: number;
    status: string;
    cooldownEndsAt?: string | null;
  };
  onPress: () => void;
}

export function WishCard({ item, onPress }: WishCardProps) {
  const statusColors: Record<string, string> = {
    cooling_off: '#E65100',
    expired: colors.textSecondary,
    purchased: '#2E7D32',
    pending: colors.textSecondary,
  };

  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, $${(item.price / 100).toFixed(2)}, status: ${item.status.replace('_', ' ')}`}
      accessibilityHint="Tap to view details"
    >
      <View style={styles.content}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Text style={styles.placeholderText} accessibilityLabel="No image">📦</Text>
          </View>
        )}
        <View style={styles.details}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.price}>${(item.price / 100).toFixed(2)}</Text>
          {item.status === 'cooling_off' && item.cooldownEndsAt && (
            <View style={styles.timerContainer}>
              <CountdownTimer endTime={item.cooldownEndsAt} />
            </View>
          )}
        </View>
        <View
          style={[styles.statusBadge, { backgroundColor: statusColors[item.status] }]}
          accessibilityLabel={`Status: ${item.status.replace('_', ' ')}`}
        >
          <Text style={styles.statusText}>{item.status.replace('_', ' ')}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: colors.accent,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 24,
  },
  details: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 4,
  },
  timerContainer: {
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.surface,
    textTransform: 'capitalize',
    letterSpacing: 0.5,
  },
});