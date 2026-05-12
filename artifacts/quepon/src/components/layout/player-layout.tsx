import { Link, useLocation } from "wouter";
import { Monitor, Clock, Calendar, Ticket, MessageSquare, Coffee, Wallet, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayerLayoutProps {
  children: React.ReactNode;
}

export function PlayerLayout({ children }: PlayerLayoutProps) {
  const [location] = useLocation();

  const navItems = [
    { href: "/home", icon: Monitor, label: "Home" },
    { href: "/pcs", icon: Monitor, label: "PCs" },
    { href: "/queue", icon: Clock, label: "Queue" },
    { href: "/session", icon: Calendar, label: "Session" },
    { href: "/profile", icon: UserIcon, label: "Profile" },
  ];

  return (
    <div className="min-h-[100dvh] w-full flex flex-col bg-background text-foreground pb-20">
      <main className="flex-1 w-full max-w-md mx-auto p-4 overflow-x-hidden">
        {children}
      </main>

      {/* Bottom Pill Navigation */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md z-50">
        <nav className="flex items-center justify-around bg-[rgba(255,255,255,0.04)] backdrop-blur-md border border-[rgba(255,255,255,0.08)] rounded-full p-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center justify-center gap-2 px-3 py-2 rounded-full transition-all duration-300 cursor-pointer",
                    isActive
                      ? "bg-primary/20 text-primary border border-primary/50 shadow-[0_0_15px_rgba(124,58,237,0.3)]"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {isActive && <span className="text-sm font-medium">{item.label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
