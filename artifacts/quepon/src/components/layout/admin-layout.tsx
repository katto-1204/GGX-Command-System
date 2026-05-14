import { Link, useLocation } from "wouter";
import { Monitor, Clock, Users, Coffee, Ticket, Settings, MessageSquare, LayoutDashboard, Wallet, CreditCard, ChevronRight, ChevronLeft, BarChart3, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useLogoutUser } from "@workspace/api-client-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { motion } from "framer-motion";

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
        setLocation("/role-selection");
      }
    });
  };

  return (
    <div className="min-h-screen w-full flex bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-72 fixed inset-y-0 left-0 bg-card border-r border-border flex flex-col z-20 shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary/30" />
        
        <div className="p-8 flex flex-col items-center">
          <div className="w-16 h-16 mb-6 rounded-3xl bg-muted border border-border flex items-center justify-center overflow-hidden p-3 shadow-lg relative group transition-transform hover:scale-105 active:scale-95">
            <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors" />
            <img src="/ggx logo.png" alt="GGX Logo" className="w-full h-full object-contain relative z-10" />
          </div>
          
          <div className="flex items-center justify-between w-full">
            <div className="text-center w-full">
              <h1 className="text-2xl font-black text-foreground font-display tracking-tighter italic leading-none">
                GGX<span className="text-primary italic">.HUB</span>
              </h1>
              <p className="text-[9px] text-muted-foreground/60 uppercase tracking-[0.4em] mt-2 font-black italic">Terminal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-6 py-2 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location === item.href || location.startsWith(item.href + "/");
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all cursor-pointer group relative",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="active-pill"
                      className="absolute inset-0 bg-primary rounded-2xl -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                  <span className="font-black text-xs uppercase tracking-widest">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-border bg-muted/30 backdrop-blur-md">
          <div className="flex items-center gap-4 px-4 py-3 bg-card border border-border rounded-2xl shadow-inner mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-black shadow-[0_0_15px_rgba(var(--primary),0.2)]">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-black truncate text-foreground tracking-tight">{user?.username}</div>
              <div className="text-[10px] text-primary/60 font-black uppercase tracking-widest mt-0.5">{user?.role}</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between gap-2 px-1">
            <ThemeToggle className="bg-background border-border" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 min-h-screen flex flex-col bg-background relative">
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-10 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {location !== "/admin/dashboard" && (
              <button 
                onClick={() => window.history.back()}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-muted border border-border hover:bg-primary hover:text-primary-foreground transition-all shadow-sm active:scale-95"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex flex-col">
              {breadcrumbs && breadcrumbs.length > 0 ? (
                <nav className="flex items-center gap-2 text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] mb-1">
                  <Link href="/admin/dashboard">
                    <span className="hover:text-primary cursor-pointer transition-colors">Admin</span>
                  </Link>
                  {breadcrumbs.map((crumb, i) => (
                    <span key={i} className="flex items-center gap-2">
                      <ChevronRight className="w-3 h-3 opacity-30" />
                      {crumb.href ? (
                        <Link href={crumb.href}>
                          <span className="hover:text-primary cursor-pointer transition-colors">{crumb.label}</span>
                        </Link>
                      ) : (
                        <span className="text-primary/80">{crumb.label}</span>
                      )}
                    </span>
                  ))}
                </nav>
              ) : (
                <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.3em] mb-1">System Terminal</span>
              )}
              <h2 className="text-2xl font-black font-display tracking-tight text-foreground">
                {breadcrumbs?.[breadcrumbs.length - 1]?.label || "Dashboard"}
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden lg:flex flex-col items-end">
               <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-1">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                 Status: Online
               </div>
               <span className="text-xs font-black text-foreground">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
             </div>
             <div className="w-px h-10 bg-border mx-2" />
             <div className="w-12 h-12 rounded-2xl bg-card border border-border shadow-2xl flex items-center justify-center group relative overflow-hidden transition-all hover:border-primary/50">
               <img src="/ggx logo.png" alt="GGX Logo" className="w-8 h-8 object-contain relative z-10 transition-transform group-hover:scale-110" />
             </div>
          </div>
        </header>

        <div className="flex-1 max-w-[1600px] w-full mx-auto p-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>

  );
}
