import { useListPcs } from "@workspace/api-client-react";
import { PlayerLayout } from "@/components/layout/player-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Monitor } from "lucide-react";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PcStatus } from "@workspace/api-client-react";

export default function Pcs() {
  const { data: pcs } = useListPcs({ query: { refetchInterval: 10000 } as any });
  const [filter, setFilter] = useState<string>("all");

  const filteredPcs = pcs?.filter(pc => filter === "all" || pc.status === filter) || [];

  return (
    <PlayerLayout>
      <div className="space-y-6 pt-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold font-display">PCs</h1>
            <p className="text-muted-foreground text-sm">Real-time availability</p>
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[140px] bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)]">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="inUse">In Use</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {filteredPcs.map(pc => (
            <Card key={pc.id} className="bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] backdrop-blur-sm relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-full h-1 ${
                pc.status === "available" ? "bg-green-500" :
                pc.status === "inUse" ? "bg-red-500" :
                pc.status === "maintenance" ? "bg-yellow-500" :
                pc.status === "reserved" ? "bg-purple-500" : "bg-gray-500"
              }`} />
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-muted-foreground" />
                    <span className="font-bold font-mono text-lg">{pc.label}</span>
                  </div>
                  <Badge variant="outline" className={
                    pc.status === "available" ? "border-green-500 text-green-500" :
                    pc.status === "inUse" ? "border-red-500 text-red-500" :
                    pc.status === "maintenance" ? "border-yellow-500 text-yellow-500" :
                    pc.status === "reserved" ? "border-purple-500 text-purple-500" : "border-gray-500 text-gray-500"
                  }>
                    {pc.status}
                  </Badge>
                </div>
                
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Tier: <span className="text-foreground capitalize">{pc.tier}</span></div>
                  {pc.specs?.gpu && <div className="text-xs text-muted-foreground truncate">GPU: {pc.specs.gpu}</div>}
                  {pc.status === "inUse" && pc.remainingSeconds && (
                    <div className="text-xs font-mono text-red-400 mt-2">
                      Time: {Math.floor(pc.remainingSeconds / 60)}m remaining
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PlayerLayout>
  );
}
