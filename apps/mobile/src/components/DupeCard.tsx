import { View, Text, StyleSheet, Pressable, Image, Linking } from 'react-native';
import { colors } from '../constants/colors';

interface DupeCardProps {
  dupe: {
    id: string;
    name: string;
    link?: string | null;
    suggestedPrice: number;
    confidence: number;
    source: string;
    affiliateLink?: string | null;
  };
  onPress: () => void;
}

export function DupeCard({ dupe, onPress }: DupeCardProps) {
  const handlePress = () => {
    if (dupe.affiliateLink) {
      Linking.openURL(dupe.affiliateLink);
    } else if (dupe.link) {
      Linking.openURL(dupe.link);
    }
  };

  return (
    <Pressable style={styles.card} onPress={handlePress}>
      <View style={styles.content}>
        <View style={styles.imagePlaceholder}>
          <Text style={styles.placeholderText}>🔗</Text>
        </View>
        <View style={styles.details}>
          <Text style={styles.name} numberOfLines={2}>
            {dupe.name}
          </Text>
          <Text style={styles.price}>${(dupe.suggestedPrice / 100).toFixed(2)}</Text>
          <View style={styles.confidence}>
            <View
              style={[
                styles.confidenceBar,
                { width: `${dupe.confidence * 100}%` },
              ]}
            />
            <Text style={styles.confidenceText}>
              {Math.round(dupe.confidence * 100)}% match
            </Text>
          </View>
        </View>
      </View>
      <Text style={styles.source}>Source: {dupe.source}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: colors.accent,
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
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.success,
    marginVertical: 4,
  },
  confidence: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceBar: {
    height: 4,
    backgroundColor: colors.success,
    borderRadius: 2,
    marginRight: 8,
  },
  confidenceText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  source: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});