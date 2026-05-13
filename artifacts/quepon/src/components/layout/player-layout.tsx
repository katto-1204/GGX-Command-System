import { Link, useLocation } from "wouter";
import { Home, Monitor, QrCode, UtensilsCrossed, User, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";

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
      <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-white/5 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {backHref ? (
            <Link href={backHref}>
              <button className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
            </Link>
          ) : location !== "/home" && (
            <Link href="/home">
              <button className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
            </Link>
          )}
          <span className="font-bold font-display text-lg">
            {pageTitle || (pathParts[0]?.charAt(0).toUpperCase() + pathParts[0]?.slice(1)) || "GGX"}
          </span>
        </div>
        <ThemeToggle className="bg-white/5" />
      </header>

      {showBreadcrumbs && location !== "/home" && (
        <div className="px-4 py-2 border-b border-white/5 bg-white/2 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <nav className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
            <Link href="/home" className="hover:text-primary transition-colors flex items-center gap-1">
              Home
            </Link>
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-2">
                <ChevronRight className="w-2.5 h-2.5 opacity-50" />
                {i === breadcrumbs.length - 1 ? (
                  <span className="text-primary font-bold">{crumb.label}</span>
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
        {children}
      </main>

      {/* Bottom Pill Navigation */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md z-50">
        <nav className="flex items-center justify-around bg-[rgba(10,10,20,0.88)] backdrop-blur-xl border border-[rgba(124,58,237,0.3)] rounded-full p-2 shadow-[0_0_30px_rgba(124,58,237,0.15)]">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex items-center justify-center gap-2 px-3 py-2 rounded-full transition-all duration-300 cursor-pointer",
                  active
                    ? "bg-primary/20 text-primary border border-primary/50 shadow-[0_0_15px_rgba(124,58,237,0.3)]"
                    : "text-muted-foreground hover:text-foreground"
                )}>
                  <Icon className="w-5 h-5" />
                  {active && <span className="text-sm font-medium">{item.label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
