import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useTopUpWallet, useListPlayers } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wallet } from "lucide-react";
import { useEffect } from "react";

const topupSchema = z.object({
  userId: z.string().min(1, "Player selection is required"),
  amount: z.coerce.number().min(1, "Amount must be at least 1"),
  paymentMethod: z.enum(["cash", "gcash", "maya", "card", "manualAdjustment"]),
  adminNote: z.string().optional()
});

export default function AdminTopup() {
  const { toast } = useToast();
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialUserId = searchParams.get("userId") || "";

  const { data: players } = useListPlayers();
  const topUpMutation = useTopUpWallet();

  const form = useForm<z.infer<typeof topupSchema>>({
    resolver: zodResolver(topupSchema),
    defaultValues: {
      userId: initialUserId,
      amount: 100,
      paymentMethod: "cash",
      adminNote: ""
    }
  });

  useEffect(() => {
    if (initialUserId && !form.getValues("userId")) {
      form.setValue("userId", initialUserId);
    }
  }, [initialUserId, form]);

  const onSubmit = (values: z.infer<typeof topupSchema>) => {
    topUpMutation.mutate({ data: values }, {
      onSuccess: (tx) => {
        toast({ title: "Top-up successful", description: `Added ₱${tx.amount.toFixed(2)} to wallet.` });
        form.reset({ ...values, amount: 100, adminNote: "" });
      },
      onError: (err: any) => {
        toast({ title: "Top-up failed", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground">Wallet Top-up</h1>
          <p className="text-muted-foreground">Add credits to player accounts</p>
        </div>

        <div className="max-w-xl">
          <Card className="bg-card border-border shadow-2xl rounded-3xl overflow-hidden relative">
            <div className="absolute right-[-10%] top-[-10%] w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
            <CardHeader className="bg-muted/30 border-b border-border py-6">
              <CardTitle className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Wallet className="text-primary w-5 h-5" /> 
                </div>
                Process Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 relative z-10">
                  <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Account Target</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-muted/50 border-border h-14 rounded-2xl px-5 text-base font-bold">
                              <SelectValue placeholder="Select player" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-card border-border rounded-xl">
                            {players?.map(p => (
                              <SelectItem key={p.id} value={p.id} className="focus:bg-primary/10">
                                {p.username} {p.displayName ? `(${p.displayName})` : ''} — ₱{p.walletBalance.toFixed(2)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Credits (PHP)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} className="bg-muted/50 border-border h-14 rounded-2xl px-5 font-mono text-xl font-black text-primary focus-visible:ring-primary/30" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Payment Method</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-muted/50 border-border h-14 rounded-2xl px-5 font-bold uppercase tracking-wider text-xs">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-card border-border rounded-xl">
                              <SelectItem value="cash" className="focus:bg-primary/10">CASH</SelectItem>
                              <SelectItem value="gcash" className="focus:bg-primary/10">GCASH</SelectItem>
                              <SelectItem value="maya" className="focus:bg-primary/10">MAYA</SelectItem>
                              <SelectItem value="card" className="focus:bg-primary/10">CARD</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="adminNote"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Transaction Identity (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Ref #12345" {...field} className="bg-muted/50 border-border h-14 rounded-2xl px-5" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full h-14 text-sm bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-[0.2em] rounded-2xl shadow-[0_10px_20px_rgba(var(--primary),0.2)] transition-all active:scale-95" 
                    disabled={topUpMutation.isPending}
                  >
                    {topUpMutation.isPending && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                    Confirm Top-up
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>

  );
}
