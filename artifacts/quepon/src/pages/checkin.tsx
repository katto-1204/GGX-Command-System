import { useState } from "react";
import { useCheckinSession } from "@workspace/api-client-react";
import { PlayerLayout } from "@/components/layout/player-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrCode, Monitor, CheckCircle2, XCircle, Loader2, Camera, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";

export default function Checkin() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<any>(null);
  const checkinMutation = useCheckinSession();
  const [, setLocation] = useLocation();

  const handleCheckin = () => {
    if (!code.trim()) return;
    checkinMutation.mutate({ data: { sessionCode: code.trim() } }, {
      onSuccess: (data) => setResult(data),
      onError: () => setResult({ found: false, message: "Error verifying code. Try again." }),
    });
  };

  const handleReset = () => {
    setResult(null);
    setCode("");
  };

  return (
    <PlayerLayout>
      <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-display uppercase tracking-tight text-foreground">
              SYNC <span className="text-primary">DEVICE</span>
            </h1>
            <p className="text-muted-foreground text-xs uppercase tracking-widest mt-1">Initialize hardware uplink</p>
          </div>
          <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.2)]">
            <QrCode className="w-6 h-6 text-primary" />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
              {/* QR Scanner Mock */}
              <Card className="bg-card border-border shadow-xl overflow-hidden rounded-3xl relative group">
                <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                <CardContent className="p-0">
                  <div className="relative h-64 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    {/* Corner markers */}
                    <div className="absolute top-6 left-6 w-12 h-12 border-t-2 border-l-2 border-primary rounded-tl-xl" />
                    <div className="absolute top-6 right-6 w-12 h-12 border-t-2 border-r-2 border-primary rounded-tr-xl" />
                    <div className="absolute bottom-6 left-6 w-12 h-12 border-b-2 border-l-2 border-primary rounded-bl-xl" />
                    <div className="absolute bottom-6 right-6 w-12 h-12 border-b-2 border-r-2 border-primary rounded-br-xl" />
                    {/* Scan line animation */}
                    <motion.div
                      className="absolute left-8 right-8 h-0.5 bg-primary shadow-[0_0_12px_rgba(var(--primary),1)]"
                      animate={{ top: ["20%", "80%", "20%"] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="flex flex-col items-center gap-4 text-muted-foreground relative z-10">
                      <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md">
                        <Camera className="w-8 h-8 opacity-70" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Awaiting visual lock</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center gap-3 text-muted-foreground text-[10px] font-black uppercase tracking-widest my-6">
                <div className="flex-1 h-px bg-border" />
                <span>Manual Override</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Manual code entry */}
              <Card className="bg-card border-border shadow-xl rounded-3xl">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Access Protocol Code</label>
                    <div className="flex gap-3 mt-3">
                      <Input
                        value={code}
                        onChange={e => setCode(e.target.value.toUpperCase())}
                        placeholder="GGX-PC1+USERNAME"
                        className="font-mono text-lg tracking-[0.2em] bg-muted/50 border-border h-14 rounded-2xl focus:border-primary/50 text-center"
                        onKeyDown={e => e.key === "Enter" && handleCheckin()}
                      />
                      <Button
                        onClick={handleCheckin}
                        disabled={!code.trim() || checkinMutation.isPending}
                        className="h-14 px-6 bg-primary hover:bg-primary/90 font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-[0_5px_15px_rgba(var(--primary),0.2)]"
                      >
                        {checkinMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Link"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
              <Card className={`border shadow-2xl rounded-[2.5rem] overflow-hidden ${result.found ? "border-green-500/30 bg-card" : "border-red-500/30 bg-card"}`}>
                <div className={`absolute top-0 left-0 w-full h-1 ${result.found ? "bg-green-500" : "bg-red-500"}`} />
                <CardContent className="p-10 text-center space-y-6 relative">
                  <div className={`absolute inset-0 opacity-5 pointer-events-none blur-3xl ${result.found ? "bg-green-500" : "bg-red-500"}`} />
                  
                  {result.found ? (
                    <>
                      <div className="w-24 h-24 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto relative">
                        <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full animate-pulse" />
                        <CheckCircle2 className="w-12 h-12 text-green-500 relative z-10" />
                      </div>
                      
                      <div>
                        <h2 className="text-2xl font-black font-display text-green-500 tracking-tight mb-2">UPLINK ESTABLISHED</h2>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{result.message}</p>
                      </div>

                      {result.pcLabel && (
                        <div className="inline-flex items-center justify-center gap-3 bg-muted/50 rounded-2xl p-4 border border-border mx-auto min-w-[200px]">
                          <Monitor className="w-5 h-5 text-primary" />
                          <div className="text-left">
                            <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Active Rig</div>
                            <span className="font-black font-mono text-foreground tracking-widest text-lg">{result.pcLabel}</span>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto relative">
                        <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full animate-pulse" />
                        <XCircle className="w-12 h-12 text-red-500 relative z-10" />
                      </div>

                      <div>
                        <h2 className="text-2xl font-black font-display text-red-500 tracking-tight mb-2">UPLINK FAILED</h2>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{result.message}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {result.found ? (
                <Button 
                  className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black tracking-widest uppercase shadow-[0_10px_25px_rgba(var(--primary),0.3)] hover:shadow-[0_15px_35px_rgba(var(--primary),0.4)] transition-all active:scale-95 text-xs group" 
                  onClick={() => setLocation("/session")}
                >
                  Enter Active Session
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full h-14 rounded-2xl border-border bg-muted/30 font-black tracking-widest uppercase text-[10px]" 
                  onClick={handleReset}
                >
                  Reboot Scanner
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PlayerLayout>
  );
}
