import { Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  style?: object;
}

export function AnimatedNumber({ value, prefix = '', suffix = '', style }: AnimatedNumberProps) {
  return (
    <Text style={[styles.text, style]}>
      {prefix}{value.toLocaleString()}{suffix}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
  },
});