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
    <PlayerLayout>
      <div className="space-y-6 pt-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold font-display">Hello, {user?.displayName || user?.username}</h1>
            <p className="text-muted-foreground text-sm">Welcome back to QUEPON</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Balance</div>
            <div className="text-xl font-bold text-green-400 font-mono">₱{(user?.walletBalance || 0).toFixed(2)}</div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] backdrop-blur-sm">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
              <div className="text-3xl font-bold text-green-400 font-mono mb-1">{availablePcs}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">PCs Available</div>
            </CardContent>
          </Card>
          
          <Card 
            className="bg-[rgba(124,58,237,0.1)] border-[rgba(124,58,237,0.3)] backdrop-blur-sm cursor-pointer hover:bg-[rgba(124,58,237,0.15)] transition-colors"
            onClick={() => setLocation(mySession ? "/session" : "/queue")}
          >
            <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
              {mySession ? (
                <>
                  <div className="text-xl font-bold text-primary font-mono mb-1">{mySession.pcLabel}</div>
                  <div className="text-xs text-primary/80 uppercase tracking-wider">Active Session</div>
                </>
              ) : (
                <>
                  <Clock className="w-8 h-8 text-primary mb-2" />
                  <div className="text-sm font-medium text-primary">Join Queue</div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Promo Carousel (Simple) */}
        {activePromos.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Featured Promos</h2>
              <Link href="/promos" className="text-xs text-primary flex items-center">View all <ChevronRight className="w-3 h-3" /></Link>
            </div>
            <div className="flex overflow-x-auto space-x-4 pb-2 snap-x hide-scrollbar">
              {activePromos.slice(0, 3).map(promo => (
                <div key={promo.id} className="min-w-[280px] snap-center bg-gradient-to-br from-primary/20 to-transparent border border-primary/20 rounded-xl p-4 flex-shrink-0">
                  <div className="text-xs text-primary font-bold uppercase tracking-wider mb-1">{promo.tag}</div>
                  <h3 className="font-bold text-lg mb-1 leading-tight">{promo.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{promo.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-2 pb-8">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href}>
                  <div className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.06)] transition-colors cursor-pointer">
                    <div className={`w-10 h-10 rounded-full ${action.bg} ${action.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-center">{action.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </PlayerLayout>
  );
}
