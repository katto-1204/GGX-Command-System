import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function SplashScreen() {
  const [, setLocation] = useLocation();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 5;
      });
    }, 100);

    const timer = window.setTimeout(() => {
      setLocation("/onboarding");
    }, 4500);

    return () => {
      clearInterval(interval);
      window.clearTimeout(timer);
    };
  }, [setLocation]);

  const currentVal = Math.floor((progress / 100) * 4070);

  const timeValue = Math.floor(4500 - (progress * 45)).toString().padStart(2, '0');

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] relative overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#a855f7]/10 via-black to-black opacity-50" />

      <div className="relative w-full max-w-[900px] flex flex-col items-start z-10 px-6">
        
        {/* Top Info Area (54 TIME) */}
        <div className="flex items-end gap-2 mb-2 ml-2">
          <div className="flex flex-col items-start leading-none">
            <span className="text-6xl font-black text-[#a855f7] font-mono italic tracking-tighter">{timeValue}</span>
            <span className="text-xl font-black text-[#a855f7] font-mono uppercase tracking-widest mt-[-8px]">TIME</span>
          </div>
          
          {/* Slanted Separator */}
          <div className="flex flex-col gap-1 mb-1">
            <div className="w-8 h-3 bg-[#a855f7] skew-x-[-25deg]" />
            <div className="w-6 h-3 bg-[#a855f7] skew-x-[-25deg]" />
          </div>
        </div>

        {/* Main Bar Container (ZZZ Style Geometry) */}
        <div className="relative w-full h-16 flex items-center">
          
          {/* Progress Bar Background (The Outline) */}
          <div 
            className="absolute inset-0 bg-black border-[3px] border-[#a855f7]"
            style={{
              clipPath: "polygon(0% 0%, 100% 0%, 95% 100%, 0% 100%)"
            }}
          />

          {/* Actual Progress Fill (Purple Running Gradient) */}
          <motion.div 
            className="absolute top-[3px] left-[3px] h-[calc(100%-6px)] bg-gradient-to-r from-[#7c3aed] via-[#a855f7] to-[#d946ef] shadow-[0_0_30px_rgba(168,85,247,0.4)]"
            initial={{ width: "0%" }}
            animate={{ width: `calc(${progress}% - 6px)` }}
            transition={{ duration: 0.1 }}
            style={{
              clipPath: "polygon(0% 0%, 100% 0%, 95% 100%, 0% 100%)"
            }}
          />

          {/* Player Name Tag (Slanted Overlap) */}
          <div 
            className="absolute bottom-[-1px] left-[20%] h-8 bg-black border-t-[3px] border-r-[3px] border-l-[3px] border-[#a855f7] flex items-center px-8 z-20"
            style={{
              clipPath: "polygon(0% 100%, 15% 0%, 100% 0%, 85% 100%)"
            }}
          >
            <span className="text-xs font-black text-white italic tracking-widest uppercase">GGX: QUEPON</span>
          </div>
        </div>

        {/* Bottom Level Info */}
        <div className="w-full mt-2 flex flex-col items-end mr-[10%]">
          <div className="flex items-center gap-3">
             <div className="h-0.5 w-64 bg-gradient-to-l from-[#a855f7] to-transparent" />
             <div className="flex items-center gap-2">
               <span className="text-xs font-black text-[#a855f7] font-mono tracking-widest italic">LEVEL 10</span>
               <div className="flex gap-1">
                 <div className="w-4 h-1 bg-[#a855f7]" />
                 <div className="w-4 h-1 bg-[#a855f7]" />
                 <div className="w-4 h-1 bg-[#a855f7]" />
               </div>
             </div>
          </div>
        </div>

        {/* Sync Subtext */}
        <div className="mt-12 ml-4">
           <motion.p 
             initial={{ opacity: 0 }}
             animate={{ opacity: [0, 1, 0] }}
             transition={{ duration: 2, repeat: Infinity }}
             className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em] italic"
           >
             ESTABLISHING CONNECTION...
           </motion.p>
        </div>
      </div>
    </div>
  );
}
