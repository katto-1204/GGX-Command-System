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
import { Monitor, Clock, Wallet, Coffee, MessageSquare, Ticket, ChevronRight, Play, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { WelcomeModal } from "@/components/welcome-modal";
import { motion } from "framer-motion";
import { MembershipCard } from "@/components/membership-card";
import { RulesSection } from "@/components/rules-section";
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
      
      <div className="space-y-12 pt-6 pb-24 px-1" style={{ 
        paddingTop: "calc(1.5rem + env(safe-area-inset-top))",
        paddingBottom: "calc(6rem + env(safe-area-inset-bottom))"
      }}>
        {/* Header Greeting */}
        <div className="space-y-1 mb-2 px-1">
          <h1 className="text-4xl font-black font-display tracking-tighter text-foreground leading-none italic uppercase">
            {user?.displayName || user?.username}
          </h1>
          <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em]">Player Hub Access</p>
        </div>

        {/* 1. WALLET BALANCE (INSIDE MEMBERSHIP CARD) */}
        <MembershipCard user={user} className="mb-4" />

        {/* 2. sTATIONS FREE */}
        <div className="grid grid-cols-2 gap-5">
          <Link href="/pcs" className="block h-full group">
            <div className={cn(
              "h-full rounded-[2.5rem] p-7 border-2 transition-all active:scale-95 flex flex-col items-center text-center relative overflow-hidden group shadow-lg",
              availablePcs > 0 
                ? "bg-card border-border hover:border-primary/50" 
                : "bg-muted border-border opacity-70"
            )}>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              {availablePcs > 0 && <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary shadow-[0_0_12px_rgba(var(--primary),1)] animate-pulse" />}
              <div className={cn(
                "text-5xl font-black font-mono mb-2 tracking-tighter transition-transform group-hover:scale-110",
                availablePcs > 0 ? "text-foreground" : "text-muted-foreground/30"
              )}>{availablePcs}</div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-black">Stations Free</div>
              <div className="mt-6 flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/10 text-[9px] font-black uppercase tracking-widest text-primary border border-primary/20">
                {availablePcs > 0 ? "Select Unit" : "Full Fleet"}
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          </Link>

          <Link href={mySession ? "/session" : "/queue"} className="block h-full group">
            <div className={cn(
              "h-full rounded-[2.5rem] p-7 border-2 transition-all active:scale-95 flex flex-col items-center text-center relative overflow-hidden group shadow-lg",
              mySession 
                ? "bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/20" 
                : "bg-card border-border hover:border-primary/50"
            )}>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              {mySession ? (
                <>
                  <div className="absolute top-4 right-4"><Zap className="w-5 h-5 text-primary-foreground animate-bounce" /></div>
                  <div className="text-4xl font-black text-primary-foreground font-mono mb-2 tracking-tighter uppercase italic">{mySession.pcLabel}</div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-primary-foreground/80 font-black">Active Play</div>
                  <div className="mt-6 flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/20 text-[9px] font-black uppercase tracking-widest text-white border border-white/20">
                    View Data <ChevronRight className="w-3 h-3" />
                  </div>
                </>
              ) : (
                <>
                  <Clock className={cn("w-12 h-12 mb-4 transition-all group-hover:text-primary group-hover:scale-110", availablePcs > 0 ? "text-muted-foreground/40" : "text-primary")} />
                  <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-black">
                    {availablePcs > 0 ? "Standby Mode" : "Queue Portal"}
                  </div>
                  <div className="mt-4 text-[9px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-primary" />
                    {availablePcs > 0 ? "Direct Entry" : "Join Waitlist"}
                  </div>
                </>
              )}
            </div>
          </Link>
        </div>

        {/* Command Hub */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-1 bg-primary rounded-full" />
            <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Hub</h2>
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

        {/* 3. POPULAR GAMES */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              <div className="w-8 h-1 bg-primary rounded-full" />
              <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Popular Games</h2>
            </div>
          </div>
          <div className="flex overflow-x-auto space-x-5 snap-x hide-scrollbar px-1 pb-4">
            {RECENT_GAMES.map((game) => (
              <div key={game.id} className="min-w-[150px] snap-center flex-shrink-0 group cursor-pointer">
                <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden border border-border mb-3 shadow-md">
                  <img src={game.image} alt={game.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <Button size="icon" className="w-10 h-10 rounded-full bg-primary shadow-xl shadow-primary/30"><Play className="w-5 h-5 fill-white" /></Button>
                  </div>
                </div>
                <div className="px-2">
                  <div className="text-sm font-black text-foreground truncate uppercase italic">{game.name}</div>
                  <div className="text-[9px] text-muted-foreground uppercase tracking-widest font-black mt-0.5">{game.category}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. OFFERS */}
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
            <div className="flex overflow-x-auto space-x-5 snap-x hide-scrollbar px-1">
              {activePromos.slice(0, 3).map(promo => (
                <div key={promo.id} className="min-w-[90%] snap-center bg-card border-2 border-border rounded-[2.5rem] p-10 flex-shrink-0 relative overflow-hidden group shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className="inline-flex items-center px-3 py-1.5 rounded-xl bg-primary/20 text-primary text-[9px] font-black uppercase tracking-[0.3em] mb-5 border border-primary/20">{promo.tag || "MISSION"}</div>
                    <h3 className="font-black text-3xl mb-3 leading-none text-foreground italic tracking-tighter uppercase">{promo.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 font-bold leading-relaxed mb-8 uppercase tracking-wide">{promo.description}</p>
                    <Button variant="default" size="lg" className="rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest px-8 shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all">Execute Now</Button>
                  </div>
                  <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.08] transition-all group-hover:scale-110 group-hover:rotate-12 pointer-events-none">
                    <Ticket className="w-32 h-32" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PC SPECS SECTION */}
        <PcSpecsSection />

        {/* GENERAL RULES SECTION */}
        <RulesSection />
      </div>
    </PlayerLayout>
  );
}
