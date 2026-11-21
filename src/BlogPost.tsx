import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import 'katex/dist/katex.min.css';
import { blogContent } from './blogContent';
import blogsData from './data/blogs.json';

const attachmentAssets = import.meta.glob('../assets/blogs/Attachments/*.{png,jpg,jpeg,webp,avif,gif,svg}', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

function resolveImageSrc(source: string): string {
  let decoded = source;
  try {
    decoded = decodeURIComponent(source);
  } catch {
    // Keep original source if it is not valid percent-encoding
  }
  const filename = decoded.split('/').pop() ?? decoded;
  const key = Object.keys(attachmentAssets).find((path) => path.endsWith(`/${filename}`));
  if (key) return attachmentAssets[key];
  return `/assets/blogs/Attachments/${filename}`;
}

function preprocessMarkdown(raw: string): string {
  let md = raw.replace(/\r\n/g, '\n');
  md = md.replace(/^---[\s\S]*?---\n?/, '');
  // Convert Obsidian ![[file.png]] / ![[file.png|alt]] embeds to standard markdown images
  md = md.replace(/!\[\[([^\]|]+?)(?:\|([^\]]*))?\]\]/g, (_, target: string, alt?: string) => {
    const src = target.trim();
    const label = (alt ?? src).trim();
    return `![${label}](${encodeURI(src)})`;
  });
  return md;
}

const cx = (...classes: Array<string | undefined>) => classes.filter(Boolean).join(' ');

const markdownComponents: Components = {
  h1: ({ className, ...props }) => <h1 className={cx('blog-h1', className)} {...props} />,
  h2: ({ className, ...props }) => <h2 className={cx('blog-h2', className)} {...props} />,
  h3: ({ className, ...props }) => <h3 className={cx('blog-h3', className)} {...props} />,
  h4: ({ className, ...props }) => <h4 className={cx('blog-h4', className)} {...props} />,
  h5: ({ className, ...props }) => <h5 className={cx('blog-h5', className)} {...props} />,
  h6: ({ className, ...props }) => <h6 className={cx('blog-h6', className)} {...props} />,
  p: ({ className, ...props }) => <p className={cx('blog-p', className)} {...props} />,
  a: ({ href, className, ...props }) => {
    const isAnchor = href?.startsWith('#');
    return (
      <a
        href={href}
        className={cx('blog-a', className)}
        target={isAnchor ? undefined : '_blank'}
        rel={isAnchor ? undefined : 'noreferrer'}
        {...props}
      />
    );
  },
  img: ({ src, alt, className, ...props }) => (
    <img
      src={src ? resolveImageSrc(src) : undefined}
      alt={alt ?? ''}
      className={cx('blog-img', className)}
      loading="lazy"
      {...props}
    />
  ),
  pre: ({ className, ...props }) => <pre className={cx('blog-pre', className)} {...props} />,
  code: ({ className, ...props }) => {
    const isBlock = Boolean(className && /language-|math/.test(className));
    return <code className={cx(isBlock ? 'blog-code' : 'blog-inline-code', className)} {...props} />;
  },
  blockquote: ({ className, ...props }) => <blockquote className={cx('blog-blockquote', className)} {...props} />,
  ul: ({ className, ...props }) => <ul className={cx('blog-ul', className)} {...props} />,
  ol: ({ className, ...props }) => <ol className={cx('blog-ol', className)} {...props} />,
  li: ({ className, ...props }) => <li className={cx('blog-li', className)} {...props} />,
  hr: ({ className, ...props }) => <hr className={cx('blog-hr', className)} {...props} />,
  strong: ({ className, ...props }) => <strong className={cx('blog-strong', className)} {...props} />,
  em: ({ className, ...props }) => <em className={cx('blog-em', className)} {...props} />,
  table: ({ className, ...props }) => (
    <div className="blog-table-container">
      <table className={cx('blog-table', className)} {...props} />
    </div>
  ),
  th: ({ className, ...props }) => <th className={cx('blog-th', className)} {...props} />,
  td: ({ className, ...props }) => <td className={cx('blog-td', className)} {...props} />,
};

const Cursor = () => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDown, setIsDown] = useState(false);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    const handleDown = () => setIsDown(true);
    const handleUp = () => setIsDown(false);

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mousedown', handleDown);
    window.addEventListener('mouseup', handleUp);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mouseup', handleUp);
    };
  }, []);

  return (
    <>
      <div
        className="fixed w-[22px] h-[22px] pointer-events-none z-[9999] transition-transform duration-75 ease-out"
        style={{
          left: pos.x,
          top: pos.y,
          transform: `translate(-50%, -50%) scale(${isDown ? 0.7 : 1})`,
        }}
      >
        <div className="absolute w-px h-full left-1/2 -translate-x-1/2 bg-cyan opacity-70" />
        <div className="absolute h-px w-full top-1/2 -translate-y-1/2 bg-cyan opacity-70" />
      </div>
      <div
        className="fixed w-[3px] h-[3px] bg-cyan rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2"
        style={{ left: pos.x, top: pos.y }}
      />
    </>
  );
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);

  const meta = useMemo(
    () => blogsData.find((b) => b.slug === slug) ?? null,
    [slug]
  );

  const rawContent = slug ? blogContent[slug] ?? null : null;

  const markdownSource = useMemo(
    () => (rawContent ? preprocessMarkdown(rawContent) : null),
    [rawContent]
  );

  // --- Head management: canonical, title, OG/Twitter ---
  useEffect(() => {
    if (!meta) return;

    const canonicalUrl = `https://adper.me/blog/${meta.slug}`;
    const pageTitle = `${meta.title} — adper`;

    // Title
    const prevTitle = document.title;
    document.title = pageTitle;

    // Canonical link
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const prevCanonicalHref = canonical?.href ?? '';
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    // OG tags
    const ogMeta: Record<string, string> = {
      'og:title': pageTitle,
      'og:description': meta.description,
      'og:url': canonicalUrl,
      'og:type': 'article',
      'twitter:title': pageTitle,
      'twitter:description': meta.description,
    };

    const injected: HTMLMetaElement[] = [];
    for (const [property, content] of Object.entries(ogMeta)) {
      const attr = property.startsWith('twitter:') ? 'name' : 'property';
      let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${property}"]`);
      const prev = el?.getAttribute('content') ?? null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, property);
        document.head.appendChild(el);
        injected.push(el);
      }
      el.setAttribute('content', content);
      if (prev !== null) el.dataset.prev = prev;
    }

    return () => {
      document.title = prevTitle;
      if (canonical) canonical.href = prevCanonicalHref || 'https://adper.me/';
      injected.forEach((el) => el.remove());
      document.querySelectorAll<HTMLMetaElement>('meta[data-prev]').forEach((el) => {
        el.setAttribute('content', el.dataset.prev!);
        delete el.dataset.prev;
      });
    };
  }, [meta]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // 404
  if (!meta || !markdownSource) {
    return (
      <div className="min-h-screen bg-bg text-text flex flex-col items-center justify-center gap-6 font-mono">
        <div className="text-[11px] text-text-dim tracking-[0.18em] uppercase">404 · not found</div>
        <div className="text-text-hi text-sm">No post with slug: <code className="text-cyan">{slug}</code></div>
        <button
          onClick={() => navigate('/#log')}
          className="text-[11px] text-text-dim border border-border-hi p-[6px_14px] tracking-wider transition-colors duration-200 hover:text-cyan hover:border-cyan cursor-none"
        >
          ← return to log
        </button>
      </div>
    );
  }

  const hasAnyPlatform = Object.values(meta.platforms).some(Boolean);
  const formattedDate = new Date(meta.date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-bg text-text font-mono">
      <Cursor />

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 h-[42px] bg-bg/95 border-b border-border backdrop-blur-md flex items-center px-7 gap-7 z-[500]">
        <div className="text-[11px] md:text-[13px] text-cyan tracking-wider opacity-80 shrink-0">
          <a href="/" className="transition-opacity duration-200 hover:opacity-100">
            <span className="text-text-dim">debie</span>@adper<span className="text-text-dim">:</span>~<span className="text-text-dim">$</span>&nbsp;_
          </a>
        </div>
        <div className="flex gap-5 flex-1">
          {['work', 'record', 'skills', 'whoami', 'signals', 'log'].map((link) => (
            <a
              key={link}
              href={link === 'log' ? '/logs' : `/#${link}`}
              className="text-[11px] md:text-[13px] text-text-dim tracking-[0.08em] transition-colors duration-200 hover:text-text-hi relative pb-0.5 group"
            >
              ./{link}
              <span className="absolute bottom-0 left-0 w-0 h-px bg-cyan transition-all duration-200 group-hover:w-full" />
            </a>
          ))}
        </div>
      </nav>

      {/* ── Content ── */}
      <main className="relative z-10 mt-[42px] max-w-[780px] mx-auto px-6 py-[72px]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          {/* Breadcrumb */}
          <button
            onClick={() => navigate('/logs')}
            className="text-[11px] text-text-dim tracking-[0.12em] hover:text-cyan transition-colors duration-200 mb-9 flex items-center gap-2 cursor-none"
          >
            <span className="text-cyan opacity-60">←</span> ~/logs
          </button>

          {/* Header */}
          <div className="border-b border-border pb-9 mb-9">
            <div className="flex items-center gap-2.5 text-[10px] md:text-xs text-text-dim tracking-[0.18em] uppercase mb-5 before:content-[''] before:w-[18px] before:h-px before:bg-cyan before:shrink-0">
              adper · blog · {meta.slug}
            </div>

            <h1 className="font-display font-black text-[clamp(32px,5vw,56px)] leading-[0.92] text-text-hi tracking-[-0.02em] mb-5 uppercase">
              {meta.title}
            </h1>

            <p className="text-sm text-text leading-[1.75] max-w-[560px] mb-6">
              {meta.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-[11px]">
              <span className="text-text-dim tabular-nums">{formattedDate}</span>
              <span className="text-border-hi">·</span>
              <div className="flex flex-wrap gap-1.5">
                {meta.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-text-dim border border-border p-[2px_7px] tracking-wider"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Cross-post notice */}
          {hasAnyPlatform && (
            <div className="border border-border bg-bg-2 p-4 mb-9 text-[11px]">
              <div className="text-cyan tracking-[0.12em] uppercase mb-2">Also published on</div>
              <div className="flex flex-wrap gap-3">
                {Object.entries(meta.platforms).map(([platform, url]) =>
                  url ? (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-text-dim hover:text-cyan transition-colors duration-200 tracking-wider after:content-['_↗'] after:text-[10px]"
                    >
                      {platform}
                    </a>
                  ) : null
                )}
              </div>
            </div>
          )}

          {/* Markdown content */}
          <div ref={contentRef} className="blog-prose">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex, rehypeSlug]}
              components={markdownComponents}
            >
              {markdownSource}
            </ReactMarkdown>
          </div>

          {/* Footer nav */}
          <div className="border-t border-border mt-[72px] pt-9 flex items-center justify-between">
            <button
              onClick={() => navigate('/logs')}
              className="text-[11px] text-text-dim border border-border-hi p-[6px_14px] tracking-wider transition-all duration-200 hover:text-cyan hover:border-cyan cursor-none"
            >
              ← back to logs
            </button>
            <div className="text-[10px] text-text-dim tracking-[0.12em]">
              adper · {new Date().getFullYear()}
            </div>
          </div>
        </motion.div>
      </main>

      {/* ── Statusbar ── */}
      <div className="fixed bottom-0 left-0 right-0 h-[26px] bg-bg-2 border-t border-border flex items-center px-3 gap-[18px] text-[10px] md:text-xs text-text-dim z-[500] tracking-wider">
        <span className="bg-cyan text-bg px-2 py-[1px] font-medium tracking-[0.12em] shrink-0">NORMAL</span>
        <span className="text-border-hi">·</span>
        <span className="text-text">~/log/{meta.slug}</span>
        <span className="text-border-hi">·</span>
        <span>blog · {meta.tags[0]}</span>
        <div className="ml-auto flex items-center gap-4">
          <span>
            <span className="text-cyan opacity-60">canonical</span> → adper.me/blog/{meta.slug}
          </span>
        </div>
      </div>
    </div>
  );
}
