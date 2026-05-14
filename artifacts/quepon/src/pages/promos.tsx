import { useState } from "react";
import { useListPromos, useListAnnouncements } from "@workspace/api-client-react";
import { PlayerLayout } from "@/components/layout/player-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ticket, Megaphone, Loader2, Gamepad2, Wrench, Tag } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const PRICING = [
  { label: "Normal PC", rate: "₱25 / hr", note: "" },
  { label: "VIP PC", rate: "₱35 / hr", note: "" },
  { label: "Overnight (10PM–7AM)", rate: "₱99 flat", note: "" },
  { label: "Student Discount", rate: "₱20 / hr", note: "Valid ID required" },
];

const GAMES = ["Valorant", "ML: Bang Bang", "DOTA 2", "CS2", "GTA V", "Fortnite", "Roblox", "COD Warzone", "FC Online", "Minecraft", "Apex Legends"];

const SERVICES = [
  { name: "Printing (B&W)", price: "₱2/page" },
  { name: "Printing (Color)", price: "₱10/page" },
  { name: "Scanning", price: "₱5/page" },
  { name: "Load up", price: "All networks" },
  { name: "GCASH Cash-in", price: "Free" },
];

const TABS = [
  { id: "all", label: "All" },
  { id: "promos", label: "Promos" },
  { id: "pricing", label: "Pricing" },
  { id: "games", label: "Games" },
  { id: "services", label: "Services" },
];

export default function Promos() {
  const [tab, setTab] = useState("all");
  const { data: promos, isLoading: loadingPromos } = useListPromos();
  const { data: announcements, isLoading: loadingAnns } = useListAnnouncements();

  const activePromos = promos?.filter(p => p.isActive)?.sort((a, b) => b.displayPriority - a.displayPriority) || [];
  const activeAnns = announcements?.filter(a => a.isActive) || [];
  const isLoading = loadingPromos || loadingAnns;

  const showPromos = tab === "all" || tab === "promos";
  const showAnnouncements = tab === "all";
  const showPricing = tab === "all" || tab === "pricing";
  const showGames = tab === "all" || tab === "games";
  const showServices = tab === "all" || tab === "services";

  return (
    <PlayerLayout>
      <div className="space-y-6 pt-4">
        <div>
          <h1 className="text-2xl font-bold font-display uppercase tracking-tight">Offers</h1>
          <p className="text-muted-foreground text-sm font-medium">Claim rewards and discounts</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                tab === t.id
                  ? "bg-primary text-white shadow-[0_0_15px_rgba(124,58,237,0.4)]"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

              {/* Hot Deal / Announcements */}
              {showAnnouncements && activeAnns.length > 0 && (
                <div className="space-y-3">
                  {activeAnns.map(ann => (
                    <Card key={ann.id} className="bg-[rgba(124,58,237,0.08)] border-[rgba(124,58,237,0.25)] border-l-4 border-l-primary overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <Megaphone className="w-4 h-4 text-primary flex-shrink-0" />
                            <span className="text-xs text-primary uppercase tracking-widest font-bold">{ann.type}</span>
                          </div>
                          <Badge variant="outline" className="border-primary/30 text-primary/70 text-[10px] uppercase">{ann.priority}</Badge>
                        </div>
                        <h3 className="font-bold text-lg">{ann.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{ann.body}</p>
                        <p className="text-[10px] text-muted-foreground/50 mt-3">{format(new Date(ann.createdAt), 'MMM d, yyyy')}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Promos */}
              {showPromos && (
                <div className="space-y-3">
                  {activePromos.length > 0 ? activePromos.map(promo => (
                    <Card key={promo.id} className="bg-gradient-to-br from-primary/10 to-transparent border-[rgba(124,58,237,0.2)]">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-2">
                          <Badge className="bg-primary/20 text-primary border-primary/30 uppercase text-[10px]">{promo.tag}</Badge>
                          {promo.endsAt && <span className="text-[10px] text-muted-foreground">{format(new Date(promo.endsAt), 'MMM d')}</span>}
                        </div>
                        <h3 className="font-bold text-lg">{promo.title}</h3>
                        <p className="text-sm text-white/70 mt-1">{promo.description}</p>
                      </CardContent>
                    </Card>
                  )) : (
                    <div className="text-center py-8 text-muted-foreground text-sm">No active promos right now.</div>
                  )}
                </div>
              )}

              {/* Pricing */}
              {showPricing && (
                <div className="space-y-3">
                  <h2 className="font-bold text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Tag className="w-4 h-4" /> Pricing
                  </h2>
                  <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]">
                    <CardContent className="p-0">
                      {PRICING.map((item, i) => (
                        <div key={i} className={cn("flex justify-between items-center px-5 py-3.5 text-sm", i < PRICING.length - 1 && "border-b border-white/5")}>
                          <div>
                            <span className="font-medium">{item.label}</span>
                            {item.note && <span className="text-[10px] text-muted-foreground ml-2">({item.note})</span>}
                          </div>
                          <span className="font-mono font-bold text-primary">{item.rate}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Games */}
              {showGames && (
                <div className="space-y-3">
                  <h2 className="font-bold text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4" /> Available Titles
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {GAMES.map(g => (
                      <span key={g} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Services */}
              {showServices && (
                <div className="space-y-3">
                  <h2 className="font-bold text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Wrench className="w-4 h-4" /> Shop Services
                  </h2>
                  <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]">
                    <CardContent className="p-0">
                      {SERVICES.map((svc, i) => (
                        <div key={i} className={cn("flex justify-between items-center px-5 py-3.5 text-sm", i < SERVICES.length - 1 && "border-b border-white/5")}>
                          <span className="font-medium">{svc.name}</span>
                          <span className="font-mono text-yellow-400 font-bold">{svc.price}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </PlayerLayout>
  );
}
