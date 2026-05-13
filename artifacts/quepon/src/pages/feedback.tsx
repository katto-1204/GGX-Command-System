import { useState } from "react";
import { useSubmitFeedback } from "@workspace/api-client-react";
import { PlayerLayout } from "@/components/layout/player-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MessageSquare, AlertCircle, Lightbulb, Star, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  { id: "general", label: "General Feedback", icon: MessageSquare, color: "text-blue-400 bg-blue-400/10 border-blue-400/30" },
  { id: "issue", label: "Report an Issue", icon: AlertCircle, color: "text-red-400 bg-red-400/10 border-red-400/30" },
  { id: "featureRequest", label: "Feature Request", icon: Lightbulb, color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30" },
];

export default function Feedback() {
  const { toast } = useToast();
  const submitFeedbackMutation = useSubmitFeedback();
  const [submitted, setSubmitted] = useState(false);

  const [category, setCategory] = useState("general");
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [message, setMessage] = useState("");
  const [relatedPcId, setRelatedPcId] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleSubmit = () => {
    if (message.trim().length < 5) {
      toast({ title: "Message too short", description: "Please write at least 5 characters.", variant: "destructive" });
      return;
    }
    submitFeedbackMutation.mutate({
      data: { category, message, isAnonymous, relatedPcId: relatedPcId || null }
    }, {
      onSuccess: () => {
        setSubmitted(true);
      },
      onError: (err: any) => {
        toast({ title: "Failed to submit", description: err.message || "Try again.", variant: "destructive" });
      }
    });
  };

  if (submitted) {
    return (
      <PlayerLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 pt-4">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
            <div className="w-24 h-24 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-400" />
            </div>
          </motion.div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-display">Thank You!</h2>
            <p className="text-muted-foreground text-sm max-w-[280px] mx-auto">
              We've received your feedback. Your input helps us build a better experience for everyone. We'll look into this right away.
            </p>
          </div>
          <Button onClick={() => { setSubmitted(false); setMessage(""); setRating(0); setRelatedPcId(""); setIsAnonymous(false); }} variant="outline" className="border-white/10">
            Submit Another
          </Button>
        </div>
      </PlayerLayout>
    );
  }

  return (
    <PlayerLayout>
      <div className="space-y-6 pt-4">
        <div>
          <h1 className="text-2xl font-bold font-display">Feedback</h1>
          <p className="text-muted-foreground text-sm">Help us improve GGX. Your feedback goes directly to management.</p>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Category</label>
          <div className="space-y-2">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const active = category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left",
                    active
                      ? cat.color
                      : "bg-white/3 border-white/10 text-muted-foreground hover:bg-white/5"
                  )}
                >
                  <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0", active ? "border-current" : "border-white/20")}>
                    {active && <div className="w-2 h-2 rounded-full bg-current" />}
                  </div>
                  <Icon className="w-4 h-4" />
                  <span className="font-medium text-sm">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Star Rating */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Rate Your Experience</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110"
              >
                <Star className={cn(
                  "w-8 h-8 transition-colors",
                  star <= (hoveredStar || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-white/20"
                )} />
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Your Message</label>
          <Textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Tell us what's on your mind..."
            className="min-h-[120px] bg-black/20 border-white/10 resize-none"
          />
        </div>

        {/* PC Reference */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Attach PC # (Optional)</label>
          <Input
            value={relatedPcId}
            onChange={e => setRelatedPcId(e.target.value)}
            placeholder="e.g. PC-01, VIP-03"
            className="bg-black/20 border-white/10"
          />
        </div>

        {/* Anonymous */}
        <button
          onClick={() => setIsAnonymous(!isAnonymous)}
          className={cn(
            "w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left",
            isAnonymous
              ? "bg-primary/10 border-primary/30 text-primary"
              : "bg-white/3 border-white/10 text-muted-foreground hover:bg-white/5"
          )}
        >
          <div className={cn("w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0", isAnonymous ? "border-primary bg-primary" : "border-white/20")}>
            {isAnonymous && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12"><path d="M10 3L5 8L2 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>}
          </div>
          <span className="font-medium text-sm">Submit anonymously</span>
        </button>

        <Button
          className="w-full h-12 text-lg shadow-[0_0_15px_rgba(124,58,237,0.3)]"
          onClick={handleSubmit}
          disabled={submitFeedbackMutation.isPending || !message.trim()}
        >
          {submitFeedbackMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <MessageSquare className="w-4 h-4 mr-2" />}
          Submit Feedback
        </Button>
      </div>
    </PlayerLayout>
  );
}
