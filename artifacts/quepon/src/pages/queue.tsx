import { useState, useEffect } from "react";
import { useGetMyQueueEntry, useJoinQueue, useListPcs, useRemoveQueueEntry, getGetMyQueueEntryQueryKey } from "@workspace/api-client-react";
import { PlayerLayout } from "@/components/layout/player-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Monitor, X, Loader2, ChevronRight, AlertTriangle, Home, ChevronLeft } from "lucide-react";
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

  const handleJoinQueue = () => {
    joinQueueMutation.mutate({ data: { requestedTier: tier } }, {
      onSuccess: (data) => {
        if (data.status === "approved") {
          toast({ title: "Auto-Approved!", description: "There are available PCs. You've been approved immediately." });
        } else {
          toast({ title: "Joined queue!", description: "We'll notify you when a PC is ready." });
        }
        queryClient.invalidateQueries({ queryKey: getGetMyQueueEntryQueryKey() });
      },
      onError: (err: any) => {
        toast({ title: "Failed to join queue", description: err.message || "Please try again.", variant: "destructive" });
      }
    });
  };

  const handleLeave = () => {
    if (!queueEntry) return;
    leaveQueueMutation.mutate({ queueId: queueEntry.id }, {
      onSuccess: () => {
        toast({ title: "Left the queue" });
        queryClient.invalidateQueries({ queryKey: getGetMyQueueEntryQueryKey() });
      }
    });
  };

  const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    waitingApproval: { label: "Awaiting Approval", color: "text-yellow-400" },
    approved: { label: "Approved — PC being assigned", color: "text-green-400" },
    waiting: { label: "Waiting", color: "text-blue-400" },
  };

  return (
    <PlayerLayout backHref="/home">
      <div className="space-y-6 pt-4">
        <div>
          <h1 className="text-2xl font-bold font-display">Queue</h1>
          <p className="text-muted-foreground text-sm">
            {anyAvailable
              ? <span className="text-green-400">{availablePcs.length} PCs available now</span>
              : "All PCs are occupied — join the queue"}
          </p>
        </div>

        {isLoadingQueue ? (
          <div className="flex justify-center p-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : isQueued ? (
          /* Active queue position */
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="bg-[rgba(124,58,237,0.08)] border-[rgba(124,58,237,0.3)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary animate-pulse" />
              <CardContent className="p-8 text-center">
                <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
                <div className="text-xs text-primary uppercase tracking-widest mb-2">Your Position</div>
                <div className="text-7xl font-bold font-mono text-white mb-4 drop-shadow-[0_0_20px_rgba(124,58,237,0.6)]">
                  #{queueEntry.position}
                </div>

                <div className={cn("text-sm font-medium mb-6", STATUS_LABELS[queueEntry.status]?.color ?? "text-muted-foreground")}>
                  {STATUS_LABELS[queueEntry.status]?.label ?? queueEntry.status}
                </div>

                <div className="bg-black/20 rounded-xl p-4 space-y-2 text-left mb-6 border border-white/5">
                  {queueEntry.estimatedWaitMinutes != null && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Est. Wait</span>
                      <span className="text-yellow-400 font-medium">~{queueEntry.estimatedWaitMinutes} min</span>
                    </div>
                  )}
                  {queueEntry.requestedTier && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Requested Tier</span>
                      <span className="text-white capitalize">{queueEntry.requestedTier}</span>
                    </div>
                  )}
                </div>

                <Button
                  variant="outline"
                  className="border-red-500/30 text-red-500 hover:bg-red-500/10 w-full"
                  onClick={handleLeave}
                  disabled={leaveQueueMutation.isPending}
                >
                  {leaveQueueMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <X className="w-4 h-4 mr-2" />}
                  Leave Queue
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {/* Available PCs CTA */}
            {anyAvailable && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="bg-green-500/5 border-green-500/30">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-green-400 flex items-center gap-2">
                          <Monitor className="w-4 h-4" /> PCs Available Now!
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {availablePcs.length} PC{availablePcs.length !== 1 ? "s" : ""} ready — you can pick one directly instead of waiting.
                        </p>
                      </div>
                      <Button size="sm" className="bg-green-500 hover:bg-green-400 text-black font-bold whitespace-nowrap" onClick={() => setLocation("/pcs")}>
                        Pick a PC <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Join Queue form */}
            <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]">
              <CardContent className="p-6 space-y-5">
                <div className="flex items-center gap-3">
                  <Monitor className="w-8 h-8 text-muted-foreground" />
                  <div>
                    <h3 className="font-bold">{anyAvailable ? "Join Queue Anyway" : "Join the Queue"}</h3>
                    <p className="text-sm text-muted-foreground">
                      {anyAvailable ? "Or wait for a specific tier" : "We'll assign you the next available PC"}
                    </p>
                  </div>
                </div>

                {!anyAvailable && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20 text-xs text-yellow-400">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    All PCs are currently occupied. You'll be assigned automatically when one frees up.
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Preferred Tier</label>
                  <Select value={tier} onValueChange={setTier}>
                    <SelectTrigger className="bg-black/20 border-white/10 h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard — ₱25/hr</SelectItem>
                      <SelectItem value="premium">Premium — ₱35/hr</SelectItem>
                      <SelectItem value="vip">VIP — ₱50/hr</SelectItem>
                    </SelectContent>
                  </Select>
                  {availableForTier.length > 0 && (
                    <p className="text-xs text-green-400">{availableForTier.length} {tier} PC{availableForTier.length !== 1 ? "s" : ""} available</p>
                  )}
                </div>

                <Button
                  className="w-full h-12 text-base font-bold shadow-[0_0_20px_rgba(124,58,237,0.3)]"
                  onClick={handleJoinQueue}
                  disabled={joinQueueMutation.isPending}
                >
                  {joinQueueMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Join Queue
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </PlayerLayout>
  );
}
