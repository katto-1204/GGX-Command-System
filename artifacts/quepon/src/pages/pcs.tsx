import { useState } from "react";
import { useListPcs } from "@workspace/api-client-react";
import { useLocation, Link } from "wouter";
import { PlayerLayout } from "@/components/layout/player-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Monitor, Search, ChevronRight, Clock, Cpu, Zap, Star, Shield, LayoutGrid, Wallet, Timer, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useEndSession, useGetMySession, getGetMySessionQueryKey, useCreateSession } from "@workspace/api-client-react";

const STATUS_CONFIG = {
  available: { label: "ONLINE", color: "text-green-400", dot: "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]", bar: "bg-green-500", glow: "border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.05)]" },
  inUse: { label: "PLAYING", color: "text-red-400", dot: "bg-red-500", bar: "bg-red-500", glow: "border-red-500/10" },
  maintenance: { label: "MAINTENANCE", color: "text-yellow-400", dot: "bg-yellow-500", bar: "bg-yellow-500", glow: "border-yellow-500/10" },
  reserved: { label: "RESERVED", color: "text-purple-400", dot: "bg-purple-500", bar: "bg-purple-500", glow: "border-purple-500/10" },
  offline: { label: "OFFLINE", color: "text-zinc-500", dot: "bg-zinc-700", bar: "bg-zinc-700", glow: "border-white/5" },
};

const TIER_CONFIG = {
  standard: { label: "REGULAR", color: "text-blue-400", bg: "bg-blue-400/10", icon: Monitor, rate: 25 },
  vip: { label: "VVIP", color: "text-yellow-400", bg: "bg-yellow-400/10", icon: Star, rate: 50 },
};

type SessionMode = "open" | "limited";

export default function Pcs() {
  const { data: pcs, isLoading } = useListPcs({ query: { refetchInterval: 5000 } as any });
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: activeSession } = useGetMySession({ query: { refetchInterval: 5000 } as any });
  const endSessionMutation = useEndSession();
  const createSessionMutation = useCreateSession();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const [selectedPc, setSelectedPc] = useState<any>(null);
  const [sessionMode, setSessionMode] = useState<SessionMode>("limited");
  const [bookingMinutes, setBookingMinutes] = useState(60);
  const [limitAmount, setLimitAmount] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [ownedPcToManage, setOwnedPcToManage] = useState<any>(null);
  const [topUpModalOpen, setTopUpModalOpen] = useState(false);

  const walletBalance = Number((user as any)?.walletBalance ?? 0);

  const availablePcs = pcs?.filter(p => p.status === "available") ?? [];
  const hasAvailable = availablePcs.length > 0;

  const filtered = (pcs ?? []).filter(pc => {
    const matchesSearch = !search || pc.label.toLowerCase().includes(search.toLowerCase()) ||
      pc.tier.toLowerCase().includes(search.toLowerCase()) ||
      (pc.specs?.gpu ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || pc.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getSelectedRate = () => (TIER_CONFIG as any)[selectedPc?.tier]?.rate || 25;

  const getOpenModeSeconds = () => {
    const rate = getSelectedRate();
    return Math.max(0, Math.floor((walletBalance / rate) * 3600));
  };

  // Calculate max minutes affordable with current balance for "open" mode
  const getOpenModeMinutes = () => {
    const maxMinutes = Math.floor(getOpenModeSeconds() / 60);
    return Math.max(1, Math.min(maxMinutes, 1440));
  };

  const getSessionPresetAmount = () => (bookingMinutes / 60) * getSelectedRate();
  const getLimitAmount = () => {
    const amount = Number(limitAmount);
    return Number.isFinite(amount) && amount > 0 ? amount : getSessionPresetAmount();
  };
  const getEffectiveDurationSeconds = () => {
    if (sessionMode === "open") return getOpenModeSeconds();
    return Math.floor((getLimitAmount() / getSelectedRate()) * 3600);
  };
  const getEffectiveDuration = () => Math.ceil(getEffectiveDurationSeconds() / 60);

  const getRequestedAmount = () => sessionMode === "open" ? walletBalance : getLimitAmount();
  const exceedsWalletBalance = sessionMode === "limited" && getRequestedAmount() > walletBalance;
  const hasNoOpenTimeBalance = sessionMode === "open" && walletBalance <= 0;

  const handleDirectBook = async () => {
    if (!selectedPc) return;
    setIsBooking(true);
    try {
      const requestedAmount = getRequestedAmount();

      if (sessionMode === "open" && walletBalance <= 0) {
        throw new Error("Insufficient wallet balance. Please top up before starting an open session.");
      }

      if (sessionMode === "limited" && requestedAmount > walletBalance) {
        throw new Error(`Insufficient wallet balance. You can only use up to ${walletBalance.toFixed(2)}.`);
      }

      await createSessionMutation.mutateAsync({
        data: {
          pcId: selectedPc.id,
          sessionType: sessionMode === "open" ? "open_time" : "limit_amount",
          allocatedAmount: requestedAmount,
          maxCost: requestedAmount,
          durationSeconds: getEffectiveDurationSeconds(),
          durationMinutes: getEffectiveDuration(),
        }
      });


      toast({
        title: "SQUAD ASSIGNED!",
        description: `Deployment on ${selectedPc.label} authorized. GLHF!`,
        variant: "default",
      });

      setSelectedPc(null);
      queryClient.invalidateQueries();
      setLocation("/session");
    } catch (err: any) {
      toast({
        title: "SYSTEM ERROR",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  const handleEndOwnedSession = async () => {
    if (!ownedPcToManage || !activeSession) return;

    endSessionMutation.mutate(
      { sessionId: activeSession.id },
      {
        onSuccess: () => {
          toast({ title: "SESSION TERMINATED", description: `${ownedPcToManage.label} is now available.` });
          setOwnedPcToManage(null);
          queryClient.invalidateQueries();
          queryClient.invalidateQueries({ queryKey: getGetMySessionQueryKey() });
        },
        onError: (err: any) => {
          toast({ title: "ERROR", description: err.message, variant: "destructive" });
        },
      }
    );
  };

  return (
    <PlayerLayout backHref="/home">
      <div className="space-y-8 pt-6 pb-20">
        {/* Immersive Header - Reduced Size */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-card border border-border p-6 shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32 pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-primary" />
                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">Fleet</span>
              </div>
              <h1 className="text-xl font-black font-display tracking-tight text-foreground leading-none italic uppercase">
                STATIONS
              </h1>
              <p className="text-[9px] font-black uppercase tracking-[0.1em]">
                {hasAvailable
                  ? <span className="text-green-500">{availablePcs.length} READY</span>
                  : <span className="text-primary">FULL</span>}
              </p>
            </div>

            <Button
              variant="outline"
              size="icon"
              className="w-10 h-10 rounded-xl bg-card border-border hover:bg-muted"
              onClick={() => setSearch(search ? "" : " ")} // Simple toggle for now, or I can add a state for showing search
            >
              <Search className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        </div>

        {/* Global Stats/Queue Banner */}
        {!hasAvailable && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="bg-primary text-primary-foreground rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-xl shadow-primary/20 border-none" onClick={() => setLocation("/queue")}>
              <CardContent className="p-8 flex items-center justify-between relative overflow-hidden">
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-6 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg border border-white/10">
                    <Clock className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="font-black text-lg uppercase tracking-tighter italic">ALL UNITS ENGAGED</p>
                    <p className="text-[10px] text-white/70 font-black uppercase tracking-widest mt-1">Est. Wait: 05:00 - 10:00</p>
                  </div>
                </div>
                <Button size="icon" className="w-12 h-12 rounded-2xl bg-white text-primary hover:bg-white/90 shadow-xl transition-all active:scale-90">
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Compact Filters - Chip Style */}
        <div className="flex flex-col gap-4">
          {/* @ts-ignore - framer-motion React 19 type compat */}
        <AnimatePresence>
            {search && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="relative"
              >
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                <Input
                  autoFocus
                  value={search === " " ? "" : search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="SEARCH STATIONS..."
                  className="h-12 pl-11 bg-card/50 border-border rounded-xl text-[10px] font-black uppercase tracking-widest shadow-inner"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar px-1">
            {["all", "available", "inUse", "maintenance"].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] transition-all border whitespace-nowrap active:scale-95 flex items-center gap-2",
                  filter === f
                    ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                    : "bg-card text-muted-foreground border-border hover:bg-muted"
                )}
              >
                {f === "all" ? "TOTAL" : f === "inUse" ? "BUSY" : f}
                <span className={cn("px-1.5 py-0.5 rounded-md text-[8px] min-w-[1.5rem]", filter === f ? "bg-white/20 text-white" : "bg-muted text-muted-foreground")}>
                  {pcs ? pcs.filter(p => f === "all" ? true : p.status === f).length : 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* PC Grid - 3 Columns */}
        <div className="grid grid-cols-3 gap-2 px-1">
          {/* @ts-ignore */}
          <AnimatePresence mode="popLayout">
            {filtered.map((pc, i) => {
              const cfg = STATUS_CONFIG[pc.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.offline;
              const tierCfg = (TIER_CONFIG as any)[pc.tier] ?? { label: pc.tier, color: "text-muted-foreground", bg: "bg-muted", icon: Monitor, rate: 0 };
              const isAvailable = pc.status === "available";
              const isVip = pc.tier === "vip";
              const isMyPc = pc.status === "inUse" && pc.currentUserId === user?.id;

              return (
                <motion.div
                  key={pc.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <div
                    onClick={() => {
                      if (isMyPc) setOwnedPcToManage(pc);
                      else if (isAvailable) setSelectedPc(pc);
                    }}
                    style={{
                      clipPath: "polygon(0% 12%, 12% 0%, 100% 0%, 100% 88%, 88% 100%, 0% 100%)"
                    }}
                    className={cn(
                      "relative p-3 transition-all active:scale-95 group overflow-hidden shadow-lg aspect-square flex flex-col border-2",
                      isMyPc
                        ? "cursor-pointer bg-[#1a0b2e] border-primary shadow-[0_0_20px_rgba(var(--primary),0.2)]"
                        : isAvailable
                          ? (isVip
                            ? "cursor-pointer bg-gradient-to-br from-[#1a1608] via-[#2a220a] to-[#1a1608] border-yellow-500/60 hover:border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.15)]"
                            : "cursor-pointer bg-card hover:bg-muted border-border hover:border-primary/40")
                          : "bg-muted/40 opacity-60 border-border grayscale-[0.8]"
                    )}
                  >
                    {/* Corner Accent for "Staplered" look */}
                    <div className="absolute top-0 left-0 w-4 h-4 bg-primary/20 -rotate-45 -translate-x-2 -translate-y-2" />

                    {/* Header: Status (L) and Number (R) */}
                    <div className="flex justify-between items-start mb-0.5 relative z-10 gap-1">
                      <div className={cn(
                        "flex items-center gap-0.5 px-1 py-0.5 rounded-sm bg-black/40 backdrop-blur-sm border border-white/5 min-w-0 max-w-[65%]",
                        cfg.color
                      )}>
                        <div className={cn("w-0.5 h-0.5 rounded-full shrink-0", cfg.dot, isAvailable && "animate-pulse")} />
                        <span className="text-[5px] font-black tracking-widest uppercase truncate">{cfg.label}</span>
                      </div>
                      <div className={cn(
                        "text-lg font-black font-display tracking-tighter italic leading-none opacity-50 shrink-0",
                        isVip ? "text-yellow-500" : "text-foreground"
                      )}>
                        {pc.label.replace(/[^0-9]/g, '')}
                      </div>
                    </div>

                    {/* Centered PC Icon - Maximized for visibility */}
                    <div className="flex-1 flex flex-col items-center justify-center relative z-10 overflow-hidden py-1">
                      <div className="w-full h-full max-w-[4.5rem] max-h-[4.5rem] flex items-center justify-center group-hover:scale-110 transition-all duration-700 ease-out shrink-0">
                        <img
                          src="/pc svg (2).png"
                          alt="PC"
                          className="w-full h-full object-contain filter brightness-125 drop-shadow-[0_0_12px_rgba(255,255,255,0.15)]"
                        />
                      </div>

                      <div className="mt-0.5 text-center w-full px-1">
                        <span className={cn(
                          "text-[7px] font-black uppercase tracking-[0.2em] opacity-80 italic block truncate w-full",
                          isMyPc ? "text-primary" : isVip ? "text-yellow-500" : tierCfg.color
                        )}>
                          {isMyPc ? `@${user?.username}` : tierCfg.label}
                        </span>
                      </div>
                    </div>

                    {/* Footer: USE PC Badge Overlay */}
                    {isAvailable && (
                      <div className="absolute inset-0 bg-primary/30 opacity-0 group-hover:opacity-100 backdrop-blur-[1px] transition-all duration-300 flex items-center justify-center z-20">
                        <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] shadow-2xl border border-white/20 scale-90 group-hover:scale-100 transition-transform">
                          USE
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && !isLoading && (
          <div className="text-center py-24 bg-card rounded-[3rem] border-2 border-dashed border-border mx-2">
            <LayoutGrid className="w-20 h-20 mx-auto mb-6 text-muted-foreground/10" />
            <p className="text-muted-foreground font-black uppercase tracking-[0.4em] text-xs">Scan returns zero units</p>
          </div>
        )}

        {/* Manage Owned PC Dialog */}
        <Dialog open={!!ownedPcToManage} onOpenChange={() => setOwnedPcToManage(null)}>
          <DialogContent className="sm:max-w-md bg-zinc-950 border-border rounded-[2rem] p-6 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
            <DialogHeader className="mb-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 mx-auto border border-primary/20">
                <Monitor className="w-7 h-7 text-primary" />
              </div>
              <DialogTitle className="text-2xl font-black italic uppercase italic tracking-tighter">
                MANAGE {ownedPcToManage?.label}
              </DialogTitle>
              <DialogDescription className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                Active Session Control
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3">
              <Button 
                onClick={() => setTopUpModalOpen(true)}
                className="h-14 rounded-2xl bg-card border border-primary/20 hover:border-primary/40 text-primary font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3"
              >
                <Wallet className="w-4 h-4" />
                TOP UP SESSION
              </Button>
              <Button 
                variant="destructive"
                onClick={handleEndOwnedSession}
                className="h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3"
              >
                <X className="w-4 h-4" />
                TERMINATE SESSION
              </Button>
            </div>

            <Button variant="ghost" onClick={() => setOwnedPcToManage(null)} className="w-full mt-4 text-[8px] font-black uppercase tracking-widest text-muted-foreground">
              Close
            </Button>
          </DialogContent>
        </Dialog>

        {/* Top Up Instructions Dialog */}
        <Dialog open={topUpModalOpen} onOpenChange={setTopUpModalOpen}>
          <DialogContent className="sm:max-w-xs bg-zinc-950 border-border rounded-[2rem] p-8 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-6 mx-auto">
              <Wallet className="w-8 h-8 text-primary" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl font-black uppercase italic tracking-tighter mb-2">CREDIT RELOAD</DialogTitle>
              <DialogDescription className="text-[10px] font-black text-muted-foreground uppercase leading-relaxed tracking-widest mb-8">
                Please proceed to the <span className="text-primary">service counter</span> for manual top-up and verification.
              </DialogDescription>
            </DialogHeader>
            <Button onClick={() => setTopUpModalOpen(false)} className="w-full h-12 rounded-xl bg-primary font-black uppercase tracking-[0.2em] text-[10px]">
              Acknowledged
            </Button>
          </DialogContent>
        </Dialog>

        {/* Immersive Booking Dialog */}
        <Dialog open={!!selectedPc} onOpenChange={() => { if (!isBooking) { setSelectedPc(null); setSessionMode("limited"); setLimitAmount(""); } }}>
          <DialogContent className="sm:max-w-md bg-zinc-950 border-border rounded-[2rem] p-6 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-primary" />
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 blur-[80px] -mr-24 -mt-24 pointer-events-none" />

            <DialogHeader className="mb-4 text-center">
              <div className="w-14 h-14 rounded-[1.25rem] bg-primary/10 flex items-center justify-center mb-3 mx-auto border border-primary/20 shadow-inner">
                <Monitor className="w-7 h-7 text-primary" />
              </div>
              <DialogTitle className="text-2xl font-black font-display tracking-tight text-foreground italic uppercase">
                STATION <span className="text-primary">{selectedPc?.label}</span>
              </DialogTitle>
              <DialogDescription className="text-muted-foreground font-black uppercase tracking-[0.2em] text-[9px] mt-1">
                Choose your session type
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5">
              {/* Session Mode Toggle */}
              <div className="bg-muted/60 border border-border rounded-2xl p-1.5 flex gap-1.5">
                <button
                  onClick={() => setSessionMode("open")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all active:scale-[0.97]",
                    sessionMode === "open"
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 border border-emerald-400/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Wallet className="w-3.5 h-3.5" />
                  Open Time
                </button>
                <button
                  onClick={() => setSessionMode("limited")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all active:scale-[0.97]",
                    sessionMode === "limited"
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 border border-primary/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Timer className="w-3.5 h-3.5" />
                  Limit Amount
                </button>
              </div>

              {/* Open Time Mode */}
              {sessionMode === "open" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="bg-gradient-to-br from-emerald-950/80 to-emerald-900/40 border border-emerald-500/20 rounded-2xl p-5 text-center space-y-3 shadow-inner">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Wallet className="w-4 h-4 text-emerald-400" />
                      <span className="text-[9px] font-black text-emerald-400/80 uppercase tracking-[0.3em]">Wallet Balance</span>
                    </div>
                    <div className="text-3xl font-black text-emerald-400 font-mono tracking-tighter italic">
                      ₱{walletBalance.toFixed(2)}
                    </div>
                    <div className="h-px bg-emerald-500/20" />
                    <p className="text-[9px] text-emerald-300/60 font-bold uppercase tracking-wider leading-relaxed">
                      Use your entire balance until it runs out.
                      <br />
                      Session auto-ends when balance hits ₱0.
                    </p>
                    <div className="flex items-center justify-center gap-3 pt-1">
                      <div className="text-center">
                        <div className="text-lg font-black font-mono text-foreground italic">{Math.floor(getOpenModeMinutes() / 60)}h {getOpenModeMinutes() % 60}m</div>
                        <div className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em]">Est. Playtime</div>
                      </div>
                      <div className="w-px h-8 bg-emerald-500/20" />
                      <div className="text-center">
                        <div className="text-lg font-black font-mono text-foreground italic">₱{((TIER_CONFIG as any)[selectedPc?.tier]?.rate || 25)}/hr</div>
                        <div className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em]">Rate</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Limited Time Mode */}
              {sessionMode === "limited" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-3 gap-2.5">
                    {[60, 120, 180, 240, 300, 480].map(mins => (
                      <button
                        key={mins}
                        disabled={(mins / 60) * getSelectedRate() > walletBalance}
                        className={cn(
                          "h-[4.5rem] rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all border-2 active:scale-95 group relative overflow-hidden shadow-sm",
                          bookingMinutes === mins
                            ? "bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/20"
                            : "bg-muted border-border hover:bg-muted/80 text-muted-foreground",
                          (mins / 60) * getSelectedRate() > walletBalance && "opacity-40 cursor-not-allowed hover:bg-muted"
                        )}
                        onClick={() => setBookingMinutes(mins)}
                      >
                        <span className={cn("text-lg font-black font-mono leading-none", bookingMinutes === mins ? "text-primary-foreground" : "text-foreground")}>{mins / 60}H</span>
                        <span className={cn("text-[8px] font-black uppercase tracking-[0.1em] opacity-70", bookingMinutes === mins ? "text-primary-foreground" : "text-primary")}>₱{((mins / 60) * ((TIER_CONFIG as any)[selectedPc?.tier]?.rate || 0)).toFixed(0)}</span>
                      </button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 italic">Limit Amount</label>
                    <Input
                      type="number"
                      min="1"
                      step="0.01"
                      value={limitAmount}
                      onChange={event => setLimitAmount(event.target.value)}
                      placeholder={`Max ${walletBalance.toFixed(2)}`}
                      className="h-12 bg-muted/50 border-border rounded-xl text-sm font-black font-mono tracking-wider"
                    />
                  </div>
                  <div className={cn(
                    "text-[9px] font-black uppercase tracking-[0.2em] leading-relaxed",
                    exceedsWalletBalance ? "text-red-400" : "text-muted-foreground/60"
                  )}>
                    Wallet: ₱{walletBalance.toFixed(2)}
                    {exceedsWalletBalance && " · Amount cannot exceed your wallet balance."}
                  </div>
                </motion.div>
              )}

              {/* Cost Summary */}
              <div className="bg-muted/50 border border-border rounded-2xl p-4 space-y-3 shadow-inner">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em]">
                    {sessionMode === "open" ? "Max Cost" : "Session Cost"}
                  </span>
                  <span className="text-xl font-black text-foreground font-mono tracking-tighter italic">
                    ₱{getRequestedAmount().toFixed(2)}
                  </span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex justify-between items-center bg-card/50 p-2.5 rounded-xl border border-border/50">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                      {sessionMode === "open" ? "Est. End" : "Termination"}
                    </span>
                  </div>
                  <span className="text-xs font-black text-primary font-mono italic">
                    {new Date(Date.now() + getEffectiveDurationSeconds() * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6 sm:flex-col gap-2.5">
              <Button
                onClick={handleDirectBook}
                className={cn(
                  "w-full h-14 rounded-2xl font-black text-xs tracking-[0.3em] uppercase shadow-xl relative overflow-hidden group border-2 border-white/10 transition-colors",
                  sessionMode === "open"
                    ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-600/30"
                    : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/30"
                )}
                disabled={isBooking || hasNoOpenTimeBalance || exceedsWalletBalance || getEffectiveDurationSeconds() <= 0}
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
                {isBooking ? (
                  <Clock className="w-5 h-5 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    {sessionMode === "open" ? <Wallet className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                    {sessionMode === "open" ? "START OPEN SESSION" : "LOCK IN & PLAY"}
                  </span>
                )}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setSelectedPc(null)}
                disabled={isBooking}
                className="w-full h-9 text-[8px] font-black text-muted-foreground uppercase tracking-[0.3em] hover:text-foreground active:scale-95"
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PlayerLayout>

  );
}
