import { useListOrders, useUpdateOrderStatus, getListOrdersQueryKey } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coffee, Check, X, ChefHat, Play, Loader2, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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
    <AdminLayout breadcrumbs={[{ label: "Kitchen Ops" }]}>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary">
              <ChefHat className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Logistics & Catering</span>
            </div>
            <h1 className="text-4xl font-black font-display tracking-tight text-foreground uppercase">KITCHEN <span className="text-primary">OPS</span></h1>
            <p className="text-muted-foreground font-medium text-sm">Real-time management of personnel nourishment requests.</p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 flex flex-col items-center justify-center min-w-[120px]">
            <p className="text-[8px] font-black text-primary uppercase tracking-widest mb-0.5">Active Load</p>
            <p className="text-xl font-black font-mono text-foreground uppercase tracking-widest">{activeOrders.length}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
             <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
               <Loader2 className="w-10 h-10 text-primary opacity-20" />
             </motion.div>
             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Synchronizing Order Stream...</p>
          </div>
        ) : activeOrders.length === 0 ? (
          <Card className="bg-card border-border border-2 border-dashed rounded-[3rem] overflow-hidden">
            <CardContent className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted/30 border border-border/50 flex items-center justify-center mb-6 shadow-inner">
                <Coffee className="w-8 h-8 text-muted-foreground/40" />
              </div>
              <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">No Active Fulfillment Requests</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-10">
            <AnimatePresence>
              {activeOrders.map((order, i) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="bg-card border-border flex flex-col rounded-[2.5rem] overflow-hidden hover:border-primary/30 transition-all group shadow-sm relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none group-hover:bg-primary/10 transition-colors" />
                    <CardHeader className="p-6 border-b border-border bg-muted/20 relative z-10">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-[8px] font-black text-primary uppercase tracking-[0.3em] mb-1 flex items-center gap-2">
                            <Terminal className="w-3 h-3" />
                            REQ-ID: {order.id.slice(0,8).toUpperCase()}
                          </div>
                          <CardTitle className="text-xl font-black text-foreground uppercase tracking-tight">{order.username}</CardTitle>
                          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1 opacity-70">
                            {format(new Date(order.createdAt), 'HH:mm:ss')} • ST-404
                          </div>
                        </div>
                        <Badge variant="outline" className={cn(
                          "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em]",
                          order.status === "pending" ? "bg-yellow-400/10 border-yellow-400/20 text-yellow-500" :
                          order.status === "accepted" ? "bg-blue-400/10 border-blue-400/20 text-blue-500" :
                          "bg-primary/10 border-primary/20 text-primary"
                        )}>
                          {order.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-8 flex-1 flex flex-col relative z-10">
                      <div className="space-y-4 flex-1 mb-8">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center group/item">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-muted/50 rounded-xl border border-border/50 flex items-center justify-center text-[10px] font-black text-foreground">
                                {item.quantity}
                              </div>
                              <span className="text-sm font-black text-foreground/80 uppercase tracking-tight">{item.name}</span>
                            </div>
                            <div className="h-px flex-1 border-t border-border border-dashed mx-4 opacity-20" />
                            <span className="font-mono text-[10px] text-muted-foreground/40">OP-0{idx+1}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex justify-between items-center py-4 border-t border-border mb-8">
                        <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">Total Valuation</span>
                        <span className="font-mono text-primary font-black text-xl tracking-tighter">₱{order.totalAmount.toFixed(2)}</span>
                      </div>

                      <div className="flex gap-3">
                        {order.status === "pending" && (
                          <>
                            <Button className="flex-1 h-12 bg-blue-500 hover:bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-blue-500/20" onClick={() => handleUpdateStatus(order.id, "accepted")}>
                              <Check className="w-4 h-4 mr-2" /> Authorize
                            </Button>
                            <Button variant="ghost" className="w-12 h-12 border border-red-500/20 text-red-500 hover:bg-red-500/10 rounded-xl" onClick={() => handleUpdateStatus(order.id, "rejected")}>
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {order.status === "accepted" && (
                          <Button className="flex-1 h-12 bg-yellow-500 hover:bg-yellow-600 text-black font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-yellow-500/20" onClick={() => handleUpdateStatus(order.id, "preparing")}>
                            <ChefHat className="w-4 h-4 mr-2" /> Process
                          </Button>
                        )}
                        {order.status === "preparing" && (
                          <Button className="flex-1 h-12 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-[0_0_20px_rgba(124,58,237,0.3)]" onClick={() => handleUpdateStatus(order.id, "served")}>
                            <Zap className="w-4 h-4 mr-2" /> Dispatch
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
