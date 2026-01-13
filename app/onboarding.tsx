import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Sparkles, Gift } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, FONTS, SCREEN_WIDTH } from './constants';
import { FadeInView } from './components/FadeInView';
import { Button } from './components/Button';

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Never struggle with gift ideas again',
      subtitle: 'Tell us about the people you care about and we\'ll handle the rest.',
      icon: <User size={80} />,
    },
    {
      title: 'Get personalized suggestions',
      subtitle: 'Our AI finds unique gifts they\'ll actually love based on their interests.',
      icon: <Sparkles size={80} />,
    },
    {
      title: 'Give with confidence',
      subtitle: 'Save ideas, track history, and never forget a special occasion.',
      icon: <Gift size={80} />,
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      router.replace('/');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.onboardingContent}>
        <View style={styles.onboardingIllustration}>
          <View style={styles.iconCircle}>
            {steps[step].icon}
          </View>
        </View>
        <View style={{ height: 200 }}>
          <Text style={styles.onboardingTitle}>{steps[step].title}</Text>
          <Text style={styles.onboardingSubtitle}>{steps[step].subtitle}</Text>
        </View>
        
        <View style={styles.pagination}>
          {steps.map((_, i) => (
            <View 
              key={i} 
              style={[
                styles.paginationDot, 
                i === step ? styles.paginationDotActive : null
              ]} 
            />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Button 
          title={step === steps.length - 1 ? 'Get Started' : 'Next'} 
          onPress={handleNext} 
        />
        {step < steps.length - 1 && (
          <TouchableOpacity style={{ marginTop: 16, alignItems: 'center' }} onPress={() => router.replace('/')}>
            <Text style={{ color: COLORS.textSecondary, fontFamily: FONTS.body }}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  onboardingContent: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onboardingIllustration: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onboardingTitle: {
    fontSize: 28,
    fontFamily: FONTS.display,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  onboardingSubtitle: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    marginTop: SPACING.xl,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: COLORS.accentPrimary,
    width: 24,
  },
  footer: {
    padding: SPACING.xl,
  },
});
