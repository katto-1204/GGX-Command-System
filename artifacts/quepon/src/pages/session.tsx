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
    <PlayerLayout backHref="/home">
      <div className="space-y-8 pt-6 pb-20">
        {/* Session Header */}
        <div className="relative overflow-hidden rounded-[3rem] bg-card border border-border p-10 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 blur-[120px] -mr-40 -mt-40 pointer-events-none" />
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">Live Metrics</span>
            </div>
            <h1 className="text-4xl font-black font-display tracking-tight text-foreground leading-none italic uppercase">
              SESSION
            </h1>
            <p className="text-xs font-black uppercase tracking-[0.1em]">
              {isActive 
                ? <span className="text-green-500">SYSTEM ENGAGED — STATION {session?.pcLabel}</span>
                : <span className="text-muted-foreground">NO ACTIVE HARDWARE CONNECTION</span>}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-24 space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse" />
              <Loader2 className="w-16 h-16 animate-spin text-primary relative z-10" />
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.5em] animate-pulse">Syncing Session Data...</p>
          </div>
        ) : isActive && session ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className={cn(
              "bg-card border-2 rounded-[3.5rem] overflow-hidden transition-all shadow-3xl relative",
              isLowTime 
                ? "border-red-500/50 shadow-red-500/20" 
                : isMediumTime 
                  ? "border-yellow-500/50 shadow-yellow-500/20" 
                  : "border-border shadow-primary/10"
            )}>
              {isLowTime && (
                <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none" />
              )}
              <CardContent className="p-12 text-center flex flex-col items-center">
                <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-2xl bg-muted/50 border border-border backdrop-blur-sm mb-10 shadow-inner group">
                  <Monitor className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                  <span className="font-black font-mono text-lg uppercase italic tracking-tighter text-foreground">{session.pcLabel}</span>
                </div>
                
                <div className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-[0.5em] mb-4 italic">Time Remaining</div>
                <div className={cn(
                  "text-[8rem] font-black font-mono mb-10 tracking-tighter leading-none italic",
                  isLowTime 
                    ? "text-red-500 drop-shadow-[0_0_40px_rgba(239,68,68,0.6)]" 
                    : isMediumTime 
                      ? "text-yellow-500 drop-shadow-[0_0_40px_rgba(234,179,8,0.4)]" 
                      : "text-foreground drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                )}>
                  {formatTime(localRemaining || 0)}
                </div>

                <div className="grid grid-cols-2 gap-5 w-full mb-12">
                  <div className="bg-background/40 rounded-[2rem] p-6 border border-border/50 shadow-inner text-left group hover:bg-muted/50 transition-colors">
                    <div className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-2">Billing Rate</div>
                    <div className="font-mono text-2xl font-black italic text-foreground leading-none">₱{session.ratePerHour}<span className="text-[10px] opacity-40 ml-1">/HR</span></div>
                  </div>
                  <div className="bg-background/40 rounded-[2rem] p-6 border border-border/50 shadow-inner text-left group hover:bg-muted/50 transition-colors">
                    <div className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-2">Accumulated</div>
                    <div className="font-mono text-2xl font-black italic text-green-500 leading-none">₱{session.costSoFar?.toFixed(2) || "0.00"}</div>
                  </div>
                </div>

                {/* Session QR Code */}
                {session.sessionCode && (
                  <div className="w-full bg-background/40 rounded-[2rem] p-6 border border-primary/20 shadow-inner mb-12">
                    <div className="flex items-center gap-6">
                      <div className="bg-white p-3 rounded-2xl shadow-lg">
                        <QRCodeSVG value={session.sessionCode} size={96} level="H" />
                      </div>
                      <div className="flex-1 text-left space-y-2">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 italic">Your Session Code</p>
                        <p className="text-lg font-black font-mono text-primary tracking-wider">{session.sessionCode}</p>
                        <p className="text-[9px] text-muted-foreground/40 italic uppercase tracking-widest leading-relaxed">Show this QR at the front desk to verify your check-in</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 w-full">
                  <Button 
                    variant="ghost" 
                    className="flex-1 h-16 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.3em] text-destructive/60 hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20"
                    onClick={handleEnd}
                    disabled={endSessionMutation.isPending}
                  >
                    <X className="w-5 h-5 mr-3" /> Terminate
                  </Button>
                  <Button 
                    className="flex-[1.5] h-16 rounded-[1.5rem] bg-primary text-primary-foreground font-black uppercase text-[11px] tracking-[0.4em] shadow-2xl shadow-primary/30 relative overflow-hidden group border-2 border-white/10"
                    onClick={handleExtend}
                    disabled={extendSessionMutation.isPending}
                  >
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
                    <Plus className="w-5 h-5 mr-3" /> Extend +1H
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="bg-card border-2 border-dashed border-border rounded-[3.5rem] p-16 text-center shadow-inner mx-2">
            <div className="w-24 h-24 rounded-[2rem] bg-muted/50 border border-border flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Monitor className="w-12 h-12 text-muted-foreground/20" />
            </div>
            <h3 className="text-2xl font-black text-foreground uppercase tracking-[0.2em] italic mb-4">No Active Link</h3>
            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] max-w-[280px] mx-auto leading-relaxed opacity-60">
              You don't have an active hardware uplink right now. Secure a station from the fleet.
            </p>
            <Button 
              onClick={() => setLocation("/pcs")}
              className="mt-10 h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase text-[10px] tracking-[0.4em] px-10 shadow-xl shadow-primary/20"
            >
              View Fleet
            </Button>
          </div>
        )}
      </div>
    </PlayerLayout>

  );
}
