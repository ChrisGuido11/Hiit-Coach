import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { profileApi, workoutApi } from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';
import { COLORS } from '../../lib/config';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ['/api/profile'],
    queryFn: profileApi.get,
  });

  const { data: history = [] } = useQuery({
    queryKey: ['/api/workout/history'],
    queryFn: workoutApi.getHistory,
  });

  const totalWorkouts = history.length;
  const totalMinutes = history.reduce((sum: number, s: any) => sum + s.durationMinutes, 0);

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: logout },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all workout data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { apiRequest } = await import('../../lib/api');
              await apiRequest('/api/auth/deleteAccount', { method: 'DELETE' });
              logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete account');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {profile?.displayName || user?.firstName || 'Athlete'}
            </Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statCardPrimary]}>
            <Text style={styles.statValuePrimary}>{totalWorkouts}</Text>
            <Text style={styles.statLabelPrimary}>Workouts</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalMinutes}</Text>
            <Text style={styles.statLabel}>Minutes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{profile?.skillScore || 50}</Text>
            <Text style={styles.statLabel}>Skill</Text>
          </View>
        </View>

        {/* Training Profile */}
        {profile && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Training Profile</Text>
              <TouchableOpacity>
                <Ionicons name="pencil" size={18} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.profileCard}>
              <View style={styles.profileRow}>
                <Text style={styles.profileRowLabel}>Level</Text>
                <Text style={styles.profileRowValue}>{profile.fitnessLevel}</Text>
              </View>
              <View style={styles.profileRow}>
                <Text style={styles.profileRowLabel}>Goal</Text>
                <Text style={styles.profileRowValue}>{profile.goalFocus}</Text>
              </View>
              <View style={styles.profileRow}>
                <Text style={styles.profileRowLabel}>Equipment</Text>
                <Text style={styles.profileRowValue}>
                  {(profile.equipment as string[])?.join(', ')}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Workout History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Workouts</Text>
          {history.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No workouts yet. Start your first session!</Text>
            </View>
          ) : (
            history.slice(0, 5).map((session: any) => (
              <View key={session.id} style={styles.historyCard}>
                <View style={styles.historyIcon}>
                  <Ionicons name="trophy" size={24} color={COLORS.mutedForeground} />
                </View>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyTitle}>{session.focusLabel?.toUpperCase()} EMOM</Text>
                  <Text style={styles.historySubtitle}>
                    {new Date(session.createdAt).toLocaleDateString()} • {session.durationMinutes} min
                  </Text>
                </View>
                <View style={styles.historyBadge}>
                  <Text style={styles.historyBadgeText}>{session.difficultyTag}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
            <View style={styles.actionButtonContent}>
              <Ionicons name="log-out-outline" size={20} color={COLORS.foreground} />
              <Text style={styles.actionButtonText}>Log Out</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.mutedForeground} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.actionButtonDestructive]} onPress={handleDeleteAccount}>
            <View style={styles.actionButtonContent}>
              <Ionicons name="trash-outline" size={20} color={COLORS.destructive} />
              <Text style={[styles.actionButtonText, styles.actionButtonTextDestructive]}>Delete Account</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.destructive} />
          </TouchableOpacity>
        </View>
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(204, 255, 0, 0.2)',
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.foreground,
  },
  profileEmail: {
    fontSize: 14,
    color: COLORS.mutedForeground,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statCardPrimary: {
    backgroundColor: 'rgba(204, 255, 0, 0.1)',
    borderColor: 'rgba(204, 255, 0, 0.2)',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.foreground,
  },
  statValuePrimary: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.mutedForeground,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  },
  statLabelPrimary: {
    fontSize: 10,
    color: COLORS.mutedForeground,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
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
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.foreground,
    marginBottom: 12,
  },
  profileCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  profileRowLabel: {
    fontSize: 14,
    color: COLORS.mutedForeground,
  },
  profileRowValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.foreground,
    textTransform: 'capitalize',
    maxWidth: '60%',
    textAlign: 'right',
  },
  emptyCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyText: {
    color: COLORS.mutedForeground,
    textAlign: 'center',
  },
  historyCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.foreground,
  },
  historySubtitle: {
    fontSize: 12,
    color: COLORS.mutedForeground,
    marginTop: 2,
  },
  historyBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  historyBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.mutedForeground,
    textTransform: 'uppercase',
  },
  actionButton: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  actionButtonDestructive: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.foreground,
  },
  actionButtonTextDestructive: {
    color: COLORS.destructive,
  },
});
