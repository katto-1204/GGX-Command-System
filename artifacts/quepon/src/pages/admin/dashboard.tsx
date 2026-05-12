import { useGetDashboardStats, useGetPcSummary, useGetRecentActivity } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, Clock, Users, AlertCircle, ShoppingBag } from "lucide-react";

export default function AdminDashboard() {
  const { data: stats } = useGetDashboardStats({ query: { refetchInterval: 15000 } as any });
  const { data: pcSummary } = useGetPcSummary({ query: { refetchInterval: 15000 } as any });
  const { data: activity } = useGetRecentActivity({ query: { refetchInterval: 15000 } as any });

  const kpis = [
    { title: "Total PCs", value: stats?.totalPcs || 0, icon: Monitor, color: "text-blue-400" },
    { title: "Available", value: stats?.availablePcs || 0, icon: Monitor, color: "text-green-400" },
    { title: "In Use", value: stats?.inUsePcs || 0, icon: Monitor, color: "text-red-400" },
    { title: "Queue Count", value: stats?.queueCount || 0, icon: Clock, color: "text-purple-400" },
    { title: "Active Sessions", value: stats?.activeSessions || 0, icon: Users, color: "text-primary" },
    { title: "Pending Orders", value: stats?.pendingOrdersCount || 0, icon: ShoppingBag, color: "text-orange-400" },
    { title: "Open Feedback", value: stats?.openFeedbackCount || 0, icon: AlertCircle, color: "text-yellow-400" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-display">Command Center</h1>
          <p className="text-muted-foreground">Real-time shop overview</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <Card key={i} className="bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)]">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{kpi.title}</p>
                    <h3 className="text-3xl font-bold font-mono">{kpi.value}</h3>
                  </div>
                  <div className={`p-3 rounded-xl bg-[rgba(255,255,255,0.03)] ${kpi.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)]">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activity?.map((item) => (
                  <div key={item.id} className="flex items-start gap-4 border-b border-[rgba(255,255,255,0.05)] pb-4 last:border-0">
                    <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                    <div>
                      <p className="text-sm">{item.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(item.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {!activity?.length && (
                  <div className="text-center text-muted-foreground py-8">No recent activity</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
