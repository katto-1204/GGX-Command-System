import { Link, useLocation } from "wouter";
import { Monitor, Clock, Users, Coffee, Ticket, Settings, MessageSquare, LayoutDashboard, Wallet, CreditCard, ChevronRight, BarChart3, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useLogoutUser } from "@workspace/api-client-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface AdminLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

export function AdminLayout({ children, breadcrumbs }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const logoutMutation = useLogoutUser();

  const navItems = [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/pcs", icon: Monitor, label: "PCs" },
    { href: "/admin/queue", icon: Clock, label: "Queue" },
    { href: "/admin/assign", icon: ChevronRight, label: "Assign" },
    { href: "/admin/sessions", icon: Clock, label: "Sessions" },
    { href: "/admin/players", icon: Users, label: "Players" },
    { href: "/admin/topup", icon: CreditCard, label: "Top-up" },
    { href: "/admin/orders", icon: Coffee, label: "Orders" },
    { href: "/admin/feedback", icon: MessageSquare, label: "Feedback" },
    { href: "/admin/promos", icon: Ticket, label: "Promos" },
    { href: "/admin/menu", icon: Coffee, label: "Menu" },
    { href: "/admin/reports", icon: BarChart3, label: "Reports" },
    { href: "/admin/settings", icon: Settings, label: "Settings" },
  ];

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        localStorage.removeItem("quepon_token");
        setLocation("/admin/login");
        window.location.reload();
      }
    });
  };

  return (
    <div className="min-h-screen w-full flex bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 fixed inset-y-0 left-0 bg-[rgba(255,255,255,0.02)] border-r border-[rgba(255,255,255,0.08)] flex flex-col z-20">
        <div className="p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary font-display tracking-wider">QUEPON</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Admin Command</p>
          </div>
          <ThemeToggle />
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href || location.startsWith(item.href + "/");
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

        <div className="p-4 border-t border-[rgba(255,255,255,0.08)] space-y-2">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user?.username}</div>
              <div className="text-xs text-muted-foreground capitalize">{user?.role}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="px-8 pt-6 pb-0">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/admin/dashboard">
                <span className="hover:text-foreground cursor-pointer">Dashboard</span>
              </Link>
              {breadcrumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-2">
                  <ChevronRight className="w-3 h-3" />
                  {crumb.href ? (
                    <Link href={crumb.href}>
                      <span className="hover:text-foreground cursor-pointer">{crumb.label}</span>
                    </Link>
                  ) : (
                    <span className="text-foreground font-medium">{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
          </div>
        )}
        <div className="max-w-[1440px] mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
