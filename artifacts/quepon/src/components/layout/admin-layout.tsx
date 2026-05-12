import { Link, useLocation } from "wouter";
import { Monitor, Clock, Users, Coffee, Ticket, Settings, MessageSquare, LayoutDashboard, Wallet, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const { user } = useAuth();

  const navItems = [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/pcs", icon: Monitor, label: "PCs" },
    { href: "/admin/queue", icon: Clock, label: "Queue" },
    { href: "/admin/sessions", icon: Clock, label: "Sessions" },
    { href: "/admin/players", icon: Users, label: "Players" },
    { href: "/admin/topup", icon: CreditCard, label: "Top-up" },
    { href: "/admin/orders", icon: Coffee, label: "Orders" },
    { href: "/admin/feedback", icon: MessageSquare, label: "Feedback" },
    { href: "/admin/promos", icon: Ticket, label: "Promos" },
    { href: "/admin/menu", icon: Coffee, label: "Menu" },
    { href: "/admin/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen w-full flex bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 fixed inset-y-0 left-0 bg-[rgba(255,255,255,0.02)] border-r border-[rgba(255,255,255,0.08)] flex flex-col z-20">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary font-display tracking-wider">QUEPON</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Admin Command</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer",
                    isActive
                      ? "bg-primary/20 text-primary border border-primary/50 shadow-[0_0_15px_rgba(124,58,237,0.15)]"
                      : "text-muted-foreground hover:bg-[rgba(255,255,255,0.05)] hover:text-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[rgba(255,255,255,0.08)]">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-medium">{user?.username}</div>
              <div className="text-xs text-muted-foreground capitalize">{user?.role}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen">
        <div className="max-w-[1440px] mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
