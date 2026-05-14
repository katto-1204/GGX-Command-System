import { useGetReports } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { BarChart3, Monitor, Clock, TrendingUp, Loader2, Shield, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
const TIER_COLORS: Record<string, string> = { standard: "#60a5fa", premium: "#c084fc", vip: "#fbbf24" };

export default function AdminReports() {
  const { data: report, isLoading } = useGetReports({ query: { refetchInterval: 30000 } as any });

  if (isLoading) {
    return (
      <AdminLayout breadcrumbs={[{ label: "Reports" }]}>
        <div className="flex justify-center py-40">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
            <Loader2 className="w-8 h-8 text-primary" />
          </motion.div>
        </div>
      </AdminLayout>
    );
  }

  const peakData = report?.peakHours?.filter((h: any) => h.count > 0) ?? [];
  const totalRevPHP = ((report?.totalRevenueCents ?? 0) / 100).toLocaleString('en-PH', { style: 'currency', currency: 'PHP' });

  return (
    <AdminLayout breadcrumbs={[{ label: "Reports" }]}>
      <div className="space-y-10">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">Analytical Telemetry</span>
            </div>
            <h1 className="text-4xl font-black font-display tracking-tight text-foreground">OPERATIONAL <span className="text-primary">INSIGHTS</span></h1>
          </div>
          <div className="px-4 py-2 rounded-xl bg-muted border border-border">
            <p className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest mb-0.5">Report Period</p>
            <p className="text-xs font-black text-foreground uppercase tracking-widest">Last 24 Hours</p>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Gross Revenue", value: totalRevPHP, icon: TrendingUp, color: "text-green-400", bg: "bg-green-400/10" },
            { label: "Active Sessions", value: report?.sessionCount ?? 0, icon: Monitor, color: "text-blue-400", bg: "bg-blue-400/10" },
            { label: "Uptime (Hours)", value: `${(report?.totalPcHours ?? 0).toFixed(1)}h`, icon: Clock, color: "text-purple-400", bg: "bg-purple-400/10" },
            { label: "Avg Session", value: `${Math.round(report?.avgSessionMinutes ?? 0)}m`, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-400/10" },
          ].map(kpi => (
            <Card key={kpi.label} className="bg-card border-border overflow-hidden group">
              <CardContent className="p-6 relative">
                <div className={cn("absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform", kpi.color)}>
                  <kpi.icon className="w-12 h-12" />
                </div>
                <div className="relative z-10">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", kpi.bg, kpi.color)}>
                    <kpi.icon className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-black font-mono text-foreground tracking-tighter">{kpi.value}</div>
                  <div className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] mt-1">{kpi.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Revenue Breakdown */}
          <Card className="bg-card border-border overflow-hidden">
            <CardHeader className="border-b border-border bg-muted/20 px-8 py-5">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" /> Tier Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              {(report?.revenueByTier ?? []).map((tier: any) => {
                const pct = report?.totalRevenueCents
                  ? Math.round((tier.revenueCents / report.totalRevenueCents) * 100)
                  : 0;
                return (
                  <div key={tier.tier} className="space-y-3">
                    <div className="flex justify-between text-xs items-end">
                      <div className="space-y-1">
                        <span className="capitalize font-black tracking-widest text-foreground">{tier.tier} Cluster</span>
                        <p className="text-[10px] text-muted-foreground/40 uppercase font-black">{tier.sessions} Deployments</p>
                      </div>
                      <span className="font-mono font-black text-primary">₱{(tier.revenueCents / 100).toFixed(0)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        className="h-full rounded-full bg-primary shadow-[0_0_10px_rgba(124,58,237,0.3)]" 
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* PC Utilization */}
          <Card className="bg-card border-border overflow-hidden">
            <CardHeader className="border-b border-border bg-muted/20 px-8 py-5">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" /> Hardware Engagement
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              {(report?.utilizationByTier ?? []).map((tier: any) => (
                <div key={tier.tier} className="space-y-3">
                  <div className="flex justify-between text-xs items-end">
                    <div className="space-y-1">
                      <span className="capitalize font-black tracking-widest text-foreground">{tier.tier} Utilization</span>
                      <p className="text-[10px] text-muted-foreground/40 uppercase font-black">{tier.inUse} of {tier.total} Active</p>
                    </div>
                    <span className="font-mono font-black text-foreground">{tier.pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${tier.pct}%` }}
                      className="h-full rounded-full bg-foreground/20" 
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Peak Hours Chart */}
        <Card className="bg-card border-border overflow-hidden">
          <CardHeader className="border-b border-border bg-muted/20 px-8 py-5">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Traffic Density Spectrum
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {peakData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <BarChart3 className="w-8 h-8 text-muted-foreground/20" />
                </div>
                <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">Awaiting Peak Telemetry</p>
              </div>
            ) : (
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report?.peakHours?.slice(6, 26) ?? []}>
                    <XAxis 
                      dataKey="hour" 
                      tickFormatter={(h: number) => `${h}h`} 
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 900 }} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <YAxis hide />
                    <Tooltip
                      cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }}
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-card border border-border p-3 rounded-xl shadow-2xl backdrop-blur-xl">
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{label}:00 – {label + 1}:00</p>
                              <p className="text-sm font-black text-primary uppercase">{payload[0].value} Sessions</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {(report?.peakHours?.slice(6, 26) ?? []).map((_: any, i: number) => (
                        <Cell key={i} fill="hsl(var(--primary))" fillOpacity={0.2 + (i / 20) * 0.8} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
