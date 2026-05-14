import { useState } from "react";
import { useListPcs, useUpdatePcStatus, useCreatePc, useDeletePc, getListPcsQueryKey } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Monitor, Wrench, RefreshCw, Loader2, CheckCircle, Plus, Trash2, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
export default function AdminPcs() {
  const { data: pcs, isLoading } = useListPcs({ query: { refetchInterval: 10000 } as any });
  const updatePcMutation = useUpdatePcStatus();
  const createMutation = useCreatePc();
  const deleteMutation = useDeletePc();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [filter, setFilter] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newPc, setNewPc] = useState({ number: 1, label: "", tier: "standard" as "standard"|"vip" });

  const filteredPcs = pcs?.filter(pc => filter === "all" || pc.status === filter) || [];

  const handleAddPc = () => {
    createMutation.mutate({ data: { ...newPc, status: "available", location: "Main Area" } }, {
      onSuccess: () => {
        toast({ title: "PC Added Successfully" });
        setIsAddOpen(false);
        setNewPc(prev => ({ ...prev, number: prev.number + 1, label: `PC ${String(prev.number + 1).padStart(2, '0')}` }));
        queryClient.invalidateQueries({ queryKey: getListPcsQueryKey() });
      },
      onError: (err: any) => {
        toast({ title: "Failed to add PC", description: err.message, variant: "destructive" });
      }
    });
  };

  const handleDeletePc = (pcId: string) => {
    if (!confirm("Are you sure you want to delete this PC?")) return;
    deleteMutation.mutate({ pcId }, {
      onSuccess: () => {
        toast({ title: "PC Deleted" });
        queryClient.invalidateQueries({ queryKey: getListPcsQueryKey() });
      }
    });
  };

  const handleStatusUpdate = (pcId: string, status: any) => {
    updatePcMutation.mutate({
      pcId,
      data: { status, maintenanceNote: status === "maintenance" ? "Admin marked" : null }
    }, {
      onSuccess: () => {
        toast({ title: "PC Status Updated" });
        queryClient.invalidateQueries({ queryKey: getListPcsQueryKey() });
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "available": return "bg-green-500/20 text-green-500 border-green-500/30";
      case "inUse": return "bg-red-500/20 text-red-500 border-red-500/30";
      case "maintenance": return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
      case "reserved": return "bg-purple-500/20 text-purple-500 border-purple-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <AdminLayout breadcrumbs={[{ label: "FLEET MANAGEMENT" }]}>
      <div className="space-y-10">
        {/* Fleet Command Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4 border-b border-border/50">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/60 italic">Hardware Grid</span>
            </div>
            <h1 className="text-5xl font-black font-display tracking-tight text-foreground italic uppercase leading-none">
              STATIONS
            </h1>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 italic">
              Manage shop terminals
            </p>
          </div>
             <div className="flex items-center gap-4">
              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90 h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(124,58,237,0.3)] italic">
                    <Plus className="w-4 h-4 mr-2" /> Add Station
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border backdrop-blur-2xl max-w-md rounded-[2rem]">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-black uppercase tracking-tight italic">New Station</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 pt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">PC Number</label>
                        <Input type="number" value={newPc.number} onChange={e => setNewPc(p => ({...p, number: parseInt(e.target.value)||1}))} className="bg-muted border-border h-12 rounded-xl px-4 font-mono font-bold" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Label</label>
                        <Input value={newPc.label} onChange={e => setNewPc(p => ({...p, label: e.target.value}))} className="bg-muted border-border h-12 rounded-xl px-4 font-mono font-bold" placeholder="e.g. PC 01" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Tier</label>
                      <Select value={newPc.tier} onValueChange={(v: any) => setNewPc(p => ({...p, tier: v}))}>
                        <SelectTrigger className="bg-muted border-border h-12 rounded-xl"><SelectValue/></SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="standard" className="font-black uppercase text-[10px] tracking-widest">Regular</SelectItem>
                          <SelectItem value="vip" className="font-black uppercase text-[10px] tracking-widest">VIP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full h-14 bg-primary hover:bg-primary/90 font-black uppercase tracking-[0.2em] text-xs rounded-xl mt-4 italic shadow-[0_0_20px_rgba(124,58,237,0.3)]" onClick={handleAddPc} disabled={createMutation.isPending}>
                      {createMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Monitor className="w-4 h-4 mr-2" />} Deploy Station
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-muted/50 border border-border/50 backdrop-blur-xl">
                 <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest italic">Filter:</span>
                 <Select value={filter} onValueChange={setFilter}>
                   <SelectTrigger className="w-[160px] h-8 bg-transparent border-none text-[11px] font-black uppercase tracking-widest text-foreground focus:ring-0">
                     <SelectValue placeholder="All Nodes" />
                   </SelectTrigger>
                   <SelectContent className="bg-card border-border rounded-xl">
                     <SelectItem value="all" className="text-[10px] font-black uppercase tracking-widest py-3">All Nodes</SelectItem>
                     <SelectItem value="available" className="text-[10px] font-black uppercase tracking-widest py-3 text-green-500">Available</SelectItem>
                     <SelectItem value="inUse" className="text-[10px] font-black uppercase tracking-widest py-3 text-red-500">In Use</SelectItem>
                     <SelectItem value="maintenance" className="text-[10px] font-black uppercase tracking-widest py-3 text-yellow-500">Maintenance</SelectItem>
                   </SelectContent>
                 </Select>
              </div>
           </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6">
            <div className="relative">
              <Loader2 className="w-16 h-16 animate-spin text-primary opacity-20" />
              <Loader2 className="w-16 h-16 animate-spin text-primary absolute inset-0 blur-md" />
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.5em] animate-pulse italic">Synchronizing Nodes...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-10">
            {filteredPcs.map(pc => (
              <motion.div
                key={pc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card className={cn(
                  "bg-card border-2 transition-all duration-500 group relative overflow-hidden shadow-xl flex flex-col h-full min-h-[460px]",
                  "rounded-[2rem_1rem_2rem_1rem]", // Abstract Shape
                  pc.status === "available" ? "border-green-500/10 hover:border-green-500/40 hover:shadow-green-500/10" :
                  pc.status === "inUse" ? "border-red-500/10 hover:border-red-500/40 hover:shadow-red-500/10" :
                  "border-border hover:border-primary/40 hover:shadow-primary/10"
                )}>
                  {/* Status Indicator Bar */}
                  <div className={cn(
                    "absolute top-0 left-0 w-full h-1.5 transition-all duration-500",
                    pc.status === "available" ? "bg-green-500/40" :
                    pc.status === "inUse" ? "bg-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.5)]" :
                    "bg-border"
                  )} />

                  <CardContent className="p-6 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-4 gap-2">
                      <div className="min-w-0 flex-1">
                        <Badge className={cn(
                          "font-black uppercase tracking-widest text-[9px] py-1 px-3 rounded-full border-2 italic bg-background/50 backdrop-blur-sm truncate max-w-full block text-center", 
                          getStatusColor(pc.status)
                        )} variant="outline">
                          {pc.status}
                        </Badge>
                      </div>
                      <div className={cn(
                        "text-3xl font-black font-display tracking-tighter italic leading-none opacity-20 shrink-0",
                        pc.tier === "vip" ? "text-yellow-500" : "text-muted-foreground"
                      )}>
                        {pc.label.replace(/[^0-9]/g, '')}
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center py-2 mb-4 shrink-0">
                      <div 
                        style={{ clipPath: "polygon(0% 12%, 12% 0%, 100% 0%, 100% 88%, 88% 100%, 0% 100%)" }}
                        className={cn(
                          "w-24 h-24 flex items-center justify-center transition-all duration-500 shadow-inner border border-white/5",
                          pc.status === "available" ? "bg-green-500/10" :
                          pc.status === "inUse" ? "bg-red-500/10" :
                          "bg-muted/50"
                        )}
                      >
                        <img src="/pc svg (2).png" alt="PC" className={cn("w-16 h-16 object-contain filter brightness-110", pc.status === "inUse" && "animate-pulse")} />
                      </div>
                      <div className="mt-3 text-center w-full px-2">
                        <span className={cn(
                          "text-[10px] uppercase tracking-[0.4em] font-black italic opacity-60 truncate block",
                          pc.tier === "vip" ? "text-yellow-500" : "text-muted-foreground"
                        )}>
                          {pc.tier === "vip" ? "VIP" : "Regular"} Tier
                        </span>
                      </div>
                    </div>

                    {/* Operational Telemetry Card */}
                    <div className="flex-1 flex flex-col justify-end w-full min-h-[160px] bg-muted/40 rounded-[1.5rem] p-4 border border-border/50 shadow-inner group-hover:bg-muted/60 transition-colors mb-4 overflow-hidden">
                      {pc.status === "inUse" && pc.currentUsername ? (
                        <div className="space-y-3 flex flex-col h-full justify-between">
                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-start gap-2">
                              <div className="space-y-1 min-w-0 flex-1">
                                 <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 italic truncate">Active Operator</p>
                                 <p className="text-sm font-black text-foreground uppercase italic tracking-tighter truncate w-full">{pc.currentUsername}</p>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground/40 hover:text-red-500 hover:bg-red-500/10 shrink-0"
                                  onClick={(e) => { e.stopPropagation(); handleDeletePc(pc.id); }}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                                <div className="text-2xl font-black font-display text-foreground italic leading-none shrink-0">{String(pc.number).padStart(2, '0')}</div>
                              </div>
                            </div>
                          </div>

                          {/* Session QR Code */}
                          {pc.currentSessionCode && (
                            <div className="flex items-center gap-3 p-2.5 bg-black/30 rounded-xl border border-primary/20 overflow-hidden w-full">
                              <div className="bg-white p-1.5 rounded-lg shrink-0">
                                <QrCode className="w-6 h-6 text-black" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 italic truncate">Session Code</p>
                                <p className="text-xs font-black font-mono text-primary tracking-wider truncate">{pc.currentSessionCode}</p>
                              </div>
                            </div>
                          )}

                          <div className="space-y-1.5 mt-auto">
                            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-red-500 italic gap-2">
                               <span className="truncate">TIME DEPLETION</span>
                               <span className="font-mono text-[10px] shrink-0">{Math.floor((pc.remainingSeconds||0)/60)}:{(pc.remainingSeconds||0)%60 < 10 ? '0' : ''}{(pc.remainingSeconds||0)%60} REMAINING</span>
                            </div>
                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden border border-white/5">
                              <motion.div 
                                className="h-full bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.4)]" 
                                initial={{ width: "100%" }}
                                animate={{ width: "65%" }}
                                transition={{ duration: 1 }}
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center gap-3 opacity-40 group-hover:opacity-60 transition-opacity">
                          <div className="flex gap-2">
                             {[1,2,3].map(i => (
                               <div key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                             ))}
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground italic text-center w-full truncate px-2">Node in Standby</span>
                        </div>
                      )}
                    </div>

                    {/* Admin Tactical Controls */}
                    <div className="flex gap-2 mt-auto shrink-0 w-full">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 rounded-xl h-10 px-1 border-border bg-card hover:bg-green-500/10 hover:text-green-500 hover:border-green-500/30 font-black uppercase tracking-widest text-[8px] italic shadow-sm transition-all overflow-hidden"
                        onClick={() => handleStatusUpdate(pc.id, "available")}
                        disabled={pc.status === "available" || pc.status === "inUse"}
                      >
                        <CheckCircle className="w-3 h-3 mr-1 shrink-0" /> <span className="truncate">Release</span>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 rounded-xl h-10 px-1 border-border bg-card hover:bg-yellow-500/10 hover:text-yellow-500 hover:border-yellow-500/30 font-black uppercase tracking-widest text-[8px] italic shadow-sm transition-all overflow-hidden"
                        onClick={() => handleStatusUpdate(pc.id, "maintenance")}
                        disabled={pc.status === "maintenance" || pc.status === "inUse"}
                      >
                        <Wrench className="w-3 h-3 mr-1 shrink-0" /> <span className="truncate">Repair</span>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-10 h-10 rounded-xl px-0 shrink-0 border-border bg-card hover:bg-primary/10 hover:text-primary transition-all group/btn shadow-sm"
                        onClick={() => handleStatusUpdate(pc.id, "cleaning")}
                      >
                        <RefreshCw className="w-4 h-4 group-hover/btn:rotate-180 transition-transform duration-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>

  );
}
