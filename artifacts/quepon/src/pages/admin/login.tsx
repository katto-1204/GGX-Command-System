import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useLoginUser, setAuthTokenGetter } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

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
        localStorage.setItem("quepon_token", res.token);
        setAuthTokenGetter(() => localStorage.getItem("quepon_token"));
        queryClient.invalidateQueries();
        if (res.user.role === "admin" || res.user.role === "superAdmin") {
          toast({ title: "Admin Login successful" });
          setLocation("/admin/dashboard");
        } else {
          toast({ 
            title: "Access Denied", 
            description: "You do not have admin privileges",
            variant: "destructive" 
          });
          setLocation("/login");
        }
      },
      onError: (err: any) => {
        toast({ 
          title: "Login failed", 
          description: err.message || "Invalid credentials",
          variant: "destructive" 
        });
      }
    });
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col bg-[#050508] p-6 items-center justify-center relative">
      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-10">
          <div className="inline-block px-3 py-1 bg-primary/20 border border-primary/30 rounded-full text-xs text-primary mb-6 font-mono uppercase tracking-widest">
            Restricted Access
          </div>
          <h1 className="text-3xl font-bold font-display mb-2 text-white">QUEPON Admin</h1>
          <p className="text-muted-foreground">Command Center Login</p>
        </div>

        <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admin ID</FormLabel>
                    <FormControl>
                      <Input placeholder="admin_username" {...field} className="bg-black/40 border-white/5 font-mono" />
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
                    <FormLabel>Passcode</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} className="bg-black/40 border-white/5 font-mono" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full mt-6 bg-white text-black hover:bg-white/90" 
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Authorize
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
