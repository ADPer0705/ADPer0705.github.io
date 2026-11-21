import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import projectsData from "../data/projects.json";
import aboutData from "../data/whoami.json";
import { getAllBlogPosts } from "../lib/utils";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onSelectProject?: (projectId: string) => void;
}

interface CommandItem {
  id: string;
  group: "Navigation" | "Projects" | "Logs" | "Actions";
  title: string;
  subtitle: string;
  keywords: string;
  run: () => void;
}

export function CommandPalette({
  open,
  onClose,
  onSelectProject,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const posts = useMemo(() => getAllBlogPosts(), []);

  const items = useMemo<CommandItem[]>(() => {
    const jumpToSection = (id: string) => {
      onClose();
      if (location.pathname !== "/") {
        navigate(`/#${id}`);
        return;
      }
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    };

    const navItems: CommandItem[] = [
      { id: "nav-identity", group: "Navigation", title: "Identity", subtitle: "Hero overview & telemetry", keywords: "home top hero", run: () => jumpToSection("identity") },
      { id: "nav-work", group: "Navigation", title: "Work", subtitle: `${projectsData.length} engineering projects`, keywords: "projects builds portfolio", run: () => jumpToSection("work") },
      { id: "nav-record", group: "Navigation", title: "Record", subtitle: "Experience & community leadership", keywords: "experience internships club", run: () => jumpToSection("record") },
      { id: "nav-skills", group: "Navigation", title: "Skills", subtitle: "Technical stack & domains", keywords: "stack languages tools", run: () => jumpToSection("skills") },
      { id: "nav-whoami", group: "Navigation", title: "Whoami", subtitle: "Dossier, bio & traits", keywords: "about bio profile", run: () => jumpToSection("whoami") },
      { id: "nav-signals", group: "Navigation", title: "Signals", subtitle: "Certifications, networks & contact", keywords: "certs social hobbies contact", run: () => jumpToSection("signals") },
      { id: "nav-logs", group: "Navigation", title: "All Logs", subtitle: `Browse all ${posts.length} writings`, keywords: "blog essays articles", run: () => { onClose(); navigate("/logs"); } },
    ];

    const projectItems: CommandItem[] = projectsData.map((p) => ({
      id: `proj-${p.id}`,
      group: "Projects",
      title: p.name,
      subtitle: `${p.tagline} · ${p.year}`,
      keywords: `${p.category} ${p.stack.join(" ")} ${(p.tags || []).join(" ")}`,
      run: () => {
        onClose();
        if (location.pathname !== "/") {
          navigate("/#work");
        }
        onSelectProject?.(p.id);
        window.setTimeout(() => {
          document.getElementById("work")?.scrollIntoView({ behavior: "smooth" });
        }, 60);
      },
    }));

    const blogItems: CommandItem[] = posts.map((post) => ({
      id: `blog-${post.slug}`,
      group: "Logs",
      title: post.title,
      subtitle: post.date ?? "undated",
      keywords: `${post.slug} ${post.tags.join(" ")} ${post.description}`,
      run: () => {
        onClose();
        navigate(`/blog/${post.slug}`);
      },
    }));

    const actionItems: CommandItem[] = [
      {
        id: "act-cv",
        group: "Actions",
        title: "Download CV (PDF)",
        subtitle: "anay_pandya_cv.pdf",
        keywords: "resume pdf download",
        run: () => {
          onClose();
          const a = document.createElement("a");
          a.href = "/anay_pandya_cv.pdf";
          a.download = "anay_pandya_cv.pdf";
          a.click();
        },
      },
      {
        id: "act-email",
        group: "Actions",
        title: copiedEmail ? "Email Copied!" : "Copy Email Address",
        subtitle: aboutData.contact.email,
        keywords: "mail contact copy",
        run: () => {
          navigator.clipboard?.writeText(aboutData.contact.email);
          setCopiedEmail(true);
          window.setTimeout(() => {
            setCopiedEmail(false);
            onClose();
          }, 700);
        },
      },
      {
        id: "act-github",
        group: "Actions",
        title: "Open GitHub",
        subtitle: aboutData.contact.github,
        keywords: "code repos",
        run: () => {
          onClose();
          window.open(`https://${aboutData.contact.github}`, "_blank", "noreferrer");
        },
      },
      {
        id: "act-linkedin",
        group: "Actions",
        title: "Open LinkedIn",
        subtitle: aboutData.contact.linkedin,
        keywords: "connect profile",
        run: () => {
          onClose();
          window.open(`https://${aboutData.contact.linkedin}`, "_blank", "noreferrer");
        },
      },
    ];

    return [...navItems, ...actionItems, ...projectItems, ...blogItems];
  }, [copiedEmail, location.pathname, navigate, onClose, onSelectProject, posts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, 14);
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.keywords.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q),
    );
  }, [items, query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIdx(0);
      window.setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => (filtered.length ? (i + 1) % filtered.length : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) =>
          filtered.length ? (i - 1 + filtered.length) % filtered.length : 0,
        );
      } else if (e.key === "Enter" && filtered[activeIdx]) {
        e.preventDefault();
        filtered[activeIdx].run();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIdx, filtered, onClose, open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onClick={onClose}
          className="fixed inset-0 z-[900] bg-bg/75 backdrop-blur-md flex items-start justify-center pt-[12vh] px-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -10 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[600px] hud-panel rounded-[6px] shadow-[0_24px_80px_rgba(0,0,0,0.7)] overflow-hidden border border-cyan/30"
          >
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
              <span className="font-mono text-xs text-cyan">›</span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Jump to section, project, log, or action..."
                className="w-full bg-transparent text-sm text-text-hi placeholder:text-text-dim focus:outline-none font-sans"
              />
              <kbd className="font-mono text-[10px] text-text-dim border border-border-hi px-1.5 py-0.5 rounded-[2px]">
                ESC
              </kbd>
            </div>

            <div className="max-h-[55vh] overflow-y-auto py-2">
              {filtered.length === 0 ? (
                <div className="px-4 py-8 text-center font-mono text-xs text-text-dim">
                  No matching commands for “{query}”
                </div>
              ) : (
                filtered.map((item, idx) => {
                  const active = idx === activeIdx;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onMouseEnter={() => setActiveIdx(idx)}
                      onClick={item.run}
                      className={`w-full px-4 py-2.5 flex items-center justify-between gap-4 text-left transition-colors ${
                        active
                          ? "bg-cyan/10 text-text-hi border-l-2 border-cyan"
                          : "text-text hover:bg-bg-3/60 border-l-2 border-transparent"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-text-hi truncate">
                          {item.title}
                        </div>
                        <div className="text-xs text-text-dim truncate">
                          {item.subtitle}
                        </div>
                      </div>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-cyan/75 border border-border-hi px-2 py-0.5 rounded-[2px] shrink-0">
                        {item.group}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            <div className="px-4 py-2 border-t border-border bg-bg-2/70 flex items-center justify-between font-mono text-[10px] text-text-dim">
              <span>↑↓ navigate · ↵ select</span>
              <span>{filtered.length} results</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
