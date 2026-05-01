import { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

interface CountdownTimerProps {
  endTime: string | null;
  onExpire?: () => void;
}

export function CountdownTimer({ endTime, onExpire }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: true,
  });

  useEffect(() => {
    if (!endTime) {
      setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const diff = Math.max(0, end - now);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return {
        hours,
        minutes,
        seconds,
        isExpired: diff <= 0,
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const newTime = calculateTimeLeft();
      setTimeLeft(newTime);

      if (newTime.isExpired) {
        clearInterval(timer);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  if (timeLeft.isExpired) {
    return (
      <View style={styles.container}>
        <Text style={styles.expiredText}>Ready!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {timeLeft.hours > 0 && (
        <View style={styles.timeBlock}>
          <Text style={styles.timeValue}>{timeLeft.hours}</Text>
          <Text style={styles.timeLabel}>h</Text>
        </View>
      )}
      <View style={styles.timeBlock}>
        <Text style={styles.timeValue}>{timeLeft.minutes}</Text>
        <Text style={styles.timeLabel}>m</Text>
      </View>
      <View style={styles.timeBlock}>
        <Text style={styles.timeValue}>{timeLeft.seconds}</Text>
        <Text style={styles.timeLabel}>s</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginRight: 4,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  timeLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 2,
  },
  expiredText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.success,
  },
});