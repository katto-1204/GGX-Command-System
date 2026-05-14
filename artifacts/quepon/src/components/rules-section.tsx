import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Info, ShieldAlert, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const RULES = [
  "Use your assigned PC only.",
  "Do not transfer to another PC without admin approval.",
  "Keep your area clean.",
  "Report damaged equipment immediately.",
  "Respect other players and staff.",
  "No shouting, fighting, or disruptive behavior.",
  "Save your files before your session ends.",
  "The shop is not responsible for unsaved files.",
  "Food and drinks should be handled carefully near equipment.",
  "Follow admin instructions at all times."
];

export function RulesSection() {
  const [isExpanded, setIsExpanded] = useState(false);

  const displayedRules = isExpanded ? RULES : RULES.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <div className="w-8 h-1 bg-orange-500 rounded-full" />
          <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Rules</h2>
        </div>
      </div>

      <div className="bg-card border border-border rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
          <ShieldAlert className="w-24 h-24" />
        </div>
        
        <div className="space-y-4 relative z-10">
          <AnimatePresence mode="popLayout">
            {displayedRules.map((rule, index) => (
              <motion.div
                key={rule}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/8 transition-colors"
              >
                <div className="w-5 h-5 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-orange-500" />
                </div>
                <p className="text-xs font-bold text-white/80 leading-relaxed uppercase tracking-wide">
                  {rule}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <Button
          variant="ghost"
          className="w-full mt-6 h-12 rounded-2xl bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-[0.3em] text-orange-500"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Collapse List" : "View All Rules"}
          <ChevronDown className={cn("ml-2 w-4 h-4 transition-transform", isExpanded && "rotate-180")} />
        </Button>
      </div>
    </div>
  );
}
