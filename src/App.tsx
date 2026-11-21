import { useCallback, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";

import BlogPost from "./BlogPost";
import { HudBackdrop } from "./components/HudBackdrop";
import { PrecisionCursor } from "./components/PrecisionCursor";
import { BootOverlay } from "./components/BootOverlay";
import { TopHudNav } from "./components/TopHudNav";
import { StatusBar } from "./components/StatusBar";
import { CommandPalette } from "./components/CommandPalette";
import { HeroIdentity } from "./components/HeroIdentity";
import { WorkShowcase } from "./components/WorkShowcase";
import { RecordTimeline } from "./components/RecordTimeline";
import { SkillsMatrix } from "./components/SkillsMatrix";
import { WhoamiDossier } from "./components/WhoamiDossier";
import { SignalsHub } from "./components/SignalsHub";
import { LogPreview } from "./components/LogPreview";
import { BlogListPage } from "./components/BlogListPage";

const BOOT_SESSION_KEY = "adper_hud_booted";

function HomePage({
  onOpenCommand,
  selectedProjectId,
}: {
  onOpenCommand: () => void;
  selectedProjectId: string | null;
}) {
  const [isBooted, setIsBooted] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return true;
    }
    return sessionStorage.getItem(BOOT_SESSION_KEY) === "1";
  });
  const [currentSection, setCurrentSection] = useState("identity");
  const location = useLocation();

  const finishBoot = useCallback(() => {
    sessionStorage.setItem(BOOT_SESSION_KEY, "1");
    setIsBooted(true);
  }, []);

  // Scroll to hash anchor when landing from another route
  useEffect(() => {
    if (!isBooted || !location.hash) return;
    const id = location.hash.slice(1);
    const el = document.getElementById(id);
    if (el) {
      window.setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
    }
  }, [isBooted, location.hash]);

  // Active section scroll spy
  useEffect(() => {
    if (!isBooted) return;
    const sectionIds = [
      "identity",
      "work",
      "record",
      "skills",
      "whoami",
      "signals",
      "log",
    ];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setCurrentSection(visible[0].target.id);
        }
      },
      { threshold: [0.2, 0.45], rootMargin: "-52px 0px -30% 0px" },
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isBooted]);

  return (
    <div className="relative min-h-screen bg-bg text-text overflow-x-hidden">
      <AnimatePresence>
        {!isBooted && <BootOverlay onComplete={finishBoot} />}
      </AnimatePresence>

      {isBooted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <PrecisionCursor />
          <HudBackdrop />
          <TopHudNav
            activeSection={currentSection}
            onOpenCommand={onOpenCommand}
          />

          <main className="relative z-10 pt-[52px]">
            <HeroIdentity onOpenCommand={onOpenCommand} />
            <WorkShowcase selectedProjectId={selectedProjectId} />
            <RecordTimeline />
            <SkillsMatrix />
            <WhoamiDossier />
            <SignalsHub />
            <LogPreview />
          </main>

          <StatusBar currentSection={currentSection} />
        </motion.div>
      )}
    </div>
  );
}

function AppShell() {
  const [commandOpen, setCommandOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );

  // Global ⌘K / Ctrl+K shortcut
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              onOpenCommand={() => setCommandOpen(true)}
              selectedProjectId={selectedProjectId}
            />
          }
        />
        <Route
          path="/blog/:slug"
          element={<BlogPost onOpenCommand={() => setCommandOpen(true)} />}
        />
        <Route
          path="/logs"
          element={<BlogListPage onOpenCommand={() => setCommandOpen(true)} />}
        />
      </Routes>

      <CommandPalette
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        onSelectProject={(id) => setSelectedProjectId(id)}
      />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}
