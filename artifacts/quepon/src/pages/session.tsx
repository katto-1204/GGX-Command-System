import { useEffect, useState } from "react";
import { useGetMySession, useExtendSession, useEndSession, getGetMySessionQueryKey } from "@workspace/api-client-react";
import { PlayerLayout } from "@/components/layout/player-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Monitor, Clock, X, Plus, Zap } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { QRCodeSVG } from "qrcode.react";

export default function Session() {
  const [, setLocation] = useLocation();
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
    if (localRemaining === null || localRemaining <= 0 || session?.status !== "active") {
      if (localRemaining === 0 && session?.status === "active") {
        handleEnd();
      }
      return;
    }
    
    const interval = setInterval(() => {
      setLocalRemaining(prev => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
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
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime = localRemaining != null && localRemaining < 300; // < 5 mins
  const isMediumTime = localRemaining != null && localRemaining >= 300 && localRemaining < 600; // < 10 mins

  const isActive = session && ["active", "extended"].includes(session.status);

  return (
    <PlayerLayout backHref="/home">
      <div className="space-y-5 pt-4 pb-20">
        {/* Session Header */}
        <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-5 shadow-xl">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 blur-[80px] -mr-24 -mt-24 pointer-events-none" />
          <div className="relative z-10 space-y-1.5">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Live Metrics</span>
            </div>
            <h1 className="text-2xl font-black font-display tracking-tight text-foreground leading-none italic uppercase">
              SESSION
            </h1>
            <p className="text-[9px] font-black uppercase tracking-[0.1em] truncate">
              {isActive 
                ? <span className="text-green-500">ENGAGED — STATION {session?.pcLabel}</span>
                : <span className="text-muted-foreground">NO ACTIVE CONNECTION</span>}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-2xl animate-pulse" />
              <Loader2 className="w-12 h-12 animate-spin text-primary relative z-10" />
            </div>
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] animate-pulse">Syncing...</p>
          </div>
        ) : isActive && session ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className={cn(
              "bg-card border-2 rounded-2xl overflow-hidden transition-all shadow-xl relative",
              isLowTime 
                ? "border-red-500/50 shadow-red-500/10" 
                : isMediumTime 
                  ? "border-yellow-500/50 shadow-yellow-500/10" 
                  : "border-border shadow-primary/5"
            )}>
              {isLowTime && (
                <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none" />
              )}
              <CardContent className="p-6 text-center flex flex-col items-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/50 border border-border backdrop-blur-sm mb-6 shadow-inner">
                  <Monitor className="w-4 h-4 text-primary" />
                  <span className="font-black font-mono text-base uppercase italic tracking-tighter text-foreground">{session.pcLabel}</span>
                </div>
                
                <div className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-[0.4em] mb-2 italic">Time Remaining</div>
                <div className={cn(
                  "text-[3.5rem] sm:text-[4.5rem] font-black font-mono mb-6 tracking-tighter leading-none italic w-full overflow-hidden",
                  isLowTime 
                    ? "text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]" 
                    : isMediumTime 
                      ? "text-yellow-500 drop-shadow-[0_0_30px_rgba(234,179,8,0.3)]" 
                      : "text-foreground drop-shadow-[0_0_20px_rgba(255,255,255,0.08)]"
                )}>
                  {formatTime(localRemaining || 0)}
                </div>

                <div className="grid grid-cols-2 gap-3 w-full mb-6">
                  <div className="bg-background/40 rounded-xl p-4 border border-border/50 shadow-inner text-left">
                    <div className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Billing Rate</div>
                    <div className="font-mono text-lg font-black italic text-foreground leading-none">₱{session.ratePerHour}<span className="text-[8px] opacity-40 ml-0.5">/HR</span></div>
                  </div>
                  <div className="bg-background/40 rounded-xl p-4 border border-border/50 shadow-inner text-left">
                    <div className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Accumulated</div>
                    <div className="font-mono text-lg font-black italic text-green-500 leading-none">₱{session.costSoFar?.toFixed(2) || "0.00"}</div>
                  </div>
                </div>

                {/* Session QR Code — compact */}
                {session.sessionCode && (
                  <div className="w-full bg-background/40 rounded-xl p-4 border border-primary/20 shadow-inner mb-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-white p-2 rounded-lg shadow flex-shrink-0">
                        <QRCodeSVG value={session.sessionCode} size={72} level="H" />
                      </div>
                      <div className="flex-1 text-left space-y-1 min-w-0">
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 italic">Session Code</p>
                        <p className="text-sm font-black font-mono text-primary tracking-wider break-all leading-tight">{session.sessionCode}</p>
                        <p className="text-[7px] text-muted-foreground/40 italic uppercase tracking-widest leading-relaxed">Show QR at desk to verify</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 w-full">
                  <Button 
                    variant="ghost" 
                    className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-destructive/60 hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20"
                    onClick={handleEnd}
                    disabled={endSessionMutation.isPending}
                  >
                    <X className="w-4 h-4 mr-2" /> End
                  </Button>
                  <Button 
                    className="flex-[1.5] h-12 rounded-xl bg-primary text-primary-foreground font-black uppercase text-[10px] tracking-[0.3em] shadow-xl shadow-primary/20 relative overflow-hidden group border border-white/10"
                    onClick={handleExtend}
                    disabled={extendSessionMutation.isPending}
                  >
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
                    <Plus className="w-4 h-4 mr-2" /> Extend +
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="bg-card border-2 border-dashed border-border rounded-2xl p-10 text-center shadow-inner">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 border border-border flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Monitor className="w-8 h-8 text-muted-foreground/20" />
            </div>
            <h3 className="text-xl font-black text-foreground uppercase tracking-[0.15em] italic mb-3">No Active Link</h3>
            <p className="text-muted-foreground text-[9px] font-black uppercase tracking-[0.2em] max-w-[240px] mx-auto leading-relaxed opacity-60 mb-6">
              No active hardware uplink. Secure a station from the fleet.
            </p>
            <Button 
              onClick={() => setLocation("/pcs")}
              className="h-11 rounded-xl bg-primary text-primary-foreground font-black uppercase text-[9px] tracking-[0.3em] px-8 shadow-lg shadow-primary/20"
            >
              View Fleet
            </Button>
          </div>
        )}
      </div>
    </PlayerLayout>
  );
}
