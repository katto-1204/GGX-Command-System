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
import { Monitor, Clock, Wallet, Coffee, MessageSquare, Ticket, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: pcSummary } = useGetPcSummary({ query: { refetchInterval: 10000 } as any });
  const { data: promos } = useListPromos();
  const { data: mySession } = useGetMySession({ query: { refetchInterval: 10000 } as any });

  const availablePcs = pcSummary?.available || 0;

  const quickActions = [
    { icon: Monitor, label: "View PCs", href: "/pcs", color: "text-blue-400", bg: "bg-blue-400/10" },
    { icon: Clock, label: "Join Queue", href: "/queue", color: "text-purple-400", bg: "bg-purple-400/10" },
    { icon: Wallet, label: "Wallet", href: "/wallet", color: "text-green-400", bg: "bg-green-400/10" },
    { icon: Coffee, label: "Menu", href: "/menu", color: "text-orange-400", bg: "bg-orange-400/10" },
    { icon: Ticket, label: "Promos", href: "/promos", color: "text-pink-400", bg: "bg-pink-400/10" },
    { icon: MessageSquare, label: "Feedback", href: "/feedback", color: "text-muted-foreground", bg: "bg-white/5" },
  ];

  const activePromos = promos?.filter(p => p.isActive) || [];

  return (
    <PlayerLayout showBreadcrumbs={false}>
      <div className="space-y-8 pt-4">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/20 p-6">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold font-display tracking-tight mb-1">
              Hello, <span className="text-primary">{user?.displayName || user?.username}</span>
            </h1>
            <p className="text-muted-foreground">Ready for a legendary session?</p>
            
            <div className="mt-6 flex items-end justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-1">Credits Available</div>
                <div className="text-2xl font-bold text-foreground font-mono">₱{(user?.walletBalance || 0).toFixed(2)}</div>
              </div>
              <Link href="/wallet">
                <Button size="sm" className="rounded-full shadow-lg shadow-primary/20">Top-up</Button>
              </Link>
            </div>
          </div>
          {/* Decorative element */}
          <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-primary/20 blur-[60px] rounded-full" />
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/pcs" className="block h-full">
            <Card className={cn(
              "h-full border-[rgba(255,255,255,0.08)] backdrop-blur-md transition-all active:scale-95",
              availablePcs > 0 ? "bg-green-500/5 hover:bg-green-500/10 border-green-500/20" : "bg-red-500/5 border-red-500/10 opacity-60"
            )}>
              <CardContent className="p-5 flex flex-col items-center justify-center text-center">
                <div className={cn(
                  "text-4xl font-black font-mono mb-1",
                  availablePcs > 0 ? "text-green-400" : "text-red-400"
                )}>{availablePcs}</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">PCs Available</div>
                <div className="mt-2 text-[10px] text-primary font-bold flex items-center gap-1">
                  Book Now <ChevronRight className="w-2.5 h-2.5" />
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link href={mySession ? "/session" : "/queue"} className="block h-full">
            <Card 
              className={cn(
                "h-full border-[rgba(124,58,237,0.2)] backdrop-blur-md transition-all active:scale-95",
                mySession ? "bg-primary/20 border-primary/40" : "bg-primary/5 hover:bg-primary/10"
              )}
            >
              <CardContent className="p-5 flex flex-col items-center justify-center text-center">
                {mySession ? (
                  <>
                    <div className="text-2xl font-black text-primary font-mono mb-1">{mySession.pcLabel}</div>
                    <div className="text-[10px] uppercase tracking-widest text-primary/80 font-bold">Active Playing</div>
                    <div className="mt-2 text-[10px] text-primary font-bold flex items-center gap-1">
                      Details <ChevronRight className="w-2.5 h-2.5" />
                    </div>
                  </>
                ) : (
                  <>
                    <Clock className="w-10 h-10 text-primary mb-2 opacity-80" />
                    <div className="text-sm font-bold text-primary uppercase tracking-widest">
                      {availablePcs > 0 ? "Enter Queue" : "Join Waitlist"}
                    </div>
                    <div className="mt-1 text-[10px] text-muted-foreground font-medium">Estimated: 5m</div>
                  </>
                )}
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Quick Actions Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Command Grid</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href}>
                  <div className="group flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:bg-white/5 hover:border-primary/30 transition-all cursor-pointer active:scale-90">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                      action.bg, action.color
                    )}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">{action.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Promo Banner */}
        {activePromos.length > 0 && (
          <div className="space-y-4 pb-12">
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Limited Deals</h2>
              <Link href="/promos" className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1">
                View All <ChevronRight className="w-2.5 h-2.5" />
              </Link>
            </div>
            <div className="flex overflow-x-auto space-x-4 pb-4 snap-x hide-scrollbar">
              {activePromos.slice(0, 3).map(promo => (
                <div key={promo.id} className="min-w-[85%] snap-center bg-white/2 border border-white/5 rounded-3xl p-6 flex-shrink-0 relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mb-2">{promo.tag}</div>
                    <h3 className="font-bold text-xl mb-2 leading-tight">{promo.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 font-medium leading-relaxed">{promo.description}</p>
                  </div>
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Ticket className="w-16 h-16 rotate-12" />
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
