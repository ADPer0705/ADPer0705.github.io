import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import "katex/dist/katex.min.css";
import { blogContent } from "./blogContent";
import blogsData from "./data/blogs.json";
import { estimateReadingTime } from "./lib/utils";
import { HudBackdrop } from "./components/HudBackdrop";
import { PrecisionCursor } from "./components/PrecisionCursor";
import { TopHudNav } from "./components/TopHudNav";
import { StatusBar } from "./components/StatusBar";

const attachmentAssets = import.meta.glob(
  "../assets/blogs/Attachments/*.{png,jpg,jpeg,webp,avif,gif,svg}",
  {
    eager: true,
    import: "default",
  },
) as Record<string, string>;

function resolveImageSrc(source: string): string {
  let decoded = source;
  try {
    decoded = decodeURIComponent(source);
  } catch {
    // Keep original source if it is not valid percent-encoding
  }
  const filename = decoded.split("/").pop() ?? decoded;
  const key = Object.keys(attachmentAssets).find((path) =>
    path.endsWith(`/${filename}`),
  );
  if (key) return attachmentAssets[key];
  return `/assets/blogs/Attachments/${filename}`;
}

function preprocessMarkdown(raw: string): string {
  let md = raw.replace(/\r\n/g, "\n").replace(/\u200B/g, "");
  md = md.replace(/^---[\s\S]*?---\n?/, "");
  // Convert Obsidian ![[file.png]] / ![[file.png|alt]] embeds to standard markdown images
  md = md.replace(
    /!\[\[([^\]|]+?)(?:\|([^\]]*))?\]\]/g,
    (_, target: string, alt?: string) => {
      const src = target.trim();
      const label = (alt ?? src).trim();
      return `![${label}](${encodeURI(src)})`;
    },
  );
  return md;
}

const cx = (...classes: Array<string | undefined>) =>
  classes.filter(Boolean).join(" ");

const markdownComponents: Components = {
  h1: ({ className, ...props }) => (
    <h1 className={cx("blog-h1", className)} {...props} />
  ),
  h2: ({ className, ...props }) => (
    <h2 className={cx("blog-h2", className)} {...props} />
  ),
  h3: ({ className, ...props }) => (
    <h3 className={cx("blog-h3", className)} {...props} />
  ),
  h4: ({ className, ...props }) => (
    <h4 className={cx("blog-h4", className)} {...props} />
  ),
  h5: ({ className, ...props }) => (
    <h5 className={cx("blog-h5", className)} {...props} />
  ),
  h6: ({ className, ...props }) => (
    <h6 className={cx("blog-h6", className)} {...props} />
  ),
  p: ({ className, ...props }) => (
    <p className={cx("blog-p", className)} {...props} />
  ),
  a: ({ href, className, ...props }) => {
    const isAnchor = href?.startsWith("#");
    return (
      <a
        href={href}
        className={cx("blog-a", className)}
        target={isAnchor ? undefined : "_blank"}
        rel={isAnchor ? undefined : "noreferrer"}
        {...props}
      />
    );
  },
  img: ({ src, alt, className, ...props }) => (
    <img
      src={src ? resolveImageSrc(src) : undefined}
      alt={alt ?? ""}
      className={cx("blog-img", className)}
      loading="lazy"
      {...props}
    />
  ),
  pre: ({ className, ...props }) => (
    <pre className={cx("blog-pre", className)} {...props} />
  ),
  code: ({ className, ...props }) => {
    const isBlock = Boolean(className && /language-|math/.test(className));
    return (
      <code
        className={cx(isBlock ? "blog-code" : "blog-inline-code", className)}
        {...props}
      />
    );
  },
  blockquote: ({ className, ...props }) => (
    <blockquote className={cx("blog-blockquote", className)} {...props} />
  ),
  ul: ({ className, ...props }) => (
    <ul className={cx("blog-ul", className)} {...props} />
  ),
  ol: ({ className, ...props }) => (
    <ol className={cx("blog-ol", className)} {...props} />
  ),
  li: ({ className, ...props }) => (
    <li className={cx("blog-li", className)} {...props} />
  ),
  hr: ({ className, ...props }) => (
    <hr className={cx("blog-hr", className)} {...props} />
  ),
  strong: ({ className, ...props }) => (
    <strong className={cx("blog-strong", className)} {...props} />
  ),
  em: ({ className, ...props }) => (
    <em className={cx("blog-em", className)} {...props} />
  ),
  table: ({ className, ...props }) => (
    <div className="blog-table-container">
      <table className={cx("blog-table", className)} {...props} />
    </div>
  ),
  th: ({ className, ...props }) => (
    <th className={cx("blog-th", className)} {...props} />
  ),
  td: ({ className, ...props }) => (
    <td className={cx("blog-td", className)} {...props} />
  ),
};

interface BlogPostProps {
  onOpenCommand: () => void;
}

export default function BlogPost({ onOpenCommand }: BlogPostProps) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  const [readingProgress, setReadingProgress] = useState(0);

  const meta = useMemo(
    () => blogsData.find((b) => b.slug === slug) ?? null,
    [slug],
  );

  const rawContent = slug ? (blogContent[slug] ?? null) : null;

  const markdownSource = useMemo(
    () => (rawContent ? preprocessMarkdown(rawContent) : null),
    [rawContent],
  );

  const readMinutes = useMemo(
    () => (rawContent ? estimateReadingTime(rawContent) : 1),
    [rawContent],
  );

  // Reading progress tracking
  useEffect(() => {
    const updateProgress = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      if (max <= 0) {
        setReadingProgress(0);
        return;
      }
      setReadingProgress((window.scrollY / max) * 100);
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    return () => window.removeEventListener("scroll", updateProgress);
  }, [slug]);

  // Head management: canonical, title, OG/Twitter
  useEffect(() => {
    if (!meta) return;

    const canonicalUrl = `https://adper.me/blog/${meta.slug}`;
    const pageTitle = `${meta.title} — adper`;

    const prevTitle = document.title;
    document.title = pageTitle;

    let canonical = document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    const prevCanonicalHref = canonical?.href ?? "";
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    const ogMeta: Record<string, string> = {
      "og:title": pageTitle,
      "og:description": meta.description,
      "og:url": canonicalUrl,
      "og:type": "article",
      "twitter:title": pageTitle,
      "twitter:description": meta.description,
    };

    const injected: HTMLMetaElement[] = [];
    for (const [property, content] of Object.entries(ogMeta)) {
      const attr = property.startsWith("twitter:") ? "name" : "property";
      let el = document.querySelector<HTMLMetaElement>(
        `meta[${attr}="${property}"]`,
      );
      const prev = el?.getAttribute("content") ?? null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, property);
        document.head.appendChild(el);
        injected.push(el);
      }
      el.setAttribute("content", content);
      if (prev !== null) el.dataset.prev = prev;
    }

    return () => {
      document.title = prevTitle;
      if (canonical) canonical.href = prevCanonicalHref || "https://adper.me/";
      injected.forEach((el) => el.remove());
      document
        .querySelectorAll<HTMLMetaElement>("meta[data-prev]")
        .forEach((el) => {
          el.setAttribute("content", el.dataset.prev!);
          delete el.dataset.prev;
        });
    };
  }, [meta]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // 404
  if (!meta || !markdownSource) {
    return (
      <div className="min-h-screen bg-bg text-text flex flex-col items-center justify-center gap-6 font-mono px-6">
        <PrecisionCursor />
        <HudBackdrop />
        <div className="relative z-10 hud-panel rounded-[4px] p-8 text-center max-w-[420px] w-full">
          <div className="text-[11px] text-cyan tracking-[0.2em] uppercase mb-3">
            404 · not found
          </div>
          <div className="text-text-hi text-sm mb-6">
            No post with slug: <code className="text-cyan">{slug}</code>
          </div>
          <button
            type="button"
            onClick={() => navigate("/logs")}
            className="text-xs text-text-hi border border-border-hi px-4 py-2 rounded-[3px] tracking-wider transition-colors duration-200 hover:text-cyan hover:border-cyan"
          >
            ← return to logs
          </button>
        </div>
      </div>
    );
  }

  const hasAnyPlatform = Object.values(meta.platforms).some(Boolean);
  const formattedDate = new Date(meta.date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-bg text-text relative overflow-x-hidden">
      <PrecisionCursor />
      <HudBackdrop />
      <TopHudNav
        activeSection="log"
        onOpenCommand={onOpenCommand}
        readingProgress={readingProgress}
      />

      <main className="relative z-10 mt-[52px] max-w-[820px] mx-auto px-5 md:px-8 py-14 md:py-20">
        <motion.article
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Breadcrumb */}
          <button
            type="button"
            onClick={() => navigate("/logs")}
            className="font-mono text-xs text-text-dim tracking-[0.14em] hover:text-cyan transition-colors duration-200 mb-9 inline-flex items-center gap-2"
          >
            <span className="text-cyan">←</span> ~/logs
          </button>

          {/* Header */}
          <header className="border-b border-border pb-9 mb-10">
            <div className="font-mono flex items-center gap-2.5 text-[11px] text-cyan/80 tracking-[0.18em] uppercase mb-5">
              <span className="w-5 h-px bg-cyan shrink-0" />
              <span className="truncate">adper · blog · {meta.slug}</span>
            </div>

            <h1 className="font-display font-black text-[clamp(34px,5.2vw,60px)] leading-[0.94] text-text-hi tracking-[-0.02em] mb-5 uppercase">
              {meta.title}
            </h1>

            <p className="text-base text-text leading-relaxed max-w-[640px] mb-6">
              {meta.description}
            </p>

            <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
              <span className="text-text-hi tabular-nums">{formattedDate}</span>
              <span className="text-border-hi">·</span>
              <span className="text-cyan tabular-nums">
                ~{readMinutes} min read
              </span>
              <span className="text-border-hi">·</span>
              <div className="flex flex-wrap gap-1.5">
                {meta.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] text-text-dim border border-border-hi bg-bg-2/70 px-2 py-0.5 rounded-[2px] tracking-wider"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </header>

          {/* Cross-post notice */}
          {hasAnyPlatform && (
            <div className="hud-panel rounded-[4px] p-4 mb-9 font-mono text-xs">
              <div className="text-cyan tracking-[0.14em] uppercase mb-2">
                Also published on
              </div>
              <div className="flex flex-wrap gap-3">
                {Object.entries(meta.platforms).map(([platform, url]) =>
                  url ? (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-text-hi hover:text-cyan transition-colors duration-200 tracking-wider"
                    >
                      {platform} ↗
                    </a>
                  ) : null,
                )}
              </div>
            </div>
          )}

          {/* Markdown content */}
          <div ref={contentRef} className="blog-prose">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[[rehypeKatex, { strict: "ignore" }], rehypeSlug]}
              components={markdownComponents}
            >
              {markdownSource}
            </ReactMarkdown>
          </div>

          {/* Footer nav */}
          <footer className="border-t border-border mt-16 pt-8 flex items-center justify-between gap-4 font-mono">
            <button
              type="button"
              onClick={() => navigate("/logs")}
              className="text-xs text-text-hi border border-border-hi bg-bg-2/70 px-4 py-2 rounded-[3px] tracking-wider transition-all duration-200 hover:text-cyan hover:border-cyan"
            >
              ← back to logs
            </button>
            <div className="text-[11px] text-text-dim tracking-[0.12em]">
              adper · {new Date().getFullYear()}
            </div>
          </footer>
        </motion.article>
      </main>

      <StatusBar
        currentSection={`log/${meta.slug}`}
        rightMeta={`canonical → adper.me/blog/${meta.slug}`}
      />
    </div>
  );
}
