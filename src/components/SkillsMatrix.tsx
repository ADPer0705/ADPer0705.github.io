import { motion } from "motion/react";
import skillsData from "../data/skills.json";
import { SectionHeader } from "./SectionHeader";
import { SpotlightCard } from "./SpotlightCard";

export function SkillsMatrix() {
  const categories = Object.entries(skillsData as Record<string, string[]>);

  return (
    <section
      id="skills"
      className="relative border-b border-border py-20 md:py-24"
    >
      <div className="max-w-[1280px] mx-auto px-5 md:px-10">
        <SectionHeader
          eyebrow="capabilities · technical stack"
          title="Skills"
          index="03"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map(([category, items], idx) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.35, delay: idx * 0.06 }}
              className={idx === 0 ? "md:col-span-2 lg:col-span-1" : ""}
            >
              <SpotlightCard corners className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between gap-3 pb-3.5 mb-4 border-b border-border/80">
                  <div className="font-mono text-xs text-cyan tracking-[0.15em] uppercase">
                    {category}
                  </div>
                  <span className="font-mono text-[10px] text-text-dim tabular-nums">
                    {String(items.length).padStart(2, "0")} MOD
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {items.map((item) => (
                    <span
                      key={item}
                      className="font-mono text-xs text-text-hi/90 border border-border-hi/80 bg-bg/70 px-3 py-1.5 rounded-[3px] tracking-wide transition-colors duration-200 hover:border-cyan/60 hover:text-cyan"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
