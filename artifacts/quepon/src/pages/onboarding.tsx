import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronRight, Gamepad2, Monitor, Zap, Play } from "lucide-react";

const slides = [
  {
    title: "PLAY THE BEST GAMES",
    subtitle: "Check available PCs, join the queue, and start your session faster than ever.",
    icon: Gamepad2,
    accent: "from-primary to-purple-600",
    glow: "bg-primary/20",
    visual: "gaming character, PC setup, neon game elements"
  },
  {
    title: "REAL-TIME STATUS",
    subtitle: "Monitor your session time, remaining credits, and rank in the queue live.",
    icon: Zap,
    accent: "from-red-500 to-orange-500",
    glow: "bg-red-500/20",
    visual: "tactical HUD, session timer, glowing status"
  },
  {
    title: "ELITE EXPERIENCE",
    subtitle: "Unlock premium rigs, manage orders, and dominate the arena at GGX Hub.",
    icon: Monitor,
    accent: "from-blue-500 to-cyan-500",
    glow: "bg-blue-500/20",
    visual: "premium PC rig, futuristic control panel"
  }
];

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [, setLocation] = useLocation();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem("quepon_onboarding_seen", "true");
    setLocation("/login");
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen w-full bg-background flex flex-col relative overflow-hidden transition-colors duration-500">
      {/* Background Ambience */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn("absolute inset-0 pointer-events-none transition-all duration-1000", slide.glow)}
          style={{ filter: "blur(140px)" }}
        />
      </AnimatePresence>

      <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-sm flex flex-col items-center text-center"
          >
            {/* Immersive Visual Placeholder/Icon Card */}
            <div className="relative mb-16 group">
              <div className={cn("absolute inset-0 blur-3xl opacity-50 group-hover:opacity-80 transition-opacity rounded-full", slide.glow)} />
              <div className={cn("w-48 h-48 md:w-56 md:h-56 rounded-[3rem] bg-card border border-white/10 flex items-center justify-center relative z-10 shadow-3xl overflow-hidden")}>
                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-10", slide.accent)} />
                <Icon className={cn("w-20 h-20 md:w-24 md:h-24 transition-transform group-hover:scale-110 duration-500", currentSlide === 0 ? "text-primary" : currentSlide === 1 ? "text-red-500" : "text-blue-500")} />
                
                {/* Tactical HUD Overlays */}
                <div className="absolute top-4 left-4 text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">Module: 0{currentSlide + 1}</div>
                <div className="absolute bottom-4 right-4 text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">SECURE_LINK</div>
              </div>
            </div>

            <h2 className="text-4xl md:text-5xl font-black font-display tracking-tighter text-foreground italic uppercase mb-6 leading-none">
              {slide.title.split(' ').map((word, i) => (
                <span key={i} className={i === 1 ? "text-primary" : ""}>
                  {word}{' '}
                </span>
              ))}
            </h2>
            <p className="text-sm md:text-base text-muted-foreground font-black uppercase tracking-wide leading-relaxed opacity-80 max-w-xs mx-auto italic">
              {slide.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div className="p-8 md:p-12 space-y-10 relative z-10">
        {/* Step Indicators */}
        <div className="flex justify-center gap-3">
          {slides.map((_, i) => (
            <motion.div
              key={i}
              initial={false}
              animate={{ 
                width: i === currentSlide ? 32 : 8,
                backgroundColor: i === currentSlide ? "var(--primary)" : "rgba(255,255,255,0.1)"
              }}
              className="h-2 rounded-full transition-all duration-500"
            />
          ))}
        </div>

        <div className="flex flex-col gap-4 max-w-md mx-auto w-full">
          <Button 
            onClick={handleNext}
            className="h-16 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl hover:shadow-primary/30 transition-all active:scale-95 italic group"
          >
            {currentSlide === slides.length - 1 ? (
              <>INITIALIZE PORTAL <Play className="w-4 h-4 ml-3 fill-current" /></>
            ) : (
              <>NEXT MODULE <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /></>
            )}
          </Button>
          
          {currentSlide < slides.length - 1 && (
            <Button 
              variant="ghost" 
              onClick={handleComplete}
              className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] hover:text-foreground transition-colors italic"
            >
              Skip Intelligence Brief
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";
