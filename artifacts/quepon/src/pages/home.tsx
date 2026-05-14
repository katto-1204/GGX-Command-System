import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { PlayerLayout } from "@/components/layout/player-layout";
import { 
  useGetPcSummary, 
  useListPromos, 
  useGetMySession
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Monitor, Clock, Wallet, Coffee, MessageSquare, Ticket, ChevronRight, Play, Zap, Shield, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { WelcomeModal } from "@/components/welcome-modal";
import { motion } from "framer-motion";
import { MembershipCard } from "@/components/membership-card";
import { PcSpecsSection } from "@/components/pc-specs-section";

const RECENT_GAMES = [
  { id: 1, name: "Valorant", image: "/POPULAR%20GAME%20CARD/valorant%20card.png", category: "FPS" },
  { id: 2, name: "Genshin Impact", image: "/POPULAR%20GAME%20CARD/genshincard.png", category: "RPG" },
  { id: 3, name: "Roblox", image: "/POPULAR%20GAME%20CARD/robloxcardred.png", category: "Sandbox" },
];

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: pcSummary } = useGetPcSummary({ query: { refetchInterval: 10000 } as any });
  const { data: promos } = useListPromos();
  const { data: mySession } = useGetMySession({ query: { refetchInterval: 10000 } as any });

  const availablePcs = pcSummary?.available || 0;

  const quickActions = [
    { icon: Monitor, label: "PCs", href: "/pcs", color: "text-blue-400", bg: "bg-blue-400/10" },
    { icon: Clock, label: "Queue", href: "/queue", color: "text-purple-400", bg: "bg-purple-400/10" },
    { icon: Wallet, label: "Wallet", href: "/wallet", color: "text-green-400", bg: "bg-green-400/10" },
    { icon: Coffee, label: "Menu", href: "/menu", color: "text-orange-400", bg: "bg-orange-400/10" },
    { icon: Ticket, label: "Promos", href: "/promos", color: "text-pink-400", bg: "bg-pink-400/10" },
    { icon: MessageSquare, label: "Support", href: "/feedback", color: "text-muted-foreground", bg: "bg-white/5" },
  ];

  const activePromos = promos?.filter(p => p.isActive) || [];

  return (
    <PlayerLayout showBreadcrumbs={false}>
      <WelcomeModal />
      
      <div className="space-y-10 pt-6 pb-24 px-1" style={{ 
        paddingTop: "calc(1.5rem + env(safe-area-inset-top))",
        paddingBottom: "calc(6rem + env(safe-area-inset-bottom))"
      }}>
        {/* 1. WALLET BALANCE (INSIDE MEMBERSHIP CARD) */}
        <MembershipCard user={user} className="mb-4" />

        {/* 2. STATIONS FREE */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/pcs" className="block h-full group">
            <div className={cn(
              "h-full rounded-[2rem] p-6 border-2 transition-all active:scale-95 flex flex-col items-center text-center relative overflow-hidden group shadow-lg",
              availablePcs > 0 
                ? "bg-card border-border hover:border-primary/50" 
                : "bg-muted border-border opacity-70"
            )}>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              {availablePcs > 0 && <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary shadow-[0_0_12px_rgba(var(--primary),1)] animate-pulse" />}
              <div className={cn(
                "text-4xl font-black font-mono mb-1 tracking-tighter transition-transform group-hover:scale-110",
                availablePcs > 0 ? "text-foreground" : "text-muted-foreground/30"
              )}>{availablePcs}</div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-black">Stations Free</div>
              <div className="mt-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-[8px] font-black uppercase tracking-widest text-primary border border-primary/20">
                {availablePcs > 0 ? "Choose PC" : "Full Fleet"}
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          </Link>

          <Link href={mySession ? "/session" : "/queue"} className="block h-full group">
            <div className={cn(
              "h-full rounded-[2rem] p-6 border-2 transition-all active:scale-95 flex flex-col items-center text-center relative overflow-hidden group shadow-lg",
              mySession 
                ? "bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/20" 
                : "bg-card border-border hover:border-primary/50"
            )}>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              {mySession ? (
                <>
                  <div className="absolute top-3 right-3"><Zap className="w-4 h-4 text-primary-foreground animate-bounce" /></div>
                  <div className="text-3xl font-black text-primary-foreground font-mono mb-1 tracking-tighter uppercase italic">{mySession.pcLabel}</div>
                  <div className="text-[9px] uppercase tracking-[0.2em] text-primary-foreground/80 font-black">Active Play</div>
                  <div className="mt-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-[8px] font-black uppercase tracking-widest text-white border border-white/20">
                    View Data <ChevronRight className="w-3 h-3" />
                  </div>
                </>
              ) : (
                <>
                  <Clock className={cn("w-10 h-10 mb-2 transition-all group-hover:text-primary group-hover:scale-110", availablePcs > 0 ? "text-muted-foreground/40" : "text-primary")} />
                  <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-black">
                    {availablePcs > 0 ? "Standby" : "Queue"}
                  </div>
                </>
              )}
            </div>
          </Link>
        </div>

        {/* 3. POPULAR GAMES */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              <div className="w-6 h-1 bg-primary rounded-full" />
              <h2 className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em]">Popular Games</h2>
            </div>
          </div>
          <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 px-1 pb-4">
            {RECENT_GAMES.map((game) => (
              <div key={game.id} className="min-w-full snap-center flex-shrink-0 group cursor-pointer">
                <div className="relative aspect-[16/9] rounded-3xl overflow-hidden border border-border mb-2 shadow-sm">
                  <img src={game.image} alt={game.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-black text-white truncate uppercase italic leading-none">{game.name}</div>
                      <div className="text-[7px] text-primary uppercase tracking-widest font-black mt-0.5">{game.category}</div>
                    </div>
                    <Button size="icon" className="w-8 h-8 rounded-full bg-primary shadow-lg shadow-primary/30"><Play className="w-3 h-3 fill-white" /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Command HUB (Moved up) */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-1 bg-primary rounded-full" />
            <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">HUB</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href}>
                  <div className="group flex flex-col items-center justify-center gap-4 p-5 rounded-[2rem] bg-card border border-border hover:border-primary/40 hover:bg-muted/50 transition-all cursor-pointer active:scale-90 shadow-sm relative overflow-hidden">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:-translate-y-1 group-hover:shadow-lg",
                      action.bg, action.color
                    )}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground group-hover:text-foreground transition-colors">{action.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 4. OFFERS (Moved down) */}
        {activePromos.length > 0 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center px-1">
              <div className="flex items-center gap-3">
                <div className="w-8 h-1 bg-primary rounded-full" />
                <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Offers</h2>
              </div>
              <Link href="/promos" className="text-[9px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-1.5 hover:translate-x-1 transition-transform">
                VIEW ALL <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 px-1">
              {activePromos.slice(0, 3).map(promo => (
                <div key={promo.id} className="min-w-full snap-center bg-card border-2 border-border rounded-[2rem] p-6 flex-shrink-0 relative overflow-hidden group shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className="inline-flex items-center px-2 py-1 rounded-lg bg-primary/20 text-primary text-[8px] font-black uppercase tracking-[0.2em] mb-4 border border-primary/20">{promo.tag || "MISSION"}</div>
                    <h3 className="font-black text-2xl mb-2 leading-none text-foreground italic tracking-tighter uppercase line-clamp-1">{promo.title}</h3>
                    <p className="text-[10px] text-muted-foreground line-clamp-2 font-bold leading-relaxed mb-6 uppercase tracking-wide">{promo.description}</p>
                    <Button variant="default" size="sm" className="rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-widest px-6 shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all text-[9px] h-10">Execute Now</Button>
                  </div>
                  <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-all group-hover:scale-110 group-hover:rotate-12 pointer-events-none">
                    <Ticket className="w-24 h-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PC SPECS SECTION */}
        <PcSpecsSection />

        {/* 4. SYSTEM RULES */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-1">
            <div className="w-6 h-1 bg-primary rounded-full" />
            <h2 className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em]">System Rules</h2>
          </div>
          <div className="bg-card/50 border border-border rounded-[2rem] p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-foreground uppercase tracking-tight">Respect the Gear</p>
                <p className="text-[9px] text-muted-foreground leading-relaxed">No food or drinks near hardware. Report any technical issues immediately to the desk.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-foreground uppercase tracking-tight">Time Management</p>
                <p className="text-[9px] text-muted-foreground leading-relaxed">Sessions are non-refundable. Extend your time before the countdown hits zero to avoid auto-logout.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-foreground uppercase tracking-tight">Fair Play</p>
                <p className="text-[9px] text-muted-foreground leading-relaxed">Any form of cheating, hacking, or malicious software installation will result in an immediate permanent ban.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PlayerLayout>
  );
}
