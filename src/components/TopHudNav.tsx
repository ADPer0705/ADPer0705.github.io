import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

const NAV_LINKS = [
  { id: "work", label: "work" },
  { id: "record", label: "record" },
  { id: "skills", label: "skills" },
  { id: "whoami", label: "whoami" },
  { id: "signals", label: "signals" },
  { id: "log", label: "log" },
];

interface TopHudNavProps {
  activeSection?: string;
  onOpenCommand: () => void;
  readingProgress?: number;
}

export function TopHudNav({
  activeSection,
  onOpenCommand,
  readingProgress,
}: TopHudNavProps) {
  const [time, setTime] = useState(() => new Date());
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = window.setInterval(() => setTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const isLogsRoute =
    location.pathname.startsWith("/logs") ||
    location.pathname.startsWith("/blog");

  const handleNavClick = (id: string) => {
    setMobileOpen(false);
    if (id === "log" && location.pathname !== "/") {
      navigate("/logs");
      return;
    }
    if (location.pathname !== "/") {
      navigate(`/#${id}`);
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[500]">
      <nav className="h-[52px] bg-bg/80 border-b border-border/90 backdrop-blur-xl px-4 md:px-7 flex items-center justify-between gap-4">
        {/* Brand prompt */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="font-mono text-xs md:text-[13px] text-cyan tracking-wider shrink-0 flex items-center gap-1.5 group"
        >
          <span>
            <span className="text-text-dim">debie</span>@adper
            <span className="text-text-dim">:</span>~
            <span className="text-text-dim">$</span>
          </span>
          <span className="inline-block w-1.5 h-3.5 bg-cyan/70 animate-pulse" />
        </a>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-1 font-mono">
          {NAV_LINKS.map((link) => {
            const isActive =
              (isLogsRoute && link.id === "log") ||
              (!isLogsRoute && activeSection === link.id);
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => handleNavClick(link.id)}
                className={cn(
                  "relative px-3 py-1.5 text-xs tracking-[0.08em] transition-colors duration-200 rounded-[3px]",
                  isActive
                    ? "text-cyan"
                    : "text-text-dim hover:text-text-hi",
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="hud-nav-active"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    className="absolute inset-0 bg-cyan/10 border border-cyan/30 rounded-[3px]"
                  />
                )}
                <span className="relative z-10">./{link.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right telemetry controls */}
        <div className="flex items-center gap-3 font-mono shrink-0">
          <button
            type="button"
            onClick={onOpenCommand}
            aria-label="Open command palette"
            className="flex items-center gap-2 text-[11px] text-text hover:text-cyan border border-border-hi hover:border-cyan/60 bg-bg-2/80 px-2.5 py-1 rounded-[3px] transition-colors duration-200"
          >
            <span className="hidden sm:inline tracking-wider text-text-dim">
              cmd
            </span>
            <kbd className="text-[10px] text-cyan tracking-widest">⌘K</kbd>
          </button>

          <div className="hidden sm:block text-xs text-text-dim tabular-nums tracking-wider pl-1 border-l border-border">
            {time.toLocaleTimeString("en-GB", { hour12: false })}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            className="md:hidden text-xs text-text-hi border border-border-hi px-2.5 py-1 rounded-[3px]"
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      {/* Optional reading progress bar */}
      {typeof readingProgress === "number" && (
        <div className="h-[2px] w-full bg-border/60">
          <div
            className="h-full bg-gradient-to-r from-cyan via-sky to-mint transition-[width] duration-100"
            style={{ width: `${Math.min(100, Math.max(0, readingProgress))}%` }}
          />
        </div>
      )}

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="md:hidden bg-bg-2/95 backdrop-blur-xl border-b border-border px-5 py-4 flex flex-col gap-2 font-mono"
          >
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => handleNavClick(link.id)}
                className="text-left text-xs text-text hover:text-cyan py-2 border-b border-border/50 last:border-b-0 tracking-widest"
              >
                ./{link.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
