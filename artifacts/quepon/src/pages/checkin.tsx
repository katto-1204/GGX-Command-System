import { useState, useEffect, useRef, useCallback } from "react";
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
  Shield,
  CameraOff
} from "lucide-react";
import { motion } from "framer-motion";
import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import { QrTrackingView } from "@/components/qr-tracking-view";

// QR Scanner component using html5-qrcode
function QRScanner({ onScan, enabled }: { onScan: (code: string) => void; enabled: boolean }) {
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<any>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const hasScannedRef = useRef(false);

  const startScanner = useCallback(async () => {
    if (!scannerRef.current || !enabled || html5QrCodeRef.current) return;

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const qrScanner = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = qrScanner;

      await qrScanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1.0,
        },
        (decodedText: string) => {
          if (!hasScannedRef.current) {
            hasScannedRef.current = true;
            onScan(decodedText);
            // Stop scanner after successful scan
            qrScanner.stop().catch(() => {});
          }
        },
        () => {} // Ignore scan failures (continuous scanning)
      );
      setIsScanning(true);
      setCameraError(null);
    } catch (err: any) {
      console.error("QR Scanner error:", err);
      setCameraError(
        err?.message?.includes("NotAllowedError") || err?.message?.includes("Permission")
          ? "Camera permission denied. Please allow camera access."
          : "Unable to access camera. Use manual code entry instead."
      );
    }
  }, [enabled, onScan]);

  useEffect(() => {
    if (enabled) {
      // Small delay to let the DOM render
      const timer = setTimeout(startScanner, 300);
      return () => clearTimeout(timer);
    }
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
        html5QrCodeRef.current = null;
      }
    };
  }, [enabled, startScanner]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
        html5QrCodeRef.current = null;
      }
    };
  }, []);

  if (cameraError) {
    return (
      <div className="h-56 flex flex-col items-center justify-center bg-black/80 rounded-2xl border border-border/50 p-6 text-center gap-3">
        <CameraOff className="w-10 h-10 text-red-400/60" />
        <p className="text-[9px] font-black text-red-400/80 uppercase tracking-widest max-w-[200px] leading-relaxed">
          {cameraError}
        </p>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden border-2 border-primary/30 shadow-xl">
      <div id="qr-reader" ref={scannerRef} className="w-full" style={{ minHeight: "250px" }} />
      {!isScanning && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3">
          <Camera className="w-10 h-10 text-primary/60 animate-pulse" />
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Initializing Camera...</p>
        </div>
      )}
      {/* Overlay scan markers */}
      {isScanning && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="relative w-[220px] h-[220px]">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-3 border-l-3 border-primary rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-3 border-r-3 border-primary rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-3 border-l-3 border-primary rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-3 border-r-3 border-primary rounded-br-lg" />
          </div>
        </div>
      )}
    </div>
  );
}

export default function Checkin() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<any>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const checkinMutation = useCheckinSession();
  const [, setLocation] = useLocation();

  const { data: pcSummary, isLoading: isLoadingSummary } = useGetPcSummary({ query: { refetchInterval: 5000 } as any });
  const { data: queueEntry, isLoading: isLoadingQueue } = useGetMyQueueEntry({ query: { refetchInterval: 5000 } as any });
  const { data: mySession } = useGetMySession({ query: { refetchInterval: 5000 } as any });

  // Sync remaining time from session
  useEffect(() => {
    if (mySession?.remainingSeconds != null) {
      setRemainingTime(mySession.remainingSeconds);
    }
  }, [mySession?.remainingSeconds]);

  // Local countdown
  useEffect(() => {
    if (remainingTime === null || remainingTime <= 0 || mySession?.status !== "active") return;
    
    const interval = setInterval(() => {
      setRemainingTime(prev => prev ? prev - 1 : 0);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [remainingTime, mySession?.status]);

  // Session state detection
  const hasActiveSession = !!mySession && ["active", "extended", "pending"].includes(mySession.status);
  const isInQueue = !!queueEntry && !["cancelled", "removed", "noShow", "completed"].includes(queueEntry.status);
  const isNextInLine = isInQueue && (queueEntry.position === 1 || queueEntry.status === "approved" || queueEntry.status === "assigned");
  const canScan = isNextInLine;

  const handleCheckin = (sessionCode?: string) => {
    const codeToUse = (sessionCode || code).trim();
    if (!codeToUse) return;

    checkinMutation.mutate({ data: { sessionCode: codeToUse } }, {
      onSuccess: (data) => setResult(data),
      onError: (err: any) => setResult({ found: false, message: err.message || "Error verifying code. Try again." }),
    });
  };

  const handleQrScan = (decodedText: string) => {
    setCode(decodedText);
    setShowScanner(false);
    handleCheckin(decodedText);
  };

  const handleReset = () => {
    setResult(null);
    setCode("");
    setShowScanner(false);
  };

  if (isLoadingSummary || isLoadingQueue) {
    return (
      <PlayerLayout>
        <div className="flex flex-col items-center justify-center p-16 space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Scanning Network...</p>
        </div>
      </PlayerLayout>
    );
  }

  // ACTIVE SESSION STATE: Show QR Tracking Dashboard
  if (hasActiveSession) {
    return (
      <PlayerLayout>
        <div className="pt-4 pb-20">
          <QrTrackingView session={mySession} remainingSeconds={remainingTime} />
        </div>
      </PlayerLayout>
    );
  }

  // LOCKED STATE: Not next in queue and no active session
  if (!canScan) {
    return (
      <PlayerLayout>
        <div className="space-y-5 pt-4">
          <div className="text-center space-y-6 py-8">
            <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto relative">
              <div className="absolute inset-0 bg-red-500/15 blur-2xl rounded-full" />
              <Lock className="w-9 h-9 text-red-500 relative z-10" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-black font-display text-foreground tracking-tight uppercase leading-none italic">
                SCANNER LOCKED
              </h1>
              <p className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground max-w-[260px] mx-auto leading-relaxed">
                Join the queue and wait for your turn to scan.
              </p>
            </div>

            {isInQueue ? (
              // In queue but NOT next in line
              <Card className="bg-card/50 border-border shadow-lg rounded-2xl max-w-sm mx-auto overflow-hidden">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      <span className="text-xl font-black font-mono italic">#{queueEntry.position}</span>
                    </div>
                    <div>
                      <h4 className="font-black text-[10px] text-foreground uppercase tracking-wider mb-0.5">You're In Queue</h4>
                      <p className="text-[8px] text-muted-foreground uppercase tracking-widest font-bold leading-normal">
                        Scanner unlocks when you're #1
                      </p>
                    </div>
                  </div>

                  <Link href="/queue">
                    <Button variant="outline" className="w-full h-11 rounded-xl border-border bg-card font-black uppercase tracking-widest text-[9px] hover:bg-muted transition-colors">
                      View Queue
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              // Not in queue at all
              <Card className="bg-card/50 border-border shadow-lg rounded-2xl max-w-sm mx-auto overflow-hidden">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start gap-3 text-left">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                      <ListOrdered className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-black text-[10px] text-foreground uppercase tracking-wider mb-0.5">Queue Required</h4>
                      <p className="text-[8px] text-muted-foreground uppercase tracking-widest font-bold leading-normal">
                        Join the waitlist to secure your turn.
                      </p>
                    </div>
                  </div>

                  <Link href="/queue">
                    <Button className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-[0.15em] shadow-lg shadow-primary/20 text-[10px] group">
                      Join Queue
                      <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            <div className="flex items-center justify-center gap-1.5 text-muted-foreground/30">
              <Info className="w-2.5 h-2.5" />
              <span className="text-[7px] font-black uppercase tracking-[0.2em]">ACCESS_RESTRICTED</span>
            </div>
          </div>
        </div>
      </PlayerLayout>
    );
  }

  return (
    <PlayerLayout>
      <div className="space-y-5 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black font-display uppercase tracking-tight text-foreground italic">
              SYNC <span className="text-primary">DEVICE</span>
            </h1>
            <p className="text-muted-foreground text-[9px] font-black uppercase tracking-[0.15em] mt-0.5">Initialize hardware uplink</p>
          </div>
          <div className="flex items-center gap-2">
            {isNextInLine && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500">
                <Zap className="w-3 h-3 animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-widest">Your Turn</span>
              </div>
            )}
            {!showScanner && !result && (
              <Button
                size="icon"
                variant="outline"
                className="w-9 h-9 rounded-lg border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={() => setShowScanner(true)}
              >
                <Camera className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Result state */}
        {result ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5">
            <Card className={cn(
              "border-2 shadow-xl rounded-2xl overflow-hidden relative",
              result.found ? "border-green-500/30 bg-card" : "border-red-500/30 bg-card"
            )}>
              <div className={cn(
                "absolute top-0 left-0 w-full h-1",
                result.found ? "bg-green-500" : "bg-red-500"
              )} />
              <CardContent className="p-6 text-center space-y-4 relative">
                {result.found ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto relative">
                      <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full" />
                      <CheckCircle2 className="w-8 h-8 text-green-500 relative z-10" />
                    </div>
                    <div className="space-y-1.5">
                      <h2 className="text-xl font-black font-display text-green-500 tracking-tight uppercase italic leading-none">UPLINK SUCCESS</h2>
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/80">{result.message}</p>
                    </div>
                    {result.pcLabel && (
                      <div className="inline-flex items-center justify-center gap-3 bg-muted/50 rounded-xl p-4 border border-border mx-auto min-w-[180px] shadow-inner">
                        <Monitor className="w-5 h-5 text-primary" />
                        <div className="text-left">
                          <div className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.15em] mb-0.5">Station</div>
                          <span className="font-black font-mono text-foreground tracking-wider text-lg italic">{result.pcLabel}</span>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto relative">
                      <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full" />
                      <XCircle className="w-8 h-8 text-red-500 relative z-10" />
                    </div>
                    <div className="space-y-1.5">
                      <h2 className="text-xl font-black font-display text-red-500 tracking-tight uppercase italic leading-none">UPLINK DENIED</h2>
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/80">{result.message}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {result.found ? (
              <Button 
                className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-black tracking-[0.2em] uppercase shadow-xl shadow-primary/20 transition-all active:scale-[0.97] text-[10px] group" 
                onClick={() => setLocation("/session")}
              >
                Enter Terminal
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            ) : (
              <Button 
                variant="outline" 
                className="w-full h-11 rounded-xl border-border bg-card font-black tracking-widest uppercase text-[9px] hover:bg-muted transition-colors" 
                onClick={handleReset}
              >
                Try Again
              </Button>
            )}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {/* Live QR Scanner */}
            {showScanner ? (
              <div className="space-y-3">
                <QRScanner onScan={handleQrScan} enabled={showScanner} />
                <Button
                  variant="ghost"
                  className="w-full h-9 text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] hover:text-foreground"
                  onClick={() => setShowScanner(false)}
                >
                  Close Camera
                </Button>
              </div>
            ) : (
              // QR Scanner activation card
              <Card className="bg-card border-2 border-border shadow-xl overflow-hidden rounded-2xl relative group cursor-pointer"
                onClick={() => setShowScanner(true)}
              >
                <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                <CardContent className="p-0">
                  <div className="relative h-48 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    {/* Corner markers */}
                    <div className="absolute top-6 left-6 w-10 h-10 border-t-3 border-l-3 border-primary rounded-tl-xl" />
                    <div className="absolute top-6 right-6 w-10 h-10 border-t-3 border-r-3 border-primary rounded-tr-xl" />
                    <div className="absolute bottom-6 left-6 w-10 h-10 border-b-3 border-l-3 border-primary rounded-bl-xl" />
                    <div className="absolute bottom-6 right-6 w-10 h-10 border-b-3 border-r-3 border-primary rounded-br-xl" />
                    
                    {/* Scan line animation */}
                    <motion.div
                      className="absolute left-8 right-8 h-0.5 bg-primary shadow-[0_0_15px_rgba(124,58,237,0.6)] z-10"
                      animate={{ top: ["25%", "75%", "25%"] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    />
                    
                    <div className="flex flex-col items-center gap-3 text-muted-foreground relative z-10">
                      <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md shadow-xl group-hover:scale-110 transition-transform">
                        <Camera className="w-8 h-8 text-primary opacity-80" />
                      </div>
                      <div className="space-y-1 text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Tap to Scan QR</p>
                        <p className="text-[7px] font-black uppercase tracking-[0.15em] text-muted-foreground/60">Opens camera to scan PC QR code</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex items-center gap-3 text-muted-foreground text-[9px] font-black uppercase tracking-[0.2em] px-1">
              <div className="flex-1 h-px bg-border/50" />
              <span>Or Enter Code</span>
              <div className="flex-1 h-px bg-border/50" />
            </div>

            {/* Manual code entry */}
            <Card className="bg-card border border-border shadow-lg rounded-2xl overflow-hidden">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2 ml-0.5">
                  <Shield className="w-3 h-3 text-primary" />
                  <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Session Code</label>
                </div>
                <div className="flex gap-2.5">
                  <Input
                    value={code}
                    onChange={e => setCode(e.target.value.toUpperCase())}
                    placeholder="GGX-PC01+USER"
                    className="font-mono text-sm tracking-[0.15em] bg-muted/30 border-border h-11 rounded-xl focus:border-primary/50 text-center uppercase font-black"
                    onKeyDown={e => e.key === "Enter" && handleCheckin()}
                  />
                  <Button
                    onClick={() => handleCheckin()}
                    disabled={!code.trim() || checkinMutation.isPending}
                    className="h-11 px-5 bg-primary hover:bg-primary/90 font-black uppercase tracking-widest text-[9px] rounded-xl shadow-lg shadow-primary/20"
                  >
                    {checkinMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </PlayerLayout>
  );
}
