import { useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Play, TrendingUp, Flame, Clock, ArrowRight, RotateCw, Beaker, Flame as FlameIcon } from "lucide-react";
import MobileLayout from "@/components/layout/mobile-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { GeneratedWorkout, Profile as ProfileModel, WorkoutSession } from "@/../../shared/schema";
import { getQueryFn } from "@/lib/queryClient";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis } from "recharts";

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

export default function Home() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [user, authLoading, toast]);

  const { data: profile, isLoading: profileLoading } = useQuery<ProfileModel | null>({
    queryKey: ["/api/profile"],
    enabled: !!user,
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: workout, isLoading: workoutLoading, refetch: regenerateWorkout } = useQuery<GeneratedWorkout>({
    queryKey: ["/api/workout/generate"],
    enabled: !!profile,
    retry: false,
  });

  const { data: history = [] } = useQuery<WorkoutSession[] | null>({
    queryKey: ["/api/workout/history"],
    enabled: !!user,
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const historyData = history ?? [];

  const sortedHistory = [...historyData].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - 6);

  const dateKey = (date: Date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized.toDateString();
  };

  const uniqueWorkoutDays = Array.from(
    new Set(sortedHistory.map((session) => dateKey(new Date(session.createdAt))))
  ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  let currentStreak = 0;
  let bestStreak = 0;
  let previousDate: Date | null = null;

  uniqueWorkoutDays.forEach((day) => {
    const currentDate = new Date(day);
    if (!previousDate) {
      currentStreak = 1;
    } else {
      const diffDays = Math.round(
        (previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      currentStreak = diffDays === 1 ? currentStreak + 1 : 1;
    }
    bestStreak = Math.max(bestStreak, currentStreak);
    previousDate = currentDate;
  });

  const streakNextBadge = Math.max(currentStreak + 1, bestStreak + 1);

  const weeklyVolumeData = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    const key = dateKey(date);
    const minutes = sortedHistory
      .filter((session) => dateKey(new Date(session.createdAt)) === key)
      .reduce((sum, session) => sum + session.durationMinutes, 0);

    return {
      day: date.toLocaleDateString(undefined, { weekday: "short" }),
      minutes,
    };
  });

  const weeklyMinutes = weeklyVolumeData.reduce((sum, day) => sum + day.minutes, 0);

  const rpeTrendData = sortedHistory
    .filter((session) => typeof session.perceivedExertion === "number")
    .slice(0, 7)
    .reverse()
    .map((session, index) => ({
      label: `S${index + 1}`,
      rpe: session.perceivedExertion ?? 0,
      difficulty: session.difficultyTag,
      date: new Date(session.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
    }));

  const averageRpe =
    rpeTrendData.length > 0
      ? rpeTrendData.reduce((sum, entry) => sum + entry.rpe, 0) / rpeTrendData.length
      : null;

  const rpeChange =
    rpeTrendData.length > 1
      ? rpeTrendData[rpeTrendData.length - 1].rpe - rpeTrendData[0].rpe
      : 0;

  const weeklySessions = sortedHistory.filter(
    (session) => new Date(session.createdAt).getTime() >= weekStart.getTime()
  );

  const recentActivity = weeklySessions.length > 0 ? weeklySessions : sortedHistory.slice(0, 5);

  const totalWorkouts = historyData.length;
  const totalMinutes = historyData.reduce((sum, session) => sum + session.durationMinutes, 0);

  if (authLoading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </MobileLayout>
    );
  }

  if (profileLoading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Loading profile...</div>
        </div>
      </MobileLayout>
    );
  }

  if (!profile) {
    return (
      <MobileLayout hideNav>
        <div className="flex items-center justify-center h-full p-6 text-center">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Welcome!</h2>
            <p className="text-muted-foreground mb-6">Complete your profile to start training</p>
            <Link href="/onboarding">
              <Button className="bg-primary text-black hover:bg-primary/90">
                Complete Onboarding
              </Button>
            </Link>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="p-6 pb-24 space-y-10">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-muted-foreground font-medium uppercase tracking-wider text-sm">{getTimeGreeting()}</p>
            <h1 className="text-4xl font-bold text-white leading-none mt-1">
              READY TO <br/> 
              <span className="text-primary neon-text">SWEAT?</span>
            </h1>
          </div>
          <div className="h-12 w-12 rounded-full bg-secondary border border-border flex items-center justify-center">
            <Flame className="text-primary" />
          </div>
        </div>

        {/* Main Action Card - Daily WOD */}
        {workoutLoading ? (
          <Card className="p-6 bg-card/50 border-border/50 h-48 flex items-center justify-center">
            <div className="text-muted-foreground">Generating workout...</div>
          </Card>
        ) : workout ? (
          <Card className="relative overflow-hidden border-0 group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent z-0" />
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517963879466-cd11fa9e5d34?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
            
            <div className="relative z-10 p-6 flex flex-col h-52 justify-between">
              <div className="flex justify-between items-start">
                <div className="bg-primary/20 backdrop-blur-sm px-3 py-1 rounded text-primary text-xs font-bold uppercase tracking-wider border border-primary/20">
                  Daily WOD
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    regenerateWorkout();
                  }}
                  className="text-muted-foreground hover:text-primary"
                  data-testid="button-regenerate"
                >
                  <RotateCw size={16} />
                </Button>
              </div>
              
              <div>
                <h2 className="text-3xl font-bold text-white mb-1 uppercase">
                  {workout.focusLabel}
                </h2>
                <p className="text-primary text-sm font-bold mb-4 uppercase tracking-wider">
                  {workout.framework}
                </p>
                <p className="text-gray-300 text-sm mb-4">
                  {workout.durationMinutes} Min • {workout.rounds.length} Exercises • {workout.difficultyTag}
                </p>
                
                <Link href="/workout">
                  <Button className="w-full bg-primary text-black hover:bg-primary/90 font-bold uppercase tracking-wider" data-testid="button-start-workout">
                    <Play className="w-4 h-4 mr-2 fill-current" /> Start Workout
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ) : null}

        {/* Workout Lab CTA */}
        <Link href="/workout-lab">
          <Card className="p-5 bg-gradient-to-r from-secondary/50 to-secondary/30 border-border/50 cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <Beaker className="text-primary w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-0.5">Workout Lab</h3>
                  <p className="text-xs text-muted-foreground">
                    Choose from 4 training frameworks
                  </p>
                </div>
              </div>
              <ArrowRight className="text-muted-foreground w-5 h-5" />
            </div>
          </Card>
        </Link>

        {/* Stats Row */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <Card className="p-4 bg-card/50 border-border/50 flex flex-col justify-between">
            <TrendingUp className="text-primary w-6 h-6 mb-3" />
            <div>
              <span className="text-3xl font-display font-bold">{totalWorkouts}</span>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Workouts</p>
            </div>
          </Card>
          <Card className="p-4 bg-card/50 border-border/50 flex flex-col justify-between">
            <Clock className="text-primary w-6 h-6 mb-3" />
            <div>
              <span className="text-3xl font-display font-bold">{totalMinutes}</span>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Minutes</p>
            </div>
          </Card>
        </div>

        {/* Streaks & Weekly Stats */}
        <div className="grid gap-4">
          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase font-bold text-primary tracking-wider">Streaks</p>
                <h3 className="text-xl font-bold text-white">{currentStreak || 0}-Day Current Streak</h3>
                <p className="text-sm text-muted-foreground">
                  Best streak: {bestStreak || 0} days. Keep going to hit {streakNextBadge}!
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                    Active
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase text-gray-200">
                    Personal Best: {bestStreak || 0}d
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-secondary/60 border border-border/60 flex items-center justify-center">
                <FlameIcon className="text-primary" />
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 bg-card/50 border-border/50">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs uppercase font-bold text-primary tracking-wider">Weekly Volume</p>
                  <h3 className="text-lg font-bold text-white">{weeklyMinutes} Min</h3>
                  <p className="text-xs text-muted-foreground">Last 7 days</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-secondary/40 text-xs font-bold uppercase text-gray-200">
                  {weeklySessions.length} Sessions
                </div>
              </div>
              <ChartContainer
                config={{ minutes: { label: "Minutes", color: "hsl(var(--primary))" } }}
                className="h-32"
              >
                <BarChart data={weeklyVolumeData} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Bar dataKey="minutes" fill="var(--color-minutes)" radius={[6, 6, 6, 6]} />
                </BarChart>
              </ChartContainer>
            </Card>

            <Card className="p-4 bg-card/50 border-border/50">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs uppercase font-bold text-primary tracking-wider">RPE Trend</p>
                  <h3 className="text-lg font-bold text-white">
                    {averageRpe !== null ? averageRpe.toFixed(1) : "-"} Avg RPE
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {rpeTrendData.length} recent sessions • {rpeChange > 0 ? "Increasing" : rpeChange < 0 ? "Easing" : "Stable"}
                  </p>
                </div>
                <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase text-gray-200">
                  Difficulty: {rpeChange > 0 ? "Climbing" : rpeChange < 0 ? "Dropping" : "Steady"}
                </div>
              </div>
              <ChartContainer
                config={{ rpe: { label: "RPE", color: "hsl(var(--primary))" } }}
                className="h-32"
              >
                <LineChart data={rpeTrendData} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent labelKey="date" />} />
                  <Line
                    type="monotone"
                    dataKey="rpe"
                    stroke="var(--color-rpe)"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "var(--color-rpe)" }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ChartContainer>
            </Card>
          </div>
        </div>

        {/* Recent Activity Preview */}
        {historyData.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl text-white">Recent Activity</h3>
              <Link href="/profile">
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary">
                  View Details
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {recentActivity.map((session) => (
                <Card key={session.id} className="p-4 bg-card/30 border-border/50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded bg-secondary/50 flex items-center justify-center font-display text-xl font-bold text-muted-foreground">
                      {session.durationMinutes}
                    </div>
                    <div>
                      <h4 className="text-lg leading-none mb-1 capitalize">{session.focusLabel}</h4>
                      <p className="text-xs text-muted-foreground">
                        {session.framework} • {new Date(session.createdAt).toLocaleDateString()} • {session.difficultyTag}
                      </p>
                      {session.perceivedExertion ? (
                        <p className="text-[11px] text-gray-400">RPE {session.perceivedExertion} • {session.durationMinutes} min</p>
                      ) : (
                        <p className="text-[11px] text-gray-400">{session.durationMinutes} min completed</p>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="text-muted-foreground w-5 h-5" />
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
