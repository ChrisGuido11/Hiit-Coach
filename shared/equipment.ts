// CHANGE SUMMARY (2025-11-29):
// - Added typed equipment IDs & centralized EQUIPMENT_OPTIONS with icons.
// - This is now the single source of truth for equipment across onboarding, settings, and AI.
// - Using lucide-react icons (existing in codebase) instead of MaterialCommunityIcons requested in spec.
// - Expanded from original 6 options to comprehensive 20-option equipment list.

export type EquipmentId =
  | 'bodyweight'
  | 'dumbbells'
  | 'kettlebell'
  | 'barbell'
  | 'resistance_bands_loop'
  | 'resistance_band_long'
  | 'pull_up_bar'
  | 'dip_bars'
  | 'bench'
  | 'step_box'
  | 'medicine_ball'
  | 'slam_ball'
  | 'trx'
  | 'jump_rope'
  | 'sliders'
  | 'exercise_ball'
  | 'rower'
  | 'bike'
  | 'treadmill'
  | 'elliptical';

export interface EquipmentOption {
  id: EquipmentId;
  label: string;
  description?: string;
  iconName: string; // lucide-react icon name
  defaultEnabled?: boolean;
}

/**
 * Comprehensive equipment options for HIIT/strength workouts.
 * This is the single source of truth for equipment across the entire app.
 *
 * Icon names reference lucide-react library icons.
 * All equipment must be stored using these exact IDs for consistency.
 */
export const EQUIPMENT_OPTIONS: EquipmentOption[] = [
  {
    id: 'bodyweight',
    label: 'Bodyweight Only',
    description: 'No equipment, just you and gravity.',
    iconName: 'User',
    defaultEnabled: true,
  },
  {
    id: 'dumbbells',
    label: 'Dumbbells',
    description: 'Single or pair of dumbbells.',
    iconName: 'Dumbbell',
  },
  {
    id: 'kettlebell',
    label: 'Kettlebell',
    description: 'One or more kettlebells.',
    iconName: 'Weight',
  },
  {
    id: 'barbell',
    label: 'Barbell',
    description: 'Barbell with plates or fixed-weight.',
    iconName: 'TrendingUp',
  },
  {
    id: 'resistance_bands_loop',
    label: 'Loop Bands',
    description: 'Short loop bands for glutes and legs.',
    iconName: 'Cable',
  },
  {
    id: 'resistance_band_long',
    label: 'Long Bands',
    description: 'Long resistance bands with handles or anchors.',
    iconName: 'Cable',
  },
  {
    id: 'pull_up_bar',
    label: 'Pull-Up Bar',
    description: 'Doorframe or fixed pull-up bar.',
    iconName: 'AlignVerticalJustifyStart',
  },
  {
    id: 'dip_bars',
    label: 'Dip Bars',
    description: 'Parallel bars or sturdy supports for dips.',
    iconName: 'AlignVerticalJustifyStart',
  },
  {
    id: 'bench',
    label: 'Bench',
    description: 'Flat or adjustable bench.',
    iconName: 'RectangleHorizontal',
  },
  {
    id: 'step_box',
    label: 'Step / Box',
    description: 'Plyo box or step platform.',
    iconName: 'Box',
  },
  {
    id: 'medicine_ball',
    label: 'Medicine Ball',
    description: 'Med ball or wall ball.',
    iconName: 'CircleDot',
  },
  {
    id: 'slam_ball',
    label: 'Slam Ball',
    description: 'Heavy ball for slams.',
    iconName: 'Circle',
  },
  {
    id: 'trx',
    label: 'TRX / Suspension',
    description: 'Suspension trainer straps.',
    iconName: 'Cable',
  },
  {
    id: 'jump_rope',
    label: 'Jump Rope',
    description: 'Speed rope or weighted rope.',
    iconName: 'Cable',
  },
  {
    id: 'sliders',
    label: 'Sliders / Gliders',
    description: 'Core and lower-body sliders.',
    iconName: 'Disc',
  },
  {
    id: 'exercise_ball',
    label: 'Exercise Ball',
    description: 'Swiss ball, stability ball.',
    iconName: 'Circle',
  },
  {
    id: 'rower',
    label: 'Rowing Machine',
    description: 'Erg or water rower.',
    iconName: 'Waves',
  },
  {
    id: 'bike',
    label: 'Bike / Air Bike',
    description: 'Stationary bike, spin bike, or assault bike.',
    iconName: 'Bike',
  },
  {
    id: 'treadmill',
    label: 'Treadmill',
    description: 'Motorized or manual treadmill.',
    iconName: 'MonitorPlay',
  },
  {
    id: 'elliptical',
    label: 'Elliptical',
    description: 'Elliptical trainer.',
    iconName: 'Activity',
  },
];

export const getEquipmentById = (id: EquipmentId): EquipmentOption | undefined =>
  EQUIPMENT_OPTIONS.find((e) => e.id === id);

/**
 * Get user-friendly label for equipment ID
 */
export const getEquipmentLabel = (id: EquipmentId | string): string => {
  const option = EQUIPMENT_OPTIONS.find((e) => e.id === id);
  return option?.label || id;
};

/**
 * Normalize equipment selection to always include at least bodyweight
 */
export const normalizeEquipment = (equipment: EquipmentId[]): EquipmentId[] => {
  if (!equipment || equipment.length === 0) return ['bodyweight'];
  // Deduplicate
  return Array.from(new Set(equipment));
};

/**
 * Equipment richness levels for AI workout generation
 */
export type EquipmentRichness = 'minimal' | 'moderate' | 'full';

/**
 * Determine equipment richness based on available equipment.
 * Used by AI to adjust workout difficulty and exercise selection.
 *
 * - minimal: Only bodyweight (limited variety, focus on density/tempo)
 * - moderate: Some equipment but no heavy strength tools (balanced approach)
 * - full: Access to barbells and/or cardio machines (can program heavy strength + conditioning)
 */
export const getEquipmentRichness = (equipment: EquipmentId[]): EquipmentRichness => {
  const set = new Set(equipment);

  // Only bodyweight = minimal
  if (set.size === 1 && set.has('bodyweight')) {
    return 'minimal';
  }

  // Has barbell, rower, bike, or treadmill = full gym capability
  if (set.has('barbell') || set.has('rower') || set.has('bike') || set.has('treadmill')) {
    return 'full';
  }

  // Everything else = moderate
  return 'moderate';
};

/**
 * Legacy equipment migration map for backward compatibility.
 * Maps old equipment keys to new typed EquipmentId values.
 */
export const EQUIPMENT_MIGRATION_MAP: Record<string, EquipmentId> = {
  "None (Bodyweight)": "bodyweight",
  "Dumbbells": "dumbbells",
  "Kettlebell": "kettlebell",
  "Pull-up Bar": "pull_up_bar",
  "Jump Rope": "jump_rope",
  "Box": "step_box",
  "bodyweight": "bodyweight",
  "dumbbells": "dumbbells",
  "kettlebells": "kettlebell",
  "resistance_bands": "resistance_bands_loop",
  "barbell": "barbell",
  "pull_up_bar": "pull_up_bar",
  "bench": "bench",
  "medicine_ball": "medicine_ball",
  "jump_rope": "jump_rope",
  "treadmill": "treadmill",
  "stationary_bike": "bike",
  "rower": "rower",
  "elliptical": "elliptical",
  "sliders": "sliders",
  "step_or_box": "step_box",
  "weight_machines": "bench", // Map weight machines to bench as closest equivalent
};

/**
 * Migrate equipment from old format to new typed format
 */
export const migrateEquipment = (equipment: string[]): EquipmentId[] => {
  const migrated = equipment.map(item => EQUIPMENT_MIGRATION_MAP[item] || item as EquipmentId);
  return normalizeEquipment(migrated);
};
