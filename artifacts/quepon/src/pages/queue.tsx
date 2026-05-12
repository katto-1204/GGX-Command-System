import { useState } from "react";
import { useGetMyQueueEntry, useJoinQueue, useListPcs, getGetMyQueueEntryQueryKey } from "@workspace/api-client-react";
import { PlayerLayout } from "@/components/layout/player-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Monitor, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export default function Queue() {
  const { data: queueEntry, isLoading: isLoadingQueue } = useGetMyQueueEntry({ query: { refetchInterval: 10000 } as any });
  const { data: pcs } = useListPcs();
  const joinQueueMutation = useJoinQueue();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [tier, setTier] = useState<string>("standard");

  const handleJoinQueue = () => {
    joinQueueMutation.mutate({ data: { requestedTier: tier } }, {
      onSuccess: () => {
        toast({ title: "Joined queue successfully" });
        queryClient.invalidateQueries({ queryKey: getGetMyQueueEntryQueryKey() });
      },
      onError: (err: any) => {
        toast({ title: "Failed to join queue", description: err.message, variant: "destructive" });
      }
    });
  };

  const isQueued = !!queueEntry && !["cancelled", "removed", "noShow", "completed", "assigned"].includes(queueEntry.status);

  return (
    <PlayerLayout>
      <div className="space-y-6 pt-4">
        <div>
          <h1 className="text-2xl font-bold font-display">Queue</h1>
          <p className="text-muted-foreground text-sm">Wait for your turn</p>
        </div>

        {isLoadingQueue ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : isQueued ? (
          <Card className="bg-[rgba(124,58,237,0.1)] border-[rgba(124,58,237,0.3)] backdrop-blur-sm shadow-[0_0_30px_rgba(124,58,237,0.1)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary animate-pulse" />
            <CardContent className="p-8 text-center flex flex-col items-center">
              <Clock className="w-12 h-12 text-primary mb-4" />
              <div className="text-sm text-primary uppercase tracking-wider mb-2">Position in Queue</div>
              <div className="text-6xl font-bold font-mono text-white mb-6 drop-shadow-[0_0_15px_rgba(124,58,237,0.5)]">
                {queueEntry.position}
              </div>
              <div className="space-y-2 w-full max-w-[200px] text-left">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <span className="text-white capitalize">{queueEntry.status.replace(/([A-Z])/g, ' $1').trim()}</span>
                </div>
                {queueEntry.estimatedWaitMinutes && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Est. Wait</span>
                    <span className="text-yellow-400">~{queueEntry.estimatedWaitMinutes} min</span>
                  </div>
                )}
                {queueEntry.requestedTier && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tier</span>
                    <span className="text-white capitalize">{queueEntry.requestedTier}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <Monitor className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Not in Queue</h3>
                <p className="text-muted-foreground text-sm">Join the queue to get a PC assigned to you.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Preferred Tier</label>
                  <Select value={tier} onValueChange={setTier}>
                    <SelectTrigger className="bg-black/20 border-white/10">
                      <SelectValue placeholder="Select Tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  className="w-full h-12 text-lg shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)]" 
                  onClick={handleJoinQueue}
                  disabled={joinQueueMutation.isPending}
                >
                  {joinQueueMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Join Queue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PlayerLayout>
  );
}
