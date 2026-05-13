import { useState } from "react";
import { useCheckinSession } from "@workspace/api-client-react";
import { PlayerLayout } from "@/components/layout/player-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrCode, Monitor, CheckCircle2, XCircle, Loader2, Camera } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Checkin() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<any>(null);
  const checkinMutation = useCheckinSession();

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
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-display">Check-In</h1>
            <p className="text-muted-foreground text-sm">Scan QR or enter session code</p>
          </div>
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/30">
            <QrCode className="w-6 h-6 text-primary" />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
              {/* QR Scanner Mock */}
              <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative h-52 flex items-center justify-center bg-black/40">
                    {/* Corner markers */}
                    <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-primary rounded-tl-sm" />
                    <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-primary rounded-tr-sm" />
                    <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-primary rounded-bl-sm" />
                    <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-primary rounded-br-sm" />
                    {/* Scan line animation */}
                    <motion.div
                      className="absolute left-6 right-6 h-0.5 bg-primary/60 shadow-[0_0_8px_rgba(124,58,237,0.8)]"
                      animate={{ top: ["25%", "75%", "25%"] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <Camera className="w-10 h-10 opacity-30" />
                      <p className="text-xs opacity-50">Position QR code within frame</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center gap-3 text-muted-foreground text-sm">
                <div className="flex-1 h-px bg-white/10" />
                <span>OR</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Manual code entry */}
              <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]">
                <CardContent className="p-5 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Session Code</label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={code}
                        onChange={e => setCode(e.target.value.toUpperCase())}
                        placeholder="GGX-XXXXXX"
                        className="font-mono text-lg tracking-widest bg-black/30 border-white/10 h-12"
                        onKeyDown={e => e.key === "Enter" && handleCheckin()}
                      />
                      <Button
                        onClick={handleCheckin}
                        disabled={!code.trim() || checkinMutation.isPending}
                        className="h-12 px-5 bg-primary hover:bg-primary/80 font-bold"
                      >
                        {checkinMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Go"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[rgba(255,193,7,0.05)] border-[rgba(255,193,7,0.2)]">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-yellow-400 mt-1.5 animate-pulse flex-shrink-0" />
                    <p className="text-xs text-yellow-300/70">
                      Awaiting counter confirmation — show your QR code or enter the session code at the front desk.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
              <Card className={`border-2 ${result.found ? "border-green-500/50 bg-green-500/5" : "border-red-500/50 bg-red-500/5"}`}>
                <CardContent className="p-8 text-center space-y-4">
                  {result.found ? (
                    <>
                      <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto" />
                      <div>
                        <h2 className="text-xl font-bold text-green-400 mb-1">Session Verified!</h2>
                        <p className="text-sm text-muted-foreground">{result.message}</p>
                      </div>
                      {result.pcLabel && (
                        <div className="flex items-center justify-center gap-2 bg-green-500/10 rounded-xl p-3 border border-green-500/20">
                          <Monitor className="w-5 h-5 text-green-400" />
                          <span className="font-bold font-mono text-green-300">{result.pcLabel}</span>
                        </div>
                      )}
                      {result.username && (
                        <p className="text-sm text-muted-foreground">Player: <span className="text-white font-medium">{result.username}</span></p>
                      )}
                    </>
                  ) : (
                    <>
                      <XCircle className="w-16 h-16 text-red-400 mx-auto" />
                      <div>
                        <h2 className="text-xl font-bold text-red-400 mb-1">Not Found</h2>
                        <p className="text-sm text-muted-foreground">{result.message}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
              <Button variant="outline" className="w-full border-white/10" onClick={handleReset}>
                Try Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PlayerLayout>
  );
}
