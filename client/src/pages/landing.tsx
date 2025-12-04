import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Timer, TrendingUp, Target, Mail, Lock } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import MobileLayout from "@/components/layout/mobile-layout";
import { supabase } from "@/lib/supabase";

export default function Landing() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<'landing' | 'signin' | 'signup'>('landing');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        setLocation('/');
      }
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setLocation('/');
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'signin') {
    return (
      <MobileLayout hideNav>
        <div className="h-full flex flex-col justify-center p-6 bg-black">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h1 className="text-4xl font-display font-bold text-white mb-2">Welcome Back</h1>
              <p className="text-muted-foreground">Sign in to continue your training</p>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-white uppercase tracking-wider">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-secondary/50 border-border/50"
                    placeholder="your@email.com"
                    required
                    data-testid="input-email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-white uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-secondary/50 border-border/50"
                    placeholder="••••••••"
                    required
                    data-testid="input-password"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-primary text-black hover:bg-primary/90 font-bold uppercase tracking-wider"
                data-testid="button-signin"
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="text-center">
              <button
                onClick={() => setMode('signup')}
                className="text-primary hover:text-primary/80 text-sm font-bold"
              >
                Don't have an account? Sign up
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={() => setMode('landing')}
                className="text-muted-foreground hover:text-white text-sm"
              >
                ← Back
              </button>
            </div>
          </motion.div>
        </div>
      </MobileLayout>
    );
  }

  if (mode === 'signup') {
    return (
      <MobileLayout hideNav>
        <div className="h-full flex flex-col justify-center p-6 bg-black">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h1 className="text-4xl font-display font-bold text-white mb-2">Create Account</h1>
              <p className="text-muted-foreground">Start your fitness journey today</p>
            </div>

            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-white uppercase tracking-wider">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-secondary/50 border-border/50"
                    placeholder="your@email.com"
                    required
                    data-testid="input-email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-white uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-secondary/50 border-border/50"
                    placeholder="••••••••"
                    required
                    minLength={6}
                    data-testid="input-password"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-primary text-black hover:bg-primary/90 font-bold uppercase tracking-wider"
                data-testid="button-signup"
              >
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <div className="text-center">
              <button
                onClick={() => setMode('signin')}
                className="text-primary hover:text-primary/80 text-sm font-bold"
              >
                Already have an account? Sign in
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={() => setMode('landing')}
                className="text-muted-foreground hover:text-white text-sm"
              >
                ← Back
              </button>
            </div>
          </motion.div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout hideNav>
      <div className="h-full flex flex-col justify-between p-6 bg-black">
        {/* Hero Section */}
        <div className="flex-1 flex flex-col justify-center items-center text-center space-y-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary neon-border"
          >
            <Zap className="w-12 h-12 text-primary" fill="currentColor" />
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-6xl font-display font-bold text-white mb-3 leading-none">
              HIIT<br />LAB
            </h1>
            <p className="text-xl text-muted-foreground">
              AI-Powered Training, Personalized for Every Level
            </p>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 gap-3 w-full max-w-sm mt-8"
          >
            {[
              { icon: Timer, label: "HIIT Timer" },
              { icon: Target, label: "Personalized" },
              { icon: TrendingUp, label: "Track Progress" },
              { icon: Zap, label: "Adaptive AI" },
            ].map((feature, idx) => (
              <Card key={idx} className="p-4 bg-card/50 border-border/50 flex flex-col items-center justify-center gap-2">
                <feature.icon className="w-6 h-6 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wide text-white">{feature.label}</span>
              </Card>
            ))}
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          <Button
            onClick={() => setMode('signup')}
            className="w-full h-14 text-lg font-bold uppercase tracking-wider bg-primary text-black hover:bg-primary/90 neon-border"
            data-testid="button-get-started"
          >
            <Zap className="w-5 h-5 mr-2 fill-current" />
            Get Started
          </Button>
          <Button
            onClick={() => setMode('signin')}
            variant="outline"
            className="w-full h-14 text-lg font-bold uppercase tracking-wider border-primary/50 text-primary hover:bg-primary/10"
            data-testid="button-signin-landing"
          >
            Sign In
          </Button>
        </motion.div>
      </div>
    </MobileLayout>
  );
}
