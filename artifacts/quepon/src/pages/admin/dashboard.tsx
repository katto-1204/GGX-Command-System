import { useGetDashboardStats, useGetPcSummary, useGetRecentActivity } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Monitor, Clock, Users, AlertCircle, ShoppingBag, Zap, Activity, Shield, Trophy, TrendingUp, History } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const { data: stats } = useGetDashboardStats({ query: { refetchInterval: 15000 } as any });
  const { data: activity } = useGetRecentActivity({ query: { refetchInterval: 15000 } as any });

  const kpis = [
    { title: "Stations", value: stats?.totalPcs || 0, subValue: `${stats?.availablePcs || 0} Available`, icon: Monitor, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
    { title: "Queue", value: stats?.queueCount || 0, subValue: "Waiting", icon: Clock, color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20" },
    { title: "Active Sessions", value: stats?.activeSessions || 0, subValue: "Current Players", icon: Users, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
    { title: "Orders", value: stats?.pendingOrdersCount || 0, subValue: "Pending", icon: ShoppingBag, color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20" },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <AdminLayout>
      <div className="space-y-10">
        {/* Tactical Command Header */}
        <div className="relative overflow-hidden rounded-[3.5rem] bg-card border border-border p-12 shadow-3xl">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 blur-[140px] -mr-80 -mt-80 animate-pulse pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-black font-display tracking-tight text-foreground leading-none italic uppercase">
                HUB
              </h1>
              <p className="text-muted-foreground font-black uppercase tracking-[0.2em] text-[10px] max-w-md opacity-60 leading-relaxed">
                Management Panel
              </p>
            </div>
            <div className="flex gap-5">
               <div className="px-8 py-5 rounded-[1.5rem] bg-muted/50 border border-border/50 backdrop-blur-xl shadow-inner group hover:bg-muted transition-colors">
                  <div className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] mb-2 italic">Uptime</div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-lg font-black text-foreground font-mono tracking-tighter italic">99.9%</span>
                  </div>
               </div>
               <div className="px-8 py-5 rounded-[1.5rem] bg-muted/50 border border-border/50 backdrop-blur-xl shadow-inner group hover:bg-muted transition-colors">
                  <div className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] mb-2 italic">Latency</div>
                  <div className="text-lg font-black text-foreground font-mono tracking-tighter italic text-primary">05MS</div>
               </div>
            </div>
          </div>
        </div>

        {/* Tactical KPI Grid */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {kpis.map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <motion.div key={i} variants={item}>
                <Card className={cn(
                  "bg-card border-2 transition-all hover:scale-[1.03] cursor-pointer group rounded-[2.5rem] overflow-hidden shadow-xl", 
                  kpi.border,
                  "hover:shadow-3xl transition-shadow"
                )}>
                  <CardContent className="p-10 relative overflow-hidden h-full flex flex-col">
                    <div className={cn("absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-125 transition-all duration-500", kpi.color)}>
                      <Icon className="w-24 h-24" />
                    </div>
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-center justify-between mb-10">
                         <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner border border-white/5", kpi.bg, kpi.color)}>
                           <Icon className="w-7 h-7" />
                         </div>
                         <div className="px-2 py-1 rounded-lg bg-green-500/10 text-green-500 flex items-center gap-1.5 border border-green-500/20">
                            <TrendingUp className="w-3 h-3" />
                            <span className="text-[9px] font-black font-mono">+12%</span>
                         </div>
                      </div>
                      <div className="space-y-2 mt-auto">
                        <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.4em] italic">{kpi.title}</p>
                        <h3 className="text-5xl font-black font-mono text-foreground tracking-tighter italic leading-none">{kpi.value}</h3>
                        <div className="flex items-center gap-2 mt-2">
                           <div className={cn("w-1.5 h-1.5 rounded-full bg-current opacity-40", kpi.color)} />
                           <p className={cn("text-[9px] font-black uppercase tracking-[0.2em] opacity-80", kpi.color)}>{kpi.subValue}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
        
        {/* Secondary Operational Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
          {/* Recent Activity Log */}
          <Card className="lg:col-span-2 bg-card border-border rounded-[3rem] overflow-hidden shadow-2xl">
            <CardHeader className="border-b border-border bg-muted/30 px-10 py-8">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[11px] font-black uppercase tracking-[0.5em] text-foreground flex items-center gap-4 italic">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Recent Activity
                </CardTitle>
                <div className="flex items-center gap-3">
                   <div className="px-3 py-1 rounded-full bg-muted border border-border text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                     Channel: #GENERAL
                   </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {activity?.slice(0, 7).map((item) => (
                  <div key={item.id} className="flex items-center gap-8 px-10 py-6 hover:bg-muted/40 transition-colors group relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform" />
                    <div className="w-12 h-12 rounded-[1.25rem] bg-muted/50 flex items-center justify-center shrink-0 border border-border group-hover:border-primary/30 group-hover:bg-primary/5 transition-all shadow-inner">
                      <History className="w-5 h-5 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-foreground/90 font-black uppercase tracking-[0.05em] line-clamp-1 italic">{item.message}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.3em]">
                          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </p>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span className="text-[9px] font-black text-primary/60 uppercase tracking-[0.3em]">Event ID: {item.id.slice(0, 8)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="w-2 h-2 rounded-full bg-green-500/40" />
                       <Button variant="ghost" size="sm" className="h-10 px-6 rounded-xl border border-border text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary hover:border-primary/20 hover:bg-primary/5">
                          Trace
                       </Button>
                    </div>
                  </div>
                ))}
                {!activity?.length && (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-20 h-20 rounded-[2rem] bg-muted/50 border border-border flex items-center justify-center mb-6 shadow-inner">
                      <Shield className="w-10 h-10 text-muted-foreground/10" />
                    </div>
                    <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.4em] italic">No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* System Analytics Sidecar */}
          <div className="space-y-8">
            <Card className="bg-primary text-primary-foreground p-10 rounded-[3rem] relative overflow-hidden group shadow-2xl shadow-primary/20">
               <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
               <div className="relative z-10 space-y-8">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-2xl font-black uppercase tracking-tighter italic leading-none">PEAK USAGE</h4>
                    <p className="text-[11px] text-white/70 font-black uppercase tracking-[0.1em] leading-relaxed">Usage is currently 85% above the 7-day average.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                       <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 italic">Usage</span>
                       <span className="text-xl font-black font-mono italic">85%</span>
                    </div>
                    <div className="h-3 w-full bg-white/20 rounded-full overflow-hidden border border-white/10 p-0.5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "85%" }}
                        className="h-full bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.8)]" 
                      />
                    </div>
                  </div>
                  <Button className="w-full h-14 bg-white text-primary hover:bg-white/90 rounded-2xl font-black uppercase text-[10px] tracking-[0.4em] shadow-xl">
                    View More
                  </Button>
               </div>
            </Card>

            <Card className="bg-card border-border p-10 rounded-[3rem] shadow-xl">
               <div className="flex items-center justify-between mb-10">
                  <h4 className="text-[11px] font-black text-foreground uppercase tracking-[0.4em] italic">Health</h4>
                  <Shield className="w-5 h-5 text-muted-foreground/30" />
               </div>
               <div className="space-y-6">
                  {[
                    { label: "Network", value: 92, status: "stable" },
                    { label: "Hardware", value: 78, status: "active" },
                    { label: "Storage", value: 45, status: "optimizing" }
                  ].map((sys, i) => (
                    <div key={i} className="space-y-3">
                       <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-muted-foreground/80 italic">
                          <span>{sys.label}</span>
                          <span className={cn(i === 0 ? "text-green-500" : "text-primary")}>{sys.value}%</span>
                       </div>
                       <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${sys.value}%` }}
                            className={cn("h-full rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)]", i === 0 ? "bg-green-500" : "bg-primary")} 
                          />
                       </div>
                    </div>
                  ))}
               </div>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>

  );
}
