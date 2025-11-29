import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { workoutApi, profileApi } from '../../lib/api';
import { COLORS } from '../../lib/config';

export default function WorkoutScreen() {
  const { data: profile } = useQuery({
    queryKey: ['/api/profile'],
    queryFn: profileApi.get,
  });

  const { data: workout, isLoading, refetch } = useQuery({
    queryKey: ['/api/workout/generate'],
    queryFn: workoutApi.generate,
    enabled: !!profile,
  });

  if (isLoading || !workout) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Generating workout...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Workout Preview</Text>
        <TouchableOpacity onPress={() => refetch()}>
          <Ionicons name="refresh" size={24} color={COLORS.mutedForeground} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Workout Summary */}
        <View style={styles.summary}>
          <Text style={styles.focusLabel}>{workout.focusLabel?.toUpperCase()}</Text>
          <Text style={styles.duration}>{workout.durationMinutes} Minute EMOM</Text>
          <View style={styles.difficultyBadge}>
            <Text style={styles.difficultyText}>{workout.difficultyTag?.toUpperCase()}</Text>
          </View>
        </View>

        {/* Exercise List */}
        <View style={styles.exerciseList}>
          <Text style={styles.sectionLabel}>EXERCISES</Text>
          {workout.rounds?.map((round: any, idx: number) => (
            <View key={idx} style={styles.exerciseCard}>
              <View style={styles.exerciseIndex}>
                <Text style={styles.exerciseIndexText}>{round.minuteIndex}</Text>
              </View>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{round.exerciseName}</Text>
                <Text style={styles.exerciseMuscle}>{round.targetMuscleGroup}</Text>
              </View>
              <View style={styles.exerciseReps}>
                <Text style={styles.repsValue}>{round.reps}</Text>
                <Text style={styles.repsLabel}>REPS</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Start Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => router.push('/workout/runner')}
        >
          <Ionicons name="play" size={20} color={COLORS.primaryForeground} />
          <Text style={styles.startButtonText}>Start EMOM</Text>
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
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  scrollView: {
    flex: 1,
    padding: 24,
  },
  summary: {
    alignItems: 'center',
    marginBottom: 32,
  },
  focusLabel: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.foreground,
    textAlign: 'center',
  },
  duration: {
    fontSize: 18,
    color: COLORS.mutedForeground,
    marginTop: 4,
  },
  difficultyBadge: {
    backgroundColor: 'rgba(204, 255, 0, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(204, 255, 0, 0.3)',
    marginTop: 12,
  },
  difficultyText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
    letterSpacing: 1,
  },
  exerciseList: {
    gap: 8,
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
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.foreground,
  },
  exerciseMuscle: {
    fontSize: 12,
    color: COLORS.mutedForeground,
    textTransform: 'capitalize',
    marginTop: 2,
  },
  exerciseReps: {
    alignItems: 'flex-end',
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
    gap: 8,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primaryForeground,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
});
