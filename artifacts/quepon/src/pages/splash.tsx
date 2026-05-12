import { useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export default function Splash() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoading) {
        if (isAuthenticated) {
          setLocation("/home");
        } else {
          setLocation("/login"); // For simplicity, going straight to login. User can navigate to onboarding from there if needed or we could check local storage.
        }
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated, setLocation]);

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/30 rounded-full blur-[100px] pointer-events-none" />
      
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        <h1 className="text-6xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50 tracking-tighter mb-2 drop-shadow-[0_0_30px_rgba(124,58,237,0.5)]">
          GGX
        </h1>
        <div className="text-xl tracking-[0.3em] text-primary font-medium mb-12">
          QUEPON
        </div>
        
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </motion.div>
    </div>
  );
}
