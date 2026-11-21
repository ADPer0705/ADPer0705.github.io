import { motion } from "motion/react";
import experienceData from "../data/experience.json";
import communityData from "../data/community.json";
import { cn, resolveAssetUrl } from "../lib/utils";
import { SectionHeader } from "./SectionHeader";
import { SpotlightCard } from "./SpotlightCard";

interface RecordEntry {
  org: string;
  role: string;
  period: string;
  type: string;
  organization_logo?: string;
  location?: string;
  description: string;
  highlights?: string[];
  tags?: string[];
}

export function RecordTimeline() {
  const entries: RecordEntry[] = [
    ...(experienceData as RecordEntry[]),
    ...(communityData as RecordEntry[]),
  ];

  return (
    <section
      id="record"
      className="relative border-b border-border py-20 md:py-24 bg-bg-2/35"
    >
      <div className="max-w-[1280px] mx-auto px-5 md:px-10">
        <SectionHeader
          eyebrow="experience · research · community leadership"
          title="Record"
          index="02"
        />

        <div className="relative pl-7 md:pl-12 before:content-[''] before:absolute before:left-[9px] md:before:left-[13px] before:top-3 before:bottom-3 before:w-px before:bg-gradient-to-b before:from-cyan/70 before:via-border-hi before:to-transparent">
          <div className="flex flex-col gap-7">
            {entries.map((entry, idx) => {
              const isCommunity = entry.type === "community";
              const logoSrc = entry.organization_logo
                ? resolveAssetUrl(entry.organization_logo)
                : null;

              return (
                <motion.div
                  key={`${entry.org}-${entry.period}`}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className="relative group"
                >
                  {/* Timeline diamond node */}
                  <div
                    className={cn(
                      "absolute -left-[23px] md:-left-[40px] top-6 w-2.5 h-2.5 rotate-45 border bg-bg transition-all duration-200",
                      isCommunity
                        ? "border-violet group-hover:bg-violet group-hover:shadow-[0_0_12px_rgba(155,125,255,0.7)]"
                        : "border-cyan group-hover:bg-cyan group-hover:shadow-[0_0_12px_rgba(0,229,200,0.7)]",
                    )}
                  />
                  <div className="hidden md:block absolute -left-[26px] top-[28px] w-6 h-px bg-border-hi group-hover:bg-cyan/50 transition-colors" />

                  <SpotlightCard className="p-6 md:p-7">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      <div className="flex items-start gap-4">
                        {logoSrc && (
                          <img
                            src={logoSrc}
                            alt={entry.org}
                            className="w-12 h-12 rounded-[4px] object-cover border border-border-hi bg-bg shrink-0"
                          />
                        )}
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span
                              className={cn(
                                "font-mono text-[10px] px-2 py-0.5 border rounded-[2px] uppercase tracking-[0.14em]",
                                isCommunity
                                  ? "border-violet/45 text-violet bg-violet/10"
                                  : "border-sky/45 text-sky bg-sky/10",
                              )}
                            >
                              {entry.type}
                            </span>
                            <span className="font-mono text-xs text-text-dim tracking-wider">
                              {entry.period}
                            </span>
                          </div>

                          <h3 className="font-display font-bold text-2xl md:text-[30px] text-text-hi uppercase tracking-wide leading-tight">
                            {entry.role}
                          </h3>
                          <div className="font-mono text-xs md:text-sm text-cyan mt-1 tracking-wide">
                            {entry.org}
                          </div>
                        </div>
                      </div>

                      {entry.location && (
                        <div className="font-mono text-[11px] text-text-dim sm:text-right shrink-0">
                          {entry.location}
                        </div>
                      )}
                    </div>

                    <p className="text-sm md:text-[15px] text-text leading-relaxed max-w-[780px]">
                      {entry.description}
                    </p>

                    {Array.isArray(entry.highlights) &&
                      entry.highlights.length > 0 && (
                        <ul className="mt-4 space-y-2 max-w-[780px]">
                          {entry.highlights.map((bullet) => (
                            <li
                              key={bullet}
                              className="text-sm text-text/95 leading-relaxed pl-5 relative before:content-['▸'] before:absolute before:left-0 before:text-cyan before:text-xs before:top-[2px]"
                            >
                              {bullet}
                            </li>
                          ))}
                        </ul>
                      )}

                    {Array.isArray(entry.tags) && entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-5 pt-4 border-t border-border/70">
                        {entry.tags.map((tag) => (
                          <span
                            key={tag}
                            className="font-mono text-[11px] text-text-dim border border-border-hi/80 bg-bg/60 px-2.5 py-0.5 rounded-[2px] tracking-wider transition-colors group-hover:text-text group-hover:border-border-hi"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </SpotlightCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
