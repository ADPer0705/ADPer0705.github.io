import { useEffect, useState } from "react";

interface StatusBarProps {
  currentSection: string;
  rightMeta?: string;
}

export function StatusBar({ currentSection, rightMeta }: StatusBarProps) {
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      if (max <= 0) {
        setScrollPct(0);
        return;
      }
      setScrollPct(Math.round((window.scrollY / max) * 100));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[28px] bg-bg-2/90 backdrop-blur-md border-t border-border flex items-center px-3 md:px-5 gap-3 md:gap-4 font-mono text-[10px] md:text-[11px] text-text-dim z-[500] tracking-wider">
      <span className="flex items-center gap-1.5 bg-cyan/12 border border-cyan/35 text-cyan px-2 py-[1px] font-medium tracking-[0.12em] shrink-0 rounded-[2px]">
        <span className="w-1.5 h-1.5 rounded-full bg-mint" />
        ONLINE
      </span>
      <span className="text-border-hi">·</span>
      <span className="text-text-hi truncate">~/{currentSection}</span>
      <span className="hidden sm:inline text-border-hi">·</span>
      <span className="hidden sm:inline">security · ai/ml · forensics</span>

      <div className="ml-auto flex items-center gap-4 shrink-0">
        {rightMeta ? (
          <span className="hidden md:inline text-text-dim">{rightMeta}</span>
        ) : (
          <span className="hidden md:inline">
            <span className="text-cyan/80">⌘K</span> quick command
          </span>
        )}
        <span className="tabular-nums text-text">
          {String(scrollPct).padStart(2, "0")}%
        </span>
      </div>
    </div>
  );
}
