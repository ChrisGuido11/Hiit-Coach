import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { profileApi, workoutApi } from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';
import { COLORS } from '../../lib/config';

export default function HomeScreen() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ['/api/profile'],
    queryFn: profileApi.get,
    enabled: isAuthenticated,
  });

  const { data: workout, isLoading: workoutLoading, refetch } = useQuery({
    queryKey: ['/api/workout/generate'],
    queryFn: workoutApi.generate,
    enabled: !!profile,
  });

  const { data: history = [] } = useQuery({
    queryKey: ['/api/workout/history'],
    queryFn: workoutApi.getHistory,
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!authLoading && isAuthenticated && !profile) {
      router.replace('/onboarding');
    }
  }, [authLoading, isAuthenticated, profile]);

  const totalWorkouts = history.length;
  const totalMinutes = history.reduce((sum: number, s: any) => sum + s.durationMinutes, 0);

  if (!profile) {
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
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Morning</Text>
            <Text style={styles.title}>READY TO{'\n'}<Text style={styles.titleAccent}>SWEAT?</Text></Text>
          </View>
          <View style={styles.avatarContainer}>
            <Ionicons name="flame" size={24} color={COLORS.primary} />
          </View>
        </View>

        {/* Daily WOD Card */}
        {workoutLoading ? (
          <View style={styles.wodCard}>
            <Text style={styles.loadingText}>Generating workout...</Text>
          </View>
        ) : workout ? (
          <View style={styles.wodCard}>
            <View style={styles.wodHeader}>
              <View style={styles.wodBadge}>
                <Text style={styles.wodBadgeText}>DAILY WOD</Text>
              </View>
              <TouchableOpacity onPress={() => refetch()}>
                <Ionicons name="refresh" size={20} color={COLORS.mutedForeground} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.wodTitle}>{workout.focusLabel?.toUpperCase()} EMOM</Text>
            <Text style={styles.wodSubtitle}>
              {workout.durationMinutes} Min • {workout.rounds?.length} Exercises • {workout.difficultyTag}
            </Text>

            <TouchableOpacity
              style={styles.startButton}
              onPress={() => router.push('/workout/detail')}
            >
              <Ionicons name="play" size={18} color={COLORS.primaryForeground} />
              <Text style={styles.startButtonText}>Start Workout</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="trending-up" size={24} color={COLORS.primary} />
            <Text style={styles.statValue}>{totalWorkouts}</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time" size={24} color={COLORS.primary} />
            <Text style={styles.statValue}>{totalMinutes}</Text>
            <Text style={styles.statLabel}>Minutes</Text>
          </View>
        </View>

        {/* Recent Activity */}
        {history.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
                <Text style={styles.viewAll}>VIEW ALL</Text>
              </TouchableOpacity>
            </View>
            
            {history.slice(0, 2).map((session: any) => (
              <View key={session.id} style={styles.activityCard}>
                <View style={styles.activityIcon}>
                  <Text style={styles.activityIconText}>{session.durationMinutes}</Text>
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityTitle}>{session.focusLabel?.toUpperCase()} EMOM</Text>
                  <Text style={styles.activitySubtitle}>
                    {new Date(session.createdAt).toLocaleDateString()} • {session.difficultyTag}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.mutedForeground} />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
    padding: 24,
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
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 12,
    color: COLORS.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontWeight: '600',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.foreground,
    lineHeight: 40,
    marginTop: 4,
  },
  titleAccent: {
    color: COLORS.primary,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.secondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wodCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  wodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  wodBadge: {
    backgroundColor: 'rgba(204, 255, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(204, 255, 0, 0.3)',
  },
  wodBadgeText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '700',
    letterSpacing: 1,
  },
  wodTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.foreground,
    marginBottom: 4,
  },
  wodSubtitle: {
    fontSize: 14,
    color: COLORS.mutedForeground,
    marginBottom: 16,
  },
  startButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primaryForeground,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.foreground,
    marginTop: 12,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.foreground,
  },
  viewAll: {
    fontSize: 10,
    color: COLORS.mutedForeground,
    fontWeight: '600',
    letterSpacing: 1,
  },
  activityCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityIconText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.mutedForeground,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.foreground,
  },
  activitySubtitle: {
    fontSize: 12,
    color: COLORS.mutedForeground,
    marginTop: 2,
  },
});
