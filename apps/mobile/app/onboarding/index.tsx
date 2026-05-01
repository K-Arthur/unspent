import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../src/constants/colors';

const slides = [
  {
    icon: '🎯',
    title: 'Add Your Wishes',
    description: 'Paste links or screenshot items you want. Set a price and start the 72-hour countdown.',
  },
  {
    icon: '⏰',
    title: 'Wait It Out',
    description: 'The cooling-off period helps you separate real needs from impulse buys.',
  },
  {
    icon: '🗳️',
    title: 'Get Community Help',
    description: 'Friends vote: Buy, Pass, or Dupe it. Majority rules help you decide.',
  },
  {
    icon: '💰',
    title: 'Track Your Savings',
    description: 'Every item you dont buy adds up. Share your wins and inspire others.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [birthDate, setBirthDate] = useState('');
  const [step, setStep] = useState<'slides' | 'age-gate' | 'signup'>('slides');

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      setStep('age-gate');
    }
  };

  const handleAgeSubmit = () => {
    const birth = new Date(birthDate);
    const age = getAge(birth);
    
    if (isNaN(age)) {
      return;
    }
    
    if (age < 13) {
      router.replace('/');
      return;
    }
    
    setStep('signup');
  };

  const getAge = (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (step === 'age-gate') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>When were you born?</Text>
        <Text style={styles.subtitle}>We need this to personalize your experience</Text>
        
        <View style={styles.ageGate}>
          <TextInput
            style={styles.input}
            placeholder="MM/DD/YYYY"
            placeholderTextColor={colors.textSecondary}
            value={birthDate}
            onChangeText={setBirthDate}
            keyboardType="numeric"
          />
          <Text style={styles.disclaimer}>
            Unspent is for ages 13+. We dont share your birthdate.
          </Text>
        </View>

        <Pressable style={styles.button} onPress={handleAgeSubmit}>
          <Text style={styles.buttonText}>Continue</Text>
        </Pressable>

        <Pressable style={styles.skipButton} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.skipText}>Skip for now</Text>
        </Pressable>
      </View>
    );
  }

  if (step === 'signup') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Create Your Account</Text>
        
        <View style={styles.socialButtons}>
          <Pressable style={styles.socialButton} onPress={() => {}}>
            <Text style={styles.socialIcon}>🍎</Text>
            <Text style={styles.socialText}>Continue with Apple</Text>
          </Pressable>
          
          <Pressable style={styles.socialButton} onPress={() => {}}>
            <Text style={styles.socialIcon}>G</Text>
            <Text style={styles.socialText}>Continue with Google</Text>
          </Pressable>
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
        />

        <Pressable style={styles.button} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </Pressable>

        <Text style={styles.terms}>
          By signing up, you agree to our{' '}
          <Text style={styles.link}>Terms</Text> and{' '}
          <Text style={styles.link}>Privacy Policy</Text>
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.progress}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressDot,
              i <= currentSlide && styles.progressDotActive,
            ]}
          />
        ))}
      </View>

      <View style={styles.slide}>
        <Text style={styles.icon}>{slides[currentSlide].icon}</Text>
        <Text style={styles.slideTitle}>{slides[currentSlide].title}</Text>
        <Text style={styles.slideDescription}>
          {slides[currentSlide].description}
        </Text>
      </View>

      <Pressable style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>
          {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
        </Text>
      </Pressable>

      <Pressable style={styles.skipButton} onPress={() => router.replace('/(tabs)')}>
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    justifyContent: 'center',
  },
  progress: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 48,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
  },
  slide: {
    alignItems: 'center',
    marginBottom: 48,
  },
  icon: {
    fontSize: 64,
    marginBottom: 24,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  slideDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  skipText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  ageGate: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  disclaimer: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  socialButtons: {
    gap: 12,
    marginBottom: 24,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.accent,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  socialIcon: {
    fontSize: 20,
  },
  socialText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.accent,
  },
  dividerText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginHorizontal: 12,
  },
  terms: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 24,
  },
  link: {
    color: colors.primary,
  },
});