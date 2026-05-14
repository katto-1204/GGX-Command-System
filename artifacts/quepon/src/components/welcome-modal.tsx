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
      <DialogContent className="max-w-[92vw] w-[400px] max-h-[85vh] bg-zinc-950 border-white/10 rounded-[2.5rem] p-0 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col">
        <div className="absolute top-0 left-0 w-full h-[200px] bg-gradient-to-b from-primary/20 to-transparent pointer-events-none shrink-0" />
        
        <div className="relative p-6 flex flex-col items-center text-center overflow-y-auto hide-scrollbar flex-1">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mb-4 relative group">
            <div className="absolute inset-0 bg-primary/20 blur-2xl group-hover:blur-3xl transition-all" />
            <Sparkles className="w-8 h-8 relative" />
          </div>

          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black font-display text-white tracking-tight uppercase leading-none mb-1">
              Welcome to <span className="text-primary">GGX</span>
            </DialogTitle>
            <DialogDescription className="text-white/40 font-medium text-[11px]">
              Step into the future of gaming. Explore, play, and win.
            </DialogDescription>
          </DialogHeader>

          <div className="w-full space-y-2 mb-6">
            <Link href="/pcs">
              <Button 
                variant="outline" 
                className="w-full h-14 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/50 text-white justify-start px-5 group transition-all"
                onClick={() => setIsOpen(false)}
              >
                <Monitor className="w-5 h-5 mr-3 text-primary group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <div className="font-bold text-[13px]">Browse PCs</div>
                  <div className="text-[9px] text-white/40 uppercase tracking-widest font-black">Hardware Fleet</div>
                </div>
              </Button>
            </Link>

            <Link href="/queue">
              <Button 
                variant="outline" 
                className="w-full h-14 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/50 text-white justify-start px-5 group transition-all"
                onClick={() => setIsOpen(false)}
              >
                <ListOrdered className="w-5 h-5 mr-3 text-primary group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <div className="font-bold text-[13px]">Join Queue</div>
                  <div className="text-[9px] text-white/40 uppercase tracking-widest font-black">Live Updates</div>
                </div>
              </Button>
            </Link>

            <Link href="/home">
              <Button 
                variant="outline" 
                className="w-full h-14 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/50 text-white justify-start px-5 group transition-all"
                onClick={() => setIsOpen(false)}
              >
                <LayoutDashboard className="w-5 h-5 mr-3 text-primary group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <div className="font-bold text-[13px]">Go to Home</div>
                  <div className="text-[9px] text-white/40 uppercase tracking-widest font-black">Player Menu</div>
                </div>
              </Button>
            </Link>
          </div>

          <Button 
            variant="ghost" 
            className="text-white/20 hover:text-white text-xs"
            onClick={() => setIsOpen(false)}
          >
            I'll explore myself
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
