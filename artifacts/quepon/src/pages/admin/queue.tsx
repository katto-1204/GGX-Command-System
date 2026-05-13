import { useState } from "react";
import { useListQueueEntries, useApproveQueueEntry, useRemoveQueueEntry, getListQueueEntriesQueryKey } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Trash2, Loader2, Play, Pause, Clock, Users, Shield, Zap, Filter, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function AdminQueue() {
  const { data: queue, isLoading } = useListQueueEntries({ query: { refetchInterval: 10000 } as any });
  const approveMutation = useApproveQueueEntry();
  const removeMutation = useRemoveQueueEntry();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isPaused, setIsPaused] = useState(false);

  const handleApprove = (id: string) => {
    approveMutation.mutate({ queueId: id }, {
      onSuccess: () => {
        toast({ title: "AUTHORIZATION GRANTED", description: "Player cleared for station assignment." });
        queryClient.invalidateQueries({ queryKey: getListQueueEntriesQueryKey() });
      }
    });
  };

  const handleRemove = (id: string, reason: string) => {
    removeMutation.mutate({ queueId: id }, {
      onSuccess: () => {
        toast({ title: "ENTRY PURGED", description: `Subject removed: ${reason}` });
        queryClient.invalidateQueries({ queryKey: getListQueueEntriesQueryKey() });
      }
    });
  };

  const activeQueue = queue?.filter(q => !["cancelled", "removed", "noShow", "completed", "assigned"].includes(q.status)) || [];

  return (
    <AdminLayout breadcrumbs={[{ label: "Queue Control" }]}>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black font-display tracking-tight text-foreground mb-2">QUEUE <span className="text-primary">CONTROL</span></h1>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                 <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{activeQueue.length} Active Subjects</span>
               </div>
               <div className="flex items-center gap-2">
                 <Clock className="w-3 h-3 text-muted-foreground/40" />
                 <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">System Sync: Live</span>
               </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="relative group">
                <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <Button 
                  variant={isPaused ? "default" : "outline"} 
                  className={cn(
                    "relative h-12 rounded-2xl font-black uppercase tracking-widest px-6 transition-all",
                    isPaused ? "bg-yellow-500 hover:bg-yellow-600 text-black border-none" : "bg-card border-border text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setIsPaused(!isPaused)}
                >
                  {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
                  {isPaused ? "Resume Pipeline" : "Pause Queue"}
                </Button>
             </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <Card className="bg-card border-border p-6 rounded-[2rem]">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                 </div>
                 <div>
                    <div className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-0.5">Waitlist Capacity</div>
                    <div className="text-2xl font-black text-foreground font-mono tracking-tighter">
                      {activeQueue.length}<span className="text-muted-foreground text-sm ml-1">/ 50</span>
                    </div>
                 </div>
              </div>
           </Card>
           <Card className="bg-card border-border p-6 rounded-[2rem]">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-green-500" />
                 </div>
                 <div>
                    <div className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-0.5">Throughput</div>
                    <div className="text-2xl font-black text-foreground font-mono tracking-tighter">
                      HIGH<span className="text-green-500/40 text-xs ml-2">OPTIMIZED</span>
                    </div>
                 </div>
              </div>
           </Card>
           <Card className="bg-card border-border p-6 rounded-[2rem]">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-blue-400" />
                 </div>
                 <div>
                    <div className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-0.5">Protocol</div>
                    <div className="text-2xl font-black text-foreground font-mono tracking-tighter">
                      SECURE<span className="text-blue-500/40 text-xs ml-2">VERIFIED</span>
                    </div>
                 </div>
              </div>
           </Card>
        </div>

        {/* Queue Table */}
        <Card className="bg-card border-border rounded-[2.5rem] overflow-hidden">
          <div className="border-b border-border bg-muted/20 px-8 py-6 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <Filter className="w-4 h-4 text-muted-foreground/40" />
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Active Sequence</span>
             </div>
             <div className="flex items-center gap-4">
                <Search className="w-4 h-4 text-muted-foreground/40" />
                <div className="w-px h-4 bg-border" />
                <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-primary">Export Grid</Button>
             </div>
          </div>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-border hover:bg-transparent h-14">
                  <TableHead className="w-[100px] text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">Rank</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Subject</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Class</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Latency</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Protocol</TableHead>
                  <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground pr-8">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-40 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-primary opacity-20" />
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Syncing Neural Link...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : activeQueue.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-40 text-center">
                       <div className="flex flex-col items-center gap-4 opacity-20">
                         <Shield className="w-8 h-8" />
                         <span className="text-[10px] font-black uppercase tracking-[0.2em]">Grid Secure — No Pending Subjects</span>
                       </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  activeQueue.map((entry) => (
                    <TableRow key={entry.id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                      <TableCell className="text-center">
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 font-mono font-black text-lg text-white group-hover:bg-primary/20 group-hover:text-primary transition-all">
                          {entry.position}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <div className="font-black text-white uppercase tracking-tight text-sm">{entry.displayName || entry.username}</div>
                          <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">@{entry.username}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                         <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:border-primary/20 transition-all">
                           {entry.requestedTier || "Generic"}
                         </div>
                      </TableCell>
                      <TableCell>
                         <div className="flex items-center gap-2">
                           <Clock className="w-3 h-3 text-yellow-400/40" />
                           <span className="font-mono font-black text-sm text-yellow-400">~{entry.estimatedWaitMinutes || 0}M</span>
                         </div>
                      </TableCell>
                      <TableCell>
                        <div className={cn(
                          "inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                          entry.status === "approved" ? "bg-green-500/10 text-green-500" :
                          entry.status === "waitingApproval" ? "bg-yellow-500/10 text-yellow-400" :
                          "bg-primary/10 text-primary"
                        )}>
                          {entry.status === "waitingApproval" ? "VERIFICATION REQ." : entry.status}
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <div className="flex justify-end gap-2">
                          {entry.status === "waitingApproval" && (
                            <Button 
                              size="sm" 
                              className="bg-green-500 text-black hover:bg-green-400 font-black uppercase tracking-widest text-[9px] px-4 rounded-xl shadow-lg shadow-green-500/20"
                              onClick={() => handleApprove(entry.id)}
                            >
                              <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Authorize
                            </Button>
                          )}
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="w-9 h-9 rounded-xl text-red-400/40 hover:text-red-400 hover:bg-red-400/10 transition-all"
                            onClick={() => handleRemove(entry.id, "No Show")}
                            title="Mark No-Show"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="w-9 h-9 rounded-xl text-white/20 hover:text-white hover:bg-white/5 transition-all"
                            onClick={() => handleRemove(entry.id, "Removed")}
                            title="Purge"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
