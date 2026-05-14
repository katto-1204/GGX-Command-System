import { motion } from "framer-motion";
import { Wallet, ShieldCheck, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { QRCodeSVG } from "qrcode.react";

interface MembershipCardProps {
  user: any;
  className?: string;
}

export function MembershipCard({ user, className }: MembershipCardProps) {
  const qrCodeValue = `GGX-PC#${user?.username || "GUEST"}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative w-full aspect-[1.6/1] rounded-[2.5rem] overflow-hidden shadow-2xl group",
        className
      )}
    >
      {/* Background with Glassmorphism & Gradients */}
      <div className="absolute inset-0 bg-[#0d0d1a]" />
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-orange-600/10" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 blur-[100px] -ml-32 -mb-32" />
      
      {/* Texture/Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ 
          backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
          backgroundSize: "24px 24px" 
        }} 
      />

      {/* Card Gloss Effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
      
      {/* Border Glow */}
      <div className="absolute inset-0 border border-white/10 rounded-[2.5rem]" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="relative h-full p-8 flex flex-col justify-between z-10">
        {/* Top Area */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center backdrop-blur-md">
                <img src="/ggx logo.png" alt="GGX" className="w-5 h-5 object-contain" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/90">GGX MEMBERSHIP</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30 flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[8px] font-black text-green-400 uppercase tracking-widest">Active Member</span>
              </div>
            </div>
          </div>
          
          <div className="p-2 rounded-2xl bg-white backdrop-blur-xl border border-white/20 shadow-lg group-hover:scale-110 transition-transform">
            <QRCodeSVG 
              value={qrCodeValue} 
              size={64} 
              level="H"
              includeMargin={false}
              className="rounded-lg"
            />
          </div>
        </div>

        {/* Middle Area: Name & Username */}
        <div className="space-y-0.5">
          <h2 className="text-xl font-black font-display tracking-tight text-white uppercase italic truncate">
            @{user?.username || "PLAYER"}
          </h2>
        </div>

        {/* Bottom Area: Metadata & Balance */}
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Digital Pass</span>
            <div className="text-[10px] font-black text-white/80 uppercase tracking-widest font-mono">
              {user?.id?.slice(0, 8).toUpperCase() || "GGX-0000"}
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-2 shadow-lg flex flex-col items-end">
              <span className="text-[7px] font-black text-white/40 uppercase tracking-[0.3em] mb-1">Spent</span>
              <div className="text-sm font-black text-white font-mono tracking-tighter leading-none italic">
                ₱{(user?.totalSpent || 0).toFixed(0)}
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-5 py-3 shadow-lg flex flex-col items-end">
              <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] mb-1">Credits</span>
              <div className="text-2xl font-black text-white font-mono tracking-tighter leading-none italic">
                ₱{(user?.walletBalance || 0).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Red-Orange Accent */}
      <div className="absolute top-0 right-12 w-1 h-12 bg-gradient-to-b from-orange-500 to-transparent opacity-50" />
      <div className="absolute bottom-0 left-12 w-1 h-12 bg-gradient-to-t from-primary to-transparent opacity-50" />
    </motion.div>
  );
}
