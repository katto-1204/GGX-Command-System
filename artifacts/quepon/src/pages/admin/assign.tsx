import { useState } from "react";
import { useListQueueEntries, useListPcs, useAssignQueueEntryToPc, getListQueueEntriesQueryKey, getListPcsQueryKey } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Monitor, User, ArrowRight, Loader2, Zap, Shield, ChevronRight, Clock, Target, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function AdminAssign() {
  const { data: queue, isLoading: isLoadingQueue } = useListQueueEntries({ query: { refetchInterval: 5000 } as any });
  const { data: pcs, isLoading: isLoadingPcs } = useListPcs({ query: { refetchInterval: 5000 } as any });
  const assignMutation = useAssignQueueEntryToPc();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedQueueId, setSelectedQueueId] = useState<string | null>(null);
  const [selectedPcId, setSelectedPcId] = useState<string | null>(null);
  const [duration, setDuration] = useState("60");

  const approvedEntries = queue?.filter(q => q.status === "approved" || q.status === "waiting") || [];
  const availablePcs = pcs?.filter(pc => pc.status === "available") || [];

  const handleAssign = () => {
    if (!selectedQueueId || !selectedPcId) return;

    assignMutation.mutate({
      queueId: selectedQueueId,
      data: { pcId: selectedPcId, durationMinutes: parseInt(duration) }
    }, {
      onSuccess: () => {
        toast({ title: "SQUAD DEPLOYED", description: "Station assignment broadcast successful." });
        setSelectedQueueId(null);
        setSelectedPcId(null);
        queryClient.invalidateQueries({ queryKey: getListQueueEntriesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListPcsQueryKey() });
      },
      onError: (err: any) => {
        toast({ title: "DEPLOYMENT FAILED", description: err.message, variant: "destructive" });
      }
    });
  };

  const selectedEntry = approvedEntries.find(q => q.id === selectedQueueId);
  const selectedPc = availablePcs.find(pc => pc.id === selectedPcId);

  return (
    <AdminLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary">
              <Target className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Matchmaking Engine</span>
            </div>
            <h1 className="text-4xl font-black font-display tracking-tight text-foreground">UNIT <span className="text-primary">ASSIGNMENT</span></h1>
            <p className="text-muted-foreground font-medium text-sm">Deploy authorized players to operational hardware stations.</p>
          </div>

          <div className="flex gap-4">
             <div className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 flex flex-col">
                <span className="text-[8px] font-black text-primary uppercase tracking-widest">Awaiting Ops</span>
                <span className="text-xl font-black font-mono text-foreground">{approvedEntries.length}</span>
             </div>
             <div className="px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 flex flex-col">
                <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">Available Units</span>
                <span className="text-xl font-black font-mono text-foreground">{availablePcs.length}</span>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side: Queue */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60">Verified Personnel</h3>
              <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 font-mono">{approvedEntries.length}</Badge>
            </div>
            
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {isLoadingQueue ? (
                Array(3).fill(0).map((_, i) => <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />)
              ) : approvedEntries.length === 0 ? (
                <div className="bg-card border border-border rounded-3xl p-12 text-center">
                  <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground/20" />
                  <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">No personnel cleared for deployment</p>
                </div>
              ) : (
                approvedEntries.map(entry => (
                  <motion.div 
                    key={entry.id}
                    layoutId={`queue-${entry.id}`}
                    onClick={() => setSelectedQueueId(entry.id)}
                    className={cn(
                      "p-4 rounded-2xl border cursor-pointer transition-all relative group overflow-hidden",
                      selectedQueueId === entry.id 
                        ? "bg-primary/20 border-primary shadow-[0_0_20px_rgba(124,58,237,0.2)]" 
                        : "bg-card border-border hover:bg-muted hover:border-muted-foreground/20"
                    )}
                  >
                    <div className="flex justify-between items-center relative z-10">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center font-black font-mono transition-colors",
                          selectedQueueId === entry.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        )}>
                          #{entry.position}
                        </div>
                        <div>
                          <div className="font-bold text-foreground group-hover:text-primary transition-colors">{entry.displayName || entry.username}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Shield className="w-3 h-3 text-muted-foreground/40" />
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{entry.requestedTier || "ANY"} TIER PREF</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-green-500/50 text-green-500 text-[8px] font-black uppercase tracking-widest bg-green-500/5">
                        {entry.status}
                      </Badge>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Right Side: Available PCs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60">Operational Stations</h3>
              <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/30 font-mono">{availablePcs.length}</Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {isLoadingPcs ? (
                Array(6).fill(0).map((_, i) => <div key={i} className="aspect-square rounded-2xl bg-muted animate-pulse" />)
              ) : availablePcs.length === 0 ? (
                <div className="col-span-full bg-card border border-border rounded-3xl p-12 text-center">
                  <Monitor className="w-12 h-12 mx-auto mb-4 text-muted-foreground/20" />
                  <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">All hardware units currently in use</p>
                </div>
              ) : (
                availablePcs.map(pc => (
                  <motion.div 
                    key={pc.id}
                    layoutId={`pc-${pc.id}`}
                    onClick={() => setSelectedPcId(pc.id)}
                    className={cn(
                      "aspect-square p-4 rounded-[2rem] border cursor-pointer transition-all flex flex-col items-center justify-center text-center relative group overflow-hidden",
                      selectedPcId === pc.id 
                        ? "bg-green-500/20 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.2)]" 
                        : "bg-card border-border hover:bg-muted hover:border-muted-foreground/20"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110",
                      selectedPcId === pc.id ? "bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.5)]" : "bg-muted text-muted-foreground/40"
                    )}>
                      <Monitor className="w-6 h-6" />
                    </div>
                    <div className="font-black font-mono text-lg text-foreground group-hover:text-green-400 transition-colors">{pc.label}</div>
                    <div className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1">{pc.tier}</div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <AnimatePresence>
          {selectedQueueId && selectedPcId && (
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 md:ml-32 w-[90%] max-w-3xl z-50"
            >
              <div className="bg-background/90 backdrop-blur-2xl border border-primary/30 rounded-[2.5rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_30px_rgba(124,58,237,0.2)]">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-[8px] font-black text-primary uppercase tracking-widest mb-1">Assigned Player</div>
                      <div className="font-black text-foreground">{selectedEntry?.username}</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <ArrowRight className="text-primary w-5 h-5" />
                    </div>
                    <div className="text-center">
                      <div className="text-[8px] font-black text-green-500 uppercase tracking-widest mb-1">Target Station</div>
                      <div className="font-black font-mono text-foreground">{selectedPc?.label}</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-center gap-4">
                    <div className="flex items-center gap-3 bg-muted border border-border rounded-2xl px-4 py-2">
                      <Clock className="w-4 h-4 text-muted-foreground/40" />
                      <Select value={duration} onValueChange={setDuration}>
                        <SelectTrigger className="w-[110px] h-8 bg-transparent border-none p-0 font-black text-[10px] uppercase tracking-widest focus:ring-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          <SelectItem value="30" className="text-[10px] font-black uppercase tracking-widest">30 MINS</SelectItem>
                          <SelectItem value="60" className="text-[10px] font-black uppercase tracking-widest">1 HOUR</SelectItem>
                          <SelectItem value="120" className="text-[10px] font-black uppercase tracking-widest">2 HOURS</SelectItem>
                          <SelectItem value="180" className="text-[10px] font-black uppercase tracking-widest">3 HOURS</SelectItem>
                          <SelectItem value="300" className="text-[10px] font-black uppercase tracking-widest">5 HOURS</SelectItem>
                          <SelectItem value="0" className="text-[10px] font-black uppercase tracking-widest">OPEN TIME</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button 
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase text-[10px] tracking-[0.2em] h-12 px-8 rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-all"
                      onClick={handleAssign}
                      disabled={assignMutation.isPending}
                    >
                      {assignMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
                      Authorize Deployment
                    </Button>

                    <Button 
                      variant="ghost"
                      size="icon"
                      className="h-12 w-12 rounded-2xl bg-muted hover:bg-muted/80 text-muted-foreground"
                      onClick={() => { setSelectedQueueId(null); setSelectedPcId(null); }}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}


