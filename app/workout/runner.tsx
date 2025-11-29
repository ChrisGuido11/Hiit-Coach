import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Vibration, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { workoutApi } from '../../lib/api';
import { COLORS } from '../../lib/config';

export default function WorkoutRunnerScreen() {
  const { data: workout } = useQuery({
    queryKey: ['/api/workout/generate'],
    queryFn: workoutApi.generate,
  });

  const [isRunning, setIsRunning] = useState(false);
  const [currentMinute, setCurrentMinute] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const [phase, setPhase] = useState<'ready' | 'work' | 'complete'>('ready');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalMinutes = workout?.durationMinutes || 0;
  const currentRound = workout?.rounds?.[currentMinute % (workout?.rounds?.length || 1)];

  useEffect(() => {
    if (!isRunning || phase === 'complete') return;

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          Vibration.vibrate(500);

          if (currentMinute >= totalMinutes - 1) {
            clearInterval(timerRef.current!);
            setPhase('complete');
            router.replace('/workout/complete');
            return 60;
          }

          setCurrentMinute((m) => m + 1);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, currentMinute, totalMinutes, phase]);

  const startWorkout = () => {
    setIsRunning(true);
    setPhase('work');
    Vibration.vibrate(200);
  };

  const pauseWorkout = () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const resumeWorkout = () => {
    setIsRunning(true);
  };

  const quitWorkout = () => {
    Alert.alert(
      'Quit Workout?',
      'Your progress will not be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Quit',
          style: 'destructive',
          onPress: () => {
            if (timerRef.current) clearInterval(timerRef.current);
            router.back();
          },
        },
      ]
    );
  };

  const formatTime = (seconds: number) => {
    return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  };

  const progressPercent = ((totalMinutes - currentMinute - 1) * 60 + secondsRemaining) / (totalMinutes * 60);

  if (!workout) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={quitWorkout}>
          <Ionicons name="close" size={28} color={COLORS.mutedForeground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          ROUND {currentMinute + 1} OF {totalMinutes}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${(1 - progressPercent) * 100}%` }]} />
      </View>

      {/* Main Timer Display */}
      <View style={styles.timerSection}>
        {phase === 'ready' ? (
          <View style={styles.readyState}>
            <Text style={styles.readyText}>READY?</Text>
            <Text style={styles.focusLabel}>{workout.focusLabel?.toUpperCase()}</Text>
            <Text style={styles.durationText}>{totalMinutes} Minute EMOM</Text>
          </View>
        ) : (
          <View style={styles.workState}>
            <Text style={styles.timerDisplay}>{formatTime(secondsRemaining)}</Text>
            <View style={styles.currentExercise}>
              <Text style={styles.exerciseName}>{currentRound?.exerciseName}</Text>
              <View style={styles.repsContainer}>
                <Text style={styles.repsValue}>{currentRound?.reps}</Text>
                <Text style={styles.repsLabel}>REPS</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Next Up Preview */}
      {phase === 'work' && (
        <View style={styles.nextUpSection}>
          <Text style={styles.nextUpLabel}>NEXT UP</Text>
          <Text style={styles.nextUpExercise}>
            {workout.rounds?.[(currentMinute + 1) % workout.rounds.length]?.exerciseName}
          </Text>
        </View>
      )}

      {/* Control Buttons */}
      <View style={styles.controlsSection}>
        {phase === 'ready' ? (
          <TouchableOpacity style={styles.startButton} onPress={startWorkout}>
            <Ionicons name="play" size={32} color={COLORS.primaryForeground} />
            <Text style={styles.startButtonText}>START</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.controlRow}>
            <TouchableOpacity style={styles.quitButton} onPress={quitWorkout}>
              <Ionicons name="close" size={24} color={COLORS.destructive} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.playPauseButton}
              onPress={isRunning ? pauseWorkout : resumeWorkout}
            >
              <Ionicons
                name={isRunning ? 'pause' : 'play'}
                size={32}
                color={COLORS.primaryForeground}
              />
            </TouchableOpacity>
            <View style={{ width: 56 }} />
          </View>
        )}
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
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.mutedForeground,
    letterSpacing: 2,
  },
  progressContainer: {
    height: 4,
    backgroundColor: COLORS.secondary,
    marginHorizontal: 16,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  timerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  readyState: {
    alignItems: 'center',
  },
  readyText: {
    fontSize: 18,
    color: COLORS.mutedForeground,
    fontWeight: '700',
    letterSpacing: 4,
    marginBottom: 8,
  },
  focusLabel: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.foreground,
    textAlign: 'center',
  },
  durationText: {
    fontSize: 16,
    color: COLORS.mutedForeground,
    marginTop: 8,
  },
  workState: {
    alignItems: 'center',
    width: '100%',
  },
  timerDisplay: {
    fontSize: 120,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -4,
    fontVariant: ['tabular-nums'],
    textShadowColor: 'rgba(204, 255, 0, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
  },
  currentExercise: {
    alignItems: 'center',
    marginTop: 24,
    backgroundColor: COLORS.card,
    padding: 24,
    borderRadius: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  exerciseName: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.foreground,
    textAlign: 'center',
    marginBottom: 12,
  },
  repsContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  repsValue: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.primary,
  },
  repsLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.mutedForeground,
    letterSpacing: 2,
  },
  nextUpSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
  },
  nextUpLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.mutedForeground,
    letterSpacing: 2,
    marginBottom: 4,
  },
  nextUpExercise: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.foreground,
  },
  controlsSection: {
    padding: 24,
    paddingBottom: 48,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  startButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 20,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
  startButtonText: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primaryForeground,
    letterSpacing: 4,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  quitButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
});
