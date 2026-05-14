import { useState, useEffect } from "react";
import { 
  useCheckinSession, 
  useGetPcSummary, 
  useGetMyQueueEntry,
  useGetMySession
} from "@workspace/api-client-react";
import { PlayerLayout } from "@/components/layout/player-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  QrCode, 
  Monitor, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Camera, 
  ArrowRight, 
  Lock, 
  ListOrdered, 
  Zap,
  Info,
  Shield
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";

export default function Checkin() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<any>(null);
  const checkinMutation = useCheckinSession();
  const [, setLocation] = useLocation();

  const { data: pcSummary, isLoading: isLoadingSummary } = useGetPcSummary({ query: { refetchInterval: 5000 } as any });
  const { data: queueEntry, isLoading: isLoadingQueue } = useGetMyQueueEntry({ query: { refetchInterval: 5000 } as any });
  const { data: mySession } = useGetMySession();

  const availablePcs = pcSummary?.available || 0;
  const isAssigned = queueEntry?.status === "assigned";
  const canScan = availablePcs > 0 || isAssigned || !!mySession;

  const handleCheckin = () => {
    if (!code.trim()) return;
    checkinMutation.mutate({ data: { sessionCode: code.trim() } }, {
      onSuccess: (data) => setResult(data),
      onError: (err: any) => setResult({ found: false, message: err.message || "Error verifying code. Try again." }),
    });
  };

  const handleReset = () => {
    setResult(null);
    setCode("");
  };

  if (isLoadingSummary || isLoadingQueue) {
    return (
      <PlayerLayout>
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground animate-pulse">Scanning Network...</p>
        </div>
      </PlayerLayout>
    );
  }

  // LOCKED STATE: All PCs full and not assigned
  if (!canScan) {
    return (
      <PlayerLayout>
        <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center space-y-8 py-12">
            <div className="w-24 h-24 rounded-[2.5rem] bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto relative group">
              <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full" />
              <Lock className="w-10 h-10 text-red-500 relative z-10" />
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-black font-display text-foreground tracking-tight uppercase leading-none italic">
                SCANNER <span className="text-red-500">LOCKED</span>
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground max-w-[240px] mx-auto leading-relaxed">
                All stations are currently engaged. Access to hardware uplink is restricted.
              </p>
            </div>

            <Card className="bg-card/50 border-border shadow-xl rounded-[2rem] max-w-sm mx-auto overflow-hidden">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-start gap-4 text-left">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 mt-1">
                    <ListOrdered className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-[11px] text-foreground uppercase tracking-wider mb-1">Queue Protocol Required</h4>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold leading-normal">
                      Join the waitlist to secure your rank in the fleet.
                    </p>
                  </div>
                </div>

                <Link href="/queue">
                  <Button className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all text-[11px] group mt-4">
                    Join Waitlist
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <div className="flex items-center justify-center gap-2 text-muted-foreground/40">
              <Info className="w-3 h-3" />
              <span className="text-[8px] font-black uppercase tracking-[0.3em]">Code: ACCESS_RESTRICTED_FLEET_FULL</span>
            </div>
          </div>
        </div>
      </PlayerLayout>
    );
  }

  // WAITING STATE: In queue but not assigned
  if (queueEntry && !isAssigned && !mySession) {
    return (
      <PlayerLayout>
        <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center space-y-8 py-12">
            <div className="w-24 h-24 rounded-[2.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto relative group">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
              <div className="text-2xl font-black font-mono text-primary relative z-10 italic">#{queueEntry.position}</div>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-black font-display text-foreground tracking-tight uppercase leading-none italic">
                AWAITING <span className="text-primary">TURN</span>
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground max-w-[240px] mx-auto leading-relaxed">
                Scanner will unlock automatically once a station becomes available for your rank.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
              <div className="bg-card border border-border rounded-2xl p-4 text-left">
                <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Status</div>
                <div className="text-[10px] font-black text-primary uppercase tracking-wider italic">IN WAITLIST</div>
              </div>
              <div className="bg-card border border-border rounded-2xl p-4 text-left">
                <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Est. Wait</div>
                <div className="text-[10px] font-black text-foreground uppercase tracking-wider italic">~{queueEntry.estimatedWaitMinutes || 5}M</div>
              </div>
            </div>

            <Link href="/queue">
              <Button variant="outline" className="h-14 px-8 rounded-2xl border-border bg-card font-black uppercase tracking-widest text-[10px] transition-all hover:bg-muted">
                Manage Position
              </Button>
            </Link>
          </div>
        </div>
      </PlayerLayout>
    );
  }

  return (
    <PlayerLayout>
      <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black font-display uppercase tracking-tight text-foreground italic">
              SYNC <span className="text-primary">DEVICE</span>
            </h1>
            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mt-1">Initialize hardware uplink</p>
          </div>
          {isAssigned && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500">
              <Zap className="w-3 h-3 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest">Turn Ready</span>
            </div>
          )}
        </div>

        {/* @ts-ignore */}
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              {/* QR Scanner Mock */}
              <Card className="bg-card border-2 border-border shadow-2xl overflow-hidden rounded-[2.5rem] relative group">
                <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                <CardContent className="p-0">
                  <div className="relative h-64 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    {/* Corner markers */}
                    <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-2xl" />
                    <div className="absolute top-8 right-8 w-12 h-12 border-t-4 border-r-4 border-primary rounded-tr-2xl" />
                    <div className="absolute bottom-8 left-8 w-12 h-12 border-b-4 border-l-4 border-primary rounded-bl-2xl" />
                    <div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-primary rounded-br-2xl" />
                    
                    {/* Scan line animation */}
                    <motion.div
                      className="absolute left-10 right-10 h-1 bg-primary shadow-[0_0_20px_rgba(var(--primary),1)] z-10"
                      animate={{ top: ["25%", "75%", "25%"] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    />
                    
                    <div className="flex flex-col items-center gap-4 text-muted-foreground relative z-10">
                      <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md shadow-2xl">
                        <Camera className="w-10 h-10 text-primary opacity-80" />
                      </div>
                      <div className="space-y-1 text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Focusing Optics</p>
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Target PC QR to sync</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center gap-4 text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] my-2 px-2">
                <div className="flex-1 h-px bg-border/50" />
                <span>Manual Override</span>
                <div className="flex-1 h-px bg-border/50" />
              </div>

              {/* Manual code entry */}
              <Card className="bg-card border-2 border-border shadow-xl rounded-[2rem] overflow-hidden">
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 ml-1">
                      <Shield className="w-3 h-3 text-primary" />
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Access Protocol Code</label>
                    </div>
                    <div className="flex gap-3">
                      <Input
                        value={code}
                        onChange={e => setCode(e.target.value.toUpperCase())}
                        placeholder="GGX-PC01-SYNC"
                        className="font-mono text-base tracking-[0.2em] bg-muted/30 border-border h-14 rounded-2xl focus:border-primary/50 text-center uppercase font-black"
                        onKeyDown={e => e.key === "Enter" && handleCheckin()}
                      />
                      <Button
                        onClick={handleCheckin}
                        disabled={!code.trim() || checkinMutation.isPending}
                        className="h-14 px-6 bg-primary hover:bg-primary/90 font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-lg shadow-primary/20"
                      >
                        {checkinMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
              <Card className={cn(
                "border-2 shadow-2xl rounded-[3rem] overflow-hidden relative",
                result.found ? "border-green-500/30 bg-card" : "border-red-500/30 bg-card"
              )}>
                <div className={cn(
                  "absolute top-0 left-0 w-full h-1.5",
                  result.found ? "bg-green-500" : "bg-red-500"
                )} />
                <CardContent className="p-10 text-center space-y-6 relative">
                  <div className={cn(
                    "absolute inset-0 opacity-10 pointer-events-none blur-[100px]",
                    result.found ? "bg-green-500/20" : "bg-red-500/20"
                  )} />
                  
                  {result.found ? (
                    <>
                      <div className="w-24 h-24 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto relative group">
                        <div className="absolute inset-0 bg-green-500/30 blur-3xl rounded-full group-hover:scale-125 transition-transform" />
                        <CheckCircle2 className="w-12 h-12 text-green-500 relative z-10" />
                      </div>
                      
                      <div className="space-y-2">
                        <h2 className="text-3xl font-black font-display text-green-500 tracking-tight uppercase italic leading-none">UPLINK SUCCESS</h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">{result.message}</p>
                      </div>

                      {result.pcLabel && (
                        <div className="inline-flex items-center justify-center gap-4 bg-muted/50 rounded-[1.5rem] p-5 border border-border mx-auto min-w-[220px] shadow-inner">
                          <Monitor className="w-6 h-6 text-primary" />
                          <div className="text-left">
                            <div className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Target Rig</div>
                            <span className="font-black font-mono text-foreground tracking-[0.2em] text-xl italic">{result.pcLabel}</span>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto relative group">
                        <div className="absolute inset-0 bg-red-500/30 blur-3xl rounded-full group-hover:scale-125 transition-transform" />
                        <XCircle className="w-12 h-12 text-red-500 relative z-10" />
                      </div>

                      <div className="space-y-2">
                        <h2 className="text-3xl font-black font-display text-red-500 tracking-tight uppercase italic leading-none">UPLINK DENIED</h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">{result.message}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {result.found ? (
                <Button 
                  className="w-full h-16 rounded-[1.5rem] bg-primary text-primary-foreground font-black tracking-[0.3em] uppercase shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-95 text-[11px] group" 
                  onClick={() => setLocation("/session")}
                >
                  Enter Active Terminal
                  <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full h-14 rounded-[1.5rem] border-border bg-card font-black tracking-widest uppercase text-[10px] hover:bg-muted transition-colors" 
                  onClick={handleReset}
                >
                  Retry Authorization
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PlayerLayout>
  );
}
