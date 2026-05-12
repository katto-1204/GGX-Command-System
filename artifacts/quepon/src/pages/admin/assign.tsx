import { useState } from "react";
import { useListQueueEntries, useListPcs, useAssignQueueEntryToPc, getListQueueEntriesQueryKey, getListPcsQueryKey } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Monitor, User, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function AdminAssign() {
  const { data: queue } = useListQueueEntries({ query: { refetchInterval: 10000 } as any });
  const { data: pcs } = useListPcs({ query: { refetchInterval: 10000 } as any });
  const assignMutation = useAssignQueueEntryToPc();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedQueueId, setSelectedQueueId] = useState<string | null>(null);
  const [selectedPcId, setSelectedPcId] = useState<string | null>(null);
  const [duration, setDuration] = useState("60");

  const approvedEntries = queue?.filter(q => q.status === "approved" || q.status === "waiting") || [];
  const availablePcs = pcs?.filter(pc => pc.status === "available") || [];

  const handleAssign = () => {
    if (!selectedQueueId || !selectedPcId) return;

    assignMutation.mutate({
      queueId: selectedQueueId,
      data: { pcId: selectedPcId, durationMinutes: parseInt(duration) }
    }, {
      onSuccess: () => {
        toast({ title: "PC Assigned Successfully" });
        setSelectedQueueId(null);
        setSelectedPcId(null);
        queryClient.invalidateQueries({ queryKey: getListQueueEntriesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListPcsQueryKey() });
      },
      onError: (err: any) => {
        toast({ title: "Failed to assign", description: err.message, variant: "destructive" });
      }
    });
  };

  const selectedEntry = approvedEntries.find(q => q.id === selectedQueueId);
  const selectedPc = availablePcs.find(pc => pc.id === selectedPcId);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-display">Assign PC</h1>
          <p className="text-muted-foreground">Match waiting players to available stations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side: Queue */}
          <Card className="bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)]">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Waiting Players</span>
                <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">{approvedEntries.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {approvedEntries.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">No approved players waiting.</div>
                ) : (
                  approvedEntries.map(entry => (
                    <div 
                      key={entry.id}
                      onClick={() => setSelectedQueueId(entry.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedQueueId === entry.id 
                          ? "bg-primary/20 border-primary shadow-[0_0_15px_rgba(124,58,237,0.2)]" 
                          : "bg-black/20 border-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                            {entry.position}
                          </div>
                          <div>
                            <div className="font-bold">{entry.displayName || entry.username}</div>
                            <div className="text-xs text-muted-foreground capitalize">Prefers: {entry.requestedTier || "Any"}</div>
                          </div>
                        </div>
                        <Badge variant="outline" className="border-green-500/50 text-green-500">{entry.status}</Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Right Side: Available PCs */}
          <Card className="bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)]">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Available PCs</span>
                <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/30">{availablePcs.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {availablePcs.length === 0 ? (
                  <div className="col-span-2 text-center py-12 text-muted-foreground">No PCs currently available.</div>
                ) : (
                  availablePcs.map(pc => (
                    <div 
                      key={pc.id}
                      onClick={() => setSelectedPcId(pc.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col items-center justify-center text-center ${
                        selectedPcId === pc.id 
                          ? "bg-green-500/20 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)]" 
                          : "bg-black/20 border-white/5 hover:border-white/20"
                      }`}
                    >
                      <Monitor className={`w-8 h-8 mb-2 ${selectedPcId === pc.id ? "text-green-400" : "text-muted-foreground"}`} />
                      <div className="font-bold font-mono">{pc.label}</div>
                      <div className="text-xs text-muted-foreground capitalize mt-1">{pc.tier}</div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Bar */}
        {selectedQueueId && selectedPcId && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 ml-32 w-full max-w-2xl z-50">
            <Card className="bg-[#07070D]/90 backdrop-blur-md border border-primary/50 shadow-[0_0_30px_rgba(124,58,237,0.3)]">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Player</div>
                    <div className="font-bold">{selectedEntry?.username}</div>
                  </div>
                  <ArrowRight className="text-primary w-5 h-5" />
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">PC</div>
                    <div className="font-bold font-mono text-green-400">{selectedPc?.label}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Duration:</span>
                    <Select value={duration} onValueChange={setDuration}>
                      <SelectTrigger className="w-[100px] h-9 bg-black/40 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 mins</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="180">3 hours</SelectItem>
                        <SelectItem value="300">5 hours</SelectItem>
                        <SelectItem value="0">Open time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    className="bg-primary hover:bg-primary/90 shadow-[0_0_15px_rgba(124,58,237,0.5)]"
                    onClick={handleAssign}
                    disabled={assignMutation.isPending}
                  >
                    {assignMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Confirm Assignment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
