import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useRegisterPlayer, setAuthTokenGetter } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, User, Lock, Smartphone, UserCircle } from "lucide-react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  displayName: z.string().min(1, "Display name is required"),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", password: "", confirmPassword: "", displayName: "", phone: "" },
  });

  const registerMutation = useRegisterPlayer();

  const onSubmit = (values: z.infer<typeof registerSchema>) => {
    const { confirmPassword, ...submitData } = values;
    registerMutation.mutate({ data: submitData }, {
      onSuccess: (res) => {
        localStorage.setItem("quepon_token", res.token);
        setAuthTokenGetter(() => localStorage.getItem("quepon_token"));
        queryClient.invalidateQueries();
        localStorage.setItem("quepon_show_welcome", "true");
        toast({ title: "Welcome to the Hub!" });
        setLocation("/home");
      },
      onError: (err: any) => {
        toast({ 
          title: "Registration Failed", 
          description: err.message || "Could not create account. Please check your info.",
          variant: "destructive" 
        });
      }
    });
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-background items-center justify-center relative overflow-hidden p-6 transition-colors duration-300">
      {/* Theme Toggle for register page */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle className="bg-foreground/5 backdrop-blur-md" />
      </div>

      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full" />

      <div className="w-full max-w-sm relative z-10 py-12">
        <Link href="/login">
          <Button variant="ghost" className="mb-6 text-muted-foreground hover:text-foreground hover:bg-foreground/5 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
              <img src="/ggx logo.png" alt="GGX Logo" className="w-full h-full object-cover" />
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
          </div>
          <h1 className="text-4xl font-black font-display text-foreground tracking-tighter mb-2 uppercase">
            Create <span className="text-primary">Profile</span>
          </h1>
          <p className="text-muted-foreground font-medium tracking-wide">Join the most advanced gaming community.</p>
        </div>

        <div className="bg-card backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Username *</FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground/20 group-focus-within:text-primary transition-colors">
                          <User className="w-5 h-5" />
                        </div>
                        <Input 
                          placeholder="Unique gamer handle" 
                          {...field} 
                          className="h-12 pl-12 bg-muted/30 border-border text-foreground rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Display Name *</FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground/20 group-focus-within:text-primary transition-colors">
                          <UserCircle className="w-5 h-5" />
                        </div>
                        <Input 
                          placeholder="Your public name" 
                          {...field} 
                          className="h-12 pl-12 bg-muted/30 border-border text-foreground rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
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
                    <FormLabel className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Security Key *</FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground/20 group-focus-within:text-primary transition-colors">
                          <Lock className="w-5 h-5" />
                        </div>
                        <Input 
                          type="password" 
                          placeholder="Minimum 6 characters" 
                          {...field} 
                          className="h-12 pl-12 bg-muted/30 border-border text-foreground rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Confirm Security Key *</FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground/20 group-focus-within:text-primary transition-colors">
                          <Lock className="w-5 h-5" />
                        </div>
                        <Input 
                          type="password" 
                          placeholder="Repeat security key" 
                          {...field} 
                          className="h-12 pl-12 bg-muted/30 border-border text-foreground rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black tracking-widest uppercase shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] transition-all active:scale-95 group relative overflow-hidden mt-4" 
                disabled={registerMutation.isPending}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 transition-transform group-hover:scale-105" />
                <span className="relative z-10 flex items-center justify-center">
                  {registerMutation.isPending ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    "Authorize & Join"
                  )}
                </span>
              </Button>
            </form>
          </Form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground text-sm font-medium">Already registered?</p>
          <Link href="/login">
            <span className="text-primary font-bold hover:underline cursor-pointer">Return to Login</span>
          </Link>
        </div>
      </div>
    </div>

  );
}
