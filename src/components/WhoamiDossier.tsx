import { useState } from "react";
import { motion } from "motion/react";
import aboutData from "../data/whoami.json";
import { resolveAssetUrl } from "../lib/utils";
import { SectionHeader } from "./SectionHeader";
import { SpotlightCard } from "./SpotlightCard";

export function WhoamiDossier() {
  const [copied, setCopied] = useState(false);
  const portraitUrl = resolveAssetUrl("assets/profile-pic.png");

  const copyEmail = () => {
    navigator.clipboard?.writeText(aboutData.contact.email);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section
      id="whoami"
      className="relative border-b border-border py-20 md:py-24 bg-bg-2/35"
    >
      <div className="max-w-[1280px] mx-auto px-5 md:px-10">
        <SectionHeader
          eyebrow="manual · operator profile"
          title="whoami"
          index="04"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Portrait & Dossier Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="lg:col-span-4"
          >
            <SpotlightCard corners className="overflow-hidden">
              <div className="relative aspect-[4/5] bg-bg overflow-hidden border-b border-border">
                <img
                  src={portraitUrl}
                  alt={aboutData.name}
                  loading="lazy"
                  className="w-full h-full object-cover object-top"
                />
                {/* Subtle optical vignette blending portrait into dark HUD */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-bg via-bg/15 to-transparent"
                />
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-2">
                  <div>
                    <div className="font-mono text-[10px] text-cyan tracking-[0.2em] uppercase">
                      @{aboutData.handle}
                    </div>
                    <div className="font-display font-bold text-2xl text-text-hi uppercase tracking-wide leading-tight">
                      {aboutData.name}
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-mint border border-mint/40 bg-bg/80 backdrop-blur-sm px-2 py-0.5 rounded-[2px]">
                    ACTIVE
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {Array.isArray(aboutData.personality_traits) &&
                  aboutData.personality_traits.length > 0 && (
                    <div>
                      <div className="font-mono text-[10px] text-text-dim uppercase tracking-[0.18em] mb-2">
                        traits
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {aboutData.personality_traits.map((trait) => (
                          <span
                            key={trait}
                            className="font-mono text-[11px] text-text border border-border-hi bg-bg/60 px-2.5 py-0.5 rounded-[2px]"
                          >
                            {trait}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                <div className="pt-3 border-t border-border/80 space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <a
                      href={`mailto:${aboutData.contact.email}`}
                      className="text-text-hi hover:text-cyan transition-colors truncate"
                    >
                      {aboutData.contact.email}
                    </a>
                    <button
                      type="button"
                      onClick={copyEmail}
                      className="text-[10px] text-cyan border border-cyan/35 bg-cyan/8 px-2 py-0.5 rounded-[2px] hover:bg-cyan/15 shrink-0"
                    >
                      {copied ? "copied" : "copy"}
                    </button>
                  </div>
                  <a
                    href={`https://${aboutData.contact.github}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between text-text hover:text-cyan transition-colors"
                  >
                    <span>{aboutData.contact.github}</span>
                    <span className="text-cyan/70">↗</span>
                  </a>
                  <a
                    href={`https://${aboutData.contact.linkedin}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between text-text hover:text-cyan transition-colors"
                  >
                    <span>{aboutData.contact.linkedin}</span>
                    <span className="text-cyan/70">↗</span>
                  </a>
                </div>
              </div>
            </SpotlightCard>
          </motion.div>

          {/* Right Modernized Man-Page Dossier */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="lg:col-span-8"
          >
            <SpotlightCard className="p-6 md:p-8 space-y-8">
              <div>
                <div className="font-mono text-[11px] text-cyan tracking-[0.2em] uppercase flex items-center gap-3 mb-3 after:content-[''] after:flex-1 after:h-px after:bg-border">
                  NAME
                </div>
                <div className="text-sm md:text-base text-text-hi">
                  <code className="font-mono text-mint bg-mint/10 border border-mint/25 px-2 py-0.5 rounded-[3px] text-xs md:text-sm">
                    {aboutData.handle}
                  </code>
                  <span className="text-text-dim mx-2">—</span>
                  <span className="text-text">{aboutData.title}</span>
                </div>
              </div>

              <div>
                <div className="font-mono text-[11px] text-cyan tracking-[0.2em] uppercase flex items-center gap-3 mb-3 after:content-[''] after:flex-1 after:h-px after:bg-border">
                  SYNOPSIS
                </div>
                <div className="font-mono text-xs md:text-[13px] text-text bg-bg/70 border border-border rounded-[4px] p-3.5 overflow-x-auto leading-7">
                  <span className="text-cyan">{aboutData.handle}</span>{" "}
                  [<span className="text-mint">--focus</span> security|ai-ml|systems]{" "}
                  [<span className="text-mint">--env</span> linux]{" "}
                  [<span className="text-mint">--mode</span> build|research]
                </div>
              </div>

              <div>
                <div className="font-mono text-[11px] text-cyan tracking-[0.2em] uppercase flex items-center gap-3 mb-3 after:content-[''] after:flex-1 after:h-px after:bg-border">
                  DESCRIPTION
                </div>
                <div className="space-y-4 text-[15px] md:text-base text-text leading-[1.8]">
                  {aboutData.description.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div>
                  <div className="font-mono text-[11px] text-cyan tracking-[0.2em] uppercase flex items-center gap-3 mb-3 after:content-[''] after:flex-1 after:h-px after:bg-border">
                    ENVIRONMENT
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {aboutData.current_stack.map((item) => (
                      <span
                        key={item}
                        className="font-mono text-xs text-text border border-border-hi bg-bg/60 px-2.5 py-1 rounded-[2px] tracking-wider transition-colors hover:border-cyan/60 hover:text-cyan"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="font-mono text-[11px] text-cyan tracking-[0.2em] uppercase flex items-center gap-3 mb-3 after:content-[''] after:flex-1 after:h-px after:bg-border">
                    INTERESTS
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 font-mono text-xs text-text">
                    {aboutData.focus_areas.map((area) => (
                      <span
                        key={area}
                        className="pl-3.5 relative before:content-['▸'] before:absolute before:left-0 before:text-cyan"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </SpotlightCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
