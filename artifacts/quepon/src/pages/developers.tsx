import { motion } from "framer-motion";
import { ChevronLeft, Users, Github, Globe } from "lucide-react";
import { useLocation } from "wouter";

const developers = [
  { name: "CATHERINE ARNADO", role: "UI/UX & Frontend" },
  { name: "XANDER PALMA", role: "System Architecture" },
  { name: "JOEY SALAZAR", role: "Backend & Database" },
  { name: "NORMAN ASAKIL", role: "Project Coordination" }
];

export default function Developers() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-[100dvh] w-full bg-background relative overflow-hidden text-white px-6 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.15),transparent_50%),linear-gradient(180deg,#070711_0%,#0d0714_100%)]" />
      
      <div className="relative z-20 mx-auto max-w-sm flex flex-col min-h-full">
        <header className="flex items-center justify-between mb-12">
          <button 
            onClick={() => setLocation("/role-select")}
            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-primary" />
          </button>
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] italic text-primary">Core Team</span>
          </div>
          <div className="w-12" /> {/* Spacer */}
        </header>

        <main className="flex-1 space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-black font-display italic uppercase tracking-tighter mb-2">DEVELOPERS</h1>
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Architects of the Command Center</p>
          </div>

          <div className="grid gap-4">
            {developers.map((dev, i) => (
              <motion.div
                key={dev.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-6 bg-white/5 border border-white/10 rounded-[2rem_0.5rem_2rem_0.5rem] hover:bg-white/10 transition-all hover:border-primary/50"
              >
                <div className="relative z-10 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-black font-display italic uppercase tracking-tight text-foreground">{dev.name}</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic">{dev.role}</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Github className="w-4 h-4 text-white/60" />
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-primary/5 to-transparent rounded-r-3xl" />
              </motion.div>
            ))}
          </div>
        </main>

        <footer className="mt-12 text-center pb-8">
          <div className="flex justify-center gap-6 mb-6">
            <Globe className="w-5 h-5 text-white/20" />
          </div>
          <p className="text-[8px] font-black uppercase tracking-[0.5em] text-white/20 italic">GGX SYSTEM VERSION 1.0.4 // TERMINAL_ACTIVE</p>
        </footer>
      </div>
    </div>
  );
}
