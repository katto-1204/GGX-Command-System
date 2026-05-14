import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Monitor, ListOrdered, LayoutDashboard, X, Sparkles } from "lucide-react";

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const showWelcome = localStorage.getItem("quepon_show_welcome");
    if (showWelcome === "true") {
      setIsOpen(true);
      localStorage.removeItem("quepon_show_welcome");
    }
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-[90vw] w-[400px] bg-zinc-950 border-white/10 rounded-[2rem] p-0 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="absolute top-0 left-0 w-full h-[200px] bg-gradient-to-b from-primary/20 to-transparent pointer-events-none" />
        
        <div className="relative p-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mb-6 relative group">
            <div className="absolute inset-0 bg-primary/20 blur-2xl group-hover:blur-3xl transition-all" />
            <Sparkles className="w-10 h-10 relative" />
          </div>

          <DialogHeader className="mb-8">
            <DialogTitle className="text-3xl font-black font-display text-white tracking-tight uppercase leading-none mb-2">
              Welcome to <span className="text-primary">GGX</span>
            </DialogTitle>
            <DialogDescription className="text-white/40 font-medium">
              Welcome! Explore the shop and start playing.
            </DialogDescription>
          </DialogHeader>

          <div className="w-full space-y-3 mb-8">
            <Link href="/pcs">
              <Button 
                variant="outline" 
                className="w-full h-16 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/50 text-white justify-start px-6 group transition-all"
                onClick={() => setIsOpen(false)}
              >
                <Monitor className="w-6 h-6 mr-4 text-primary group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <div className="font-bold text-sm">Browse PCs</div>
                  <div className="text-[10px] text-white/40 uppercase tracking-widest font-black">Manual Selection</div>
                </div>
              </Button>
            </Link>

            <Link href="/queue">
              <Button 
                variant="outline" 
                className="w-full h-16 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/50 text-white justify-start px-6 group transition-all"
                onClick={() => setIsOpen(false)}
              >
                <ListOrdered className="w-6 h-6 mr-4 text-primary group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <div className="font-bold text-sm">Join Queue</div>
                  <div className="text-[10px] text-white/40 uppercase tracking-widest font-black">Live Updates</div>
                </div>
              </Button>
            </Link>

            <Link href="/home">
              <Button 
                variant="outline" 
                className="w-full h-16 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/50 text-white justify-start px-6 group transition-all"
                onClick={() => setIsOpen(false)}
              >
                <LayoutDashboard className="w-6 h-6 mr-4 text-primary group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <div className="font-bold text-sm">Go to Home</div>
                  <div className="text-[10px] text-white/40 uppercase tracking-widest font-black">Player Menu</div>
                </div>
              </Button>
            </Link>
          </div>

          <Button 
            variant="ghost" 
            className="text-white/20 hover:text-white"
            onClick={() => setIsOpen(false)}
          >
            I'll explore myself
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
