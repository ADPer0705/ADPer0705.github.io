import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { cn, formatShortDate, getAllBlogPosts } from "../lib/utils";
import { HudBackdrop } from "./HudBackdrop";
import { PrecisionCursor } from "./PrecisionCursor";
import { TopHudNav } from "./TopHudNav";
import { StatusBar } from "./StatusBar";
import { SpotlightCard } from "./SpotlightCard";

interface BlogListPageProps {
  onOpenCommand: () => void;
}

export function BlogListPage({ onOpenCommand }: BlogListPageProps) {
  const navigate = useNavigate();
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [search, setSearch] = useState("");

  const posts = useMemo(() => getAllBlogPosts(), []);

  const allTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const post of posts) {
      for (const tag of post.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12);
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesTag =
        selectedTag === "all" || post.tags.includes(selectedTag);
      const matchesQuery =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.description.toLowerCase().includes(q) ||
        post.tags.some((t) => t.toLowerCase().includes(q));
      return matchesTag && matchesQuery;
    });
  }, [posts, search, selectedTag]);

  return (
    <div className="relative min-h-screen bg-bg text-text overflow-x-hidden">
      <PrecisionCursor />
      <HudBackdrop />
      <TopHudNav activeSection="log" onOpenCommand={onOpenCommand} />

      <main className="relative z-10 pt-[52px] pb-16">
        <section className="max-w-[1200px] mx-auto px-5 md:px-10 py-14 md:py-20">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="font-mono text-xs text-text-dim tracking-[0.14em] hover:text-cyan transition-colors duration-200 mb-8 inline-flex items-center gap-2"
          >
            <span className="text-cyan">←</span> ~/home
          </button>

          <div className="mb-10">
            <div className="font-mono flex items-center gap-2.5 text-[11px] text-cyan/80 tracking-[0.2em] uppercase mb-3">
              <span className="w-5 h-px bg-cyan/70" />
              <span>writing · essays · build-logs</span>
            </div>
            <div className="flex items-end gap-5">
              <h1 className="font-display font-black text-[clamp(44px,6vw,72px)] text-text-hi uppercase tracking-[-0.015em] leading-none">
                All Logs
              </h1>
              <div className="h-px flex-1 bg-gradient-to-r from-cyan/45 via-border-hi/50 to-transparent mb-2.5" />
              <div className="font-mono text-xs text-text-dim tabular-nums mb-1.5 shrink-0">
                {String(filteredPosts.length).padStart(2, "0")} /{" "}
                {String(posts.length).padStart(2, "0")}
              </div>
            </div>
          </div>

          {/* Search + Tag filter controls */}
          <div className="hud-panel rounded-[4px] p-4 mb-8 space-y-4">
            <div className="flex items-center gap-3 border-b border-border/80 pb-3">
              <span className="font-mono text-xs text-cyan">›</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter logs by title, topic, or tag..."
                className="w-full bg-transparent text-sm text-text-hi placeholder:text-text-dim focus:outline-none"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="font-mono text-[11px] text-text-dim hover:text-cyan"
                >
                  clear
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 font-mono">
              <button
                type="button"
                onClick={() => setSelectedTag("all")}
                className={cn(
                  "text-[11px] px-2.5 py-1 rounded-[2px] border tracking-wider transition-colors",
                  selectedTag === "all"
                    ? "border-cyan/60 text-cyan bg-cyan/10"
                    : "border-border text-text-dim hover:text-text-hi hover:border-border-hi",
                )}
              >
                all ({posts.length})
              </button>
              {allTags.map(([tag, count]) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className={cn(
                    "text-[11px] px-2.5 py-1 rounded-[2px] border tracking-wider transition-colors",
                    selectedTag === tag
                      ? "border-cyan/60 text-cyan bg-cyan/10"
                      : "border-border text-text-dim hover:text-text-hi hover:border-border-hi",
                  )}
                >
                  {tag} ({count})
                </button>
              ))}
            </div>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="hud-panel rounded-[4px] p-12 text-center font-mono text-xs text-text-dim">
              No logs match your current filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredPosts.map((post, idx) => (
                <motion.div
                  key={post.slug}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: idx * 0.04 }}
                >
                  <a href={`/blog/${post.slug}`} className="block h-full group">
                    <SpotlightCard className="p-6 h-full flex flex-col">
                      <div className="flex items-center justify-between gap-4 font-mono text-[11px] text-text-dim mb-3">
                        <span className="tabular-nums">
                          {formatShortDate(post.date)}
                        </span>
                        <span className="text-cyan/70 group-hover:translate-x-0.5 transition-transform">
                          read ↗
                        </span>
                      </div>

                      <h2 className="font-display font-bold text-2xl text-text-hi uppercase tracking-wide leading-tight mb-3 group-hover:text-cyan transition-colors">
                        {post.title}
                      </h2>

                      <p className="text-sm text-text leading-relaxed mb-6 flex-grow">
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
          )}
        </section>
      </main>

      <StatusBar currentSection="logs" />
    </div>
  );
}
