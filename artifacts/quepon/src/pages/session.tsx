import { useEffect, useState } from "react";
import { useGetMySession, useExtendSession, useEndSession, getGetMySessionQueryKey } from "@workspace/api-client-react";
import { PlayerLayout } from "@/components/layout/player-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Monitor, Clock, X, Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function Session() {
  const { data: session, isLoading } = useGetMySession({ query: { refetchInterval: 5000 } as any });
  const extendSessionMutation = useExtendSession();
  const endSessionMutation = useEndSession();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [localRemaining, setLocalRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (session?.remainingSeconds != null) {
      setLocalRemaining(session.remainingSeconds);
    }
  }, [session?.remainingSeconds]);

  useEffect(() => {
    if (localRemaining === null || localRemaining <= 0 || session?.status !== "active") return;
    
    const interval = setInterval(() => {
      setLocalRemaining(prev => prev ? prev - 1 : 0);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [localRemaining, session?.status]);

  const handleExtend = () => {
    if (!session) return;
    extendSessionMutation.mutate(
      { sessionId: session.id, data: { additionalMinutes: 60 } },
      {
        onSuccess: () => {
          toast({ title: "Session extended by 1 hour" });
          queryClient.invalidateQueries({ queryKey: getGetMySessionQueryKey() });
        },
        onError: (err: any) => {
          toast({ title: "Failed to extend", description: err.message, variant: "destructive" });
        }
      }
    );
  };

  const handleEnd = () => {
    if (!session) return;
    endSessionMutation.mutate(
      { sessionId: session.id },
      {
        onSuccess: () => {
          toast({ title: "Session ended" });
          queryClient.invalidateQueries({ queryKey: getGetMySessionQueryKey() });
        },
        onError: (err: any) => {
          toast({ title: "Failed to end session", description: err.message, variant: "destructive" });
        }
      }
    );
  };

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return "00:00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime = localRemaining != null && localRemaining < 300; // < 5 mins
  const isMediumTime = localRemaining != null && localRemaining >= 300 && localRemaining < 600; // < 10 mins

  const isActive = session && ["active", "extended"].includes(session.status);

  return (
    <PlayerLayout>
      <div className="space-y-6 pt-4">
        <div>
          <h1 className="text-2xl font-bold font-display">My Session</h1>
          <p className="text-muted-foreground text-sm">Manage your current PC</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : isActive && session ? (
          <Card className={`bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] backdrop-blur-sm relative overflow-hidden transition-colors ${isLowTime ? 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : isMediumTime ? 'border-yellow-500/50' : ''}`}>
            {isLowTime && <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none" />}
            <CardContent className="p-8 text-center flex flex-col items-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] mb-6">
                <Monitor className="w-4 h-4 text-primary" />
                <span className="font-bold font-mono">{session.pcLabel}</span>
              </div>
              
              <div className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Time Remaining</div>
              <div className={`text-6xl font-bold font-mono mb-8 tracking-tighter ${isLowTime ? 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]' : isMediumTime ? 'text-yellow-500' : 'text-white'}`}>
                {formatTime(localRemaining || 0)}
              </div>

              <div className="grid grid-cols-2 gap-4 w-full mb-8">
                <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                  <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Rate</div>
                  <div className="font-mono text-lg font-bold">₱{session.ratePerHour}/hr</div>
                </div>
                <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                  <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Cost</div>
                  <div className="font-mono text-lg font-bold text-green-400">₱{session.costSoFar?.toFixed(2) || "0.00"}</div>
                </div>
              </div>

              <div className="flex gap-3 w-full">
                <Button 
                  variant="outline" 
                  className="flex-1 border-white/10 hover:bg-white/5 h-12"
                  onClick={handleEnd}
                  disabled={endSessionMutation.isPending}
                >
                  <X className="w-4 h-4 mr-2" /> End
                </Button>
                <Button 
                  className="flex-1 h-12 bg-primary hover:bg-primary/90 shadow-[0_0_15px_rgba(124,58,237,0.3)]"
                  onClick={handleExtend}
                  disabled={extendSessionMutation.isPending}
                >
                  <Plus className="w-4 h-4 mr-2" /> 1 Hour
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] backdrop-blur-sm">
            <CardContent className="p-12 text-center flex flex-col items-center">
              <Monitor className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-bold mb-2">No Active Session</h3>
              <p className="text-muted-foreground text-sm max-w-[250px]">You don't have an active PC session right now. Join the queue to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </PlayerLayout>
  );
}
