// CHANGE SUMMARY (2025-11-29):
// - Switched onboarding equipment step to use centralized EQUIPMENT_OPTIONS from shared/equipment.
// - Using EquipmentSelector component for consistent icon-based, multi-select equipment UI.
// - Persists typed EquipmentId[] to PostgreSQL via /api/profile endpoint.
// - Normalizes equipment to ensure at least bodyweight is always selected.
// - Expanded Primary Goal options from 3 to 7 with icons & descriptions.
// - Added primary + secondary goal selection and stored them in profile.
// - AI workout generator now uses goals to bias frameworks, intensity, and exercise selection.

import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Check,
  Activity,
  Dumbbell,
  Flame,
  Target,
  TrendingUp,
  Heart,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import MobileLayout from "@/components/layout/mobile-layout";
import { EquipmentSelector } from "@/components/equipment-selector";
import { MasteryTierLegend } from "@/components/mastery-tiers";
import { normalizeEquipment, type EquipmentId } from "@shared/equipment";
import { PRIMARY_GOALS, buildGoalWeights, type PrimaryGoalId } from "@shared/goals";


// Icon mapping for goals
const GOAL_ICONS = {
  activity: Activity,
  dumbbell: Dumbbell,
  flame: Flame,
  target: Target,
  'trending-up': TrendingUp,
  heart: Heart,
  zap: Zap,
};

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [preferences, setPreferences] = useState({
    fitnessLevel: "",
    equipment: ['bodyweight'] as EquipmentId[],
    primaryGoal: null as PrimaryGoalId | null,
    secondaryGoals: [] as PrimaryGoalId[],
  });

  const createProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create profile");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({ title: "Profile Created!", description: "Let's start training!" });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleSelect = (key: string, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleEquipmentChange = (equipment: EquipmentId[]) => {
    setPreferences(prev => ({ ...prev, equipment }));
  };

  const handleGoalSelect = (goalId: PrimaryGoalId) => {
    const { primaryGoal, secondaryGoals } = preferences;

    if (primaryGoal === goalId) {
      // Tapping primary goal again: deselect it
      setPreferences(prev => ({
        ...prev,
        primaryGoal: null,
        secondaryGoals: prev.secondaryGoals.filter(g => g !== goalId),
      }));
      return;
    }

    if (secondaryGoals.includes(goalId)) {
      // Tapping a secondary goal: promote to primary
      setPreferences(prev => ({
        ...prev,
        primaryGoal: goalId,
        secondaryGoals: primaryGoal ? [primaryGoal, ...prev.secondaryGoals.filter(g => g !== goalId)] : prev.secondaryGoals.filter(g => g !== goalId),
      }));
      return;
    }

    // New selection: set as primary, demote old primary to secondary
    const newSecondaryGoals = primaryGoal
      ? [primaryGoal, ...secondaryGoals].slice(0, 2) // Max 2 secondary goals
      : secondaryGoals;

    setPreferences(prev => ({
      ...prev,
      primaryGoal: goalId,
      secondaryGoals: newSecondaryGoals,
    }));
  };

  const nextStep = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      // Validate that at least a primary goal is selected
      if (!preferences.primaryGoal) {
        toast({
          title: "Goal Required",
          description: "Choose at least one primary goal to personalize your training.",
          variant: "destructive"
        });
        return;
      }

      // Build goal weights from primary + secondary goals
      const goalWeights = buildGoalWeights(
        preferences.primaryGoal,
        preferences.secondaryGoals
      );

      // Normalize equipment before saving (ensure at least bodyweight)
      const normalizedPreferences = {
        fitnessLevel: preferences.fitnessLevel,
        equipment: normalizeEquipment(preferences.equipment),
        primaryGoal: preferences.primaryGoal,
        secondaryGoals: preferences.secondaryGoals,
        goalWeights,
      };

      createProfileMutation.mutate(normalizedPreferences);
    }
  };

  const steps = [
    {
      title: "Fitness Level",
      subtitle: "Help us tailor the intensity",
      component: (
        <div className="space-y-3">
          {["Beginner", "Intermediate", "Advanced", "Elite"].map((level) => (
            <Card 
              key={level}
              className={cn(
                "p-4 border-2 cursor-pointer transition-all duration-200 flex items-center justify-between",
                preferences.fitnessLevel === level
                  ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(0,229,255,0.15)]"
                  : "border-border/50 bg-card/50 hover:border-primary/50"
              )}
              onClick={() => handleSelect("fitnessLevel", level)}
              data-testid={`option-fitness-${level.toLowerCase()}`}
            >
              <span className="text-lg font-bold tracking-wide">{level}</span>
              {preferences.fitnessLevel === level && <Check className="text-primary" size={20} />}
            </Card>
          ))}
        </div>
      )
    },
    {
      title: "Equipment",
      subtitle: "What do you have access to?",
      component: (
        <EquipmentSelector
          value={preferences.equipment}
          onChange={handleEquipmentChange}
          mode="onboarding"
        />
      )
    },
    {
      title: "Training Goals",
      subtitle: "Choose your primary focus (tap again for secondary)",
      component: (
        <div className="space-y-3 max-h-[calc(100vh-350px)] overflow-y-auto pr-1">
          {PRIMARY_GOALS.map((goal) => {
            const Icon = GOAL_ICONS[goal.iconName];
            const isPrimary = preferences.primaryGoal === goal.id;
            const isSecondary = preferences.secondaryGoals.includes(goal.id);

            return (
              <Card
                key={goal.id}
                className={cn(
                  "p-4 border-2 cursor-pointer transition-all duration-200 relative",
                  isPrimary &&
                    "border-primary bg-primary/10 shadow-[0_0_15px_rgba(0,229,255,0.15)]",
                  isSecondary &&
                    "border-primary/60 bg-primary/5 shadow-[0_0_10px_rgba(0,229,255,0.08)]",
                  !isPrimary &&
                    !isSecondary &&
                    "border-border/50 bg-card/50 hover:border-primary/50"
                )}
                onClick={() => handleGoalSelect(goal.id)}
                data-testid={`option-goal-${goal.id}`}
              >
                <div className="flex items-start gap-3">
                  <Icon
                    className={cn(
                      "mt-1 flex-shrink-0",
                      isPrimary && "text-primary",
                      isSecondary && "text-primary/70",
                      !isPrimary && !isSecondary && "text-muted-foreground"
                    )}
                    size={24}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-bold tracking-wide">
                        {goal.label}
                      </span>
                      {isPrimary && (
                        <span className="px-2 py-0.5 text-xs font-bold uppercase bg-primary/20 text-primary rounded">
                          Primary
                        </span>
                      )}
                      {isSecondary && (
                        <span className="px-2 py-0.5 text-xs font-bold uppercase bg-primary/10 text-primary/70 rounded">
                          Secondary
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {goal.subtitle}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )
    }
  ];

  const currentStep = steps[step];

  return (
    <MobileLayout hideNav>
      <div className="p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "h-1 w-8 rounded-full transition-all duration-300",
                  i <= step ? "bg-primary" : "bg-secondary"
                )} 
              />
            ))}
          </div>
          <span className="font-display text-muted-foreground">STEP {step + 1}/{steps.length}</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2 text-white">{currentStep.title}</h1>
              <p className="text-muted-foreground text-lg">{currentStep.subtitle}</p>
            </div>

            <div className="flex-1">
              {currentStep.component}
            </div>

            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Mastery tiers guide your progression</h3>
                <span className="text-xs text-muted-foreground">0-100 mastery per exercise</span>
              </div>
              <p className="text-sm text-muted-foreground">
                We grade each movement from Novice to Master as you log workouts. Higher mastery unlocks harder variations and
                extra reps automatically.
              </p>
              <MasteryTierLegend compact />
            </div>
          </motion.div>
        </AnimatePresence>

        <Button
          size="lg"
          className="w-full h-14 text-lg font-bold uppercase tracking-wider bg-primary text-black hover:bg-primary/90 mt-4"
          onClick={nextStep}
          disabled={
            (step === 0 && !preferences.fitnessLevel) ||
            (step === 2 && !preferences.primaryGoal) ||
            createProfileMutation.isPending
          }
          data-testid="button-next"
        >
          {createProfileMutation.isPending ? "Saving..." : step === steps.length - 1 ? "Start Training" : "Next"}
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </MobileLayout>
  );
}
