import { motion } from "framer-motion";
import { Monitor, Clock, Zap, Wallet, ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";

interface QrTrackingViewProps {
  session: any;
  remainingSeconds: number | null;
}

export function QrTrackingView({ session, remainingSeconds }: QrTrackingViewProps) {
  const [, setLocation] = useLocation();
  const durationSeconds = Number(session.durationSeconds || 0);
  const elapsedSeconds = durationSeconds > 0 && remainingSeconds != null
    ? Math.max(0, durationSeconds - remainingSeconds)
    : Number(session.elapsedSeconds || 0);
  const allocatedAmount = Number(session.allocatedAmount ?? session.maxCost ?? Infinity);
  const spent = Math.min((elapsedSeconds / 3600) * Number(session.ratePerHour || 0), allocatedAmount);

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return "00:00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime = remainingSeconds != null && remainingSeconds < 300;
  const isMediumTime = remainingSeconds != null && remainingSeconds >= 300 && remainingSeconds < 600;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Active Session Status Card */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-card border border-border p-6 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32 pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-primary animate-pulse" />
              <span className="text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">Uplink Active</span>
            </div>
            <h1 className="text-xl font-black font-display tracking-tight text-foreground leading-none italic uppercase">
              QUE-TRACKING
            </h1>
            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-green-500">
              ENGAGED — STATION {session.pcLabel}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
            <Monitor className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Monitoring Card */}
      <Card className={cn(
        "bg-card border-2 rounded-[2.5rem] overflow-hidden transition-all shadow-2xl relative",
        isLowTime 
          ? "border-red-500/50 shadow-red-500/20" 
          : isMediumTime 
            ? "border-yellow-500/50 shadow-yellow-500/20" 
            : "border-border shadow-primary/5"
      )}>
        {isLowTime && (
          <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none" />
        )}
        <CardContent className="p-8 text-center flex flex-col items-center">
          <div className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.5em] mb-4 italic">Time Remaining</div>
          <div className={cn(
            "text-[4rem] sm:text-[5rem] font-black font-mono mb-8 tracking-tighter leading-none italic w-full overflow-hidden",
            isLowTime 
              ? "text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]" 
              : isMediumTime 
                ? "text-yellow-500 drop-shadow-[0_0_30px_rgba(234,179,8,0.3)]" 
                : "text-foreground drop-shadow-[0_0_20px_rgba(255,255,255,0.08)]"
          )}>
            {formatTime(remainingSeconds || 0)}
          </div>

          <div className="grid grid-cols-2 gap-4 w-full mb-8">
            <div className="bg-background/40 rounded-2xl p-4 border border-border/50 shadow-inner text-left">
              <div className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1.5 flex items-center gap-1.5">
                <Shield className="w-3 h-3" /> Station
              </div>
              <div className="font-mono text-xl font-black italic text-foreground leading-none">{session.pcLabel}</div>
            </div>
            <div className="bg-background/40 rounded-2xl p-4 border border-border/50 shadow-inner text-left">
              <div className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1.5 flex items-center gap-1.5">
                <Wallet className="w-3 h-3" /> Spent
              </div>
              <div className="font-mono text-xl font-black italic text-green-500 leading-none">₱{spent.toFixed(2)}</div>
            </div>
          </div>

          {/* Verification QR */}
          {session.sessionCode && (
            <div className="w-full bg-background/40 rounded-[1.5rem] p-5 border border-primary/20 shadow-inner mb-8">
              <div className="flex items-center gap-5">
                <div className="bg-white p-2.5 rounded-xl shadow-lg flex-shrink-0">
                  <QRCodeSVG value={session.sessionCode} size={84} level="H" />
                </div>
                <div className="flex-1 text-left space-y-1.5 min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 italic">Verification QR</p>
                  <p className="text-base font-black font-mono text-primary tracking-wider break-all leading-tight">{session.sessionCode}</p>
                  <p className="text-[8px] text-muted-foreground/40 italic uppercase tracking-widest leading-relaxed">System identity confirmed</p>
                </div>
              </div>
            </div>
          )}

          <Button 
            className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black tracking-[0.3em] uppercase shadow-2xl shadow-primary/30 transition-all active:scale-[0.97] text-xs group border border-white/10" 
            onClick={() => setLocation("/session")}
          >
            Terminal Dashboard
            <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1.5 transition-transform" />
          </Button>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-2 text-muted-foreground/30">
        <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
        <span className="text-[8px] font-black uppercase tracking-[0.3em]">Hardware Link Synchronized</span>
      </div>
    </motion.div>
  );
}
