import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import projectsData from "../data/projects.json";
import { cn } from "../lib/utils";
import { SectionHeader } from "./SectionHeader";
import { SpotlightCard } from "./SpotlightCard";

interface WorkShowcaseProps {
  selectedProjectId?: string | null;
}

const CATEGORY_META: Record<
  string,
  { label: string; badge: string }
> = {
  all: {
    label: "All",
    badge: "border-cyan/40 text-cyan bg-cyan/10",
  },
  sec: {
    label: "Security",
    badge: "border-sky/40 text-sky bg-sky/10",
  },
  ai: {
    label: "AI / ML",
    badge: "border-violet/40 text-violet bg-violet/10",
  },
  data: {
    label: "Data",
    badge: "border-amber/40 text-amber bg-amber/10",
  },
  tool: {
    label: "Tooling",
    badge: "border-mint/40 text-mint bg-mint/10",
  },
};

export function WorkShowcase({ selectedProjectId }: WorkShowcaseProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [openId, setOpenId] = useState<string | null>(
    projectsData[0]?.id ?? null,
  );

  useEffect(() => {
    if (selectedProjectId) {
      setActiveCategory("all");
      setOpenId(selectedProjectId);
    }
  }, [selectedProjectId]);

  const categories = useMemo(() => {
    const counts: Record<string, number> = { all: projectsData.length };
    for (const p of projectsData) {
      counts[p.category] = (counts[p.category] ?? 0) + 1;
    }
    return Object.entries(counts);
  }, []);

  const filteredProjects = useMemo(
    () =>
      activeCategory === "all"
        ? projectsData
        : projectsData.filter((p) => p.category === activeCategory),
    [activeCategory],
  );

  return (
    <section
      id="work"
      className="relative border-b border-border py-20 md:py-24"
    >
      <div className="max-w-[1280px] mx-auto px-5 md:px-10">
        <SectionHeader
          eyebrow="selected builds · engineering index"
          title="Work"
          index="01"
        />

        {/* Category filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-7">
          <div className="flex flex-wrap items-center gap-2 font-mono">
            {categories.map(([cat, count]) => {
              const active = activeCategory === cat;
              const meta = CATEGORY_META[cat] ?? {
                label: cat,
                badge: "border-border-hi text-text",
              };
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "relative px-3.5 py-1.5 text-xs tracking-wider uppercase rounded-[3px] border transition-colors duration-200",
                    active
                      ? "border-cyan/60 text-cyan bg-cyan/10"
                      : "border-border bg-bg-2/60 text-text-dim hover:text-text-hi hover:border-border-hi",
                  )}
                >
                  <span>{meta.label}</span>
                  <span className="ml-2 text-[10px] opacity-75 tabular-nums">
                    {String(count).padStart(2, "0")}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="font-mono text-[11px] text-text-dim tracking-wider">
            click any row to inspect specs
          </div>
        </div>

        {/* Column headers */}
        <div className="hidden md:grid grid-cols-[44px_245px_1fr_72px_92px_28px] gap-4 px-5 py-2.5 font-mono text-[10px] text-text-dim tracking-[0.16em] uppercase border-b border-border mb-2">
          <span>#</span>
          <span>project</span>
          <span>summary</span>
          <span>year</span>
          <span className="text-center">domain</span>
          <span />
        </div>

        {/* Project accordion index */}
        <div className="flex flex-col gap-2">
          {filteredProjects.map((p, i) => {
            const isOpen = openId === p.id;
            const catStyle =
              CATEGORY_META[p.category]?.badge ??
              "border-border-hi text-text bg-bg-2";
            const validLinks = Object.entries(p.links).filter(
              ([, url]) => Boolean(url) && url !== "#",
            );

            return (
              <SpotlightCard
                key={p.id}
                className={cn(
                  "transition-all duration-200",
                  isOpen
                    ? "border-cyan/50 shadow-[0_0_32px_-12px_rgba(0,229,200,0.22)]"
                    : "border-border/90",
                )}
              >
                <div
                  role="button"
                  tabIndex={0}
                  aria-expanded={isOpen}
                  onClick={() => setOpenId(isOpen ? null : p.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setOpenId(isOpen ? null : p.id);
                    }
                  }}
                  className={cn(
                    "grid grid-cols-[36px_1fr_auto] md:grid-cols-[44px_245px_1fr_72px_92px_28px] gap-3 md:gap-4 px-4 md:px-5 py-4 items-center transition-colors border-l-2",
                    isOpen
                      ? "border-l-cyan bg-bg-3/55"
                      : "border-l-transparent hover:bg-bg-2/50",
                  )}
                >
                  <span className="font-mono text-xs text-text-dim tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <div className="min-w-0">
                    <span
                      className={cn(
                        "font-display font-bold text-xl md:text-[22px] uppercase tracking-wider leading-none block truncate transition-colors",
                        isOpen ? "text-cyan" : "text-text-hi",
                      )}
                    >
                      {p.name}
                    </span>
                    <span className="md:hidden text-xs text-text-dim block truncate mt-1">
                      {p.tagline}
                    </span>
                  </div>

                  <span className="hidden md:block text-sm text-text truncate">
                    {p.tagline}
                  </span>

                  <span className="hidden md:block font-mono text-xs text-text-dim tabular-nums">
                    {p.year}
                  </span>

                  <span
                    className={cn(
                      "font-mono text-[10px] px-2.5 py-0.5 border rounded-[2px] tracking-[0.12em] uppercase text-center",
                      catStyle,
                    )}
                  >
                    {p.category}
                  </span>

                  <span
                    className={cn(
                      "hidden md:flex items-center justify-center font-mono text-xs text-text-dim transition-transform duration-200",
                      isOpen && "rotate-45 text-cyan",
                    )}
                  >
                    +
                  </span>
                </div>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.24, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 md:px-5 pb-5 pt-4 border-t border-border/80 bg-bg/40 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 md:pl-[60px]">
                        <div className="space-y-4">
                          <p className="text-sm md:text-[15px] text-text leading-relaxed max-w-[680px]">
                            {p.description}
                          </p>

                          <div className="flex flex-wrap gap-1.5">
                            {p.stack.map((tech) => (
                              <span
                                key={tech}
                                className="font-mono text-[11px] text-cyan bg-cyan/8 border border-cyan/25 px-2.5 py-0.5 rounded-[2px] tracking-wider"
                              >
                                {tech}
                              </span>
                            ))}
                            {Array.isArray(p.tags) &&
                              p.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="font-mono text-[11px] text-text-dim border border-border-hi px-2.5 py-0.5 rounded-[2px] tracking-wider"
                                >
                                  {tag}
                                </span>
                              ))}
                          </div>
                        </div>

                        <div className="flex flex-row md:flex-col justify-between md:items-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-border/50">
                          <div className="flex flex-wrap md:flex-col gap-2 md:items-end">
                            {validLinks.map(([type, url]) => (
                              <a
                                key={type}
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="font-mono text-xs text-text-hi border border-border-hi bg-bg-2/80 hover:border-cyan hover:text-cyan px-3.5 py-1.5 rounded-[3px] tracking-wider transition-colors inline-flex items-center gap-1.5"
                              >
                                <span>{type}</span>
                                <span className="text-cyan">↗</span>
                              </a>
                            ))}
                          </div>

                          <span
                            className={cn(
                              "font-mono text-[10px] px-2.5 py-0.5 border rounded-[2px] uppercase tracking-[0.12em] self-center md:self-end",
                              p.status === "active" || p.status === "In Progress"
                                ? "border-mint/40 text-mint bg-mint/10"
                                : "border-border-hi text-text-dim bg-bg-2/60",
                            )}
                          >
                            {p.status} · {p.year}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </SpotlightCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
