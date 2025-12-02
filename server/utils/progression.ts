import type {
  ExerciseProgression,
  InsertExerciseProgression,
  WorkoutRound,
} from "@shared/schema";

type ProgressionRound = Pick<
  WorkoutRound,
  "exerciseName" | "reps" | "actualReps" | "actualSeconds" | "isHold" | "skipped"
> & {
  targetLoad?: number | null;
  actualLoad?: number | null;
};

interface ExerciseAggregate {
  target: number;
  actual: number;
  isHold: boolean;
  targetLoad?: number | null;
  actualLoad?: number | null;
  skipped: boolean;
}

function calculateIsoWeek(date: Date): number {
  const tempDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNumber = (tempDate.getUTCDay() + 6) % 7;
  tempDate.setUTCDate(tempDate.getUTCDate() - dayNumber + 3);
  const firstThursday = new Date(Date.UTC(tempDate.getUTCFullYear(), 0, 4));
  const weekNumber =
    1 +
    Math.round(
      ((tempDate.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7,
    );
  return weekNumber;
}

function computeOverperformance(
  aggregate: ExerciseAggregate,
  progression: ExerciseProgression | undefined,
): {
  nextTargetReps: number;
  nextTargetLoad: number | null;
  overperformanceStreak: number;
  weeklyIncrements: number;
} {
  const now = new Date();
  const weekOfYear = calculateIsoWeek(now);
  const baseTarget = Math.max(1, progression?.nextTargetReps ?? aggregate.target);
  const baseLoad = progression?.nextTargetLoad ?? aggregate.targetLoad ?? null;

  const performanceRatio = aggregate.actual / Math.max(aggregate.target, 1);
  const loadRatio =
    aggregate.actualLoad && aggregate.targetLoad ? aggregate.actualLoad / Math.max(aggregate.targetLoad, 1) : null;

  const overperformed = !aggregate.skipped && (performanceRatio >= 1.05 || (loadRatio ?? 0) >= 1.02);

  const sameWeek = progression?.weekOfYear === weekOfYear;
  let weeklyIncrements = sameWeek ? progression?.weeklyIncrements ?? 0 : 0;
  let streak = overperformed ? (progression?.overperformanceStreak ?? 0) + 1 : 0;

  let nextTargetReps = baseTarget;
  let nextTargetLoad = baseLoad ?? null;

  if (streak >= 3 && weeklyIncrements < 2) {
    nextTargetReps = Math.max(baseTarget + 1, Math.round(baseTarget * 1.05));
    if (aggregate.actualLoad) {
      const baselineLoad = nextTargetLoad ?? aggregate.targetLoad ?? 0;
      nextTargetLoad = Math.max(aggregate.actualLoad, baselineLoad + 2.5);
    }
    weeklyIncrements += 1;
    streak = 0; // reset after bump so we require a fresh streak for future increases
  }

  return { nextTargetReps, nextTargetLoad, overperformanceStreak: streak, weeklyIncrements };
}

export function buildProgressionUpdates(
  rounds: ProgressionRound[],
  existing: ExerciseProgression[],
): Array<Omit<InsertExerciseProgression, "id" | "userId">> {
  const now = new Date();
  const weekOfYear = calculateIsoWeek(now);
  const progressionMap = new Map(existing.map((item) => [item.exerciseName, item] as const));

  const aggregates = new Map<string, ExerciseAggregate>();

  for (const round of rounds) {
    const aggregate = aggregates.get(round.exerciseName) ?? {
      target: round.reps,
      actual: 0,
      isHold: Boolean(round.isHold),
      targetLoad: round.targetLoad ?? null,
      actualLoad: round.actualLoad ?? null,
      skipped: false,
    };

    if (round.skipped) {
      aggregate.skipped = true;
      aggregates.set(round.exerciseName, aggregate);
      continue;
    }

    const targetValue = round.isHold ? round.reps || 1 : round.reps || 1;
    const actualValue = round.isHold
      ? round.actualSeconds ?? round.actualReps ?? targetValue
      : round.actualReps ?? round.actualSeconds ?? targetValue;

    aggregate.target = targetValue;
    aggregate.actual = actualValue;
    aggregate.targetLoad = round.targetLoad ?? aggregate.targetLoad ?? null;
    aggregate.actualLoad = round.actualLoad ?? aggregate.actualLoad ?? null;

    aggregates.set(round.exerciseName, aggregate);
  }

  const updates: Array<Omit<InsertExerciseProgression, "id" | "userId">> = [];

  for (const [exerciseName, aggregate] of aggregates.entries()) {
    const progression = progressionMap.get(exerciseName);
    const adjustment = computeOverperformance(aggregate, progression);

    updates.push({
      exerciseName,
      nextTargetReps: adjustment.nextTargetReps,
      nextTargetLoad: adjustment.nextTargetLoad,
      overperformanceStreak: adjustment.overperformanceStreak,
      weeklyIncrements: adjustment.weeklyIncrements,
      weekOfYear,
      lastSessionAt: now,
    });
  }

  return updates;
}

export function getWeekNumber(date: Date = new Date()): number {
  return calculateIsoWeek(date);
}
