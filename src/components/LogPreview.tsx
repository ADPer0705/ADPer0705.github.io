import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { formatShortDate, getAllBlogPosts } from "../lib/utils";
import { SectionHeader } from "./SectionHeader";
import { SpotlightCard } from "./SpotlightCard";

export function LogPreview() {
  const navigate = useNavigate();
  const allPosts = useMemo(() => getAllBlogPosts(), []);
  const latestPosts = useMemo(() => allPosts.slice(0, 4), [allPosts]);

  return (
    <section
      id="log"
      className="relative border-b border-border py-20 md:py-24 bg-bg-2/35"
    >
      <div className="max-w-[1280px] mx-auto px-5 md:px-10">
        <SectionHeader
          eyebrow="writing · essays · field notes"
          title="Log"
          index="06"
        />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <p className="text-sm md:text-base text-text max-w-[600px]">
            Essays, technical deep-dives, and build notes on AI systems, Linux
            engineering, cybersecurity, and thinking clearly.
          </p>
          <button
            type="button"
            onClick={() => navigate("/logs")}
            className="font-mono text-xs text-cyan border border-cyan/45 bg-cyan/8 hover:bg-cyan hover:text-bg px-4 py-2 rounded-[3px] tracking-[0.1em] uppercase transition-all duration-200 self-start md:self-auto shrink-0"
          >
            access_all_logs ({allPosts.length}) →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {latestPosts.map((post, idx) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.35, delay: idx * 0.06 }}
            >
              <a href={`/blog/${post.slug}`} className="block h-full group">
                <SpotlightCard className="p-6 h-full flex flex-col">
                  <div className="flex items-center justify-between gap-3 font-mono text-[11px] text-text-dim mb-3">
                    <span className="tabular-nums">
                      {formatShortDate(post.date)}
                    </span>
                    <span className="text-cyan/70 group-hover:translate-x-0.5 transition-transform">
                      read ↗
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-2xl text-text-hi uppercase tracking-wide leading-tight mb-3 group-hover:text-cyan transition-colors">
                    {post.title}
                  </h3>

                  <p className="text-sm text-text leading-relaxed mb-5 flex-grow">
                    {post.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-3 border-t border-border/60">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-[10px] text-text-dim border border-border-hi/80 bg-bg/60 px-2 py-0.5 rounded-[2px] tracking-wider"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </SpotlightCard>
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
