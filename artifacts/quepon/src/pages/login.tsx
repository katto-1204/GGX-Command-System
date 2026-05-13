import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useLoginUser, setAuthTokenGetter } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Lock, User, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const loginMutation = useLoginUser();

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate({ data: values }, {
      onSuccess: (res) => {
        localStorage.setItem("quepon_token", res.token);
        setAuthTokenGetter(() => localStorage.getItem("quepon_token"));
        queryClient.invalidateQueries();
        localStorage.setItem("quepon_show_welcome", "true");
        toast({ title: "Welcome back, player!" });
        if (res.user.role === "admin" || res.user.role === "superAdmin") {
          setLocation("/admin/dashboard");
        } else {
          setLocation("/home");
        }
      },
      onError: (err: any) => {
        toast({ 
          title: "Access Denied", 
          description: err.message || "Invalid credentials. Please try again.",
          variant: "destructive" 
        });
      }
    });
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-background items-center justify-center relative overflow-hidden p-6 transition-colors duration-300">
      {/* Theme Toggle for login page */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle className="bg-foreground/5 backdrop-blur-md" />
      </div>

      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full" />
      
      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-foreground rounded-full"
            initial={{ 
              x: Math.random() * 1000, // Fallback for window.innerWidth
              y: Math.random() * 800,
            }}
            animate={{ 
              y: [null, -100],
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: Math.random() * 5 + 5, 
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-sm relative z-10">
        <Link href="/onboarding">
          <Button variant="ghost" className="mb-8 text-muted-foreground hover:text-foreground hover:bg-foreground/5 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>

        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
              <img src="/ggx logo.png" alt="GGX Logo" className="w-full h-full object-cover" />
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
          </div>
          <h1 className="text-4xl font-black font-display text-foreground tracking-tighter mb-2">
            WELCOME <span className="text-primary">BACK</span>
          </h1>
          <p className="text-muted-foreground font-medium tracking-wide">Enter your credentials to enter the arena.</p>
        </div>

        <div className="bg-card backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Username</FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground/30 group-focus-within:text-primary transition-colors">
                          <User className="w-5 h-5" />
                        </div>
                        <Input 
                          placeholder="Your username" 
                          {...field} 
                          className="h-14 pl-12 bg-muted/50 border-border text-foreground rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/30"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Password</FormLabel>
                      <a href="#" className="text-[10px] text-primary hover:underline font-bold uppercase tracking-widest">Forgot?</a>
                    </div>
                    <FormControl>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground/30 group-focus-within:text-primary transition-colors">
                          <Lock className="w-5 h-5" />
                        </div>
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="••••••••" 
                          {...field} 
                          className="h-14 pl-12 pr-12 bg-muted/50 border-border text-foreground rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/30"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-4 flex items-center text-muted-foreground/30 hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black tracking-widest uppercase shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] transition-all active:scale-95 group relative overflow-hidden" 
                disabled={loginMutation.isPending}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 transition-transform group-hover:scale-105" />
                <span className="relative z-10 flex items-center justify-center">
                  {loginMutation.isPending ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    "Initialize Session"
                  )}
                </span>
              </Button>
            </form>
          </Form>
        </div>

        <div className="mt-10 text-center">
          <p className="text-muted-foreground text-sm font-medium mb-4">New to the system?</p>
          <Link href="/register">
            <Button variant="outline" className="w-full h-14 rounded-2xl border-border bg-muted/30 text-foreground hover:bg-muted/50 hover:border-primary/50 transition-all">
              Create New Account
            </Button>
          </Link>
        </div>
        
        <div className="mt-12 flex items-center justify-center gap-2">
          <div className="h-[1px] w-8 bg-border" />
          <Link href="/admin/login">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 hover:text-primary transition-colors cursor-pointer">Admin Access Override</span>
          </Link>
          <div className="h-[1px] w-8 bg-border" />
        </div>
      </div>
    </div>

  );
}
