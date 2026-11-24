import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import projectsData from "../data/projects.json";
import socialData from "../data/social.json";
import { cn } from "../lib/utils";
import { SectionHeader } from "./SectionHeader";
import { SpotlightCard } from "./SpotlightCard";

interface WorkShowcaseProps {
  selectedProjectId?: string | null;
}

interface ProjectItem {
  id: string;
  title: string;
  name: string;
  tagline: string;
  description: string;
  highlights?: string[];
  tags?: string[];
  stack: string[];
  category: string;
  tier?: "featured" | "archive";
  version?: string;
  year: string;
  status: string;
  image?: string;
  link: string;
  links: Record<string, string | undefined>;
}

const PROJECTS = projectsData as ProjectItem[];

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

const LINK_LABELS: Record<string, string> = {
  wiki: "wiki / docs",
  github: "github",
  pypi: "pypi",
  npm: "npm",
};

export function WorkShowcase({ selectedProjectId }: WorkShowcaseProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [openArchiveId, setOpenArchiveId] = useState<string | null>(null);

  const featuredProjects = useMemo(
    () => PROJECTS.filter((p) => p.tier === "featured"),
    [],
  );

  const archiveProjects = useMemo(
    () => PROJECTS.filter((p) => p.tier !== "featured"),
    [],
  );

  useEffect(() => {
    if (!selectedProjectId) return;
    const isFeatured = featuredProjects.some((p) => p.id === selectedProjectId);
    if (isFeatured) {
      setActiveCategory("all");
      setHighlightedId(selectedProjectId);
    } else {
      setOpenArchiveId(selectedProjectId);
      setHighlightedId(null);
    }

    const timer = window.setTimeout(() => {
      document
        .getElementById(`project-${selectedProjectId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);

    return () => window.clearTimeout(timer);
  }, [featuredProjects, selectedProjectId]);

  const categories = useMemo(() => {
    const counts: Record<string, number> = { all: featuredProjects.length };
    for (const p of featuredProjects) {
      counts[p.category] = (counts[p.category] ?? 0) + 1;
    }
    return Object.entries(counts);
  }, [featuredProjects]);

  const filteredFeatured = useMemo(
    () =>
      activeCategory === "all"
        ? featuredProjects
        : featuredProjects.filter((p) => p.category === activeCategory),
    [activeCategory, featuredProjects],
  );

  return (
    <section
      id="work"
      className="relative border-b border-border py-20 md:py-24"
    >
      <div className="max-w-[1280px] mx-auto px-5 md:px-10">
        <SectionHeader
          eyebrow="flagship builds · engineering index"
          title="Work"
          index="01"
        />

        {/* Category filter bar + prominent GitHub CTA */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
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

          <a
            href={socialData.github}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-xs text-text-hi border border-cyan/40 bg-cyan/8 hover:bg-cyan/15 hover:border-cyan px-3.5 py-1.5 rounded-[3px] tracking-wider transition-all duration-200 inline-flex items-center gap-2"
          >
            <span className="text-cyan">git://</span>
            <span>github.com/ADPer0705</span>
            <span className="text-cyan">↗</span>
          </a>
        </div>

        {/* Tier 1: Flagship Builds Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredFeatured.map((p, i) => {
            const isHighlighted = highlightedId === p.id;
            const catMeta = CATEGORY_META[p.category] ?? {
              label: p.category,
              badge: "border-border-hi text-text bg-bg-2",
            };
            const validLinks = Object.entries(p.links).filter(
              (entry): entry is [string, string] =>
                Boolean(entry[1]) && entry[1] !== "#",
            );

            return (
              <motion.div
                key={p.id}
                id={`project-${p.id}`}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
              >
                <SpotlightCard
                  corners
                  className={cn(
                    "p-6 h-full flex flex-col transition-all duration-200",
                    isHighlighted
                      ? "border-cyan/70 shadow-[0_0_36px_-10px_rgba(0,229,200,0.3)]"
                      : "border-border/90",
                  )}
                >
                  {/* Card top telemetry */}
                  <div className="flex items-center justify-between gap-3 pb-3.5 mb-4 border-b border-border/80">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs text-text-dim tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={cn(
                          "font-mono text-[10px] px-2 py-0.5 border rounded-[2px] tracking-[0.12em] uppercase",
                          catMeta.badge,
                        )}
                      >
                        {catMeta.label}
                      </span>
                    </div>

                    <span className="font-mono text-[11px] text-text-dim tracking-wider tabular-nums">
                      {p.version ? `${p.version} · ${p.year}` : p.year}
                    </span>
                  </div>

                  {/* Title & tagline */}
                  <div className="mb-3">
                    <h3 className="font-display font-bold text-2xl md:text-[28px] text-text-hi uppercase tracking-wider leading-none">
                      {p.name}
                    </h3>
                    <p className="font-mono text-xs text-cyan tracking-wider mt-1.5">
                      {p.tagline}
                    </p>
                  </div>

                  {/* Concise description */}
                  <p className="text-sm text-text leading-relaxed mb-4">
                    {p.description}
                  </p>

                  {/* Engineering highlights */}
                  {Array.isArray(p.highlights) && p.highlights.length > 0 && (
                    <ul className="space-y-1.5 mb-5">
                      {p.highlights.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 text-[13px] text-text/90 leading-snug"
                        >
                          <span className="text-cyan text-xs mt-0.5 shrink-0">
                            ▸
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Stack chips */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {p.stack.map((tech) => (
                      <span
                        key={tech}
                        className="font-mono text-[11px] text-cyan bg-cyan/8 border border-cyan/25 px-2 py-0.5 rounded-[2px] tracking-wider"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Footer action bar */}
                  <div className="mt-auto pt-4 border-t border-border/70 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {validLinks.map(([type, url]) => {
                        const isPrimaryWiki = type === "wiki";
                        return (
                          <a
                            key={type}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className={cn(
                              "font-mono text-xs px-3 py-1.5 rounded-[3px] tracking-wider transition-colors inline-flex items-center gap-1.5 border",
                              isPrimaryWiki
                                ? "border-cyan/50 bg-cyan/12 text-cyan hover:bg-cyan/20 hover:border-cyan"
                                : "border-border-hi bg-bg-2/80 text-text-hi hover:border-cyan hover:text-cyan",
                            )}
                          >
                            <span>{LINK_LABELS[type] ?? type}</span>
                            <span className="text-cyan">↗</span>
                          </a>
                        );
                      })}
                    </div>

                    <span
                      className={cn(
                        "font-mono text-[10px] px-2 py-0.5 border rounded-[2px] uppercase tracking-[0.12em]",
                        p.status === "Active"
                          ? "border-mint/40 text-mint bg-mint/10"
                          : "border-border-hi text-text-dim bg-bg-2/60",
                      )}
                    >
                      {p.status}
                    </span>
                  </div>
                </SpotlightCard>
              </motion.div>
            );
          })}
        </div>

        {/* Tier 2: Compact Archive & Smaller Builds */}
        {archiveProjects.length > 0 && (
          <div className="mt-14 pt-10 border-t border-border/70">
            <div className="flex flex-wrap items-baseline justify-between gap-3 mb-5">
              <div className="font-mono flex items-center gap-2.5 text-xs text-text-dim tracking-[0.16em] uppercase">
                <span className="w-4 h-px bg-border-hi shrink-0" />
                <span>lab_archive // smaller builds & coursework</span>
                <span className="text-[10px] text-cyan/80 tabular-nums">
                  ({String(archiveProjects.length).padStart(2, "0")})
                </span>
              </div>
              <span className="font-mono text-[11px] text-text-dim">
                lightweight utilities, experiments & earlier coursework
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              {archiveProjects.map((p) => {
                const isOpen = openArchiveId === p.id;
                const validLinks = Object.entries(p.links).filter(
                  (entry): entry is [string, string] =>
                    Boolean(entry[1]) && entry[1] !== "#",
                );

                return (
                  <div
                    key={p.id}
                    id={`project-${p.id}`}
                    className={cn(
                      "rounded-[4px] border transition-colors duration-200 bg-bg-2/35",
                      isOpen
                        ? "border-cyan/40 bg-bg-2/60"
                        : "border-border/70 hover:border-border-hi",
                    )}
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      aria-expanded={isOpen}
                      onClick={() => setOpenArchiveId(isOpen ? null : p.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setOpenArchiveId(isOpen ? null : p.id);
                        }
                      }}
                      className="flex flex-wrap md:flex-nowrap items-center justify-between gap-3 px-4 py-3 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="font-display font-bold text-base md:text-lg text-text-hi uppercase tracking-wider shrink-0">
                          {p.name}
                        </span>
                        <span className="hidden sm:inline text-border-hi">·</span>
                        <span className="text-xs text-text-dim truncate">
                          {p.tagline}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        {p.stack[0] && (
                          <span className="hidden md:inline-block font-mono text-[10px] text-text-dim border border-border-hi/80 px-2 py-0.5 rounded-[2px]">
                            {p.stack[0]}
                          </span>
                        )}
                        <span className="font-mono text-[11px] text-text-dim tabular-nums">
                          {p.year}
                        </span>
                        <div
                          className="flex items-center gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {validLinks.map(([type, url]) => (
                            <a
                              key={type}
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="font-mono text-[11px] text-text hover:text-cyan border border-border-hi hover:border-cyan/50 bg-bg/60 px-2.5 py-0.5 rounded-[2px] transition-colors inline-flex items-center gap-1"
                            >
                              <span>{LINK_LABELS[type] ?? type}</span>
                              <span className="text-cyan">↗</span>
                            </a>
                          ))}
                        </div>
                        <span
                          className={cn(
                            "font-mono text-xs text-text-dim transition-transform duration-200 ml-1",
                            isOpen && "rotate-45 text-cyan",
                          )}
                        >
                          +
                        </span>
                      </div>
                    </div>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-3.5 pt-2.5 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <p className="text-xs md:text-[13px] text-text leading-relaxed max-w-[700px]">
                              {p.description}
                            </p>
                            <div className="flex flex-wrap gap-1.5 shrink-0">
                              {p.stack.map((tech) => (
                                <span
                                  key={tech}
                                  className="font-mono text-[10px] text-cyan/85 bg-cyan/6 border border-cyan/20 px-2 py-0.5 rounded-[2px]"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom GitHub Repositories Callout */}
        <SpotlightCard className="mt-8 p-5 md:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-border-hi/70">
          <div>
            <div className="font-mono text-[11px] text-cyan uppercase tracking-[0.16em] mb-1">
              more_repositories
            </div>
            <p className="text-sm text-text">
              Additional experiments, hackathon notebooks, cloud security labs, and archived builds live on GitHub.
            </p>
          </div>
          <a
            href={`${socialData.github}?tab=repositories`}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-xs text-text-hi border border-cyan/50 bg-cyan/10 hover:bg-cyan/20 hover:border-cyan px-4 py-2 rounded-[3px] tracking-wider uppercase transition-colors inline-flex items-center gap-2 shrink-0"
          >
            <span>All repositories on GitHub</span>
            <span className="text-cyan">↗</span>
          </a>
        </SpotlightCard>
      </div>
    </section>
  );
}
