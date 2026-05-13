import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function SplashScreen() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setLoading(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            const hasSeenOnboarding = localStorage.getItem("quepon_onboarding_seen");
            if (hasSeenOnboarding) {
              setLocation("/login");
            } else {
              setLocation("/onboarding");
            }
          }, 800);
          return 100;
        }
        return prev + 1;
      });
    }, 20);

    return () => clearInterval(timer);
  }, [setLocation]);

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center relative overflow-hidden p-6">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 blur-[140px] -mr-64 -mt-64 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 blur-[140px] -ml-64 -mb-64 animate-pulse" />
      
      {/* Subtle Glowing Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            initial={{ 
              x: Math.random() * 1000, 
              y: Math.random() * 800,
              opacity: 0
            }}
            animate={{ 
              y: [null, -100],
              opacity: [0, 1, 0],
              scale: [1, 1.5, 1]
            }}
            transition={{ 
              duration: Math.random() * 4 + 3, 
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-card border border-primary/20 flex items-center justify-center p-6 shadow-3xl relative mb-8"
        >
          <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-full animate-pulse" />
          <img src="/ggx logo.png" alt="GGX Logo" className="w-full h-full object-contain relative z-10" />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="space-y-4"
        >
          <h1 className="text-4xl md:text-5xl font-black font-display tracking-tighter text-foreground italic">
            GGX <span className="text-primary">CORE</span>
          </h1>
          <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-muted-foreground/60 max-w-[200px] mx-auto leading-relaxed italic">
            Smart queue. Real-time gaming. Better sessions.
          </p>
        </motion.div>

        <div className="mt-20 w-48 space-y-4">
          <div className="h-1 w-full bg-muted rounded-full overflow-hidden border border-white/5 relative">
            <motion.div
              className="h-full bg-primary shadow-[0_0_15px_rgba(var(--primary),0.8)]"
              initial={{ width: "0%" }}
              animate={{ width: `${loading}%` }}
              transition={{ ease: "linear" }}
            />
          </div>
          <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 italic">
            <span>UP-LINKING</span>
            <span>{loading}%</span>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-12 flex items-center gap-3 opacity-20"
      >
        <span className="text-[9px] font-black uppercase tracking-[0.5em] text-muted-foreground">Nexus OS v2.0</span>
      </motion.div>
    </div>
  );
}
