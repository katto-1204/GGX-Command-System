import { useState } from "react";
import { useListQueueEntries, useApproveQueueEntry, useRemoveQueueEntry, getListQueueEntriesQueryKey } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Trash2, Loader2, Play, Pause } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminQueue() {
  const { data: queue, isLoading } = useListQueueEntries({ query: { refetchInterval: 10000 } as any });
  const approveMutation = useApproveQueueEntry();
  const removeMutation = useRemoveQueueEntry();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isPaused, setIsPaused] = useState(false);

  const handleApprove = (id: string) => {
    approveMutation.mutate({ queueId: id }, {
      onSuccess: () => {
        toast({ title: "Entry approved" });
        queryClient.invalidateQueries({ queryKey: getListQueueEntriesQueryKey() });
      }
    });
  };

  const handleRemove = (id: string, reason: string) => {
    removeMutation.mutate({ queueId: id }, {
      onSuccess: () => {
        toast({ title: `Entry removed (${reason})` });
        queryClient.invalidateQueries({ queryKey: getListQueueEntriesQueryKey() });
      }
    });
  };

  const activeQueue = queue?.filter(q => !["cancelled", "removed", "noShow", "completed", "assigned"].includes(q.status)) || [];

  return (
    <AdminLayout breadcrumbs={[{ label: "Queue Control" }]}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold font-display">Queue Control</h1>
            <p className="text-muted-foreground">Manage waiting players</p>
          </div>
          <Button 
            variant={isPaused ? "default" : "outline"} 
            className={isPaused ? "bg-yellow-500 hover:bg-yellow-600" : "border-yellow-500/20 text-yellow-500 hover:bg-yellow-500/10"}
            onClick={() => setIsPaused(!isPaused)}
          >
            {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
            {isPaused ? "Resume Queue" : "Pause Queue"}
          </Button>
        </div>

        <Card className="bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)]">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-black/20">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="w-[80px] text-center">Pos</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Wait Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                    </TableCell>
                  </TableRow>
                ) : activeQueue.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      Queue is currently empty
                    </TableCell>
                  </TableRow>
                ) : (
                  activeQueue.map((entry) => (
                    <TableRow key={entry.id} className="border-white/5 hover:bg-white/5">
                      <TableCell className="text-center font-mono font-bold text-lg">{entry.position}</TableCell>
                      <TableCell>
                        <div className="font-medium">{entry.displayName || entry.username}</div>
                        <div className="text-xs text-muted-foreground">@{entry.username}</div>
                      </TableCell>
                      <TableCell className="capitalize">{entry.requestedTier || "Any"}</TableCell>
                      <TableCell className="font-mono text-yellow-400">~{entry.estimatedWaitMinutes || 0}m</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          entry.status === "approved" ? "border-green-500/50 text-green-500" :
                          entry.status === "waitingApproval" ? "border-yellow-500/50 text-yellow-500" :
                          "border-primary/50 text-primary"
                        }>
                          {entry.status.replace(/([A-Z])/g, ' $1').trim()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {entry.status === "waitingApproval" && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-green-500/20 text-green-500 hover:bg-green-500/10"
                              onClick={() => handleApprove(entry.id)}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" /> Approve
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-red-500/20 text-red-500 hover:bg-red-500/10 px-2"
                            onClick={() => handleRemove(entry.id, "No Show")}
                            title="Mark No-Show"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-white/10 hover:bg-white/10 px-2"
                            onClick={() => handleRemove(entry.id, "Removed")}
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
