import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '../lib/api';
import { COLORS } from '../lib/config';

const EQUIPMENT_OPTIONS = [
  'Dumbbells', 'Kettlebell', 'Pull-up Bar', 'Jump Rope', 'Box', 'None (Bodyweight)'
];

const FITNESS_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Elite'];

const GOALS = [
  { id: 'cardio', label: 'Cardio & Endurance', icon: 'pulse-outline' },
  { id: 'strength', label: 'Strength & Power', icon: 'barbell-outline' },
  { id: 'metcon', label: 'Metabolic Conditioning', icon: 'timer-outline' },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [preferences, setPreferences] = useState({
    fitnessLevel: '',
    equipment: [] as string[],
    goalFocus: '',
  });
  const queryClient = useQueryClient();

  const createProfileMutation = useMutation({
    mutationFn: profileApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      router.replace('/(tabs)');
    },
  });

  const toggleEquipment = (item: string) => {
    setPreferences(prev => {
      const current = prev.equipment;
      if (current.includes(item)) {
        return { ...prev, equipment: current.filter(i => i !== item) };
      }
      return { ...prev, equipment: [...current, item] };
    });
  };

  const nextStep = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      createProfileMutation.mutate(preferences);
    }
  };

  const canProceed = () => {
    if (step === 0) return !!preferences.fitnessLevel;
    if (step === 1) return preferences.equipment.length > 0;
    if (step === 2) return !!preferences.goalFocus;
    return false;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            {[0, 1, 2].map(i => (
              <View
                key={i}
                style={[styles.progressDot, i <= step && styles.progressDotActive]}
              />
            ))}
          </View>
          <Text style={styles.stepText}>STEP {step + 1}/3</Text>
        </View>

        {/* Step Content */}
        <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
          {step === 0 && (
            <>
              <Text style={styles.title}>Fitness Level</Text>
              <Text style={styles.subtitle}>Help us tailor the intensity</Text>
              <View style={styles.optionsList}>
                {FITNESS_LEVELS.map(level => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.optionCard,
                      preferences.fitnessLevel === level && styles.optionCardActive,
                    ]}
                    onPress={() => setPreferences(prev => ({ ...prev, fitnessLevel: level }))}
                  >
                    <Text style={styles.optionText}>{level}</Text>
                    {preferences.fitnessLevel === level && (
                      <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {step === 1 && (
            <>
              <Text style={styles.title}>Equipment</Text>
              <Text style={styles.subtitle}>What do you have access to?</Text>
              <View style={styles.equipmentGrid}>
                {EQUIPMENT_OPTIONS.map(item => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.equipmentCard,
                      preferences.equipment.includes(item) && styles.equipmentCardActive,
                    ]}
                    onPress={() => toggleEquipment(item)}
                  >
                    <Ionicons
                      name="barbell-outline"
                      size={32}
                      color={preferences.equipment.includes(item) ? COLORS.primary : COLORS.mutedForeground}
                    />
                    <Text style={[
                      styles.equipmentText,
                      preferences.equipment.includes(item) && styles.equipmentTextActive,
                    ]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {step === 2 && (
            <>
              <Text style={styles.title}>Primary Goal</Text>
              <Text style={styles.subtitle}>What are you training for?</Text>
              <View style={styles.optionsList}>
                {GOALS.map(goal => (
                  <TouchableOpacity
                    key={goal.id}
                    style={[
                      styles.goalCard,
                      preferences.goalFocus === goal.id && styles.optionCardActive,
                    ]}
                    onPress={() => setPreferences(prev => ({ ...prev, goalFocus: goal.id }))}
                  >
                    <Ionicons
                      name={goal.icon as any}
                      size={24}
                      color={preferences.goalFocus === goal.id ? COLORS.primary : COLORS.mutedForeground}
                    />
                    <Text style={styles.optionText}>{goal.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </ScrollView>

        {/* Next Button */}
        <TouchableOpacity
          style={[styles.nextButton, !canProceed() && styles.nextButtonDisabled]}
          onPress={nextStep}
          disabled={!canProceed() || createProfileMutation.isPending}
        >
          <Text style={styles.nextButtonText}>
            {createProfileMutation.isPending
              ? 'Saving...'
              : step === 2
              ? 'Start Training'
              : 'Next'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color={COLORS.primaryForeground} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.secondary,
  },
  progressDotActive: {
    backgroundColor: COLORS.primary,
  },
  stepText: {
    fontSize: 12,
    color: COLORS.mutedForeground,
    fontWeight: '600',
    letterSpacing: 1,
  },
  stepContent: {
    flex: 1,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.foreground,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.mutedForeground,
    marginBottom: 24,
  },
  optionsList: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(204, 255, 0, 0.1)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
  },
  optionText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.foreground,
    letterSpacing: 1,
  },
  goalCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  equipmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  equipmentCard: {
    width: '47%',
    aspectRatio: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  equipmentCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(204, 255, 0, 0.1)',
  },
  equipmentText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.mutedForeground,
    textAlign: 'center',
  },
  equipmentTextActive: {
    color: COLORS.foreground,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primaryForeground,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
});
