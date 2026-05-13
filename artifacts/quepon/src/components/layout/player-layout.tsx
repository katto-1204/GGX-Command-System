import { Link, useLocation } from "wouter";
import { Home, Monitor, QrCode, UtensilsCrossed, User, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { motion } from "framer-motion";

interface PlayerLayoutProps {
  children: React.ReactNode;
  backHref?: string;
  pageTitle?: string;
  showBreadcrumbs?: boolean;
}

export function PlayerLayout({ children, backHref, pageTitle, showBreadcrumbs = true }: PlayerLayoutProps) {
  const [location] = useLocation();

  const navItems = [
    { href: "/home", icon: Home, label: "Home" },
    { href: "/pcs", icon: Monitor, label: "PCs" },
    { href: "/checkin", icon: QrCode, label: "Check-in" },
    { href: "/menu", icon: UtensilsCrossed, label: "Menu" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  const isActive = (href: string) => {
    if (href === "/home") return location === "/home";
    return location.startsWith(href);
  };

  // Simple breadcrumb logic for players
  const pathParts = location.split("/").filter(Boolean);
  const breadcrumbs = pathParts.map((part, i) => ({
    label: part.charAt(0).toUpperCase() + part.slice(1),
    href: "/" + pathParts.slice(0, i + 1).join("/"),
  }));

  return (
    <div className="min-h-[100dvh] w-full flex flex-col bg-background text-foreground pb-24 transition-colors duration-300">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-border px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {backHref ? (
            <Link href={backHref}>
              <button className="flex items-center justify-center w-10 h-10 rounded-xl bg-muted border border-border hover:bg-primary hover:text-primary-foreground transition-all active:scale-90">
                <ChevronLeft className="w-5 h-5" />
              </button>
            </Link>
          ) : location !== "/home" && (
            <Link href="/home">
              <button className="flex items-center justify-center w-10 h-10 rounded-xl bg-muted border border-border hover:bg-primary hover:text-primary-foreground transition-all active:scale-90">
                <ChevronLeft className="w-5 h-5" />
              </button>
            </Link>
          )}
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center overflow-hidden p-1 shadow-sm">
              <img src="/ggx logo.png" alt="GGX Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-black font-display text-base uppercase tracking-tighter italic">
              {pageTitle || (pathParts[0]?.charAt(0).toUpperCase() + pathParts[0]?.slice(1)) || "GGX"}
            </span>
          </div>
        </div>
        <ThemeToggle className="bg-muted border-border" />
      </header>

      {showBreadcrumbs && location !== "/home" && (
        <div className="px-4 py-2.5 border-b border-border bg-muted/20 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 font-black">
            <Link href="/home" className="hover:text-primary transition-colors flex items-center gap-1">
              Home
            </Link>
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-2">
                <ChevronRight className="w-2.5 h-2.5 opacity-30" />
                {i === breadcrumbs.length - 1 ? (
                  <span className="text-primary font-black">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="hover:text-foreground transition-colors">
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>
        </div>
      )}

      <main className="flex-1 w-full max-w-md mx-auto p-4 overflow-x-hidden">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Bottom Pill Navigation */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-md z-50">
        <nav className="flex items-center justify-around bg-card/80 backdrop-blur-2xl border border-border rounded-[2rem] p-2.5 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl transition-all duration-300 cursor-pointer relative",
                  active
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                    : "text-muted-foreground hover:text-foreground"
                )}>
                  <Icon className={cn("w-5 h-5", active ? "stroke-[3px]" : "stroke-[2px]")} />
                  {active && <span className="text-[10px] font-black uppercase tracking-widest leading-none">{item.label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>

  );
}
