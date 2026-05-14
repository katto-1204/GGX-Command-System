import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useTopUpWallet, useListPlayers, useGetPlayerTransactions } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wallet, Banknote, CreditCard, Smartphone, Search, User, Calendar, Activity, History } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

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

  const [searchQuery, setSearchQuery] = useState("");
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

  const selectedUserId = form.watch("userId");

  useEffect(() => {
    if (initialUserId && !form.getValues("userId")) {
      form.setValue("userId", initialUserId);
    }
  }, [initialUserId, form]);

  const selectedPlayer = players?.find(p => p.id === selectedUserId);
  const filteredPlayers = players?.filter(p => 
    !searchQuery || 
    p.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  ) ?? [];

  const { data: transactions } = useGetPlayerTransactions(
    selectedUserId,
    { query: { enabled: !!selectedUserId } as any }
  );

  const onSubmit = (values: z.infer<typeof topupSchema>) => {
    topUpMutation.mutate({ data: values }, {
      onSuccess: (tx) => {
        toast({ title: "FUNDS INJECTED", description: `Added ₱${tx.amount.toFixed(2)} to wallet.` });
        form.reset({ ...values, amount: 100, adminNote: "" });
      },
      onError: (err: any) => {
        toast({ title: "TRANSACTION FAILED", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <AdminLayout breadcrumbs={[{ label: "Top Up" }]}>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary">
              <Wallet className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Credit Injection</span>
            </div>
            <h1 className="text-4xl font-black font-display tracking-tight text-foreground italic">TOP <span className="text-primary">UP</span></h1>
            <p className="text-muted-foreground font-medium text-sm">Add credits to player wallets and verify history.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column: Top Up Form */}
          <Card className="bg-card border-border shadow-2xl rounded-[2.5rem] overflow-hidden relative group">
            <div className="absolute right-[-10%] top-[-10%] w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-primary/10 transition-colors duration-700" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50 opacity-50" />
            
            <CardHeader className="bg-muted/30 border-b border-border py-8 px-8">
              <CardTitle className="flex items-center gap-4 text-sm font-black uppercase tracking-[0.2em] text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner">
                  <Banknote className="text-primary w-6 h-6" /> 
                </div>
                <div>
                  Process Payment
                  <p className="text-[10px] text-muted-foreground tracking-widest mt-1 normal-case">SECURE TRANSACTION GATEWAY</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 px-8 pb-10">
              <div className="space-y-6 mb-8">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search player by name or username..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-background/50 pl-11 h-12 border-border rounded-xl text-xs font-black uppercase tracking-[0.1em]"
                  />
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 relative z-10">
                  <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Account Target</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-muted/50 border-border h-14 rounded-2xl px-5 text-base font-bold focus:border-primary/50 hover:bg-muted/80 transition-colors">
                              <SelectValue placeholder="Select player" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-card border-border rounded-xl">
                            {filteredPlayers.map(p => (
                              <SelectItem key={p.id} value={p.id} className="focus:bg-primary/10">
                                {p.username} {p.fullName ? `(${p.fullName})` : ''} — ₱{(p.walletBalance || 0).toFixed(2)}
                              </SelectItem>
                            ))}
                            {filteredPlayers.length === 0 && (
                              <div className="p-4 text-center text-xs text-muted-foreground uppercase font-black tracking-widest">No players found</div>
                            )}
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
                            <Input type="number" {...field} className="bg-muted/50 border-border h-14 rounded-2xl px-5 font-mono text-xl font-black text-primary focus-visible:ring-primary/30 hover:bg-muted/80 transition-colors" />
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
                              <SelectTrigger className="bg-muted/50 border-border h-14 rounded-2xl px-5 font-bold uppercase tracking-wider text-xs focus:border-primary/50 hover:bg-muted/80 transition-colors">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-card border-border rounded-xl">
                              <SelectItem value="cash" className="focus:bg-primary/10">
                                <div className="flex items-center gap-2">
                                  <Banknote className="w-4 h-4 text-green-500" />
                                  <span>CASH</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="gcash" className="focus:bg-primary/10">
                                <div className="flex items-center gap-2">
                                  <Smartphone className="w-4 h-4 text-blue-500" />
                                  <span>GCASH</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="maya" className="focus:bg-primary/10">
                                <div className="flex items-center gap-2">
                                  <Smartphone className="w-4 h-4 text-green-400" />
                                  <span>MAYA</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="card" className="focus:bg-primary/10">
                                <div className="flex items-center gap-2">
                                  <CreditCard className="w-4 h-4 text-orange-400" />
                                  <span>CARD</span>
                                </div>
                              </SelectItem>
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
                          <Input placeholder="e.g. Ref #12345" {...field} className="bg-muted/50 border-border h-14 rounded-2xl px-5 font-mono text-sm hover:bg-muted/80 transition-colors focus-visible:ring-primary/30" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full h-14 text-sm bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-[0.2em] rounded-2xl shadow-[0_10px_20px_rgba(var(--primary),0.2)] transition-all active:scale-95 group/btn" 
                    disabled={topUpMutation.isPending}
                  >
                    {topUpMutation.isPending ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <Wallet className="w-5 h-5 mr-3 opacity-70 group-hover/btn:scale-110 transition-transform" />
                    )}
                    Inject Funds
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Right Column: User Profile & Audit Trail */}
          <div className="space-y-8">
            <Card className="bg-card border-border shadow-xl rounded-[2.5rem] overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border py-6 px-8">
                <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-3">
                  <User className="w-4 h-4 text-primary" /> User Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                {selectedPlayer ? (
                  <div className="space-y-6">
                    <div>
                      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Full Name</div>
                      <div className="text-xl font-black uppercase italic tracking-tighter text-foreground">{selectedPlayer.fullName || "—"}</div>
                      <div className="text-xs font-black text-primary uppercase tracking-[0.2em] mt-1">@{selectedPlayer.username}</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/50 p-4 rounded-2xl border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Birth Date</span>
                        </div>
                        <div className="font-mono text-sm font-black text-foreground">
                          {selectedPlayer.birthDate ? new Date(selectedPlayer.birthDate).toLocaleDateString() : "—"}
                        </div>
                      </div>
                      <div className="bg-muted/50 p-4 rounded-2xl border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="w-4 h-4 text-muted-foreground" />
                          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Sex</span>
                        </div>
                        <div className="font-mono text-sm font-black text-foreground capitalize">
                          {selectedPlayer.sex || "—"}
                        </div>
                      </div>
                    </div>

                    <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 flex justify-between items-center shadow-inner">
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">Current Credits</span>
                      <span className="text-2xl font-black font-mono text-primary italic">₱{(selectedPlayer.walletBalance || 0).toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 opacity-50">
                    <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Select a target to view identity</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedPlayer && (
              <Card className="bg-card border-border shadow-xl rounded-[2.5rem] overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border py-6 px-8">
                  <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-3">
                    <History className="w-4 h-4 text-primary" /> Audit Trail
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  {transactions && transactions.length > 0 ? (
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {transactions.map((tx: any) => (
                        <div key={tx.id} className="flex justify-between items-center bg-muted/30 p-4 rounded-2xl border border-border/50">
                          <div>
                            <div className="text-[10px] font-black text-foreground uppercase tracking-[0.2em]">{tx.type}</div>
                            <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">
                              {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString()}
                            </div>
                            {tx.adminNote && (
                              <div className="text-[8px] mt-1 text-primary/70 uppercase">Note: {tx.adminNote}</div>
                            )}
                          </div>
                          <div className={cn(
                            "font-mono text-sm font-black italic",
                            tx.amount > 0 ? "text-green-500" : "text-destructive"
                          )}>
                            {tx.amount > 0 ? "+" : ""}₱{Math.abs(tx.amount).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 opacity-50">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">No transactions recorded</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}
