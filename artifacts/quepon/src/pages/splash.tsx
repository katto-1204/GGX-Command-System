import { motion } from "framer-motion";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function SplashScreen() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // ALWAYS go to onboarding as requested
    const timer = window.setTimeout(() => {
      setLocation("/onboarding");
    }, 2800);
    return () => window.clearTimeout(timer);
  }, [setLocation]);

  return (
    <div className="min-h-screen w-full bg-background relative overflow-hidden flex flex-col items-center justify-center px-6">
      {/* Purple glow background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.25),transparent_50%)]" />

      {/* Horizontal glowing line */}
      <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent shadow-[0_0_24px_rgba(124,58,237,0.8)]" />

      {/* Main Logo and Text */}
      <div className="relative z-10 w-full max-w-sm text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8 h-28 w-28 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md p-4 shadow-[0_0_40px_rgba(124,58,237,0.3)]"
        >
          <img src="/ggx logo.png" alt="GGX" className="h-full w-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h1 className="text-6xl font-black font-display italic tracking-tighter text-white drop-shadow-[0_0_25px_rgba(124,58,237,0.6)]">
            GGX
          </h1>
          <div className="text-sm font-black uppercase tracking-[0.5em] text-primary mt-2">

          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-16 w-48"
        >
          <div className="mx-auto h-1 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full bg-primary shadow-[0_0_15px_rgba(124,58,237,0.8)]"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          <div className="mt-4 text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
            Initializing...
          </div>
        </motion.div>
      </div>
    </div>
  );
}
