import { View, Image, StyleSheet, Text, Pressable } from 'react-native';
import { colors } from '../constants/colors';

interface AvatarProps {
  uri?: string | null;
  name: string;
  size?: number;
}

export function Avatar({ uri, name, size = 40 }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[
          styles.image,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
        accessibilityLabel={`Avatar for ${name}`}
        accessibilityRole="image"
      />
    );
  }

  return (
    <View
      style={[
        styles.initials,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
      accessibilityLabel={`Avatar for ${name}`}
      accessibilityRole="image"
    >
      <Text style={[styles.initialsText, { fontSize: size * 0.4 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.accent,
  },
  initials: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    color: '#3D1C1F',
    fontWeight: '700',
  },
});