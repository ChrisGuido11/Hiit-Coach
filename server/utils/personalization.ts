import type { WorkoutRound, WorkoutSession } from "@shared/schema";

export interface PersonalizationInsights {
  averageHitRate: number;
  skipRate: number;
  averageRpe: number | null;
  fatigueTrend: number;
  exercisePreference: Record<string, number>;
  streakLength: number;
  timeOfDayAdherence: {
    preferredWindow: "morning" | "afternoon" | "evening" | "late-night" | "unavailable";
    consistency: number;
    averageHour: number | null;
  };
  exercisePerformance: Record<
    string,
    {
      completionRatio: number;
      averageSecondsPerUnit: number | null;
      underperformed: boolean;
      samples: number;
    }
  >;
}

export interface SessionPerformanceSummary {
  averageHitRate: number;
  skipRate: number;
  averageRpe: number | null;
}

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export function buildPersonalizationInsights(
  sessions: Array<WorkoutSession & { rounds: WorkoutRound[] }>,
  windowSize = 8
): PersonalizationInsights {
  const recent = sessions.slice(0, windowSize);

  let hitSum = 0;
  let hitCount = 0;
  let skippedCount = 0;
  let totalRounds = 0;
  const preferenceBuckets: Record<string, { score: number; count: number }> = {};
  const rpeValues: number[] = [];
  const fatigueScores: number[] = [];
  const exercisePerformanceBuckets: Record<
    string,
    {
      ratioSum: number;
      ratioCount: number;
      underperformCount: number;
      total: number;
      secondsSum: number;
      secondsCount: number;
    }
  > = {};

  const timeBuckets: Record<"morning" | "afternoon" | "evening" | "late-night", { count: number; hourSum: number }> = {
    morning: { count: 0, hourSum: 0 },
    afternoon: { count: 0, hourSum: 0 },
    evening: { count: 0, hourSum: 0 },
    "late-night": { count: 0, hourSum: 0 },
  };

  for (const session of recent) {
    const createdAt = new Date(session.createdAt);
    const hour = createdAt.getHours();
    const bucketKey =
      hour >= 5 && hour < 12
        ? "morning"
        : hour >= 12 && hour < 17
          ? "afternoon"
          : hour >= 17 && hour < 22
            ? "evening"
            : "late-night";
    timeBuckets[bucketKey].count += 1;
    timeBuckets[bucketKey].hourSum += hour;

    let sessionHitSum = 0;
    let sessionHitCount = 0;
    let sessionSkipped = 0;
    let sessionTotal = 0;

    if (typeof session.perceivedExertion === "number") {
      rpeValues.push(session.perceivedExertion);
    }

    for (const round of session.rounds) {
      totalRounds += 1;
      if (round.skipped) {
        skippedCount += 1;
        sessionSkipped += 1;
        sessionTotal += 1;
        continue;
      }

      const target = round.reps || 1;
      const actualValue = round.isHold
        ? round.actualSeconds ?? round.actualReps ?? target
        : round.actualReps ?? round.actualSeconds ?? target;

      const ratio = Math.min(actualValue / target, 1.5);
      hitSum += ratio;
      hitCount += 1;
      sessionHitSum += ratio;
      sessionHitCount += 1;
      sessionTotal += 1;

      const bucket = preferenceBuckets[round.targetMuscleGroup] ?? { score: 0, count: 0 };
      bucket.score += ratio;
      bucket.count += 1;
      preferenceBuckets[round.targetMuscleGroup] = bucket;

      const exerciseBucket =
        exercisePerformanceBuckets[round.exerciseName] ?? {
          ratioSum: 0,
          ratioCount: 0,
          underperformCount: 0,
          total: 0,
          secondsSum: 0,
          secondsCount: 0,
        };

      exerciseBucket.total += 1;
      exerciseBucket.ratioSum += ratio;
      exerciseBucket.ratioCount += 1;
      if (ratio < 0.9) {
        exerciseBucket.underperformCount += 1;
      }

      const actualSeconds = round.actualSeconds;
      const completedUnits = round.isHold
        ? round.actualSeconds ?? round.actualReps ?? target
        : round.actualReps ?? target;
      if (typeof actualSeconds === "number" && completedUnits > 0) {
        exerciseBucket.secondsSum += actualSeconds / completedUnits;
        exerciseBucket.secondsCount += 1;
      }

      exercisePerformanceBuckets[round.exerciseName] = exerciseBucket;
    }

    const sessionAverageHitRate = sessionHitCount ? sessionHitSum / sessionHitCount : 1;
    const sessionSkipRate = sessionTotal ? sessionSkipped / sessionTotal : 0;
    const fatigueScore = Math.max(
      0,
      sessionSkipRate * 0.5 +
        (sessionAverageHitRate < 1 ? 1 - sessionAverageHitRate : 0) +
        (session.perceivedExertion && session.perceivedExertion > 3 ? (session.perceivedExertion - 3) / 5 : 0),
    );
    fatigueScores.push(fatigueScore);
  }

  const averageHitRate = hitCount ? hitSum / hitCount : 1;
  const skipRate = totalRounds ? skippedCount / totalRounds : 0;
  const averageRpe = rpeValues.length ? rpeValues.reduce((a, b) => a + b, 0) / rpeValues.length : null;
  const fatigueTrend = (() => {
    if (!fatigueScores.length) return 0;
    let weightedSum = 0;
    let weightTotal = 0;
    for (let i = 0; i < fatigueScores.length; i++) {
      const weight = Math.pow(0.8, i); // exponential decay for recency
      weightedSum += fatigueScores[i] * weight;
      weightTotal += weight;
    }
    return weightTotal ? weightedSum / weightTotal : 0;
  })();

  const exercisePreference = Object.fromEntries(
    Object.entries(preferenceBuckets).map(([muscle, bucket]) => {
      const ratio = bucket.count ? bucket.score / bucket.count : 1;
      return [muscle, Math.min(Math.max(ratio, 0.8), 1.3)];
    })
  );

  const exercisePerformance = Object.fromEntries(
    Object.entries(exercisePerformanceBuckets).map(([exercise, bucket]) => {
      const completionRatio = bucket.ratioCount ? bucket.ratioSum / bucket.ratioCount : 1;
      const averageSecondsPerUnit = bucket.secondsCount ? bucket.secondsSum / bucket.secondsCount : null;
      const underperformed =
        (bucket.total ? bucket.underperformCount / bucket.total : 0) > 0.35 || completionRatio < 0.9;
      return [exercise, { completionRatio, averageSecondsPerUnit, underperformed, samples: bucket.total }];
    })
  );

  const totalTimeSamples = Object.values(timeBuckets).reduce((acc, bucket) => acc + bucket.count, 0);
  const preferredWindow =
    totalTimeSamples === 0
      ? "unavailable"
      : (Object.entries(timeBuckets).reduce((a, b) => (b[1].count > a[1].count ? b : a)) as [
          "morning" | "afternoon" | "evening" | "late-night",
          { count: number; hourSum: number },
        ])[0];
  const preferredCount = preferredWindow === "unavailable" ? 0 : timeBuckets[preferredWindow].count;
  const timeOfDayAdherence = {
    preferredWindow,
    consistency: totalTimeSamples ? preferredCount / totalTimeSamples : 0,
    averageHour:
      preferredWindow === "unavailable" || preferredCount === 0
        ? null
        : Math.round((timeBuckets[preferredWindow].hourSum / preferredCount) * 10) / 10,
  } as const;

  let streakLength = 0;
  let lastTrackedDate: Date | null = null;
  const countedDays = new Set<string>();
  for (const session of sessions) {
    const createdAt = new Date(session.createdAt);
    const dayKey = createdAt.toISOString().split("T")[0];
    if (countedDays.has(dayKey)) continue;
    countedDays.add(dayKey);

    if (!session.completed) break;
    if (!lastTrackedDate) {
      streakLength = 1;
      lastTrackedDate = createdAt;
      continue;
    }

    const dayDiff = Math.floor(
      (startOfDay(lastTrackedDate).getTime() - startOfDay(createdAt).getTime()) / (1000 * 60 * 60 * 24),
    );
    if (dayDiff === 0) {
      continue;
    }
    if (dayDiff === 1) {
      streakLength += 1;
      lastTrackedDate = createdAt;
    } else {
      break;
    }
  }

  return {
    averageHitRate,
    skipRate,
    averageRpe,
    fatigueTrend,
    exercisePreference,
    streakLength,
    timeOfDayAdherence,
    exercisePerformance,
  };
}

export function personalizeFrameworkSelection(
  baseFramework: "tabata" | "emom" | "amrap" | "circuit",
  personalization?: PersonalizationInsights
): "tabata" | "emom" | "amrap" | "circuit" {
  if (!personalization) return baseFramework;
  const exerciseValues = Object.values(personalization.exercisePerformance);
  const underperformanceRate = exerciseValues.length
    ? exerciseValues.filter((perf) => perf.underperformed).length / exerciseValues.length
    : 0;

  let framework = baseFramework;

  // If fatigue or underperformance is high, prioritize frameworks with built-in recovery
  if (personalization.fatigueTrend > 0.75 || underperformanceRate > 0.35) {
    framework = "circuit";
  } else if (personalization.fatigueTrend > 0.55 && baseFramework === "tabata") {
    framework = "emom";
  }

  // If user is consistent and fresh, allow more intensity variety
  if (
    framework === baseFramework &&
    personalization.streakLength >= 5 &&
    personalization.fatigueTrend < 0.4 &&
    personalization.timeOfDayAdherence.consistency > 0.6
  ) {
    framework = baseFramework === "emom" ? "tabata" : baseFramework;
  }

  // If time-of-day consistency is low, avoid rigid interval structures
  if (personalization.timeOfDayAdherence.consistency < 0.35 && framework === "tabata") {
    framework = "amrap";
  }

  return framework;
}

export function summarizeSessionPerformance(
  rounds: Array<Pick<WorkoutRound, "reps" | "actualReps" | "actualSeconds" | "skipped" | "isHold">>,
  perceivedExertion?: number | null
): SessionPerformanceSummary {
  let hitSum = 0;
  let hitCount = 0;
  let skipped = 0;

  for (const round of rounds) {
    if (round.skipped) {
      skipped += 1;
      continue;
    }
    const target = round.reps || 1;
    const actualValue = round.isHold
      ? round.actualSeconds ?? round.actualReps ?? target
      : round.actualReps ?? round.actualSeconds ?? target;
    hitSum += Math.min(actualValue / target, 1.5);
    hitCount += 1;
  }

  const totalRounds = rounds.length || 1;

  return {
    averageHitRate: hitCount ? hitSum / hitCount : 1,
    skipRate: skipped / totalRounds,
    averageRpe: typeof perceivedExertion === "number" ? perceivedExertion : null,
  };
}
