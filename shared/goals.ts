// CHANGE SUMMARY (2025-11-29):
// - Created centralized goal configuration system with 7 goal options
// - Defined AI-specific metadata for each goal (framework bias, intensity, tags)
// - Provides single source of truth for UI and AI workout generation

/**
 * Primary Goal Configuration System
 *
 * This file defines all available training goals with rich metadata used by:
 * - Onboarding UI (labels, icons, descriptions)
 * - AI Workout Generator (framework bias, intensity, exercise selection)
 * - Profile management (goal weights, personalization)
 */

export type PrimaryGoalId =
  | 'fat_loss'
  | 'muscle_gain'
  | 'strength_power';

export type IconLibrary = 'activity' | 'dumbbell' | 'flame' | 'target' | 'trending-up' | 'heart' | 'zap';

export interface FrameworkBias {
  tabata: number;
  emom: number;
  amrap: number;
  circuit: number;
}

export interface PrimaryGoalConfig {
  id: PrimaryGoalId;
  label: string;
  subtitle: string;
  iconName: IconLibrary; // lucide-react icon names
  // AI-specific metadata
  aiTags: string[]; // Used in prompts and heuristics
  frameworkBias: FrameworkBias; // Probability weights for framework selection
  intensityBias: 'low' | 'moderate' | 'high';
  preferredDurationsMinutes: [number, number]; // [min, max] typical durations
  restMultiplier: number; // Multiplier for rest periods (1.0 = baseline)
  exerciseBias: {
    // Exercise selection preferences
    compoundLifts: number; // 0-1 preference for compound movements
    cardio: number; // 0-1 preference for cardio exercises
    plyometric: number; // 0-1 preference for explosive movements
    mobility: number; // 0-1 preference for mobility/stretching
  };
}

export const PRIMARY_GOALS: PrimaryGoalConfig[] = [
  {
    id: 'fat_loss',
    label: 'Fat Loss',
    subtitle: 'Burn calories and lean out',
    iconName: 'trending-up',
    aiTags: ['fat loss', 'calorie burn', 'intervals', 'conditioning', 'metabolic'],
    frameworkBias: { tabata: 0.35, emom: 0.25, amrap: 0.15, circuit: 0.25 },
    intensityBias: 'moderate',
    preferredDurationsMinutes: [12, 25],
    restMultiplier: 0.85, // Shorter rest to maintain heart rate
    exerciseBias: {
      compoundLifts: 0.5,
      cardio: 0.8,
      plyometric: 0.6,
      mobility: 0.2,
    },
  },
  {
    id: 'muscle_gain',
    label: 'Muscle Gain',
    subtitle: 'Hypertrophy-focused strength work',
    iconName: 'target',
    aiTags: ['hypertrophy', 'time under tension', 'moderate rest', 'muscle building'],
    frameworkBias: { tabata: 0.1, emom: 0.4, amrap: 0.15, circuit: 0.35 },
    intensityBias: 'moderate',
    preferredDurationsMinutes: [20, 30],
    restMultiplier: 1.2, // Adequate rest for muscle recovery
    exerciseBias: {
      compoundLifts: 0.9,
      cardio: 0.2,
      plyometric: 0.3,
      mobility: 0.2,
    },
  },
  {
    id: 'strength_power',
    label: 'Strength & Power',
    subtitle: 'Build strength, explosiveness, and muscle',
    iconName: 'dumbbell',
    aiTags: ['strength', 'power', 'compound lifts', 'longer rest', 'explosive'],
    frameworkBias: { tabata: 0.1, emom: 0.4, amrap: 0.2, circuit: 0.3 },
    intensityBias: 'moderate',
    preferredDurationsMinutes: [10, 25],
    restMultiplier: 1.3, // Longer rest for strength recovery
    exerciseBias: {
      compoundLifts: 0.9,
      cardio: 0.2,
      plyometric: 0.6,
      mobility: 0.2,
    },
  },
];

/**
 * Helper: Get goal configuration by ID
 */
export const getPrimaryGoalConfig = (id: PrimaryGoalId | null | undefined): PrimaryGoalConfig | undefined => {
  if (!id) return undefined;
  return PRIMARY_GOALS.find((g) => g.id === id);
};

/**
 * Helper: Get AI tags for a goal (for prompt injection)
 */
export const getGoalTagsForAI = (goalId: PrimaryGoalId | null | undefined): string[] => {
  const config = getPrimaryGoalConfig(goalId);
  return config?.aiTags ?? [];
};

/**
 * Helper: Pick a framework based on goal bias
 * Uses weighted random selection from frameworkBias probabilities
 */
export const pickFrameworkForGoal = (
  goalId: PrimaryGoalId | null | undefined
): 'tabata' | 'emom' | 'amrap' | 'circuit' => {
  const config = getPrimaryGoalConfig(goalId);

  // Fallback: if no goal, default to EMOM (current app default)
  if (!config) return 'emom';

  const { frameworkBias } = config;
  const roll = Math.random();
  let cumulative = 0;

  const entries: [keyof FrameworkBias, number][] = Object.entries(frameworkBias) as any;

  for (const [framework, weight] of entries) {
    cumulative += weight;
    if (roll <= cumulative) {
      return framework as any;
    }
  }

  return 'emom'; // Fallback
};

/**
 * Helper: Calculate goal weights from primary + secondary goals
 * Primary goal gets 60% weight, secondary goals share 40%
 */
export const buildGoalWeights = (
  primaryGoal: PrimaryGoalId,
  secondaryGoals: PrimaryGoalId[] = []
): Record<PrimaryGoalId, number> => {
  const allIds: PrimaryGoalId[] = [
    'cardio_endurance',
    'strength_power',
    'metabolic_conditioning',
    'fat_loss',
    'muscle_gain',
    'mobility_recovery',
    'athletic_performance',
  ];

  const weights: Record<PrimaryGoalId, number> = allIds.reduce(
    (acc, id) => ({ ...acc, [id]: 0 }),
    {} as Record<PrimaryGoalId, number>
  );

  weights[primaryGoal] = 0.6;

  const secondaryShare = secondaryGoals.length ? 0.4 / secondaryGoals.length : 0;

  secondaryGoals.forEach((id) => {
    weights[id] = secondaryShare;
  });

  return weights;
};

/**
 * Helper: Get combined exercise bias from goal weights
 * Useful when user has both primary and secondary goals
 */
export const getCombinedExerciseBias = (
  goalWeights: Record<PrimaryGoalId, number>
): PrimaryGoalConfig['exerciseBias'] => {
  const combinedBias = {
    compoundLifts: 0,
    cardio: 0,
    plyometric: 0,
    mobility: 0,
  };

  Object.entries(goalWeights).forEach(([goalId, weight]) => {
    const config = getPrimaryGoalConfig(goalId as PrimaryGoalId);
    if (config && weight > 0) {
      combinedBias.compoundLifts += config.exerciseBias.compoundLifts * weight;
      combinedBias.cardio += config.exerciseBias.cardio * weight;
      combinedBias.plyometric += config.exerciseBias.plyometric * weight;
      combinedBias.mobility += config.exerciseBias.mobility * weight;
    }
  });

  return combinedBias;
};

/**
 * Helper: Get rest multiplier from goal weights
 */
export const getCombinedRestMultiplier = (
  goalWeights: Record<PrimaryGoalId, number>
): number => {
  let multiplier = 0;

  Object.entries(goalWeights).forEach(([goalId, weight]) => {
    const config = getPrimaryGoalConfig(goalId as PrimaryGoalId);
    if (config && weight > 0) {
      multiplier += config.restMultiplier * weight;
    }
  });

  return multiplier || 1.0; // Default to 1.0 if no goals
};

/**
 * Legacy goal mapping: Convert old goalFocus values to new PrimaryGoalId
 * Maintains backward compatibility with existing profiles
 */
export const migrateLegacyGoal = (
  legacyGoalFocus: string | null | undefined
): PrimaryGoalId | null => {
  if (!legacyGoalFocus) return null;

  const mapping: Record<string, PrimaryGoalId> = {
    cardio: 'cardio_endurance',
    strength: 'strength_power',
    metcon: 'metabolic_conditioning',
  };

  return mapping[legacyGoalFocus] ?? null;
};
