import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../lib/AuthContext';
import { COLORS } from '../lib/config';

export default function LandingScreen() {
  const { isAuthenticated, isLoading, login } = useAuth();

  React.useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
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
      <View style={styles.content}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="flash" size={48} color={COLORS.primary} />
          </View>

          <Text style={styles.title}>EMOM{'\n'}PULSE</Text>
          <Text style={styles.subtitle}>Every Minute Matters</Text>

          {/* Features Grid */}
          <View style={styles.featuresGrid}>
            <View style={styles.featureCard}>
              <Ionicons name="timer-outline" size={24} color={COLORS.primary} />
              <Text style={styles.featureText}>EMOM Timer</Text>
            </View>
            <View style={styles.featureCard}>
              <Ionicons name="person-outline" size={24} color={COLORS.primary} />
              <Text style={styles.featureText}>Personalized</Text>
            </View>
            <View style={styles.featureCard}>
              <Ionicons name="trending-up-outline" size={24} color={COLORS.primary} />
              <Text style={styles.featureText}>Track Progress</Text>
            </View>
            <View style={styles.featureCard}>
              <Ionicons name="flash-outline" size={24} color={COLORS.primary} />
              <Text style={styles.featureText}>Adaptive AI</Text>
            </View>
          </View>
        </View>

        {/* CTA Button */}
        <View style={styles.ctaSection}>
          <TouchableOpacity style={styles.loginButton} onPress={login}>
            <Ionicons name="flash" size={20} color={COLORS.primaryForeground} />
            <Text style={styles.loginButtonText}>Get Started</Text>
          </TouchableOpacity>
          <Text style={styles.loginHint}>Sign in to start training</Text>
        </View>
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
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  heroSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(204, 255, 0, 0.2)',
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  title: {
    fontSize: 56,
    fontWeight: '800',
    color: COLORS.foreground,
    textAlign: 'center',
    letterSpacing: 2,
    lineHeight: 60,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.mutedForeground,
    marginTop: 8,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 32,
    gap: 12,
  },
  featureCard: {
    width: '45%',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.foreground,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  ctaSection: {
    paddingBottom: 24,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primaryForeground,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  loginHint: {
    fontSize: 12,
    color: COLORS.mutedForeground,
    textAlign: 'center',
    marginTop: 12,
  },
});
