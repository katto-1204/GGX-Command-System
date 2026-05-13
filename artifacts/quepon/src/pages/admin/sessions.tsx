import { useState } from "react";
import { useListSessions, useExtendSession, useEndSession, getListSessionsQueryKey } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Search, XSquare, Plus, Lock, Activity, Clock, Terminal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function AdminSessions() {
  const [search, setSearch] = useState("");
  const { data: sessions, isLoading } = useListSessions(undefined, { query: { refetchInterval: 10000 } as any });
  
  const extendMutation = useExtendSession();
  const endMutation = useEndSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleExtend = (id: string) => {
    extendMutation.mutate({ sessionId: id, data: { additionalMinutes: 60 } }, {
      onSuccess: () => {
        toast({ title: "TIME INJECTED", description: "Session extended by 60 minutes." });
        queryClient.invalidateQueries({ queryKey: getListSessionsQueryKey() });
      }
    });
  };

  const handleEnd = (id: string) => {
    endMutation.mutate({ sessionId: id }, {
      onSuccess: () => {
        toast({ title: "SESSION TERMINATED", description: "Connection severed and billing finalized." });
        queryClient.invalidateQueries({ queryKey: getListSessionsQueryKey() });
      }
    });
  };

  const activeSessions = sessions?.filter(s => ["active", "extended", "locked"].includes(s.status)) || [];
  
  const filteredSessions = activeSessions.filter(s => 
    s.username.toLowerCase().includes(search.toLowerCase()) || 
    (s.pcLabel && s.pcLabel.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AdminLayout breadcrumbs={[{ label: "Live Sessions" }]}>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary">
              <Activity className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Network Telemetry</span>
            </div>
            <h1 className="text-4xl font-black font-display tracking-tight text-foreground">LIVE <span className="text-primary">SESSIONS</span></h1>
            <p className="text-muted-foreground font-medium text-sm">Monitor and manage operational connections.</p>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 flex flex-col">
                <span className="text-[8px] font-black text-primary uppercase tracking-widest">Active Connections</span>
                <span className="text-xl font-black font-mono text-foreground">{activeSessions.length}</span>
             </div>
             <div className="relative w-64 group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
               <Input 
                 placeholder="SCAN SUBJECT OR NODE..." 
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="h-12 pl-12 bg-card border-border rounded-2xl focus:border-primary/50 transition-all uppercase text-[10px] tracking-widest font-black"
               />
             </div>
          </div>
        </div>

        {/* Sessions Grid */}
        <Card className="bg-card border-border rounded-[2.5rem] overflow-hidden">
          <div className="border-b border-border bg-muted/20 px-8 py-6 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <Terminal className="w-4 h-4 text-muted-foreground/40" />
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Active Links</span>
             </div>
          </div>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-border hover:bg-transparent h-14">
                  <TableHead className="w-[100px] text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">Node</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Subject</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Remaining</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ledger</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</TableHead>
                  <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground pr-8">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-40 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-primary opacity-20" />
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Tracing Connections...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredSessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-40 text-center">
                       <div className="flex flex-col items-center gap-4 opacity-20">
                         <Activity className="w-8 h-8" />
                         <span className="text-[10px] font-black uppercase tracking-[0.2em]">Zero Active Connections</span>
                       </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSessions.map((session) => (
                    <TableRow key={session.id} className="border-border hover:bg-muted/50 transition-colors group">
                      <TableCell className="text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 font-mono font-black text-lg text-primary group-hover:bg-primary/20 transition-all shadow-inner">
                          {session.pcLabel}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <div className="font-black text-foreground uppercase tracking-tight text-sm">{session.username}</div>
                          <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">ID: {session.id.split("-")[0]}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                         <div className="flex items-center gap-2">
                           <Clock className="w-3 h-3 text-yellow-500/40" />
                           <span className={cn(
                             "font-mono font-black text-sm", 
                             session.remainingSeconds && session.remainingSeconds < 300 ? "text-red-500 animate-pulse" : "text-yellow-500"
                           )}>
                             {session.remainingSeconds ? Math.floor(session.remainingSeconds / 60) : 0}M
                           </span>
                         </div>
                      </TableCell>
                      <TableCell>
                         <span className="font-mono font-black text-green-500">₱{session.costSoFar?.toFixed(2)}</span>
                      </TableCell>
                      <TableCell>
                        <div className={cn(
                          "inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                          session.status === "locked" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                          "bg-green-500/10 text-green-500 border-green-500/20"
                        )}>
                          {session.status}
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            className="bg-card hover:bg-primary text-foreground hover:text-primary-foreground border border-border font-black uppercase tracking-widest text-[9px] px-3 rounded-xl transition-all h-9"
                            onClick={() => handleExtend(session.id)}
                            title="Inject Time (1H)"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1.5" /> Inject
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 font-black uppercase tracking-widest text-[9px] px-3 rounded-xl transition-all h-9"
                            onClick={() => handleEnd(session.id)}
                          >
                            <XSquare className="w-3.5 h-3.5 mr-1.5" /> Terminate
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

