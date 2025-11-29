import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workoutApi } from '../../lib/api';
import { COLORS } from '../../lib/config';

const RPE_OPTIONS = [
  { value: 1, label: 'Too Easy', emoji: '😴', color: '#22c55e' },
  { value: 2, label: 'Easy', emoji: '🙂', color: '#84cc16' },
  { value: 3, label: 'Just Right', emoji: '💪', color: '#ccff00' },
  { value: 4, label: 'Hard', emoji: '😤', color: '#f97316' },
  { value: 5, label: 'Too Hard', emoji: '🥵', color: '#ef4444' },
];

export default function WorkoutCompleteScreen() {
  const [selectedRpe, setSelectedRpe] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data: workout } = useQuery({
    queryKey: ['/api/workout/generate'],
    queryFn: workoutApi.generate,
  });

  const saveSessionMutation = useMutation({
    mutationFn: (rpe: number) =>
      workoutApi.saveSession({
        durationMinutes: workout?.durationMinutes,
        focusLabel: workout?.focusLabel,
        difficultyTag: workout?.difficultyTag,
        rounds: workout?.rounds,
        perceivedExertion: rpe,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workout/history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/workout/generate'] });
      router.replace('/(tabs)');
    },
  });

  const handleFinish = () => {
    if (selectedRpe !== null) {
      saveSessionMutation.mutate(selectedRpe);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Celebration Header */}
        <View style={styles.celebrationSection}>
          <View style={styles.trophyContainer}>
            <Ionicons name="trophy" size={64} color={COLORS.primary} />
          </View>
          <Text style={styles.congratsText}>WORKOUT{'\n'}COMPLETE!</Text>
          <Text style={styles.subtitle}>
            You crushed {workout?.durationMinutes} minutes of {workout?.focusLabel?.toLowerCase()}
          </Text>
        </View>

        {/* Stats Summary */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="time-outline" size={24} color={COLORS.primary} />
            <Text style={styles.statValue}>{workout?.durationMinutes}</Text>
            <Text style={styles.statLabel}>MINUTES</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="repeat-outline" size={24} color={COLORS.primary} />
            <Text style={styles.statValue}>{workout?.rounds?.length}</Text>
            <Text style={styles.statLabel}>EXERCISES</Text>
          </View>
        </View>

        {/* RPE Rating */}
        <View style={styles.rpeSection}>
          <Text style={styles.rpeTitle}>How did it feel?</Text>
          <Text style={styles.rpeSubtitle}>Rate your effort to optimize future workouts</Text>

          <View style={styles.rpeOptions}>
            {RPE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.rpeCard,
                  selectedRpe === option.value && styles.rpeCardActive,
                  selectedRpe === option.value && { borderColor: option.color },
                ]}
                onPress={() => setSelectedRpe(option.value)}
              >
                <Text style={styles.rpeEmoji}>{option.emoji}</Text>
                <Text style={[styles.rpeLabel, selectedRpe === option.value && { color: option.color }]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Finish Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.finishButton, !selectedRpe && styles.finishButtonDisabled]}
          onPress={handleFinish}
          disabled={!selectedRpe || saveSessionMutation.isPending}
        >
          <Text style={styles.finishButtonText}>
            {saveSessionMutation.isPending ? 'Saving...' : 'Finish & Save'}
          </Text>
          <Ionicons name="checkmark" size={24} color={COLORS.primaryForeground} />
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
  celebrationSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  trophyContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(204, 255, 0, 0.15)',
    borderWidth: 3,
    borderColor: 'rgba(204, 255, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  congratsText: {
    fontSize: 40,
    fontWeight: '800',
    color: COLORS.foreground,
    textAlign: 'center',
    lineHeight: 44,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.mutedForeground,
    textAlign: 'center',
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.foreground,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.mutedForeground,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 4,
  },
  rpeSection: {
    flex: 1,
  },
  rpeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.foreground,
    textAlign: 'center',
    marginBottom: 4,
  },
  rpeSubtitle: {
    fontSize: 14,
    color: COLORS.mutedForeground,
    textAlign: 'center',
    marginBottom: 20,
  },
  rpeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  rpeCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rpeCardActive: {
    backgroundColor: 'rgba(204, 255, 0, 0.1)',
  },
  rpeEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  rpeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  finishButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  finishButtonDisabled: {
    opacity: 0.5,
  },
  finishButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primaryForeground,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
});
