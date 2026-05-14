import { useState } from "react";
import { useListPcs } from "@workspace/api-client-react";
import { useLocation, Link } from "wouter";
import { PlayerLayout } from "@/components/layout/player-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Monitor, Search, ChevronRight, Clock, Cpu, Zap, Star, Shield, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

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

export default function Pcs() {
  const { data: pcs, isLoading } = useListPcs({ query: { refetchInterval: 5000 } as any });
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  
  const [selectedPc, setSelectedPc] = useState<any>(null);
  const [bookingMinutes, setBookingMinutes] = useState(60);
  const [isBooking, setIsBooking] = useState(false);

  const availablePcs = pcs?.filter(p => p.status === "available") ?? [];
  const hasAvailable = availablePcs.length > 0;

  const filtered = (pcs ?? []).filter(pc => {
    const matchesSearch = !search || pc.label.toLowerCase().includes(search.toLowerCase()) ||
      pc.tier.toLowerCase().includes(search.toLowerCase()) ||
      (pc.specs?.gpu ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || pc.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleDirectBook = async () => {
    if (!selectedPc) return;
    setIsBooking(true);
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pcId: selectedPc.id,
          durationMinutes: bookingMinutes
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to start session");
      }

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

  return (
    <PlayerLayout backHref="/home">
      <div className="space-y-8 pt-6 pb-20">
        {/* Immersive Header */}
        <div className="relative overflow-hidden rounded-[3rem] bg-card border border-border p-10 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 blur-[120px] -mr-40 -mt-40 pointer-events-none" />
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">Hardware Status</span>
            </div>
            <h1 className="text-4xl font-black font-display tracking-tight text-foreground leading-none italic uppercase">
              STATIONS
            </h1>
            <p className="text-xs font-black uppercase tracking-[0.1em]">
              {hasAvailable
                ? <span className="text-green-500">{availablePcs.length} AVAILABLE</span>
                : <span className="text-primary">FULL CAPACITY</span>}
            </p>
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

        {/* Search & Filters */}
        <div className="space-y-5">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="SEARCH..."
              className="h-16 pl-14 bg-card border-border rounded-[1.5rem] focus:border-primary/50 focus:ring-primary/10 transition-all uppercase text-[11px] tracking-[0.2em] font-black shadow-inner"
            />
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar px-1">
            {["all", "available", "inUse", "maintenance"].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border whitespace-nowrap active:scale-95",
                  filter === f
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                    : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                )}
              >
                {f === "all" ? "TOTAL" : f === "inUse" ? "BUSY" : f}
                <span className={cn("ml-3 px-2 py-0.5 rounded-lg text-[9px]", filter === f ? "bg-white/20 text-white" : "bg-muted text-muted-foreground")}>
                  {pcs ? pcs.filter(p => f === "all" ? true : p.status === f).length : 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* PC Grid */}
        <div className="grid grid-cols-2 gap-5">
          {/* @ts-ignore */}
          <AnimatePresence mode="popLayout">
            {filtered.map((pc, i) => {
              const cfg = STATUS_CONFIG[pc.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.offline;
              const tierCfg = (TIER_CONFIG as any)[pc.tier] ?? { label: pc.tier, color: "text-muted-foreground", bg: "bg-muted", icon: Monitor, rate: 0 };
              const isAvailable = pc.status === "available";
              const TierIcon = tierCfg.icon;

              const isVip = pc.tier === "vip";

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
                    onClick={() => isAvailable && setSelectedPc(pc)}
                    className={cn(
                      "relative p-5 rounded-[2rem] border-2 transition-all active:scale-95 group overflow-hidden shadow-sm h-full flex flex-col",
                      isAvailable 
                        ? (isVip 
                            ? "cursor-pointer bg-gradient-to-br from-yellow-500/20 via-yellow-500/5 to-transparent border-yellow-500/50 hover:border-yellow-400 shadow-[0_0_25px_rgba(234,179,8,0.15)] bg-[#1a1608]" 
                            : "cursor-pointer bg-card hover:bg-muted border-border hover:border-primary/30") 
                        : "bg-muted/40 opacity-70 border-border grayscale-[0.5]"
                    )}
                  >
                    {/* Status Indicator */}
                    <div className="flex justify-between items-start mb-4">
                      <div className={cn(
                        "flex items-center gap-1.5 px-2 py-1 rounded-lg bg-background/50 border border-border backdrop-blur-sm",
                        cfg.color
                      )}>
                        <div className={cn("w-1.5 h-1.5 rounded-full", cfg.dot, isAvailable && "animate-pulse")} />
                        <span className="text-[8px] font-black tracking-[0.1em]">{cfg.label}</span>
                      </div>
                      <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shadow-inner", isVip ? "bg-yellow-500/20 text-yellow-400" : tierCfg.bg, tierCfg.color)}>
                        <TierIcon className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="space-y-1 mb-4 flex-1">
                      <h3 className={cn(
                        "text-xl font-black font-mono tracking-tighter uppercase italic",
                        isVip ? "text-yellow-400" : "text-foreground"
                      )}>{pc.label}</h3>
                      <div className="flex items-center gap-2">
                        <span className={cn("text-[9px] font-black uppercase tracking-[0.2em] opacity-80", isVip ? "text-yellow-500" : tierCfg.color)}>{tierCfg.label}</span>
                      </div>
                    </div>

                    {isAvailable && (
                      <Button className={cn(
                        "w-full h-10 rounded-xl font-black uppercase text-[9px] tracking-[0.2em] transition-transform",
                        isVip ? "bg-yellow-500 text-black hover:bg-yellow-400" : "bg-primary text-primary-foreground"
                      )}>
                        USE PC
                      </Button>
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

        {/* Immersive Booking Dialog */}
        <Dialog open={!!selectedPc} onOpenChange={() => !isBooking && setSelectedPc(null)}>
          <DialogContent className="sm:max-w-md bg-zinc-950 border-border rounded-[2rem] p-6 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 blur-[80px] -mr-24 -mt-24 pointer-events-none" />
            
            <DialogHeader className="mb-6 text-center">
              <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center mb-4 mx-auto border border-primary/20 shadow-inner">
                <Monitor className="w-8 h-8 text-primary" />
              </div>
              <DialogTitle className="text-3xl font-black font-display tracking-tight text-foreground italic uppercase">
                STATION <span className="text-primary">{selectedPc?.label}</span>
              </DialogTitle>
              <DialogDescription className="text-muted-foreground font-black uppercase tracking-[0.2em] text-[9px] mt-1">
                Configure session parameters
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-3">
                {[60, 120, 180, 240, 300, 480].map(mins => (
                  <button
                    key={mins}
                    className={cn(
                      "h-20 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all border-2 active:scale-95 group relative overflow-hidden shadow-sm",
                      bookingMinutes === mins 
                        ? "bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/20" 
                        : "bg-muted border-border hover:bg-muted/80 text-muted-foreground"
                    )}
                    onClick={() => setBookingMinutes(mins)}
                  >
                    <span className={cn("text-xl font-black font-mono leading-none", bookingMinutes === mins ? "text-primary-foreground" : "text-foreground")}>{mins / 60}H</span>
                    <span className={cn("text-[9px] font-black uppercase tracking-[0.1em] opacity-70", bookingMinutes === mins ? "text-primary-foreground" : "text-primary")}>₱{((mins / 60) * ((TIER_CONFIG as any)[selectedPc?.tier]?.rate || 0)).toFixed(0)}</span>
                  </button>
                ))}
              </div>

              <div className="bg-muted/50 border border-border rounded-2xl p-5 space-y-4 shadow-inner">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Session Cost</span>
                  <span className="text-2xl font-black text-foreground font-mono tracking-tighter italic">₱{((bookingMinutes / 60) * ((TIER_CONFIG as any)[selectedPc?.tier]?.rate || 0)).toFixed(2)}</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex justify-between items-center bg-card/50 p-3 rounded-xl border border-border/50">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Termination</span>
                  </div>
                  <span className="text-sm font-black text-primary font-mono italic">
                    {new Date(Date.now() + bookingMinutes * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-8 sm:flex-col gap-3">
              <Button 
                onClick={handleDirectBook} 
                className="w-full h-14 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 font-black text-xs tracking-[0.3em] uppercase shadow-xl shadow-primary/30 relative overflow-hidden group border-2 border-white/10"
                disabled={isBooking}
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
                {isBooking ? <Clock className="w-5 h-5 animate-spin mr-3" /> : "ENGAGE STATION"}
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setSelectedPc(null)} 
                disabled={isBooking}
                className="w-full h-10 text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] hover:text-foreground active:scale-95"
              >
                Cancel Authorization
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PlayerLayout>

  );
}

