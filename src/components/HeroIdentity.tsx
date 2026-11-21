import { motion } from "motion/react";
import aboutData from "../data/whoami.json";
import projectsData from "../data/projects.json";
import certificationsData from "../data/certifications.json";
import { cn, getAllBlogPosts } from "../lib/utils";
import { SpotlightCard } from "./SpotlightCard";

interface HeroIdentityProps {
  onOpenCommand: () => void;
}

export function HeroIdentity({ onOpenCommand }: HeroIdentityProps) {
  const postCount = getAllBlogPosts().length;

  const telemetryRows = [
    { key: "alias", value: aboutData.handle, accent: "text-cyan" },
    { key: "full_name", value: aboutData.name, accent: "text-text-hi font-medium" },
    { key: "focus", value: aboutData.role, accent: "text-text-hi" },
    { key: "institution", value: aboutData.institution, accent: "text-text" },
    { key: "location", value: aboutData.location, accent: "text-text" },
    { key: "status", value: "active · seeking opportunities", accent: "text-mint" },
  ];

  const focusStyles = [
    "border-sky/30 text-sky bg-sky/5 hover:border-sky/60",
    "border-cyan/30 text-cyan bg-cyan/5 hover:border-cyan/60",
    "border-violet/30 text-violet bg-violet/5 hover:border-violet/60",
    "border-mint/30 text-mint bg-mint/5 hover:border-mint/60",
    "border-amber/30 text-amber bg-amber/5 hover:border-amber/60",
  ];

  return (
    <section
      id="identity"
      className="relative min-h-[calc(100vh-52px)] border-b border-border flex items-center"
    >
      <div className="w-full max-w-[1280px] mx-auto px-5 md:px-10 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
        {/* Left editorial column */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="lg:col-span-7 flex flex-col items-start"
        >
          {/* Availability telemetry badge */}
          <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-text-hi border border-border-hi bg-bg-2/80 backdrop-blur-md px-3.5 py-1.5 rounded-full mb-7 tracking-[0.14em] uppercase">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mint opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-mint" />
            </span>
            <span>{aboutData.location}</span>
            <span className="text-border-hi">·</span>
            <span className="text-mint">available for opportunities</span>
          </div>

          <div className="font-mono flex items-center gap-2.5 text-[11px] text-cyan/80 tracking-[0.22em] uppercase mb-3">
            <span className="w-5 h-px bg-cyan" />
            <span>process · identity</span>
          </div>

          <h1
            className="font-display font-black text-[clamp(80px,12vw,158px)] leading-[0.84] text-text-hi tracking-[-0.03em] mb-7 relative select-none cyber-glitch"
            data-text={aboutData.handle}
          >
            {aboutData.handle}
          </h1>

          <p className="font-mono text-xs md:text-sm text-cyan tracking-[0.12em] uppercase mb-3">
            {aboutData.title}
          </p>

          <p className="text-base md:text-lg text-text leading-relaxed max-w-[560px] mb-9">
            {aboutData.synopsis}
          </p>

          {/* Primary CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`mailto:${aboutData.contact.email}`}
              className="font-mono text-xs md:text-[13px] font-medium bg-cyan text-bg px-5 py-2.5 rounded-[3px] tracking-[0.08em] uppercase transition-all duration-200 hover:bg-cyan/90 hover:shadow-[0_0_24px_rgba(0,229,200,0.35)]"
            >
              init_contact
            </a>
            <a
              href="/anay_pandya_cv.pdf"
              download="anay_pandya_cv.pdf"
              className="font-mono text-xs md:text-[13px] text-text-hi border border-border-hi bg-bg-2/75 backdrop-blur-md px-5 py-2.5 rounded-[3px] tracking-[0.08em] uppercase transition-all duration-200 hover:border-cyan hover:text-cyan"
            >
              pull_cv ↓
            </a>
            <a
              href={`https://${aboutData.contact.github}`}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-xs md:text-[13px] text-text border border-border-hi bg-bg-2/50 px-4 py-2.5 rounded-[3px] tracking-[0.08em] uppercase transition-all duration-200 hover:border-cyan/60 hover:text-text-hi"
            >
              github ↗
            </a>
            <button
              type="button"
              onClick={onOpenCommand}
              className="font-mono text-xs text-text-dim border border-border px-3.5 py-2.5 rounded-[3px] tracking-wider transition-colors duration-200 hover:border-cyan/50 hover:text-cyan"
            >
              ⌘K explore
            </button>
          </div>

          {/* Live compact stats */}
          <div className="mt-12 pt-6 border-t border-border/80 w-full max-w-[540px] grid grid-cols-3 gap-6">
            <div>
              <div className="font-display font-black text-3xl text-text-hi leading-none tabular-nums">
                {String(projectsData.length).padStart(2, "0")}
              </div>
              <div className="font-mono text-[10px] text-text-dim uppercase tracking-[0.16em] mt-1.5">
                systems built
              </div>
            </div>
            <div>
              <div className="font-display font-black text-3xl text-text-hi leading-none tabular-nums">
                {String(certificationsData.length).padStart(2, "0")}
              </div>
              <div className="font-mono text-[10px] text-text-dim uppercase tracking-[0.16em] mt-1.5">
                credentials
              </div>
            </div>
            <div>
              <div className="font-display font-black text-3xl text-text-hi leading-none tabular-nums">
                {String(postCount).padStart(2, "0")}
              </div>
              <div className="font-mono text-[10px] text-text-dim uppercase tracking-[0.16em] mt-1.5">
                field logs
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Optical Telemetry Panel */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.12, ease: "easeOut" }}
          className="lg:col-span-5"
        >
          <SpotlightCard corners className="p-6 md:p-7 relative">
            {/* Subtle concentric optical calibration ring in background */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-20 -right-20 w-[260px] h-[260px] opacity-25"
            >
              <svg
                viewBox="0 0 260 260"
                className="w-full h-full animate-orbit-slow"
                fill="none"
              >
                <circle
                  cx="130"
                  cy="130"
                  r="118"
                  stroke="#00e5c8"
                  strokeWidth="0.7"
                  strokeDasharray="4 8"
                />
                <circle
                  cx="130"
                  cy="130"
                  r="94"
                  stroke="#38bdf8"
                  strokeWidth="0.6"
                  strokeDasharray="48 16 10 16"
                />
                <circle
                  cx="130"
                  cy="130"
                  r="66"
                  stroke="#00e5c8"
                  strokeWidth="0.5"
                  strokeOpacity="0.6"
                />
              </svg>
              <svg
                viewBox="0 0 260 260"
                className="w-full h-full absolute inset-0 animate-orbit-reverse"
                fill="none"
              >
                <circle
                  cx="130"
                  cy="130"
                  r="80"
                  stroke="#9b7dff"
                  strokeWidth="0.6"
                  strokeDasharray="2 10"
                />
                <line x1="130" y1="6" x2="130" y2="20" stroke="#00e5c8" strokeWidth="1" />
                <line x1="254" y1="130" x2="240" y2="130" stroke="#00e5c8" strokeWidth="1" />
                <line x1="130" y1="254" x2="130" y2="240" stroke="#00e5c8" strokeWidth="1" />
                <line x1="6" y1="130" x2="20" y2="130" stroke="#00e5c8" strokeWidth="1" />
              </svg>
            </div>

            {/* Card header */}
            <div className="relative z-10 flex items-center justify-between pb-4 mb-5 border-b border-border">
              <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-cyan">
                identity_spec
              </div>
              <div className="font-mono text-[10px] text-text-dim tracking-widest">
                ENV // LINUX
              </div>
            </div>

            {/* Spec readout */}
            <div className="relative z-10 divide-y divide-border/60">
              {telemetryRows.map((row) => (
                <div
                  key={row.key}
                  className="grid grid-cols-[96px_16px_1fr] items-baseline py-2.5 font-mono text-xs"
                >
                  <span className="text-text-dim tracking-wider">{row.key}</span>
                  <span className="text-border-hi">::</span>
                  <span className={cn("leading-snug", row.accent)}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Focus areas */}
            <div className="relative z-10 mt-6 pt-5 border-t border-border">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-dim mb-3">
                focus_vectors
              </div>
              <div className="flex flex-wrap gap-1.5">
                {aboutData.focus_areas.map((area, i) => (
                  <span
                    key={area}
                    className={cn(
                      "font-mono text-[11px] px-2.5 py-1 border rounded-[2px] tracking-wider transition-colors duration-200",
                      focusStyles[i % focusStyles.length],
                    )}
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>

            {/* Active Stack */}
            <div className="relative z-10 mt-5 pt-4 border-t border-border/60">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-dim mb-2.5">
                active_stack
              </div>
              <div className="flex flex-wrap gap-1.5">
                {aboutData.current_stack.map((tech) => (
                  <span
                    key={tech}
                    className="font-mono text-[11px] text-text border border-border-hi/80 bg-bg/60 px-2 py-0.5 rounded-[2px] tracking-wider"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </SpotlightCard>
        </motion.div>
      </div>
    </section>
  );
}
