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

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] relative overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Grid Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{ 
          backgroundImage: "linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)",
          backgroundSize: "40px 40px" 
        }} 
      />

      {/* ZZZ Inspired Loading Bar */}
      <div className="relative w-full max-w-[800px] flex flex-col items-start">
        
        {/* Main Bar Container */}
        <div className="relative w-full h-24 bg-black border-[4px] border-[#1a1a1a] rounded-r-lg flex items-center p-1 overflow-hidden"
          style={{
            clipPath: "polygon(0% 25%, 5% 0%, 100% 0%, 100% 100%, 5% 100%, 0% 75%)"
          }}
        >
          {/* Left Icon Section */}
          <div className="h-full aspect-square bg-[#333] flex items-center justify-center border-r-[4px] border-[#1a1a1a] relative group overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
             <div className="flex flex-col gap-1 z-10">
               <div className="w-8 h-1.5 bg-white/40 skew-x-[-20deg]" />
               <div className="w-8 h-1.5 bg-white/40 skew-x-[-20deg]" />
             </div>
          </div>

          {/* Character/Image Placeholder */}
          <div className="h-full aspect-[1.5/1] bg-[#1a1a1a] flex items-center justify-center overflow-hidden border-r-[4px] border-[#1a1a1a]">
             <img src="/ggx logo.png" alt="GGX" className="h-16 w-16 object-contain brightness-75 contrast-125" />
          </div>

          {/* Progress Bar Section */}
          <div className="flex-1 h-full flex flex-col relative px-4 py-2">
            
            {/* Top Bar (Green) */}
            <div className="relative w-full h-10 bg-[#1a1a1a] rounded-sm overflow-hidden mb-2">
               <motion.div 
                 className="absolute inset-y-0 left-0 bg-[#a6f111] shadow-[0_0_20px_rgba(166,241,17,0.5)]"
                 initial={{ width: "0%" }}
                 animate={{ width: `${progress}%` }}
                 transition={{ duration: 0.1 }}
               />
               <div className="absolute top-0 right-0 h-full w-24 bg-red-600/40 blur-md" />
            </div>

            {/* Middle Value */}
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-white italic font-mono tracking-tighter">{currentVal} / 4070</span>
            </div>

            {/* Tech Bottom Bars */}
            <div className="absolute bottom-2 right-4 flex gap-2">
               <div className="w-32 h-6 bg-[#1a1a1a] rounded-sm relative overflow-hidden">
                  <motion.div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500"
                    initial={{ width: "0%" }}
                    animate={{ width: `${Math.min(progress * 1.2, 100)}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-black text-white/50 italic font-mono uppercase">SYNCING</span>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Stars/Rating Bottom */}
        <div className="mt-4 flex gap-1 ml-4">
           {[1, 2, 3].map(i => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, scale: 0 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: i * 0.2 }}
               className="w-5 h-5 text-[#37c8ff] fill-[#37c8ff]"
             >
               <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
             </motion.div>
           ))}
           {[1, 2].map(i => (
             <div key={i} className="w-5 h-5 text-[#333] fill-[#333]">
               <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
             </div>
           ))}
        </div>

        {/* Subtext */}
        <div className="mt-8 ml-4">
           <motion.p 
             initial={{ opacity: 0 }}
             animate={{ opacity: [0, 1, 0] }}
             transition={{ duration: 2, repeat: Infinity }}
             className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em] italic"
           >
             SYSTEM INITIALIZING... PLEASE STAND BY
           </motion.p>
        </div>
      </div>
    </div>
  );
}
