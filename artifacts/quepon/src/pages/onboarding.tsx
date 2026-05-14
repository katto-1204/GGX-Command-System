import { AnimatePresence, animate as motionAnimate, motion, useMotionValue, useTransform } from "framer-motion";
import { ChevronRight, ChevronsRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

const slides = [
  {
    title: "Play the Best Games",
    subtitle: "Check available PCs, join the queue, and start your session faster.",
    image: "/gaming_onboarding_1_1778711195013.png",
    accent: "from-primary to-purple-400",
  },
  {
    title: "Skip the Waiting Confusion",
    subtitle: "See your queue position in real time and know when its your turn.",
    image: "/skipthewait.png",
    accent: "from-purple-500 to-fuchsia-500",
  },
  {
    title: "Control Your Session",
    subtitle: "View your assigned PC, remaining time, wallet balance, and session status in one place.",
    image: "/media__1778711031664.png",
    accent: "from-fuchsia-500 to-primary",
  },
  {
    title: "Order, Report, and Stay Updated",
    subtitle: "Order snacks, report issues, view promos, and get shop updates without asking the counter.",
    image: "/lastpage.png",
    accent: "from-primary to-purple-600",
  },
];

const swipeConfidenceThreshold = 8000;

function swipePower(offset: number, velocity: number) {
  return Math.abs(offset) * velocity;
}

export default function Onboarding() {
  const [[page, direction], setPage] = useState([0, 0]);
  const [, setLocation] = useLocation();
  const slideIndex = Math.max(0, Math.min(page, slides.length - 1));
  const slide = slides[slideIndex];

  const paginate = (newDirection: number) => {
    const next = page + newDirection;
    if (next < 0 || next > slides.length - 1) return;
    setPage([next, newDirection]);
  };

  const complete = () => {
    try {
      localStorage.setItem("quepon_onboarding_seen", "true");
    } catch {
      // Storage can be unavailable in private or embedded browser contexts.
    }
    setLocation("/role-selection");
  };

  return (
    <div className="min-h-[100dvh] w-full bg-background relative overflow-hidden text-white">
      {/* @ts-ignore */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={slideIndex}
          custom={direction}
          initial={{ x: direction >= 0 ? "18%" : "-18%", opacity: 0, scale: 1.08 }}
          animate={{ x: "0%", opacity: 1, scale: 1 }}
          exit={{ x: direction >= 0 ? "-14%" : "14%", opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.55, ease: [0.22, 0.9, 0.28, 1] }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.7}
          onDragEnd={(_, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x);
            if (swipe < -swipeConfidenceThreshold) paginate(1);
            if (swipe > swipeConfidenceThreshold) paginate(-1);
          }}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
        >
          <motion.img
            src={slide.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            animate={{ scale: [1.05, 1.1, 1.05], x: slideIndex % 2 === 0 ? [0, -10, 0] : [0, 10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/92" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(124,58,237,0.24),transparent_34%),radial-gradient(circle_at_80%_82%,rgba(168,85,247,0.24),transparent_28%)]" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 min-h-[100dvh] flex flex-col px-6 pb-8 pt-[max(2rem,env(safe-area-inset-top))]">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md p-2">
              <img src="/ggx logo.png" alt="GGX" className="h-full w-full object-contain" />
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-[0.34em] text-white/45 font-black">GGX Hub</div>
              <div className="font-display text-lg font-black italic tracking-tight">QUEPON</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setLocation("/role-selection")}
            className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-[9px] font-black uppercase tracking-[0.24em] text-white/55 backdrop-blur-md active:scale-95"
          >
            Skip
          </button>
        </header>

        <main className="flex flex-1 items-end pb-36">
          {/* @ts-ignore */}
          <AnimatePresence mode="wait">
            <motion.div
              key={slideIndex}
              initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
              transition={{ duration: 0.42, ease: "easeOut" }}
              className="max-w-sm"
            >
              <div className={cn("mb-5 h-1.5 w-24 rounded-full bg-gradient-to-r shadow-[0_0_22px_rgba(124,58,237,0.6)]", slide.accent)} />
              <h1 className="text-4xl font-black font-display tracking-tight leading-[0.95] drop-shadow-[0_3px_18px_rgba(0,0,0,0.75)]">
                {slide.title}
              </h1>
              <p className="mt-5 text-base leading-7 text-white/78 font-semibold drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
                {slide.subtitle}
              </p>
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="absolute inset-x-0 bottom-0 z-20 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-16 bg-gradient-to-t from-black via-black/80 to-transparent">
          <div className="mx-auto max-w-sm space-y-6">
            <div className="flex items-center justify-center gap-2">
              {slides.map((_, index) => (
                <button
                  type="button"
                  key={index}
                  onClick={() => setPage([index, index > slideIndex ? 1 : -1])}
                  className="h-4 px-1"
                  aria-label={`Go to onboarding slide ${index + 1}`}
                >
                  <motion.span
                    className="block h-2 rounded-full bg-white/25"
                    animate={{
                      width: index === slideIndex ? 34 : 8,
                      backgroundColor: index === slideIndex ? "rgb(168 85 247)" : "rgba(255,255,255,0.24)",
                    }}
                  />
                </button>
              ))}
            </div>

            {slideIndex === slides.length - 1 ? (
              <SlideToStart onComplete={complete} />
            ) : (
              <button
                type="button"
                onClick={() => paginate(1)}
                className="h-14 w-full rounded-full bg-white/10 border border-white/15 backdrop-blur-xl text-[11px] font-black uppercase tracking-[0.24em] text-white shadow-[0_0_28px_rgba(124,58,237,0.18)] active:scale-[0.98]"
              >
                Next
                <ChevronRight className="ml-2 inline h-4 w-4" />
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}

function SlideToStart({ onComplete }: { onComplete: () => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [maxDrag, setMaxDrag] = useState(220);
  const [complete, setComplete] = useState(false);
  const fillWidth = useTransform(x, [0, maxDrag], ["18%", "100%"]);

  useEffect(() => {
    const updateWidth = () => {
      if (!trackRef.current) return;
      setMaxDrag(Math.max(120, trackRef.current.offsetWidth - 64));
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const handleEnd = () => {
    if (x.get() >= maxDrag * 0.75) {
      setComplete(true);
      void motionAnimate(x, maxDrag, { duration: 0.2, ease: "easeOut" });
      window.setTimeout(onComplete, 320);
      return;
    }

    void motionAnimate(x, 0, { type: "spring", stiffness: 460, damping: 34 });
  };

  return (
    <div
      ref={trackRef}
      className="relative h-16 w-full overflow-hidden rounded-full bg-gradient-to-r from-primary to-purple-600 p-1.5 shadow-[0_0_34px_rgba(124,58,237,0.5)]"
    >
      <motion.div className="absolute inset-y-0 left-0 rounded-full bg-white/18" style={{ width: fillWidth as any }} />
      <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm font-black uppercase tracking-[0.28em] text-white">
        Start
        <ChevronsRight className="h-5 w-5 animate-pulse" />
      </div>
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: maxDrag }}
        dragElastic={0.04}
        style={{ x }}
        onDragEnd={handleEnd}
        animate={complete ? { scale: [1, 1.08, 1], boxShadow: "0 0 30px rgba(255,255,255,0.9)" } : undefined}
        className="relative z-10 flex h-[52px] w-[52px] cursor-grab items-center justify-center rounded-full bg-white text-primary shadow-xl active:cursor-grabbing"
      >
        <ChevronsRight className="h-6 w-6" />
      </motion.div>
    </div>
  );
}
