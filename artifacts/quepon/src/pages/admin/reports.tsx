import { useGetReports } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { BarChart3, Monitor, Clock, TrendingUp, Loader2 } from "lucide-react";

const TIER_COLORS: Record<string, string> = { standard: "#60a5fa", premium: "#c084fc", vip: "#fbbf24" };

export default function AdminReports() {
  const { data: report, isLoading } = useGetReports({ query: { refetchInterval: 30000 } as any });

  if (isLoading) {
    return (
      <AdminLayout breadcrumbs={[{ label: "Reports" }]}>
        <div className="flex justify-center py-40"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </AdminLayout>
    );
  }

  const peakData = report?.peakHours?.filter((h: any) => h.count > 0) ?? [];
  const totalRevPHP = ((report?.totalRevenueCents ?? 0) / 100).toFixed(2);

  return (
    <AdminLayout breadcrumbs={[{ label: "Reports" }]}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-display flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" /> Reports
          </h1>
          <p className="text-muted-foreground">Revenue & utilization overview</p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: "Revenue", value: `₱${totalRevPHP}`, icon: TrendingUp, color: "text-green-400" },
            { label: "Sessions", value: report?.sessionCount ?? 0, icon: Monitor, color: "text-blue-400" },
            { label: "PC Hours", value: `${(report?.totalPcHours ?? 0).toFixed(1)}h`, icon: Clock, color: "text-purple-400" },
            { label: "Avg Session", value: `${Math.round(report?.avgSessionMinutes ?? 0)}m`, icon: Clock, color: "text-yellow-400" },
          ].map(kpi => (
            <Card key={kpi.label} className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]">
              <CardContent className="p-5">
                <kpi.icon className={`w-5 h-5 ${kpi.color} mb-3`} />
                <div className="text-2xl font-bold font-mono">{kpi.value}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-widest mt-1">{kpi.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid xl:grid-cols-2 gap-6">
          {/* Revenue Breakdown */}
          <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]">
            <CardHeader>
              <CardTitle className="text-base font-medium">Revenue Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(report?.revenueByTier ?? []).map((tier: any) => {
                const pct = report?.totalRevenueCents
                  ? Math.round((tier.revenueCents / report.totalRevenueCents) * 100)
                  : 0;
                return (
                  <div key={tier.tier} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize font-medium" style={{ color: TIER_COLORS[tier.tier] }}>{tier.tier} PCs ({tier.sessions} sessions)</span>
                      <span className="font-mono font-bold">₱{(tier.revenueCents / 100).toFixed(0)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: TIER_COLORS[tier.tier] }} />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* PC Utilization */}
          <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]">
            <CardHeader>
              <CardTitle className="text-base font-medium">PC Utilization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(report?.utilizationByTier ?? []).map((tier: any) => (
                <div key={tier.tier} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize font-medium" style={{ color: TIER_COLORS[tier.tier] }}>{tier.tier} PCs</span>
                    <span className="font-mono text-muted-foreground">{tier.inUse}/{tier.total} — <span className="text-white font-bold">{tier.pct}%</span></span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${tier.pct}%`, backgroundColor: TIER_COLORS[tier.tier] }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Peak Hours Chart */}
        <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]">
          <CardHeader>
            <CardTitle className="text-base font-medium">Peak Hours Today</CardTitle>
          </CardHeader>
          <CardContent>
            {peakData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <BarChart3 className="w-12 h-12 opacity-20 mb-3" />
                <p className="text-sm">No session data yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={report?.peakHours?.slice(6, 26) ?? []}>
                  <XAxis dataKey="hour" tickFormatter={(h: number) => `${h}h`} tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip
                    formatter={(val: number) => [`${val} sessions`, "Count"]}
                    labelFormatter={(h: number) => `${h}:00 – ${h + 1}:00`}
                    contentStyle={{ background: "#0a0a0f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {(report?.peakHours?.slice(6, 26) ?? []).map((_: any, i: number) => (
                      <Cell key={i} fill={`rgba(124,58,237,${0.3 + i * 0.04})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
