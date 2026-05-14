import { useState, useEffect } from "react";
import { useGetMyQueueEntry, useJoinQueue, useListPcs, useRemoveQueueEntry, getGetMyQueueEntryQueryKey } from "@workspace/api-client-react";
import { PlayerLayout } from "@/components/layout/player-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Monitor, X, Loader2, ChevronRight, AlertTriangle, Home, ChevronLeft, Zap, Shield, Trophy, ListOrdered } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
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
    waitingApproval: { label: "PENDING AUTHORIZATION", color: "text-yellow-400", bg: "bg-yellow-400/10" },
    approved: { label: "ACCESS GRANTED", color: "text-green-400", bg: "bg-green-400/10" },
    waiting: { label: "IN ACTIVE QUEUE", color: "text-blue-400", bg: "bg-blue-400/10" },
  };

  return (
    <PlayerLayout backHref="/home">
      <div className="space-y-8 pt-6 pb-20">
        {/* Tactical Header */}
        <div className="relative overflow-hidden rounded-[3rem] bg-card border border-border p-10 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 blur-[120px] -mr-40 -mt-40 pointer-events-none" />
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-3">
              <ListOrdered className="w-5 h-5 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">Position Status</span>
            </div>
            <h1 className="text-4xl font-black font-display tracking-tight text-foreground leading-none italic uppercase">
              QUEUE
            </h1>
            <p className="text-xs font-black uppercase tracking-[0.1em]">
              {anyAvailable
                ? <span className="text-green-500">{availablePcs.length} STATIONS READY FOR UPLINK</span>
                : <span className="text-primary">FLEET FULLY DEPLOYED — JOIN ACTIVE WAITLIST</span>}
            </p>
          </div>
        </div>

        {isLoadingQueue ? (
          <div className="flex flex-col items-center justify-center p-24 space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse" />
              <Loader2 className="w-16 h-16 animate-spin text-primary relative z-10" />
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.5em] animate-pulse">Syncing Network State...</p>
          </div>
        ) : isQueued ? (
          /* Active queue position */
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="relative bg-card border border-border rounded-[3.5rem] p-12 text-center overflow-hidden shadow-3xl">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32 pointer-events-none" />
              
              <div className="relative z-10">
                <div className="w-24 h-24 rounded-[2rem] bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-10 relative group">
                   <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
                   <Trophy className="w-12 h-12 text-primary relative z-10 group-hover:scale-110 transition-transform" />
                </div>

                <div className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-[0.5em] mb-4 italic">System Rank</div>
                <div className="text-[10rem] font-black font-mono text-foreground mb-4 tracking-tighter leading-none drop-shadow-[0_0_40px_rgba(124,58,237,0.5)] italic">
                  #{queueEntry.position}
                </div>

                <div className={cn(
                  "inline-flex items-center gap-3 px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] mb-12 border",
                  STATUS_LABELS[queueEntry.status]?.bg ?? "bg-muted",
                  STATUS_LABELS[queueEntry.status]?.color ?? "text-muted-foreground",
                  "border-current/20 shadow-lg shadow-current/5"
                )}>
                  <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                  {STATUS_LABELS[queueEntry.status]?.label ?? queueEntry.status}
                </div>

                <div className="grid grid-cols-2 gap-5 mb-12">
                  <div className="bg-background/40 border border-border/50 rounded-[1.5rem] p-6 text-left shadow-inner group hover:bg-muted/50 transition-colors">
                    <div className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-2">Est. Wait</div>
                    <div className="text-2xl font-black text-primary font-mono tracking-tighter italic">~{queueEntry.estimatedWaitMinutes || 5}M</div>
                  </div>
                  <div className="bg-background/40 border border-border/50 rounded-[1.5rem] p-6 text-left shadow-inner group hover:bg-muted/50 transition-colors">
                    <div className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-2">Requested</div>
                    <div className="text-2xl font-black text-foreground font-mono tracking-tighter uppercase italic">{queueEntry.requestedTier}</div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  className="text-destructive/60 hover:text-destructive hover:bg-destructive/10 text-[11px] font-black uppercase tracking-[0.3em] w-full h-16 rounded-[1.5rem] transition-all border border-transparent hover:border-destructive/20"
                  onClick={handleLeave}
                  disabled={leaveQueueMutation.isPending}
                >
                  {leaveQueueMutation.isPending ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <X className="w-5 h-5 mr-3" />}
                  De-authorize Entry
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* Available PCs CTA */}
            {anyAvailable && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <div 
                  className="relative p-8 rounded-[3rem] bg-green-500/5 border border-green-500/20 group cursor-pointer hover:bg-green-500/10 transition-all active:scale-95 overflow-hidden shadow-xl"
                  onClick={() => setLocation("/pcs")}
                >
                  <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-125 transition-transform duration-500">
                    <Zap className="w-24 h-24 text-green-500" />
                  </div>
                  <div className="relative z-10 flex items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-green-500/20 flex items-center justify-center text-green-400 border border-green-500/30 shadow-inner group-hover:scale-110 transition-transform">
                        <Monitor className="w-8 h-8" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-black text-green-400 uppercase tracking-[0.2em] text-lg italic leading-none">
                          UPLINK AVAILABLE
                        </h3>
                        <p className="text-[10px] text-muted-foreground/80 font-black uppercase tracking-[0.2em]">
                          {availablePcs.length} UNITS ONLINE — BYPASS QUEUE NOW
                        </p>
                      </div>
                    </div>
                    <Button size="icon" className="w-12 h-12 rounded-2xl bg-green-500 text-black shadow-lg shadow-green-500/20 active:scale-90 transition-all">
                      <ChevronRight className="w-7 h-7" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Join Queue Form */}
            <div className="bg-card border border-border rounded-[3rem] p-10 space-y-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32 pointer-events-none" />
              
              <div className="flex items-center gap-6 relative z-10">
                <div className="w-16 h-16 rounded-[1.5rem] bg-muted/50 border border-border flex items-center justify-center shadow-inner">
                  <Shield className="w-8 h-8 text-muted-foreground/30" />
                </div>
                <div>
                  <h3 className="font-black text-foreground uppercase tracking-[0.2em] text-lg italic leading-none">
                    {anyAvailable ? "FLEET WAITLIST" : "ACTIVE DEPLOYMENT"}
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] mt-1.5 opacity-60">
                    {anyAvailable ? "Secure specific hardware priority" : "Request next available terminal"}
                  </p>
                </div>
              </div>

              {!anyAvailable && (
                <div className="flex items-center gap-4 p-6 rounded-[1.5rem] bg-yellow-500/5 border border-yellow-500/10 text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400 italic">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  System at capacity. Position logged upon entry.
                </div>
              )}

              <div className="space-y-4 relative z-10">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-2 italic">Select Station Tier</label>
                <Select value={tier} onValueChange={setTier}>
                  <SelectTrigger className="bg-muted/50 border-border h-16 rounded-[1.5rem] text-[11px] font-black tracking-[0.2em] uppercase focus:ring-primary/10 shadow-inner px-6">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border rounded-[1.5rem] p-2 shadow-3xl">
                    {[
                      { value: "standard", label: "Regular station", price: "25" },
                      { value: "vip", label: "VVIP station", price: "50" }
                    ].map(t => (
                      <SelectItem key={t.value} value={t.value} className="text-[11px] font-black uppercase tracking-[0.2em] py-4 rounded-xl focus:bg-primary focus:text-primary-foreground">
                        {t.label} <span className="ml-2 opacity-50">₱{t.price}/H</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {availableForTier.length > 0 && (
                  <div className="flex items-center gap-2 ml-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <p className="text-[10px] text-green-500 font-black uppercase tracking-[0.2em]">
                      {availableForTier.length} {tier} Units online
                    </p>
                  </div>
                )}
              </div>

              <Button
                className="w-full h-16 text-sm font-black uppercase tracking-[0.4em] rounded-[1.5rem] bg-primary text-primary-foreground shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-95 group relative overflow-hidden"
                onClick={handleJoinQueue}
                disabled={joinQueueMutation.isPending}
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
                {joinQueueMutation.isPending ? <Loader2 className="w-6 h-6 mr-3 animate-spin" /> : <Zap className="w-6 h-6 mr-3" />}
                ENGAGE QUEUE
              </Button>
            </div>
          </div>
        )}
      </div>
    </PlayerLayout>

  );
}
