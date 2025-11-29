import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { workoutApi } from '../../lib/api';
import { COLORS } from '../../lib/config';

export default function WorkoutDetailScreen() {
  const { data: workout } = useQuery({
    queryKey: ['/api/workout/generate'],
    queryFn: workoutApi.generate,
  });

  if (!workout) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading workout...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color={COLORS.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Workout Details</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Workout Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryBadge}>
            <Text style={styles.summaryBadgeText}>{workout.difficultyTag?.toUpperCase()}</Text>
          </View>
          <Text style={styles.focusLabel}>{workout.focusLabel?.toUpperCase()}</Text>
          <Text style={styles.duration}>{workout.durationMinutes} MINUTE EMOM</Text>
        </View>

        {/* Timer Info */}
        <View style={styles.timerInfo}>
          <View style={styles.timerStat}>
            <Ionicons name="timer-outline" size={20} color={COLORS.primary} />
            <Text style={styles.timerStatValue}>{workout.durationMinutes}:00</Text>
            <Text style={styles.timerStatLabel}>Total Time</Text>
          </View>
          <View style={styles.timerStat}>
            <Ionicons name="repeat-outline" size={20} color={COLORS.primary} />
            <Text style={styles.timerStatValue}>{workout.rounds?.length}</Text>
            <Text style={styles.timerStatLabel}>Exercises</Text>
          </View>
          <View style={styles.timerStat}>
            <Ionicons name="flash-outline" size={20} color={COLORS.primary} />
            <Text style={styles.timerStatValue}>60s</Text>
            <Text style={styles.timerStatLabel}>Per Round</Text>
          </View>
        </View>

        {/* Exercise List */}
        <View style={styles.exerciseList}>
          <Text style={styles.sectionLabel}>EXERCISE BREAKDOWN</Text>
          {workout.rounds?.map((round: any, idx: number) => (
            <View key={idx} style={styles.exerciseCard}>
              <View style={styles.exerciseIndex}>
                <Text style={styles.exerciseIndexText}>{round.minuteIndex}</Text>
              </View>
              <View style={styles.exerciseContent}>
                <Text style={styles.exerciseName}>{round.exerciseName}</Text>
                <View style={styles.exerciseMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="fitness-outline" size={12} color={COLORS.mutedForeground} />
                    <Text style={styles.metaText}>{round.targetMuscleGroup}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.exerciseReps}>
                <Text style={styles.repsValue}>{round.reps}</Text>
                <Text style={styles.repsLabel}>REPS</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Instructions */}
        <View style={styles.instructionsSection}>
          <Text style={styles.sectionLabel}>HOW IT WORKS</Text>
          <View style={styles.instructionCard}>
            <View style={styles.instructionRow}>
              <View style={styles.instructionIcon}>
                <Text style={styles.instructionNumber}>1</Text>
              </View>
              <Text style={styles.instructionText}>
                Complete the prescribed reps at the start of each minute
              </Text>
            </View>
            <View style={styles.instructionRow}>
              <View style={styles.instructionIcon}>
                <Text style={styles.instructionNumber}>2</Text>
              </View>
              <Text style={styles.instructionText}>
                Rest for the remainder of that minute
              </Text>
            </View>
            <View style={styles.instructionRow}>
              <View style={styles.instructionIcon}>
                <Text style={styles.instructionNumber}>3</Text>
              </View>
              <Text style={styles.instructionText}>
                Rate your effort after to adapt future workouts
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Start Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => router.push('/workout/runner')}
        >
          <Ionicons name="play" size={24} color={COLORS.primaryForeground} />
          <Text style={styles.startButtonText}>START EMOM</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.mutedForeground,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
    padding: 24,
  },
  summary: {
    alignItems: 'center',
    marginBottom: 24,
  },
  summaryBadge: {
    backgroundColor: 'rgba(204, 255, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(204, 255, 0, 0.3)',
    marginBottom: 12,
  },
  summaryBadgeText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '700',
    letterSpacing: 1,
  },
  focusLabel: {
    fontSize: 40,
    fontWeight: '800',
    color: COLORS.foreground,
    textAlign: 'center',
  },
  duration: {
    fontSize: 14,
    color: COLORS.mutedForeground,
    marginTop: 4,
    letterSpacing: 2,
    fontWeight: '600',
  },
  timerInfo: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timerStat: {
    flex: 1,
    alignItems: 'center',
  },
  timerStatValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.foreground,
    marginTop: 8,
  },
  timerStatLabel: {
    fontSize: 10,
    color: COLORS.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
  exerciseList: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.mutedForeground,
    letterSpacing: 2,
    marginBottom: 12,
  },
  exerciseCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseIndex: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(204, 255, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exerciseIndexText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  exerciseContent: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.foreground,
    marginBottom: 4,
  },
  exerciseMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.mutedForeground,
    textTransform: 'capitalize',
  },
  exerciseReps: {
    alignItems: 'center',
    marginLeft: 12,
  },
  repsValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.foreground,
  },
  repsLabel: {
    fontSize: 10,
    color: COLORS.mutedForeground,
    fontWeight: '600',
    letterSpacing: 1,
  },
  instructionsSection: {
    marginBottom: 24,
  },
  instructionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 16,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  instructionIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(204, 255, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  instructionNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.foreground,
    lineHeight: 20,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  startButton: {
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
  startButtonText: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primaryForeground,
    letterSpacing: 2,
  },
});
