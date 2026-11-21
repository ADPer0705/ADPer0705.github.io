import { useEffect, useState, type ReactNode } from "react";
import { motion } from "motion/react";

const BOOT_LINES: Array<{ delay: number; content: ReactNode }> = [
  {
    delay: 0,
    content: (
      <>
        <span className="text-text-dim">&gt; </span>
        kernel init · adper/personal-v2.0
      </>
    ),
  },
  {
    delay: 160,
    content: (
      <>
        <span className="text-text-dim">&gt; </span>
        <span className="text-mint">[ OK ]</span> loading module:{" "}
        <span className="text-cyan">cybersecurity</span>
      </>
    ),
  },
  {
    delay: 290,
    content: (
      <>
        <span className="text-text-dim">&gt; </span>
        <span className="text-mint">[ OK ]</span> loading module:{" "}
        <span className="text-cyan">ai-ml-systems</span>
      </>
    ),
  },
  {
    delay: 420,
    content: (
      <>
        <span className="text-text-dim">&gt; </span>
        <span className="text-mint">[ OK ]</span> mounting projects: verity
        droidscanner gloss inquiro chronotrace praetor merklewatch
      </>
    ),
  },
  {
    delay: 550,
    content: (
      <>
        <span className="text-text-dim">&gt; </span>
        <span className="text-mint">[ OK ]</span> net interfaces: github email
        linkedin
      </>
    ),
  },
  {
    delay: 680,
    content: (
      <>
        <span className="text-text-dim">&gt; </span>
        status: <span className="text-mint">[ operational ]</span> · env: linux
        · shell: bash/nvim
      </>
    ),
  },
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
    timers.push(window.setTimeout(onComplete, 1350));

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
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      onClick={onComplete}
      className="fixed inset-0 z-[1000] bg-bg flex items-center justify-start px-6 md:px-[15vw] select-none"
    >
      <div className="flex flex-col gap-1">
        {BOOT_LINES.slice(0, visibleCount).map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.16 }}
            className="font-mono text-xs md:text-[13px] text-text-dim leading-6"
          >
            {line.content}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
