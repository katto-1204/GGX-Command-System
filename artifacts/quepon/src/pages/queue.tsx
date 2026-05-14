import { useState, useEffect } from "react";
import { useGetMyQueueEntry, useJoinQueue, useListPcs, useRemoveQueueEntry, getGetMyQueueEntryQueryKey } from "@workspace/api-client-react";
import { PlayerLayout } from "@/components/layout/player-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Monitor, X, Loader2, ChevronRight, AlertTriangle, Home, ChevronLeft, Zap, Shield, Trophy, ListOrdered, QrCode } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Queue() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.includes("?") ? location.split("?")[1] : "");
  const preselectedTier = params.get("tier") || "standard";

  const { data: queueEntry, isLoading: isLoadingQueue } = useGetMyQueueEntry({ query: { refetchInterval: 5000 } as any });
  const { data: pcs } = useListPcs({ query: { refetchInterval: 10000 } as any });
  const joinQueueMutation = useJoinQueue();
  const leaveQueueMutation = useRemoveQueueEntry();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [tier, setTier] = useState(preselectedTier);

  const availablePcs = (pcs ?? []).filter(p => p.status === "available");
  const availableForTier = availablePcs.filter(p => p.tier === tier);
  const anyAvailable = availablePcs.length > 0;

  const isQueued = !!queueEntry && !["cancelled", "removed", "noShow", "completed", "assigned"].includes(queueEntry.status);
  const isNextInLine = isQueued && queueEntry.position === 1;
  const isApprovedOrAssigned = queueEntry?.status === "approved" || queueEntry?.status === "assigned";

  const handleJoinQueue = () => {
    joinQueueMutation.mutate({ data: { requestedTier: tier } }, {
      onSuccess: (data) => {
        if (data.status === "approved") {
          toast({ title: "AUTO-APPROVED", description: "Authorization granted. Stations available." });
        } else {
          toast({ title: "QUEUE SECURED", description: "Your position has been logged in the system." });
        }
        queryClient.invalidateQueries({ queryKey: getGetMyQueueEntryQueryKey() });
      },
      onError: (err: any) => {
        toast({ title: "CONNECTION FAILED", description: err.message || "Please try again.", variant: "destructive" });
      }
    });
  };

  const handleLeave = () => {
    if (!queueEntry) return;
    leaveQueueMutation.mutate({ queueId: queueEntry.id }, {
      onSuccess: () => {
        toast({ title: "DE-AUTHORIZED", description: "You have left the active queue." });
        queryClient.invalidateQueries({ queryKey: getGetMyQueueEntryQueryKey() });
      }
    });
  };

  const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
    waitingApproval: { label: "PENDING", color: "text-yellow-400", bg: "bg-yellow-400/10" },
    approved: { label: "APPROVED", color: "text-green-400", bg: "bg-green-400/10" },
    waiting: { label: "IN QUEUE", color: "text-blue-400", bg: "bg-blue-400/10" },
  };

  return (
    <PlayerLayout backHref="/home">
      <div className="space-y-5 pt-4 pb-20">
        {/* Compact Header */}
        <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-5 shadow-xl">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 blur-[80px] -mr-24 -mt-24 pointer-events-none" />
          <div className="relative z-10 space-y-1.5">
            <div className="flex items-center gap-2">
              <ListOrdered className="w-3.5 h-3.5 text-primary" />
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Position Status</span>
            </div>
            <h1 className="text-2xl font-black font-display tracking-tight text-foreground leading-none italic uppercase">
              QUEUE
            </h1>
            <p className="text-[9px] font-black uppercase tracking-[0.1em]">
              {anyAvailable
                ? <span className="text-green-500">{availablePcs.length} STATIONS READY</span>
                : <span className="text-primary">FLEET FULL — JOIN WAITLIST</span>}
            </p>
          </div>
        </div>

        {isLoadingQueue ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse" />
              <Loader2 className="w-12 h-12 animate-spin text-primary relative z-10" />
            </div>
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] animate-pulse">Syncing...</p>
          </div>
        ) : isQueued ? (
          /* Active queue position — compact */
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="relative bg-card border border-border rounded-2xl p-6 text-center overflow-hidden shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/8 to-transparent pointer-events-none" />
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 blur-[80px] -mr-20 -mt-20 pointer-events-none" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5 relative group">
                   <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-50" />
                   <Trophy className="w-8 h-8 text-primary relative z-10" />
                </div>

                <div className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-[0.4em] mb-2 italic">System Rank</div>
                <div className="text-7xl font-black font-mono text-foreground mb-3 tracking-tighter leading-none drop-shadow-[0_0_30px_rgba(124,58,237,0.4)] italic">
                  #{queueEntry.position}
                </div>

                <div className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] mb-6 border",
                  STATUS_LABELS[queueEntry.status]?.bg ?? "bg-muted",
                  STATUS_LABELS[queueEntry.status]?.color ?? "text-muted-foreground",
                  "border-current/20"
                )}>
                  <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  {STATUS_LABELS[queueEntry.status]?.label ?? queueEntry.status}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-background/40 border border-border/50 rounded-xl p-4 text-left">
                    <div className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Est. Wait</div>
                    <div className="text-lg font-black text-primary font-mono tracking-tighter italic">~{queueEntry.estimatedWaitMinutes || 5}M</div>
                  </div>
                  <div className="bg-background/40 border border-border/50 rounded-xl p-4 text-left">
                    <div className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Requested</div>
                    <div className="text-lg font-black text-foreground font-mono tracking-tighter uppercase italic truncate">{queueEntry.requestedTier}</div>
                  </div>
                </div>

                {/* Scan QR Button — only when next in line */}
                {(isNextInLine || isApprovedOrAssigned) && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4"
                  >
                    <Button
                      className="w-full h-12 rounded-xl bg-green-600 text-white hover:bg-green-500 font-black text-[10px] uppercase tracking-[0.25em] shadow-lg shadow-green-600/30 group relative overflow-hidden"
                      onClick={() => setLocation("/checkin")}
                    >
                      <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                      <QrCode className="w-4 h-4 mr-2" />
                      Scan QR — It's Your Turn!
                    </Button>
                  </motion.div>
                )}

                <Button
                  variant="ghost"
                  className="text-destructive/60 hover:text-destructive hover:bg-destructive/10 text-[10px] font-black uppercase tracking-[0.2em] w-full h-12 rounded-xl transition-all border border-transparent hover:border-destructive/20"
                  onClick={handleLeave}
                  disabled={leaveQueueMutation.isPending}
                >
                  {leaveQueueMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <X className="w-4 h-4 mr-2" />}
                  Leave Queue
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-5">
            {/* Available PCs CTA */}
            {anyAvailable && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <div 
                  className="relative p-5 rounded-2xl bg-green-500/5 border border-green-500/20 group cursor-pointer hover:bg-green-500/10 transition-all active:scale-[0.98] overflow-hidden shadow-lg"
                  onClick={() => setLocation("/pcs")}
                >
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform duration-500">
                    <Zap className="w-16 h-16 text-green-500" />
                  </div>
                  <div className="relative z-10 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400 border border-green-500/30 shadow-inner group-hover:scale-110 transition-transform">
                        <Monitor className="w-6 h-6" />
                      </div>
                      <div className="space-y-0.5">
                        <h3 className="font-black text-green-400 uppercase tracking-[0.15em] text-sm italic leading-none">
                          PCs AVAILABLE
                        </h3>
                        <p className="text-[8px] text-muted-foreground/80 font-black uppercase tracking-[0.15em]">
                          {availablePcs.length} ONLINE — SKIP QUEUE
                        </p>
                      </div>
                    </div>
                    <Button size="icon" className="w-10 h-10 rounded-xl bg-green-500 text-black shadow-lg shadow-green-500/20 active:scale-90 transition-all">
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Join Queue Form */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 blur-[80px] -mr-20 -mt-20 pointer-events-none" />
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-muted/50 border border-border flex items-center justify-center shadow-inner">
                  <Shield className="w-6 h-6 text-muted-foreground/30" />
                </div>
                <div>
                  <h3 className="font-black text-foreground uppercase tracking-[0.15em] text-sm italic leading-none">
                    {anyAvailable ? "FLEET WAITLIST" : "JOIN QUEUE"}
                  </h3>
                  <p className="text-[8px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-1 opacity-60">
                    {anyAvailable ? "Secure hardware priority" : "Request next terminal"}
                  </p>
                </div>
              </div>

              {!anyAvailable && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10 text-[9px] font-black uppercase tracking-[0.15em] text-yellow-400 italic">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span className="leading-snug">System at capacity. Position logged upon entry.</span>
                </div>
              )}

              <div className="space-y-3 relative z-10">
                <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-1 italic">Station Tier</label>
                <Select value={tier} onValueChange={setTier}>
                  <SelectTrigger className="bg-muted/50 border-border h-12 rounded-xl text-[10px] font-black tracking-[0.15em] uppercase focus:ring-primary/10 shadow-inner px-4">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border rounded-xl p-1.5 shadow-2xl">
                    {[
                      { value: "standard", label: "Regular", price: "25" },
                      { value: "vip", label: "VVIP", price: "50" }
                    ].map(t => (
                      <SelectItem key={t.value} value={t.value} className="text-[10px] font-black uppercase tracking-[0.15em] py-3 rounded-lg focus:bg-primary focus:text-primary-foreground">
                        {t.label} <span className="ml-2 opacity-50">₱{t.price}/H</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {availableForTier.length > 0 && (
                  <div className="flex items-center gap-1.5 ml-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <p className="text-[8px] text-green-500 font-black uppercase tracking-[0.15em]">
                      {availableForTier.length} {tier} online
                    </p>
                  </div>
                )}
              </div>

              <Button
                className="w-full h-12 text-[10px] font-black uppercase tracking-[0.3em] rounded-xl bg-primary text-primary-foreground shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-[0.97] group relative overflow-hidden"
                onClick={handleJoinQueue}
                disabled={joinQueueMutation.isPending}
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
                {joinQueueMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
                ENGAGE QUEUE
              </Button>
            </div>
          </div>
        )}
      </div>
    </PlayerLayout>
  );
}
