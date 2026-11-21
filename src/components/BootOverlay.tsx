import { useEffect, useState } from "react";
import { motion } from "motion/react";

const BOOT_LINES = [
  { prefix: "SYS", text: "initializing workspace · adper.me", accent: "text-text-hi", delay: 0 },
  { prefix: "OK", text: "modules loaded · cybersecurity · ai/ml · forensics", accent: "text-mint", delay: 140 },
  { prefix: "OK", text: "indexed 13 builds · 4 credentials · 10 logs", accent: "text-cyan", delay: 290 },
  { prefix: "RDY", text: "interface operational", accent: "text-mint", delay: 450 },
];

export function BootOverlay({ onComplete }: { onComplete: () => void }) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const timers: number[] = [];
    BOOT_LINES.forEach((line, idx) => {
      timers.push(
        window.setTimeout(() => {
          setVisibleCount(idx + 1);
        }, line.delay),
      );
    });
    timers.push(window.setTimeout(onComplete, 880));

    const handleSkip = () => onComplete();
    window.addEventListener("keydown", handleSkip, { once: true });

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener("keydown", handleSkip);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.35, ease: "easeOut" } }}
      onClick={onComplete}
      className="fixed inset-0 z-[1000] bg-bg flex items-center justify-center px-6 select-none"
    >
      <div className="w-full max-w-[480px] hud-panel rounded-[4px] p-6 relative">
        <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan/60" />
        <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan/60" />

        <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.2em] uppercase text-text-dim mb-4 pb-3 border-b border-border">
          <span>adper · telemetry boot</span>
          <span className="text-cyan/70">click / key to skip</span>
        </div>

        <div className="space-y-2 font-mono text-xs min-h-[104px]">
          {BOOT_LINES.slice(0, visibleCount).map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-3"
            >
              <span
                className={`text-[10px] px-1.5 py-0.5 border border-border-hi bg-bg-2/80 tracking-wider ${line.accent}`}
              >
                {line.prefix}
              </span>
              <span className="text-text">{line.text}</span>
            </motion.div>
          ))}
        </div>

        <div className="mt-5 h-[2px] w-full bg-border overflow-hidden">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.82, ease: "easeInOut" }}
            className="h-full bg-gradient-to-r from-cyan via-sky to-mint"
          />
        </div>
      </div>
    </motion.div>
  );
}
