import { useState } from "react";
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

export function PcSpecsSection() {
  const { data: pcs } = useListPcs();
  const [selectedPc, setSelectedPc] = useState<any>(null);

  // Take top 4 PCs for the home screen preview
  const previewPcs = pcs?.slice(0, 4) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <div className="w-8 h-1 bg-primary rounded-full" />
          <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">GGX PC Specs</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {previewPcs.map((pc, index) => (
          <motion.div
            key={pc.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setSelectedPc(pc)}
            className="group relative bg-card border border-border rounded-[2rem] p-6 hover:border-primary/40 transition-all shadow-lg overflow-hidden cursor-pointer active:scale-95"
          >
            <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:scale-110 transition-transform">
              <Monitor className="w-16 h-16" />
            </div>

            <div className="flex justify-between items-start mb-6">
              <div className="space-y-1">
                <h3 className="text-xl font-black text-foreground font-display italic uppercase tracking-tighter">{pc.label}</h3>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-primary/10 border border-primary/20">
                  <div className={cn("w-1 h-1 rounded-full animate-pulse", pc.status === 'available' ? 'bg-green-500' : 'bg-red-500')} />
                  <span className="text-[8px] font-black text-primary uppercase tracking-widest">{pc.status}</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center">
                <Monitor className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-3">
              <SpecItem icon={Cpu} label="CPU" value={pc.specs?.cpu || "N/A"} />
              <SpecItem icon={LayoutGrid} label="RAM" value={pc.specs?.ram || "N/A"} />
              <SpecItem icon={Zap} label="GPU" value={pc.specs?.gpu || "N/A"} />
              <SpecItem icon={Monitor} label="MON" value={pc.specs?.monitor || "N/A"} />
            </div>
            
            <div className="mt-6 pt-4 border-t border-border flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest italic">Full Terminal Specs</span>
              <ChevronRight className="w-4 h-4 text-primary" />
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
                  {selectedPc.label} <span className="text-primary">CORE SPEC</span>
                </DialogTitle>
                <DialogDescription className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-2">
                  Full hardware telemetry for terminal session
                </DialogDescription>
              </DialogHeader>

              <div className="px-8 pb-10 space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <DetailItem icon={Cpu} label="Processor" value={selectedPc.specs?.cpu || "N/A"} subValue="High Performance Core" />
                  <DetailItem icon={Zap} label="Graphics Card" value={selectedPc.specs?.gpu || "N/A"} subValue="RTX Enabled Tech" />
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

function SpecItem({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center flex-shrink-0">
        <Icon className="w-3 h-3 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-0.5">{label}</div>
        <div className="text-[10px] font-bold text-white/90 uppercase truncate">{value}</div>
      </div>
    </div>
  );
}
