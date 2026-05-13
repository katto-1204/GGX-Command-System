import { useState } from "react";
import { useListPcs } from "@workspace/api-client-react";
import { useLocation, Link } from "wouter";
import { PlayerLayout } from "@/components/layout/player-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Monitor, Search, ChevronRight, Clock, Cpu, Zap, Home, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const STATUS_CONFIG = {
  available: { label: "Available", color: "border-green-500 text-green-500", dot: "bg-green-500", bar: "bg-green-500" },
  inUse: { label: "In Use", color: "border-red-500 text-red-500", dot: "bg-red-500", bar: "bg-red-500" },
  maintenance: { label: "Maintenance", color: "border-yellow-500 text-yellow-500", dot: "bg-yellow-500", bar: "bg-yellow-500" },
  reserved: { label: "Reserved", color: "border-purple-500 text-purple-500", dot: "bg-purple-500", bar: "bg-purple-500" },
  offline: { label: "Offline", color: "border-gray-500 text-gray-500", dot: "bg-gray-500", bar: "bg-gray-500" },
};

const TIER_CONFIG = {
  standard: { label: "Standard", color: "text-blue-400", rate: 25 },
  premium: { label: "Premium", color: "text-purple-400", rate: 35 },
  vip: { label: "VIP", color: "text-yellow-400", rate: 50 },
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
        title: "Session Started!",
        description: `Your session on ${selectedPc.label} has begun. Enjoy gaming!`,
        variant: "default",
      });
      
      setSelectedPc(null);
      queryClient.invalidateQueries();
      setLocation("/session");
    } catch (err: any) {
      toast({
        title: "Booking Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <PlayerLayout backHref="/home">
      <div className="space-y-5 pt-4">
        <div>
          <h1 className="text-2xl font-bold font-display">PCs</h1>
          <p className="text-muted-foreground text-sm">
            {hasAvailable
              ? <span className="text-green-400 font-medium">{availablePcs.length} PC{availablePcs.length !== 1 ? "s" : ""} available — pick yours!</span>
              : <span className="text-yellow-400">All PCs in use — join the queue</span>}
          </p>
        </div>

        {!hasAvailable && (
          <Card className="bg-yellow-500/5 border-yellow-500/30">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">All PCs occupied</p>
                <p className="text-xs text-muted-foreground">Join the queue and we'll notify you</p>
              </div>
              <Button size="sm" onClick={() => setLocation("/queue")} className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold">
                Join Queue <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by PC, tier, GPU..."
            className="pl-9 bg-black/20 border-white/10"
          />
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {["all", "available", "inUse", "maintenance"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all border",
                filter === f
                  ? "bg-primary/20 text-primary border-primary/50"
                  : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10"
              )}
            >
              {f === "all" ? "All" : f === "inUse" ? "In Use" : f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== "all" && <span className="ml-1.5 opacity-60">{(pcs ?? []).filter(p => p.status === f).length}</span>}
            </button>
          ))}
        </div>

        {/* PC Grid */}
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((pc, i) => {
            const cfg = STATUS_CONFIG[pc.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.offline;
            const tierCfg = (TIER_CONFIG as any)[pc.tier] ?? { label: pc.tier, color: "text-muted-foreground", rate: 0 };
            const isAvailable = pc.status === "available";

            return (
              <motion.div key={pc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card 
                  onClick={() => isAvailable && setSelectedPc(pc)}
                  className={cn(
                    "relative overflow-hidden transition-all",
                    isAvailable
                      ? "bg-[rgba(34,197,94,0.05)] border-green-500/30 cursor-pointer hover:border-green-500/60 hover:shadow-[0_0_20px_rgba(34,197,94,0.1)]"
                      : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]"
                  )}
                >
                  <div className={`absolute top-0 left-0 w-full h-0.5 ${cfg.bar}`} />
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${cfg.dot} ${isAvailable ? "animate-pulse" : ""}`} />
                        <span className="font-bold font-mono">{pc.label}</span>
                      </div>
                      <Badge variant="outline" className={`text-[10px] ${cfg.color}`}>{cfg.label}</Badge>
                    </div>

                    <div className="space-y-1">
                      <div className={`text-xs font-bold ${tierCfg.color}`}>{tierCfg.label}</div>
                      {pc.specs?.gpu && (
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Zap className="w-3 h-3" /> {pc.specs.gpu}
                        </div>
                      )}
                      {pc.status === "inUse" && pc.remainingSeconds != null && (
                        <div className="flex items-center gap-1 text-[10px] font-mono text-red-400 mt-1">
                          <Clock className="w-3 h-3" /> {Math.floor(pc.remainingSeconds / 60)}m left
                        </div>
                      )}
                    </div>

                    {isAvailable && (
                      <Button size="sm" className="w-full h-7 text-xs bg-green-500 hover:bg-green-400 text-black font-bold">
                        Book Now
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && !isLoading && (
          <div className="text-center py-12 text-muted-foreground">
            <Monitor className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No PCs match your search</p>
          </div>
        )}

        {/* Booking Dialog */}
        <Dialog open={!!selectedPc} onOpenChange={() => !isBooking && setSelectedPc(null)}>
          <DialogContent className="sm:max-w-md bg-zinc-950 border-white/10">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5 text-green-500" />
                Book {selectedPc?.label}
              </DialogTitle>
              <DialogDescription>
                Select your session duration. You will be logged in immediately.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-6 space-y-6">
              <div className="grid grid-cols-3 gap-3">
                {[60, 120, 180, 240, 300, 480].map(mins => (
                  <Button
                    key={mins}
                    variant={bookingMinutes === mins ? "default" : "outline"}
                    className={cn(
                      "h-14 flex flex-col items-center justify-center gap-0.5",
                      bookingMinutes === mins && "bg-primary text-white border-primary shadow-[0_0_15px_rgba(124,58,237,0.4)]"
                    )}
                    onClick={() => setBookingMinutes(mins)}
                  >
                    <span className="text-sm font-bold">{mins / 60}h</span>
                    <span className="text-[10px] opacity-70">₱{((mins / 60) * ((TIER_CONFIG as any)[selectedPc?.tier]?.rate || 0)).toFixed(0)}</span>
                  </Button>
                ))}
              </div>

              <div className="bg-white/5 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total to pay</p>
                  <p className="text-xl font-bold text-white">₱{((bookingMinutes / 60) * ((TIER_CONFIG as any)[selectedPc?.tier]?.rate || 0)).toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Ends at</p>
                  <p className="text-sm font-mono text-primary">
                    {new Date(Date.now() + bookingMinutes * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setSelectedPc(null)} disabled={isBooking}>Cancel</Button>
              <Button 
                onClick={handleDirectBook} 
                className="bg-green-500 hover:bg-green-400 text-black font-bold min-w-[120px]"
                disabled={isBooking}
              >
                {isBooking ? <Clock className="w-4 h-4 animate-spin mr-2" /> : "Confirm Booking"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PlayerLayout>
  );
}
