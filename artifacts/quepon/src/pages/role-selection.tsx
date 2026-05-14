import { motion } from "framer-motion";
import { Shield, UserRound, Users } from "lucide-react";
import type { ReactNode } from "react";
import { useLocation } from "wouter";
import { PCModel } from "@/components/pc-model";

export default function RoleSelection() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-[100dvh] w-full bg-background relative overflow-hidden text-white px-6 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      {/* Refined Purple Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(124,58,237,0.3),transparent_40%),radial-gradient(circle_at_50%_92%,rgba(124,58,237,0.2),transparent_40%),linear-gradient(180deg,#070711_0%,#0d0714_100%)]" />
      
      {/* Decorative scanline effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,35,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-10 pointer-events-none bg-[length:100%_4px,3px_100%]" />

      <div className="relative z-20 mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-sm flex-col">
        <header className="text-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto mb-4 h-14 w-14 rounded-3xl bg-white/10 border border-white/15 backdrop-blur-xl p-3 shadow-[0_0_34px_rgba(124,58,237,0.3)]"
          >
            <img src="/ggx logo.png" alt="GGX" className="h-full w-full object-contain" />
          </motion.div>
          <div className="text-[9px] font-black uppercase tracking-[0.38em] text-primary">GGX / HUB</div>
          <h1 className="mt-3 text-3xl font-black font-display leading-tight tracking-tight italic sm:text-4xl">
            CHOOSE ROLE
          </h1>
          <p className="mx-auto mt-3 max-w-xs text-sm font-semibold leading-6 text-white/58">
            Access the command center or join the queue.
          </p>
        </header>

        <main className="relative flex flex-1 items-center justify-center py-4">
          <div className="absolute h-80 w-80 rounded-full bg-primary/10 blur-[80px]" />
          <div className="w-full h-[350px]">
            <PCModel />
          </div>
        </main>

        <footer className="space-y-4">
          <motion.button
            type="button"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setLocation("/login")}
            className="flex h-16 w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-primary to-purple-600 text-sm font-black uppercase tracking-[0.24em] text-white shadow-[0_0_34px_rgba(124,58,237,0.3)] border border-white/10"
          >
            <UserRound className="h-5 w-5" />
            Player
          </motion.button>
          <motion.button
            type="button"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setLocation("/admin/login")}
            className="flex h-16 w-full items-center justify-center gap-3 rounded-full border border-white/10 bg-white/5 text-sm font-black uppercase tracking-[0.24em] text-white backdrop-blur-xl hover:bg-white/10 transition-colors"
          >
            <Shield className="h-5 w-5 text-primary" />
            Admin
          </motion.button>
          
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => setLocation("/developers")}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white/5 text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-primary transition-colors italic"
          >
            <Users className="h-4 w-4" />
            Developers
          </motion.button>
        </footer>
      </div>
    </div>
  );
}
