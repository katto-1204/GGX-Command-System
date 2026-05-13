import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { PlayerLayout } from "@/components/layout/player-layout";
import { 
  useGetPcSummary, 
  useListPromos, 
  useGetDashboardStats,
  useGetMySession
} from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Monitor, Clock, Wallet, Coffee, MessageSquare, Ticket, ChevronRight, Play, Star, TrendingUp, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { WelcomeModal } from "@/components/welcome-modal";
import { motion } from "framer-motion";

const RECENT_GAMES = [
  { id: 1, name: "Valorant", image: "https://images.unsplash.com/photo-1624138784614-87fd1b6528f2?q=80&w=200&h=280&auto=format&fit=crop", category: "FPS" },
  { id: 2, name: "Dota 2", image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=200&h=280&auto=format&fit=crop", category: "MOBA" },
  { id: 3, name: "LoL", image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=200&h=280&auto=format&fit=crop", category: "MOBA" },
  { id: 4, name: "CS2", image: "https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=200&h=280&auto=format&fit=crop", category: "FPS" },
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
      
      <div className="space-y-10 pt-6 pb-12">
        {/* Hero Banner Section */}
        <div className="relative h-[240px] rounded-[3rem] overflow-hidden border border-border group shadow-2xl">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img 
              src="/gaming_home_hero_1778711412356.png" 
              alt="Gaming Hero" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-transparent" />
          </div>

          <div className="relative z-10 p-8 h-full flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/60">System Online</span>
              </div>
              <h1 className="text-4xl font-black font-display tracking-tighter text-foreground leading-none italic">
                WELCOME <span className="text-primary">COMMANDER</span>
              </h1>
              <p className="text-muted-foreground text-xs font-black uppercase tracking-[0.2em]">{user?.displayName || user?.username}</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="bg-card/40 backdrop-blur-xl border border-border rounded-2xl px-5 py-3 shadow-sm">
                <div className="text-[8px] uppercase tracking-[0.3em] text-muted-foreground font-black mb-1">Wallet Balance</div>
                <div className="text-2xl font-black text-foreground font-mono tracking-tighter leading-none">₱{(user?.walletBalance || 0).toFixed(2)}</div>
              </div>
              <Link href="/wallet">
                <Button size="icon" className="w-14 h-14 rounded-2xl bg-primary shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-90 border-2 border-white/10">
                  <Wallet className="w-7 h-7" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Real-time Status Grid */}
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

        {/* Command Grid */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-1 bg-primary rounded-full" />
            <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Operations Hub</h2>
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

        {/* Recent Games - Swipable Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              <div className="w-8 h-1 bg-primary rounded-full" />
              <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Battle Zone</h2>
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

        {/* Promo Banner */}
        {activePromos.length > 0 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center px-1">
              <div className="flex items-center gap-3">
                <div className="w-8 h-1 bg-primary rounded-full" />
                <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Tactical Offers</h2>
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
      </div>
    </PlayerLayout>

  );
}
