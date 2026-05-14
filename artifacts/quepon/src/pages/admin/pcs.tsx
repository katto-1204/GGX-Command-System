import { useState } from "react";
import { useListPcs, useUpdatePcStatus, getListPcsQueryKey } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Monitor, Wrench, RefreshCw, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { QRCodeSVG } from "qrcode.react";
export default function AdminPcs() {
  const { data: pcs, isLoading } = useListPcs({ query: { refetchInterval: 10000 } as any });
  const updatePcMutation = useUpdatePcStatus();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [filter, setFilter] = useState("all");

  const filteredPcs = pcs?.filter(pc => filter === "all" || pc.status === filter) || [];

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
             <Button variant="outline" className="h-14 px-8 rounded-2xl border-border bg-muted/30 hover:bg-muted transition-all font-black uppercase text-[10px] tracking-[0.3em] shadow-inner italic">
                Export Log
             </Button>
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
                  "bg-card border-2 transition-all duration-500 group relative overflow-hidden shadow-xl",
                  "rounded-[3rem_1rem_3rem_1.5rem]", // Abstract Shape
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

                  <CardContent className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <Badge className={cn(
                        "font-black uppercase tracking-widest text-[9px] py-1.5 px-4 rounded-full border-2 italic bg-background/50 backdrop-blur-sm", 
                        getStatusColor(pc.status)
                      )} variant="outline">
                        {pc.status}
                      </Badge>
                      <div className={cn(
                        "text-4xl font-black font-display tracking-tighter italic leading-none opacity-20",
                        pc.tier === "premium" ? "text-primary" : "text-muted-foreground"
                      )}>
                        {pc.label.replace(/[^0-9]/g, '')}
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center py-4 mb-6">
                      <div 
                        style={{ clipPath: "polygon(0% 12%, 12% 0%, 100% 0%, 100% 88%, 88% 100%, 0% 100%)" }}
                        className={cn(
                          "w-28 h-28 flex items-center justify-center transition-all duration-500 shadow-inner border border-white/5",
                          pc.status === "available" ? "bg-green-500/10" :
                          pc.status === "inUse" ? "bg-red-500/10" :
                          "bg-muted/50"
                        )}
                      >
                        <img src="/pc svg (2).png" alt="PC" className={cn("w-20 h-20 object-contain filter brightness-110", pc.status === "inUse" && "animate-pulse")} />
                      </div>
                      <div className="mt-4 text-center">
                        <span className={cn(
                          "text-[10px] uppercase tracking-[0.4em] font-black italic opacity-60",
                          pc.tier === "premium" ? "text-primary" : "text-muted-foreground"
                        )}>
                          {pc.tier} Tier
                        </span>
                      </div>
                    </div>

                    {/* Operational Telemetry Card */}
                    <div className="space-y-4 mb-8 bg-muted/40 rounded-[1.75rem] p-6 border border-border/50 shadow-inner group-hover:bg-muted/60 transition-colors">
                      {pc.status === "inUse" && pc.currentUsername ? (
                        <div className="space-y-4">
                          <div className="flex justify-between items-end">
                            <div className="space-y-1">
                               <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 italic">Active Operator</p>
                               <p className="text-base font-black text-foreground uppercase italic tracking-tighter">{pc.currentUsername}</p>
                            </div>
                            <div className="text-right space-y-1">
                               <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 italic">Deployment</p>
                               <p className="text-xs font-black font-mono text-primary italic">SESSION_LIVE</p>
                            </div>
                          </div>

                          {/* Session QR Code */}
                          {pc.currentSessionCode && (
                            <div className="flex items-center gap-4 p-4 bg-black/30 rounded-2xl border border-primary/20">
                              <div className="bg-white p-2 rounded-xl">
                                <QRCodeSVG value={pc.currentSessionCode} size={64} level="H" />
                              </div>
                              <div className="flex-1 space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 italic">Session Code</p>
                                <p className="text-sm font-black font-mono text-primary tracking-wider">{pc.currentSessionCode}</p>
                                <p className="text-[8px] text-muted-foreground/40 italic uppercase tracking-widest">Scan to verify check-in</p>
                              </div>
                            </div>
                          )}

                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-red-500 italic">
                               <span>TIME DEPLETION</span>
                               <span className="font-mono text-xs">{Math.floor((pc.remainingSeconds||0)/60)}:{(pc.remainingSeconds||0)%60 < 10 ? '0' : ''}{(pc.remainingSeconds||0)%60} REMAINING</span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-white/5 p-0.5">
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
                        <div className="h-[90px] flex flex-col items-center justify-center gap-3 opacity-40 group-hover:opacity-60 transition-opacity">
                          <div className="flex gap-2">
                             {[1,2,3].map(i => (
                               <div key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                             ))}
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground italic">Node in Standby</span>
                        </div>
                      )}
                    </div>

                    {/* Admin Tactical Controls */}
                    <div className="flex gap-3">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 rounded-2xl h-14 border-border bg-card hover:bg-green-500/10 hover:text-green-500 hover:border-green-500/30 font-black uppercase tracking-[0.2em] text-[10px] italic shadow-sm transition-all"
                        onClick={() => handleStatusUpdate(pc.id, "available")}
                        disabled={pc.status === "available" || pc.status === "inUse"}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" /> Release
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 rounded-2xl h-14 border-border bg-card hover:bg-yellow-500/10 hover:text-yellow-500 hover:border-yellow-500/30 font-black uppercase tracking-[0.2em] text-[10px] italic shadow-sm transition-all"
                        onClick={() => handleStatusUpdate(pc.id, "maintenance")}
                        disabled={pc.status === "maintenance" || pc.status === "inUse"}
                      >
                        <Wrench className="w-4 h-4 mr-2" /> Repair
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-14 h-14 rounded-2xl px-0 border-border bg-card hover:bg-primary/10 hover:text-primary transition-all group/btn shadow-sm"
                        onClick={() => handleStatusUpdate(pc.id, "cleaning")}
                      >
                        <RefreshCw className="w-5 h-5 group-hover/btn:rotate-180 transition-transform duration-500" />
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
