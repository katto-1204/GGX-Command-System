import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Monitor, Clock, ShieldCheck } from "lucide-react";

const SLIDES = [
  {
    id: 1,
    title: "Real-time PC Monitoring",
    description: "Check which PCs are available, their specs, and time remaining on active sessions from anywhere.",
    icon: Monitor,
  },
  {
    id: 2,
    title: "Smart Queueing",
    description: "Join the queue remotely. We'll notify you when your PC is ready. No more waiting in the lobby.",
    icon: Clock,
  },
  {
    id: 3,
    title: "Session Tracking",
    description: "Keep track of your playtime, wallet balance, and order snacks straight to your desk.",
    icon: ShieldCheck,
  }
];

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [, setLocation] = useLocation();

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(s => s + 1);
    } else {
      setLocation("/login");
    }
  };

  const slide = SLIDES[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="min-h-[100dvh] w-full flex flex-col bg-background p-6">
      <div className="flex justify-end pt-4">
        <Button variant="ghost" className="text-muted-foreground" onClick={() => setLocation("/login")}>
          Skip
        </Button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center w-full"
          >
            <div className="w-32 h-32 mb-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_30px_rgba(124,58,237,0.2)]">
              <Icon className="w-16 h-16 text-primary" />
            </div>
            
            <h2 className="text-2xl font-bold font-display mb-4">{slide.title}</h2>
            <p className="text-muted-foreground leading-relaxed">{slide.description}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="pb-12 pt-8 flex flex-col items-center w-full max-w-sm mx-auto gap-8">
        <div className="flex gap-2">
          {SLIDES.map((s, i) => (
            <div
              key={s.id}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentSlide ? "w-8 bg-primary" : "w-2 bg-primary/20"
              }`}
            />
          ))}
        </div>
        
        <Button 
          className="w-full rounded-full py-6 text-lg font-medium shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] transition-shadow"
          onClick={handleNext}
        >
          {currentSlide === SLIDES.length - 1 ? "Get Started" : "Next"}
        </Button>
      </div>
    </div>
  );
}
