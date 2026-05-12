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
          <h1 className="text-3xl font-bold font-display">Wallet Top-up</h1>
          <p className="text-muted-foreground">Add credits to player accounts</p>
        </div>

        <div className="max-w-xl">
          <Card className="bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)] relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-green-500/5 rounded-full blur-[80px] pointer-events-none" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="text-green-500 w-5 h-5" /> 
                Process Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 relative z-10">
                  <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Player</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-black/40 border-white/10">
                              <SelectValue placeholder="Select player" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {players?.map(p => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.username} {p.displayName ? `(${p.displayName})` : ''} - ₱{p.walletBalance.toFixed(2)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount (₱)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} className="bg-black/40 border-white/10 font-mono text-lg text-green-400" />
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
                          <FormLabel>Payment Method</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-black/40 border-white/10">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cash">Cash</SelectItem>
                              <SelectItem value="gcash">GCash</SelectItem>
                              <SelectItem value="maya">Maya</SelectItem>
                              <SelectItem value="card">Card</SelectItem>
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
                        <FormLabel>Admin Note (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Ref #12345" {...field} className="bg-black/40 border-white/10" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-lg bg-green-500 hover:bg-green-600 text-black font-bold shadow-[0_0_20px_rgba(34,197,94,0.3)]" 
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
