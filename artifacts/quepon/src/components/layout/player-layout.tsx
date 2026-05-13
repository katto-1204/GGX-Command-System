import { Link, useLocation } from "wouter";
import { Home, Monitor, QrCode, UtensilsCrossed, User, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayerLayoutProps {
  children: React.ReactNode;
  backHref?: string;
  pageTitle?: string;
}

export function PlayerLayout({ children, backHref, pageTitle }: PlayerLayoutProps) {
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

  return (
    <div className="min-h-[100dvh] w-full flex flex-col bg-background text-foreground pb-24">
      {backHref && (
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-white/5 px-4 py-3 flex items-center gap-3">
          <Link href={backHref}>
            <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
              <ChevronLeft className="w-4 h-4" />
              {pageTitle || "Back"}
            </button>
          </Link>
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
