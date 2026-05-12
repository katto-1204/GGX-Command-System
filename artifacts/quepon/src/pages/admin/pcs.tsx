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
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold font-display">PC Management</h1>
            <p className="text-muted-foreground">Monitor and control hardware</p>
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px] bg-black/40 border-white/10">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="inUse">In Use</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredPcs.map(pc => (
              <Card key={pc.id} className="bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)] hover:border-white/10 transition-colors">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-5 h-5 text-muted-foreground" />
                      <span className="font-bold font-mono text-lg">{pc.label}</span>
                    </div>
                    <Badge className={getStatusColor(pc.status)} variant="outline">
                      {pc.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-6 h-20">
                    <div className="text-xs text-muted-foreground flex justify-between">
                      <span>Tier:</span> <span className="text-white capitalize">{pc.tier}</span>
                    </div>
                    {pc.status === "inUse" && pc.currentUsername ? (
                      <>
                        <div className="text-xs text-muted-foreground flex justify-between">
                          <span>User:</span> <span className="text-primary font-medium">{pc.currentUsername}</span>
                        </div>
                        <div className="text-xs text-muted-foreground flex justify-between">
                          <span>Timer:</span> <span className="text-red-400 font-mono font-bold">{Math.floor((pc.remainingSeconds||0)/60)}m left</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-xs text-muted-foreground/50 italic py-2">No active session</div>
                    )}
                  </div>

                  <div className="flex gap-2 border-t border-white/5 pt-4">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 border-green-500/20 hover:bg-green-500/10 hover:text-green-400"
                      onClick={() => handleStatusUpdate(pc.id, "available")}
                      disabled={pc.status === "available" || pc.status === "inUse"}
                    >
                      <CheckCircle className="w-3 h-3 mr-1.5" /> Ready
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 border-yellow-500/20 hover:bg-yellow-500/10 hover:text-yellow-400"
                      onClick={() => handleStatusUpdate(pc.id, "maintenance")}
                      disabled={pc.status === "maintenance" || pc.status === "inUse"}
                    >
                      <Wrench className="w-3 h-3 mr-1.5" /> Maint
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-10 px-0 border-white/10 hover:bg-white/10"
                      onClick={() => handleStatusUpdate(pc.id, "cleaning")}
                    >
                      <RefreshCw className="w-3 h-3" />
                    </Button>
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
