import { useState, useMemo } from "react";
import { Monitor, Cpu, Zap, Star, LayoutGrid, ChevronRight, HardDrive, Thermometer, Fan } from "lucide-react";
import { cn } from "@/lib/utils";
import { useListPcs } from "@workspace/api-client-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";

export function PcSpecsSection() {
  const { data: pcs } = useListPcs();
  const [selectedPc, setSelectedPc] = useState<any>(null);

  // Filter to show only one representative per category
  const representativePcs = useMemo(() => {
    const regular = pcs?.find(p => p.tier === "standard");
    const vvip = pcs?.find(p => p.tier === "vip");
    return [regular, vvip].filter(Boolean) as typeof pcs;
  }, [pcs]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <div className="w-8 h-1 bg-primary rounded-full" />
          <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">PC Specs</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {representativePcs?.map((pc, index) => (
          <motion.div
            key={pc.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setSelectedPc(pc)}
            className={cn(
              "p-6 rounded-[2.5rem] border-2 transition-all relative overflow-hidden group shadow-lg cursor-pointer active:scale-[0.98]",
              pc.tier === "vip" 
                ? "bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/30" 
                : "bg-card border-border"
            )}
          >
            <div className="flex items-start justify-between mb-8">
              <div className="space-y-1">
                <div className={cn(
                  "text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full inline-block mb-1",
                  pc.tier === "vip" ? "bg-yellow-500/20 text-yellow-400" : "bg-blue-500/10 text-blue-400"
                )}>
                  {pc.tier === "vip" ? "GOLD CLASS" : "SILVER CLASS"}
                </div>
                <h3 className={cn(
                  "text-2xl font-black font-mono tracking-tighter uppercase italic",
                  pc.tier === "vip" ? "text-yellow-400" : "text-foreground"
                )}>
                  {pc.tier === "vip" ? "VVIP" : "REGULAR"}
                </h3>
              </div>
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center",
                pc.tier === "vip" ? "bg-yellow-500/20 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.2)]" : "bg-blue-500/10 text-blue-400"
              )}>
                {pc.tier === "vip" ? <Star className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SpecItem icon={Cpu} label="CPU" value={pc.specs?.cpu || "N/A"} isVip={pc.tier === "vip"} />
              <SpecItem icon={LayoutGrid} label="GPU" value={pc.specs?.gpu || "N/A"} isVip={pc.tier === "vip"} />
              <SpecItem icon={Zap} label="RAM" value={pc.specs?.ram || "N/A"} isVip={pc.tier === "vip"} />
              <SpecItem icon={Monitor} label="DISPLAY" value={pc.specs?.monitor || "N/A"} isVip={pc.tier === "vip"} />
            </div>
          </motion.div>
        ))}
      </div>

      <Dialog open={!!selectedPc} onOpenChange={() => setSelectedPc(null)}>
        <DialogContent className="bg-card/95 backdrop-blur-2xl border-border rounded-[2.5rem] max-w-sm sm:max-w-md p-0 overflow-hidden shadow-2xl">
          {selectedPc && (
            <>
              <div className="h-2 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
              <DialogHeader className="p-8 pb-4">
                <DialogTitle className="text-3xl font-black font-display italic uppercase tracking-tighter text-foreground">
                  {selectedPc.label} <span className="text-primary">SPECIFICATIONS</span>
                </DialogTitle>
                <DialogDescription className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-2">
                  Hardware Specifications
                </DialogDescription>
              </DialogHeader>

              <div className="px-8 pb-10 space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <DetailItem icon={Cpu} label="Processor" value={selectedPc.specs?.cpu || "N/A"} subValue="High Performance Core" />
                  <DetailItem icon={Zap} label="Graphics Card" value={selectedPc.specs?.gpu || "N/A"} subValue="High Fidelity Visuals" />
                  <DetailItem icon={LayoutGrid} label="Memory" value={selectedPc.specs?.ram || "N/A"} subValue="Low Latency DDR" />
                  <DetailItem icon={Monitor} label="Visual Output" value={selectedPc.specs?.monitor || "N/A"} subValue="High Refresh Rate" />
                  <DetailItem icon={HardDrive} label="Storage" value={selectedPc.specs?.storage || "NVMe Gen4 SSD"} subValue="Extreme Read/Write" />
                </div>

                <div className="flex gap-4 p-4 rounded-2xl bg-muted/50 border border-border">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 text-primary">
                      <Thermometer className="w-3 h-3" />
                      <span className="text-[8px] font-black uppercase tracking-widest">Thermals</span>
                    </div>
                    <div className="text-xs font-black text-foreground">Optimized</div>
                  </div>
                  <div className="w-px bg-border" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 text-primary">
                      <Fan className="w-3 h-3" />
                      <span className="text-[8px] font-black uppercase tracking-widest">Cooling</span>
                    </div>
                    <div className="text-xs font-black text-foreground">Liquid Tech</div>
                  </div>
                </div>

                <div className="pt-2">
                  <div className={cn(
                    "w-full py-4 rounded-2xl text-center font-black uppercase tracking-[0.2em] text-[10px] border",
                    selectedPc.status === 'available' ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-red-500/10 border-red-500/20 text-red-500"
                  )}>
                    Station {selectedPc.status}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value, subValue }: { icon: any, label: string, value: string, subValue: string }) {
  return (
    <div className="flex items-center gap-5 p-4 rounded-2xl bg-muted/30 border border-border/50">
      <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">{label}</div>
        <div className="text-sm font-black text-foreground uppercase truncate tracking-tight">{value}</div>
        <div className="text-[8px] font-medium text-primary/70 uppercase tracking-widest">{subValue}</div>
      </div>
    </div>
  );
}

function SpecItem({ icon: Icon, label, value, isVip }: { icon: any, label: string, value: string, isVip?: boolean }) {
  return (
    <div className="space-y-2 p-3 rounded-2xl bg-background/40 border border-border/50 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <Icon className={cn("w-3 h-3", isVip ? "text-yellow-500" : "text-primary")} />
        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">{label}</span>
      </div>
      <div className={cn(
        "text-[10px] font-black uppercase truncate",
        isVip ? "text-yellow-400" : "text-foreground"
      )}>{value}</div>
    </div>
  );
}
