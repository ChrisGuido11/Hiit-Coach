import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Onboarding from "@/pages/onboarding";
import Home from "@/pages/home";
import Workout from "@/pages/workout";
import History from "@/pages/history";

function Router() {
  const isFirstVisit = !localStorage.getItem("emom_user_prefs");

  return (
    <Switch>
      {/* Route Logic: If no prefs, show onboarding first. But for prototype we allow direct nav */}
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/" component={isFirstVisit ? Onboarding : Home} />
      <Route path="/workout" component={Workout} />
      <Route path="/history" component={History} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
