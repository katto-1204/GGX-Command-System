import { useState } from "react";
import { useListPcs } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { PlayerLayout } from "@/components/layout/player-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Monitor, Search, ChevronRight, Clock, Cpu, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const STATUS_CONFIG = {
  available: { label: "Available", color: "border-green-500 text-green-500", dot: "bg-green-500", bar: "bg-green-500" },
  inUse: { label: "In Use", color: "border-red-500 text-red-500", dot: "bg-red-500", bar: "bg-red-500" },
  maintenance: { label: "Maintenance", color: "border-yellow-500 text-yellow-500", dot: "bg-yellow-500", bar: "bg-yellow-500" },
  reserved: { label: "Reserved", color: "border-purple-500 text-purple-500", dot: "bg-purple-500", bar: "bg-purple-500" },
  offline: { label: "Offline", color: "border-gray-500 text-gray-500", dot: "bg-gray-500", bar: "bg-gray-500" },
};

const TIER_CONFIG = {
  standard: { label: "Standard", color: "text-blue-400" },
  premium: { label: "Premium", color: "text-purple-400" },
  vip: { label: "VIP", color: "text-yellow-400" },
};

export default function Pcs() {
  const { data: pcs, isLoading } = useListPcs({ query: { refetchInterval: 10000 } as any });
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const availablePcs = pcs?.filter(p => p.status === "available") ?? [];
  const hasAvailable = availablePcs.length > 0;

  const filtered = (pcs ?? []).filter(pc => {
    const matchesSearch = !search || pc.label.toLowerCase().includes(search.toLowerCase()) ||
      pc.tier.toLowerCase().includes(search.toLowerCase()) ||
      (pc.specs?.gpu ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || pc.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <PlayerLayout>
      <div className="space-y-5 pt-4">
        <div>
          <h1 className="text-2xl font-bold font-display">PCs</h1>
          <p className="text-muted-foreground text-sm">
            {hasAvailable
              ? <span className="text-green-400 font-medium">{availablePcs.length} PC{availablePcs.length !== 1 ? "s" : ""} available — pick yours!</span>
              : <span className="text-yellow-400">All PCs in use — join the queue</span>}
          </p>
        </div>

        {!hasAvailable && (
          <Card className="bg-yellow-500/5 border-yellow-500/30">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">All PCs occupied</p>
                <p className="text-xs text-muted-foreground">Join the queue and we'll notify you</p>
              </div>
              <Button size="sm" onClick={() => setLocation("/queue")} className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold">
                Join Queue <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by PC, tier, GPU..."
            className="pl-9 bg-black/20 border-white/10"
          />
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {["all", "available", "inUse", "maintenance"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all border",
                filter === f
                  ? "bg-primary/20 text-primary border-primary/50"
                  : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10"
              )}
            >
              {f === "all" ? "All" : f === "inUse" ? "In Use" : f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== "all" && <span className="ml-1.5 opacity-60">{(pcs ?? []).filter(p => p.status === f).length}</span>}
            </button>
          ))}
        </div>

        {/* PC Grid */}
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((pc, i) => {
            const cfg = STATUS_CONFIG[pc.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.offline;
            const tierCfg = TIER_CONFIG[pc.tier as keyof typeof TIER_CONFIG] ?? { label: pc.tier, color: "text-muted-foreground" };
            const isAvailable = pc.status === "available";

            return (
              <motion.div key={pc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className={cn(
                  "relative overflow-hidden transition-all",
                  isAvailable
                    ? "bg-[rgba(34,197,94,0.05)] border-green-500/30 cursor-pointer hover:border-green-500/60 hover:shadow-[0_0_20px_rgba(34,197,94,0.1)]"
                    : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]"
                )}>
                  <div className={`absolute top-0 left-0 w-full h-0.5 ${cfg.bar}`} />
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${cfg.dot} ${isAvailable ? "animate-pulse" : ""}`} />
                        <span className="font-bold font-mono">{pc.label}</span>
                      </div>
                      <Badge variant="outline" className={`text-[10px] ${cfg.color}`}>{cfg.label}</Badge>
                    </div>

                    <div className="space-y-1">
                      <div className={`text-xs font-bold ${tierCfg.color}`}>{tierCfg.label}</div>
                      {pc.specs?.gpu && (
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Zap className="w-3 h-3" /> {pc.specs.gpu}
                        </div>
                      )}
                      {pc.specs?.cpu && (
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Cpu className="w-3 h-3" /> {pc.specs.cpu}
                        </div>
                      )}
                      {pc.status === "inUse" && pc.remainingSeconds != null && (
                        <div className="flex items-center gap-1 text-[10px] font-mono text-red-400 mt-1">
                          <Clock className="w-3 h-3" /> {Math.floor(pc.remainingSeconds / 60)}m left
                        </div>
                      )}
                    </div>

                    {isAvailable && (
                      <Button size="sm" className="w-full h-7 text-xs bg-green-500 hover:bg-green-400 text-black font-bold" onClick={() => setLocation(`/queue?pc=${pc.id}&tier=${pc.tier}`)}>
                        Book Now
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && !isLoading && (
          <div className="text-center py-12 text-muted-foreground">
            <Monitor className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No PCs match your search</p>
          </div>
        )}
      </div>
    </PlayerLayout>
  );
}
