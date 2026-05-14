import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Users } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

const developersData = [
  {
    name: "CATHERINE",
    role: "FULL STACK DEV",
    image: "/DEVELOPERS/catherine - full stack.png",
    accent: "#a855f7"
  },
  {
    name: "XANDER",
    role: "BACKEND DEV",
    image: "/DEVELOPERS/xander - backend.png",
    accent: "#3b82f6"
  },
  {
    name: "JOEY",
    role: "UI/UX",
    image: "/DEVELOPERS/joey - uiux.png",
    accent: "#ec4899"
  },
  {
    name: "NORMAN",
    role: "QA/TESTER",
    image: "/DEVELOPERS/norman - qa.png",
    accent: "#10b981"
  }
];

export default function Developers() {
  const [, setLocation] = useLocation();
  const [selectedDev, setSelectedDev] = useState<null | number>(null);

  return (
    <div className="min-h-[100dvh] w-full bg-[#0a0a0a] relative overflow-hidden text-white flex flex-col">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(168,85,247,0.05),transparent_70%)]" />

      {/* Header */}
      <header className="relative z-30 px-6 pt-[max(1.5rem,env(safe-area-inset-top))] flex items-center justify-between">
        <button
          onClick={() => setLocation("/role-selection")}
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm"
        >
          <ChevronLeft className="w-6 h-6 text-primary" />
        </button>
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] italic text-primary">Core Team</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row items-center justify-center p-6 gap-8 relative z-10">

        {/* Left Side: Static Team Image */}
        <div className="relative w-full md:w-1/2 aspect-square max-w-[500px] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full"
          >
            <img
              src="/DEVELOPERS/developers.png"
              alt="The Developers"
              className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(168,85,247,0.2)]"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent z-10" />
        </div>

        {/* Right Side: Dev Selection Cards */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <div className="mb-4">
            <h1 className="text-5xl font-black font-display italic tracking-tighter uppercase leading-none">
              TEAM <span className="text-primary">CORE</span>
            </h1>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] italic mt-2">Architects of the Terminal</p>
          </div>

          <div className="grid gap-3">
            {developersData.map((dev, i) => (
              <motion.button
                key={dev.name}
                onClick={() => setSelectedDev(selectedDev === i ? null : i)}
                className={`relative group h-20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${selectedDev === i ? 'z-50' : ''}`}
              >
                {/* Background Shape */}
                <div
                  className={`absolute inset-0 bg-[#151515] border-[2px] transition-colors ${selectedDev === i ? 'border-primary' : 'border-white/10 group-hover:border-primary'}`}
                  style={{
                    clipPath: "polygon(0% 0%, 100% 0%, 95% 100%, 5% 100%)"
                  }}
                />

                <div className="relative z-10 flex items-center justify-between px-12 h-full">
                  <div className="text-left">
                    <h3 className={`text-xl font-black italic tracking-tighter transition-colors ${selectedDev === i ? 'text-primary' : 'text-white group-hover:text-primary'}`}>
                      {dev.name}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">
                      {dev.role}
                    </span>
                  </div>
                </div>

                {/* Decorative Dots */}
                <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full transition-colors ${selectedDev === i ? 'bg-primary' : 'bg-white/20 group-hover:bg-primary'}`} />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/5" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/5" />
                </div>
              </motion.button>
            ))}
          </div>

          {/* Bottom Terminal Footer */}
          <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center opacity-30 italic">
            <span className="text-[8px] font-black uppercase tracking-[0.4em]">GGX SYSTEM VERSION 1.0.4</span>
            <span className="text-[8px] font-black uppercase tracking-[0.4em]">TERMINAL_ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Full-Screen Character Overlay */}
      <AnimatePresence>
        {selectedDev !== null && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 pointer-events-none"
          >
            <motion.div
              initial={{ y: 200, opacity: 0, scale: 0.5, rotate: -5 }}
              animate={{ y: 0, opacity: 1, scale: 1, rotate: 0 }}
              exit={{ y: 200, opacity: 0, scale: 0.5, rotate: 5 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 15, // Lower damping = more bounce
                mass: 1
              }}
              className="relative w-full max-w-4xl h-full flex items-center justify-center pointer-events-auto"
              onClick={() => setSelectedDev(null)}
            >
              <img
                src={developersData[selectedDev].image}
                alt="Developer"
                className="max-w-full max-h-full object-contain drop-shadow-[0_20px_80px_rgba(168,85,247,0.3)]"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
