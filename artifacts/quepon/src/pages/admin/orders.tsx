import { useListOrders, useUpdateOrderStatus, getListOrdersQueryKey } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coffee, Check, X, ChefHat, Play, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

export default function AdminOrders() {
  const { data: orders, isLoading } = useListOrders({ query: { refetchInterval: 10000 } as any });
  const updateOrderMutation = useUpdateOrderStatus();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleUpdateStatus = (id: string, status: any) => {
    updateOrderMutation.mutate({ orderId: id, data: { status } }, {
      onSuccess: () => {
        toast({ title: `Order marked as ${status}` });
        queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
      }
    });
  };

  const activeOrders = orders?.filter(o => ["pending", "accepted", "preparing"].includes(o.status)) || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold font-display">Kitchen & Orders</h1>
            <p className="text-muted-foreground">Manage incoming F&B requests</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : activeOrders.length === 0 ? (
          <Card className="bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)] border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-24 text-muted-foreground">
              <Coffee className="w-12 h-12 mb-4 opacity-20" />
              <p>No active orders.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeOrders.map(order => (
              <Card key={order.id} className="bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)] flex flex-col">
                <CardHeader className="p-4 border-b border-white/5 pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base font-bold">Order #{order.id.slice(0,6)}</CardTitle>
                      <div className="text-xs text-muted-foreground mt-1">
                        {order.username} • {format(new Date(order.createdAt), 'h:mm a')}
                      </div>
                    </div>
                    <Badge variant="outline" className={
                      order.status === "pending" ? "border-yellow-500/50 text-yellow-500" :
                      order.status === "accepted" ? "border-blue-500/50 text-blue-500" :
                      "border-primary/50 text-primary"
                    }>
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 flex-1 flex flex-col">
                  <div className="space-y-2 flex-1 mb-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span><span className="font-bold text-muted-foreground mr-2">{item.quantity}x</span> {item.name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-white/5 mb-4 text-sm font-bold">
                    <span>Total</span>
                    <span className="font-mono text-green-400">₱{order.totalAmount.toFixed(2)}</span>
                  </div>

                  <div className="flex gap-2">
                    {order.status === "pending" && (
                      <>
                        <Button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white" onClick={() => handleUpdateStatus(order.id, "accepted")}>
                          <Check className="w-4 h-4 mr-2" /> Accept
                        </Button>
                        <Button variant="outline" className="px-3 border-red-500/20 text-red-500 hover:bg-red-500/10" onClick={() => handleUpdateStatus(order.id, "rejected")}>
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    {order.status === "accepted" && (
                      <Button className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold" onClick={() => handleUpdateStatus(order.id, "preparing")}>
                        <ChefHat className="w-4 h-4 mr-2" /> Prep
                      </Button>
                    )}
                    {order.status === "preparing" && (
                      <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={() => handleUpdateStatus(order.id, "served")}>
                        <Play className="w-4 h-4 mr-2" /> Serve
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
