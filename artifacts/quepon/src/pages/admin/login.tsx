import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useLoginUser } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield, Lock, Zap, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { persistAuthenticatedUser } from "@/lib/auth-token";

const adminLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof adminLoginSchema>>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { username: "", password: "" },
  });

  const loginMutation = useLoginUser();

  const onSubmit = (values: z.infer<typeof adminLoginSchema>) => {
    loginMutation.mutate({ data: values }, {
      onSuccess: (res) => {
        persistAuthenticatedUser(queryClient, res.token, res.user);
        if (res.user.role === "admin" || res.user.role === "superAdmin") {
          toast({ title: "ACCESS GRANTED", description: "Command Center connection established." });
          setLocation("/admin/dashboard");
        } else {
          toast({ 
            title: "ACCESS DENIED", 
            description: "Unauthorized credentials for this terminal.",
            variant: "destructive" 
          });
          setLocation("/login");
        }
      },
      onError: (err: any) => {
        toast({ 
          title: "LINK FAILURE", 
          description: err.message || "Invalid authentication parameters.",
          variant: "destructive" 
        });
      }
    });
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col bg-background p-6 items-center justify-center relative overflow-hidden transition-colors duration-300">
      {/* Theme Toggle for admin login page */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle className="bg-foreground/5 backdrop-blur-md" />
      </div>

      {/* Background FX */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary),0.2),transparent_50%)]" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-[2rem] bg-card border border-border flex items-center justify-center overflow-hidden shadow-2xl relative group">
              <div className="absolute inset-0 bg-primary/20 blur-xl group-hover:blur-2xl transition-all" />
              <img src="/ggx logo.png" alt="GGX Logo" className="w-10 h-10 object-contain relative z-10" />
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-[10px] text-primary mb-8 font-black uppercase tracking-[0.3em] shadow-[0_0_20px_rgba(var(--primary),0.1)]">
            <Shield className="w-3 h-3" />
            Restricted Terminal
          </div>
          <h1 className="text-5xl font-black font-display mb-4 text-foreground tracking-tighter italic">QUEPON<span className="text-primary">.OS</span></h1>
          <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.4em]">Administrative Uplink</p>
        </div>

        <div className="relative group">
          <div className="absolute -inset-4 bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative bg-card border border-border rounded-[2.5rem] p-10 backdrop-blur-2xl shadow-xl">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-2">Operator ID</FormLabel>
                      <FormControl>
                        <div className="relative">
                           <Input placeholder="ADMIN_REF_001" {...field} className="bg-muted/30 border-border h-14 rounded-2xl text-xs font-black tracking-widest uppercase focus:ring-primary/20 pl-12" />
                           <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30" />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px] font-bold uppercase tracking-widest text-destructive" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-2">Secure Key</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type="password" placeholder="••••••••" {...field} className="bg-muted/30 border-border h-14 rounded-2xl text-xs font-black tracking-widest uppercase focus:ring-primary/20 pl-12" />
                          <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30" />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px] font-bold uppercase tracking-widest text-destructive" />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full h-14 mt-4 bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all" 
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Zap className="w-5 h-5 mr-2" />}
                  Establish Uplink
                </Button>
              </form>
            </Form>
          </div>
        </div>

        <div className="mt-12 text-center">
           <p className="text-[9px] font-black text-muted-foreground/20 uppercase tracking-[0.3em] leading-relaxed max-w-[240px] mx-auto">
             Unauthorized access will result in immediate station lockdown and account termination.
           </p>
        </div>
      </motion.div>
    </div>

  );
}
