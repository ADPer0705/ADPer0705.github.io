import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Data imports
import aboutData from './data/whoami.json';
import experienceData from './data/experience.json';
import projectsData from './data/projects.json';
import skillsData from './data/skills.json';
import certificationsData from './data/certifications.json';
import socialData from './data/social.json';
import hobbiesData from './data/hobbies.json';
import profilesData from './data/profiles.json';
import contactData from './data/contact.json';

// --- Utilities ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const staticAssetUrls = import.meta.glob('../assets/*.{png,jpg,jpeg,webp,avif,gif,svg}', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

// --- Components ---

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
          transform: `translate(-50%, -50%) scale(${isDown ? 0.7 : 1})` 
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

const CanvasBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const GRID = 52;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W: number, H: number;
    let pulses: { x: number, y: number, r: number, maxR: number }[] = [];

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };

    const spawnPulse = () => {
      if (pulses.length >= 5) return;
      const gx = Math.floor(Math.random() * Math.ceil(W / GRID));
      const gy = Math.floor(Math.random() * Math.ceil(H / GRID));
      pulses.push({ 
        x: gx * GRID, 
        y: gy * GRID, 
        r: 0, 
        maxR: GRID * 2.5 + Math.random() * GRID 
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Grid lines
      ctx.strokeStyle = 'rgba(26, 26, 46, 0.7)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= W; x += GRID) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y <= H; y += GRID) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Intersection dots
      ctx.fillStyle = 'rgba(40, 40, 74, 0.5)';
      for (let x = 0; x <= W; x += GRID) {
        for (let y = 0; y <= H; y += GRID) {
          ctx.beginPath();
          ctx.arc(x, y, 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Pulses
      pulses = pulses.filter(p => p.r < p.maxR);
      pulses.forEach(p => {
        const t = p.r / p.maxR;
        const a = (1 - t) * 0.18;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 229, 200, ${a})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
        p.r += 0.4;
      });

      requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    const pulseInterval = setInterval(spawnPulse, 2200);
    const animFrame = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      clearInterval(pulseInterval);
      cancelAnimationFrame(animFrame);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />;
};

const BootSequence = ({ onComplete }: { onComplete: () => void }) => {
  const [logs, setLogs] = useState<{ t: string, in: boolean }[]>([]);
  const BOOT_DATA = [
    { t: '> kernel init · adper/personal-v2.0', d: 0 },
    { t: '> <span class="text-mint">[ OK ]</span> loading module: <span class="text-cyan">cybersecurity</span>', d: 180 },
    { t: '> <span class="text-mint">[ OK ]</span> loading module: <span class="text-cyan">ai-ml-systems</span>', d: 310 },
    { t: '> <span class="text-mint">[ OK ]</span> mounting projects: inquiro wordsmith chronotrace praetor merklewatch overpage', d: 440 },
    { t: '> <span class="text-mint">[ OK ]</span> net interfaces: github email linkedin', d: 570 },
    { t: '> status: <span class="text-mint">[ operational ]</span> · env: linux · shell: bash/nvim', d: 700 },
  ];

  useEffect(() => {
    BOOT_DATA.forEach((item, i) => {
      setTimeout(() => {
        setLogs(prev => [...prev, { t: item.t, in: true }]);
      }, item.d);
    });

    setTimeout(onComplete, 1500);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-[1000] bg-bg flex items-center justify-start px-[15vw]"
    >
      <div className="flex flex-col gap-0.5">
        {logs.map((log, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-mono text-[11px] md:text-[13px] text-text-dim h-5 leading-5"
            dangerouslySetInnerHTML={{ __html: log.t }}
          />
        ))}
      </div>
    </motion.div>
  );
};

const Nav = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-GB', { hour12: false });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-[42px] bg-bg/95 border-b border-border backdrop-blur-md flex items-center px-7 gap-7 z-[500]">
      <div className="text-[11px] md:text-[13px] text-cyan tracking-wider opacity-80 shrink-0">
        <span className="text-text-dim">debie</span>@adper<span className="text-text-dim">:</span>~<span className="text-text-dim">$</span>&nbsp;_
      </div>
      <div className="flex gap-5 flex-1">
        {['work', 'record', 'skills', 'whoami', 'signals'].map((link) => (
          <a 
            key={link}
            href={`#${link}`} 
            className="text-[11px] md:text-[13px] text-text-dim tracking-[0.08em] transition-colors duration-200 hover:text-text-hi relative pb-0.5 group"
          >
            ./{link}
            <span className="absolute bottom-0 left-0 w-0 h-px bg-cyan transition-all duration-200 group-hover:w-full" />
          </a>
        ))}
      </div>
      <div className="text-[11px] md:text-[13px] text-text-dim tabular-nums shrink-0 tracking-wider">
        {formatTime(time)}
      </div>
    </nav>
  );
};

const Statusbar = ({ currentSection }: { currentSection: string }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-[26px] bg-bg-2 border-t border-border flex items-center px-3 gap-[18px] text-[10px] md:text-xs text-text-dim z-[500] tracking-wider">
      <span className="bg-cyan text-bg px-2 py-[1px] font-medium tracking-[0.12em] shrink-0">NORMAL</span>
      <span className="text-border-hi">·</span>
      <span id="sb-section" className="text-text">~/{currentSection}</span>
      <span className="text-border-hi">·</span>
      <span>security · ai/ml · systems</span>
      <div className="ml-auto flex items-center gap-4">
        <span><span className="text-cyan opacity-60">↑↓</span> scroll</span>
        <span><span className="text-cyan opacity-60">click</span> project to expand</span>
      </div>
    </div>
  );
};

const Identity = () => {
  return (
    <section id="identity" className="min-h-[calc(100vh-42px)] grid grid-cols-1 md:grid-cols-2 border-b border-border relative">
      <div className="absolute top-3 left-3 w-[14px] h-[14px] border-t border-l border-border-hi" />
      <div className="absolute bottom-3 right-3 w-[14px] h-[14px] border-b border-r border-border-hi" />

      <div className="p-[72px_56px_72px_28px] md:border-r border-border flex flex-col justify-center relative">
        <div className="flex items-center gap-2.5 text-[10px] md:text-xs text-text-dim tracking-[0.18em] uppercase mb-5 before:content-[''] before:w-[18px] before:h-px before:bg-cyan before:shrink-0">
          process · identity
        </div>

        
        
        <h1 
          className="font-display font-black text-[clamp(82px,11vw,156px)] leading-[0.82] text-text-hi tracking-[-0.025em] mb-9 relative select-none cyber-glitch"
          data-text="adper"
        >
          adper
        </h1>

        <div className="flex flex-col gap-1.5 mb-12">
          <div className="text-xs md:text-sm text-text flex items-center gap-2.5 before:content-['→'] before:text-cyan before:text-[10px] md:text-xs before:shrink-0">
            {aboutData.title}
          </div>
          <div className="text-xs md:text-sm text-text flex items-center gap-2.5 before:content-['→'] before:text-cyan before:text-[10px] md:text-xs before:shrink-0">
            {aboutData.synopsis}
          </div>
          <div className="text-xs md:text-sm text-text flex items-center gap-2.5 before:content-['→'] before:text-cyan before:text-[10px] md:text-xs before:shrink-0">
            {(aboutData.location || 'gandhinagar, india').toLowerCase()} · <span className="text-mint">available for opportunities</span>
          </div>
        </div>

        <div className="flex gap-2.5 flex-wrap">
          <a href={`mailto:${aboutData.contact.email}`} className="font-mono text-[11px] md:text-[13px] text-text-dim border border-border-hi p-[7px_14px] tracking-[0.07em] transition-all duration-200 hover:text-cyan hover:border-cyan relative overflow-hidden group">
            init_contact
            <span className="absolute inset-0 bg-cyan opacity-0 group-hover:opacity-[0.06] transition-opacity" />
          </a>
          <a href="/anay_pandya_cv_condensed.pdf" download="anay_pandya_cv.pdf" className="font-mono text-[11px] md:text-[13px] text-text-dim border border-border-hi p-[7px_14px] md:p-[10px_20px] tracking-[0.07em] transition-all duration-200 hover:text-cyan hover:border-cyan relative overflow-hidden group">
            pull_cv
            <span className="absolute inset-0 bg-cyan opacity-0 group-hover:opacity-[0.06] transition-opacity" />
          </a>
          <a href={`https://${aboutData.contact.github}`} target="_blank" className="font-mono text-[11px] md:text-[13px] text-text-dim border border-border-hi p-[7px_14px] tracking-[0.07em] transition-all duration-200 hover:text-cyan hover:border-cyan relative overflow-hidden group">
            → github
            <span className="absolute inset-0 bg-cyan opacity-0 group-hover:opacity-[0.06] transition-opacity" />
          </a>
        </div>
      </div>

      <div className="p-[72px_28px_72px_56px] flex flex-col justify-center gap-10">
        <div className="flex flex-col gap-px">
          {[
            ['alias', aboutData.handle, 'text-cyan'],
            ['full_name', aboutData.name, 'text-mint'],
            ['focus', aboutData.role || 'cybersecurity · ai/ml', ''],
            ['env', 'debian · bash', ''],
            ['edu', aboutData.institution || 'nfsu · b.tech+m.tech', ''],
            ['spec', 'cybersecurity', ''],
            ['location', aboutData.location || 'gandhinagar, india', ''],
            ['status', '[ active · seeking ]', 'text-mint'],
          ].map(([k, v, cls]) => (
            <div key={k} className="grid grid-cols-[90px_20px_1fr] gap-0 py-[5px] border-b border-transparent transition-colors duration-200 hover:border-border">
              <span className="text-[11px] md:text-[13px] text-text-dim tracking-wider">{k}</span>
              <span className="text-[11px] md:text-[13px] text-border-hi">::</span>
              <span className={cn("text-[11px] md:text-[13px] text-text-hi", cls)}>{v}</span>
            </div>
          ))}
        </div>
        <div className="h-px bg-border my-4 relative after:content-['···'] after:absolute after:right-0 after:top-[-8px] after:text-[10px] md:text-xs after:text-text-dim after:tracking-[0.1em]" />
        <div className="flex flex-wrap gap-1.5">
          {[
            {l:'python',cls:'border-[#20184a] text-[#7055d8] hover:border-[#7055d8] hover:text-[#aa90ff]'},
            {l:'rust',cls:'border-[#182a20] text-[#408855] hover:border-[#408855] hover:text-[#70c890]'},
            {l:'bash',cls:'border-[#182a20] text-[#408855] hover:border-[#408855] hover:text-[#70c890]'},
            {l:'docker',cls:'border-[#182a20] text-[#408855] hover:border-[#408855] hover:text-[#70c890]'},
            {l:'linux',cls:'border-[#182a20] text-[#408855] hover:border-[#408855] hover:text-[#70c890]'},
            {l:'neovim',cls:'border-[#182a20] text-[#408855] hover:border-[#408855] hover:text-[#70c890]'},
            {l:'cybersec',cls:'border-[#1a3050] text-[#4878a8] hover:border-[#4878a8] hover:text-[#88b8e8]'},
            {l:'ai/ml',cls:'border-[#20184a] text-[#7055d8] hover:border-[#7055d8] hover:text-[#aa90ff]'},
            {l:'rag',cls:'border-[#20184a] text-[#7055d8] hover:border-[#7055d8] hover:text-[#aa90ff]'},
            {l:'faiss',cls:'border-[#20184a] text-[#7055d8] hover:border-[#7055d8] hover:text-[#aa90ff]'},
            {l:'ollama',cls:'border-[#20184a] text-[#7055d8] hover:border-[#7055d8] hover:text-[#aa90ff]'},
            {l:'forensics',cls:'border-[#1a3050] text-[#4878a8] hover:border-[#4878a8] hover:text-[#88b8e8]'},
          ].map(s => (
            <span key={s.l} className={cn("text-[10px] md:text-xs p-[3px_9px] border tracking-wider transition-all duration-200 cursor-default", s.cls)}>
              {s.l}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

const Work = () => {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section id="work" className="p-[72px_28px] border-b border-border relative">
      <div className="flex items-end mb-[52px] gap-5">
        <h2 className="font-display font-black text-[clamp(42px,6vw,64px)] text-text-hi uppercase tracking-[-0.01em] leading-none">Work</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-cyan to-transparent opacity-30 mb-2" />
        <div className="text-[11px] md:text-[13px] text-text-dim tracking-[0.1em] mb-1.5 shrink-0">01 / 05</div>
      </div>

      <div className="hidden md:grid grid-cols-[32px_160px_1fr_60px_70px] gap-3 p-[6px_12px] text-[10px] md:text-xs text-text-dim tracking-[0.12em] uppercase border-b border-border mb-1">
        <span>#</span>
        <span>project</span>
        <span>description</span>
        <span>year</span>
        <span>type</span>
      </div>

      <div className="flex flex-col">
        {projectsData.map((p, i) => (
          <div 
            key={p.id} 
            className={cn(
              "border border-transparent mb-[3px] transition-all duration-150",
              openId === p.id ? "bg-bg-3 border-cyan" : "hover:bg-bg-2 hover:border-border-hi"
            )}
          >
            <div 
              className="grid grid-cols-[32px_1fr_auto] md:grid-cols-[32px_160px_1fr_60px_70px] gap-3 p-[13px_12px] items-center cursor-none"
              onClick={() => setOpenId(openId === p.id ? null : p.id)}
            >
              <span className="text-[11px] md:text-[13px] text-text-dim">{String(i + 1).padStart(2, '0')}</span>
              <span className={cn("font-display font-bold text-xl uppercase tracking-wider leading-none", openId === p.id ? "text-cyan" : "text-text-hi")}>
                {p.name}
              </span>
              <span className="hidden md:block text-[11px] md:text-[13px] text-text truncate">{p.tagline}</span>
              <span className="hidden md:block text-[11px] md:text-[13px] text-text-dim">{p.year}</span>
              <span className={cn(
                "text-[10px] md:text-xs p-[2px_7px] border tracking-wider text-center",
                p.category === 'sec' ? "border-[#1a3050] text-[#4878a8]" : 
                p.category === 'ai' ? "border-[#20184a] text-[#7055d8]" : "border-[#182a20] text-[#408855]"
              )}>
                {p.category}
              </span>
            </div>
            
            <div className={cn("grid transition-all duration-300 ease-in-out overflow-hidden", openId === p.id ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
              <div className="min-h-0">
                <div className="p-[18px_12px_20px] border-t border-border grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8">
                  <div>
                    <div className="text-xs md:text-sm text-text leading-[1.75] max-w-[580px]">{p.description}</div>
                    <div className="flex flex-wrap gap-[5px] mt-[14px]">
                      {p.stack.map(s => (
                        <span key={s} className="text-[10px] md:text-xs text-cyan bg-cyan/5 border border-cyan/20 p-[2px_8px] tracking-wider">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end shrink-0">
                    {Object.entries(p.links).filter(([, url]) => Boolean(url) && url !== '#').map(([type, url]) => (
                      <a key={type} href={url} className="text-[11px] md:text-[13px] text-text-dim flex items-center gap-[5px] tracking-wider transition-colors duration-200 hover:text-cyan after:content-['↗'] after:text-[10px] md:text-xs">
                        {type}
                      </a>
                    ))}
                    <span className={cn(
                      "text-[9px] p-[1px_6px] border tracking-[0.08em] self-end mt-auto",
                      p.status === 'active' || p.status === 'In Progress' ? "border-[#1a3a20] text-mint" : "border-border-hi text-text-dim"
                    )}>
                      {p.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const Experience = () => {
  return (
    <section id="record" className="p-[72px_28px] border-b border-border relative bg-bg-2">
      <div className="flex items-end mb-[52px] gap-5">
        <h2 className="font-display font-black text-[clamp(42px,6vw,64px)] text-text-hi uppercase tracking-[-0.01em] leading-none">Record</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-cyan to-transparent opacity-30 mb-2" />
        <div className="text-[11px] md:text-[13px] text-text-dim tracking-[0.1em] mb-1.5 shrink-0">02 / 05</div>
      </div>

      <div className="relative pl-[52px] before:content-[''] before:absolute before:left-[10px] before:top-2 before:bottom-2 before:w-px before:bg-gradient-to-b before:from-cyan before:via-border before:to-transparent before:opacity-40">
        {experienceData.map((e, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.1 }}
            className="relative mb-[52px] last:mb-0 group"
          >
            <div className="absolute left-[-46px] top-[7px] w-2 h-2 border border-cyan bg-bg rotate-45 transition-colors duration-200 group-hover:bg-cyan" />
            <div className="absolute left-[-38px] top-[11px] w-7 h-px bg-border-hi" />
            
            <div className="text-[10px] md:text-xs text-text-dim tracking-[0.12em] mb-1">{e.period}</div>
            <span className={cn(
              "inline-block text-[9px] p-[1px_7px] border tracking-[0.1em] mb-2 uppercase",
              e.type === 'internship' ? "border-[#1a3a50] text-[#4888b8]" : 
              e.type === 'leadership' ? "border-[#2a1a50] text-[#7858d8]" : "border-[#182a18] text-[#408840]"
            )}>
              {e.type}
            </span>
            <div className="font-display font-bold text-[30px] text-text-hi uppercase tracking-wider leading-none mb-1">{e.role}</div>
            <div className="text-[11px] md:text-[13px] text-cyan mb-[14px] tracking-wider opacity-80">{e.org}</div>
            {e.location && <div className="text-[10px] md:text-xs text-text-dim mb-2">{e.location}</div>}
            <div className="text-xs md:text-sm text-text leading-[1.75] max-w-[560px]">{e.description}</div>
            {Array.isArray(e.highlights) && e.highlights.length > 0 && (
              <ul className="mt-3 pl-5 list-disc text-xs md:text-sm text-text space-y-1.5">
                {e.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            )}
            {Array.isArray(e.tags) && e.tags.length > 0 && (
              <div className="flex flex-wrap gap-[5px] mt-[14px]">
                {e.tags.map((t) => (
                  <span key={t} className="text-[10px] md:text-xs text-text-dim border border-border p-[2px_7px] tracking-wider transition-colors duration-200 group-hover:border-border-hi group-hover:text-text">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const Skills = () => {
  const categories = Object.entries(skillsData as Record<string, string[]>);

  return (
    <section id="skills" className="p-[72px_28px] border-b border-border relative">
      <div className="flex items-end mb-[52px] gap-5">
        <h2 className="font-display font-black text-[clamp(42px,6vw,64px)] text-text-hi uppercase tracking-[-0.01em] leading-none">Skills</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-cyan to-transparent opacity-30 mb-2" />
        <div className="text-[11px] md:text-[13px] text-text-dim tracking-[0.1em] mb-1.5 shrink-0">03 / 05</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {categories.map(([category, list]) => (
          <div key={category} className="border border-border bg-bg-2/50 p-4">
            <div className="text-[10px] md:text-xs text-cyan tracking-[0.14em] uppercase mb-3">{category}</div>
            <div className="flex flex-wrap gap-1.5">
              {list.map((item) => (
                <span key={item} className="text-[10px] md:text-xs text-text border border-border-hi p-[3px_8px] tracking-wider">
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const About = () => {
  return (
    <section id="whoami" className="p-[72px_28px] border-b border-border relative">
      <div className="flex items-end mb-[52px] gap-5">
        <h2 className="font-display font-black text-[clamp(42px,6vw,64px)] text-text-hi uppercase tracking-[-0.01em] leading-none">whoami</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-cyan to-transparent opacity-30 mb-2" />
        <div className="text-[11px] md:text-[13px] text-text-dim tracking-[0.1em] mb-1.5 shrink-0">04 / 05</div>
      </div>

      <div className="max-w-[700px] text-[13px] leading-[1.8]">
        <div className="mb-9">
          <div className="text-[10px] md:text-xs text-cyan tracking-[0.2em] uppercase flex items-center gap-3.5 mb-3.5 after:content-[''] after:flex-1 after:h-px after:bg-border after:max-w-[160px]">
            NAME
          </div>
          <div className="text-text">
            <code className="text-mint bg-mint/5 p-[1px_6px] font-mono text-xs md:text-sm">{aboutData.handle}</code>
            <span className="text-text-dim"> — </span>
            {aboutData.title}
          </div>
        </div>

        <div className="mb-9">
          <div className="text-[10px] md:text-xs text-cyan tracking-[0.2em] uppercase flex items-center gap-3.5 mb-3.5 after:content-[''] after:flex-1 after:h-px after:bg-border after:max-w-[160px]">
            SYNOPSIS
          </div>
          <div className="text-text">
            <span className="text-cyan">{aboutData.handle}</span>
            &nbsp;[<code className="text-mint bg-mint/5 p-[1px_6px] font-mono text-xs md:text-sm">--focus</code> security|ai-ml|systems]
            &nbsp;[<code className="text-mint bg-mint/5 p-[1px_6px] font-mono text-xs md:text-sm">--env</code> linux]
            &nbsp;[<code className="text-mint bg-mint/5 p-[1px_6px] font-mono text-xs md:text-sm">--mode</code> build|research]
          </div>
        </div>

        <div className="mb-9">
          <div className="text-[10px] md:text-xs text-cyan tracking-[0.2em] uppercase flex items-center gap-3.5 mb-3.5 after:content-[''] after:flex-1 after:h-px after:bg-border after:max-w-[160px]">
            DESCRIPTION
          </div>
          <div className="text-text space-y-2.5">
            {aboutData.description.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>

        <div className="mb-9">
          <div className="text-[10px] md:text-xs text-cyan tracking-[0.2em] uppercase flex items-center gap-3.5 mb-3.5 after:content-[''] after:flex-1 after:h-px after:bg-border after:max-w-[160px]">
            ENVIRONMENT
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {aboutData.current_stack.map(s => (
              <span key={s} className="text-[11px] md:text-[13px] text-text-dim border border-border p-[3px_10px] tracking-wider transition-all duration-200 hover:text-cyan hover:border-cyan">
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-9">
          <div className="text-[10px] md:text-xs text-cyan tracking-[0.2em] uppercase flex items-center gap-3.5 mb-3.5 after:content-[''] after:flex-1 after:h-px after:bg-border after:max-w-[160px]">
            INTERESTS
          </div>
          <div className="flex flex-wrap gap-x-2 gap-y-2">
            {aboutData.focus_areas.map(f => (
              <span key={f} className="text-[11px] md:text-[13px] text-text pl-3.5 relative before:content-['·'] before:absolute before:left-1 before:text-cyan">
                {f}
              </span>
            ))}
          </div>
        </div>

        {Array.isArray(aboutData.personality_traits) && aboutData.personality_traits.length > 0 && (
          <div className="mb-9">
            <div className="text-[10px] md:text-xs text-cyan tracking-[0.2em] uppercase flex items-center gap-3.5 mb-3.5 after:content-[''] after:flex-1 after:h-px after:bg-border after:max-w-[160px]">
              TRAITS
            </div>
            <div className="flex flex-wrap gap-1.5">
              {aboutData.personality_traits.map((trait) => (
                <span key={trait} className="text-[11px] md:text-[13px] text-text-dim border border-border p-[3px_10px] tracking-wider">
                  {trait}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mb-9">
          <div className="text-[10px] md:text-xs text-cyan tracking-[0.2em] uppercase flex items-center gap-3.5 mb-3.5 after:content-[''] after:flex-1 after:h-px after:bg-border after:max-w-[160px]">
            CONTACT
          </div>
          <div className="flex flex-col gap-2">
            {[
              ['email', aboutData.contact.email, `mailto:${aboutData.contact.email}`],
              ['github', aboutData.contact.github, `https://${aboutData.contact.github}`],
              ['linkedin', aboutData.contact.linkedin, `https://${aboutData.contact.linkedin}`],
            ].map(([k, v, href]) => (
              <div key={k} className="grid grid-cols-[88px_14px_1fr] items-center gap-2 text-xs md:text-sm">
                <span className="text-text-dim">{k}</span>
                <span className="text-border-hi text-center">→</span>
                <a href={href} target="_blank" className="text-text-hi transition-colors duration-200 hover:text-cyan cursor-none">
                  {v}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const Signals = () => {
  const social = socialData as Record<string, string>;
  const socialEntries = Object.entries(social).filter(
    ([name]) => name !== 'tryhackme_badge' && name.toLowerCase() !== 'monkeytype'
  );
  const certificates = certificationsData as Array<{ name: string; issuer: string; issue_date: string; image?: string }>;
  const hobbies = hobbiesData as string[];
  const profiles = (profilesData as Array<{ name: string; title?: string; url: string; type?: string; embed_url?: string }>).filter(
    (profile) => profile.name.toLowerCase() !== 'monkeytype'
  );
  const contactEntries = contactData as Array<{ method: string; link: string; cta: string }>;

  const profileCards = [
    ...profiles,
    {
      name: 'Medium',
      title: 'Medium',
      url: social.medium,
      type: 'link',
    },
  ].filter((profile, index, list) => {
    if (!profile.url) return false;
    return list.findIndex((item) => item.url === profile.url) === index;
  });

  return (
    <section id="signals" className="p-[72px_28px] border-b border-border relative bg-bg-2">
      <div className="flex items-end mb-[52px] gap-5">
        <h2 className="font-display font-black text-[clamp(42px,6vw,64px)] text-text-hi uppercase tracking-[-0.01em] leading-none">Signals</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-cyan to-transparent opacity-30 mb-2" />
        <div className="text-[11px] md:text-[13px] text-text-dim tracking-[0.1em] mb-1.5 shrink-0">05 / 05</div>
      </div>

      <div className="grid grid-cols-1 gap-5">
        <div className="border border-border bg-bg p-4">
          <div className="text-xs md:text-sm text-cyan tracking-[0.14em] uppercase mb-4">Certifications</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {certificates.map((cert) => (
              <div key={cert.name} className="text-sm border border-border-hi p-4 bg-bg-2/60">
                {cert.image && (
                  <img
                    src={staticAssetUrls[`../${cert.image}`] || `/${cert.image}`}
                    alt={cert.name}
                    className="w-full h-44 object-contain border border-border mb-3 bg-bg"
                  />
                )}
                <div className="text-text-hi leading-6">{cert.name}</div>
                <div className="text-text-dim mt-1 text-xs md:text-sm">{cert.issuer} · {cert.issue_date}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-border bg-bg p-4">
          <div className="text-xs md:text-sm text-cyan tracking-[0.14em] uppercase mb-4">Public Profiles</div>
          <div className="grid grid-cols-1 gap-4">
            {profileCards.map((profile) => (
              <div key={profile.url} className="text-sm text-text border border-border-hi p-4 bg-bg-2/60 transition-colors duration-200 hover:border-cyan h-full flex flex-col">
                <div className="text-text-hi mb-3 flex items-center justify-between">
                  <span>{profile.title || profile.name}</span>
                  <span className="text-xs md:text-sm text-cyan">↗</span>
                </div>
                {profile.type === 'iframe' && profile.embed_url && (
                  <div className="mb-4 border border-border overflow-hidden bg-bg rounded-sm">
                    <iframe
                      src={profile.embed_url}
                      title={profile.title || profile.name}
                      className="w-full h-[128px]"
                      loading="lazy"
                    />
                  </div>
                )}

                {profile.name.toLowerCase() === 'medium' && (
                  <div className="mb-4 border border-border bg-bg p-3.5 rounded-sm">
                    <div className="text-xs text-cyan tracking-[0.12em] uppercase">Writing Hub</div>
                    <div className="text-text mt-2.5 leading-7 text-sm md:text-[15px]">
                      Essays and build notes on AI systems, cybersecurity, and practical engineering.
                    </div>
                    <div className="text-text-dim mt-2.5 text-xs">@adper0705</div>
                  </div>
                )}

                <a href={profile.url} target="_blank" rel="noreferrer" className="inline-block text-text-dim hover:text-cyan transition-colors duration-200 mt-auto text-sm">
                  visit profile
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-border bg-bg p-4">
          <div className="text-xs md:text-sm text-cyan tracking-[0.14em] uppercase mb-3">Networks</div>
          <div className="flex flex-wrap gap-1.5">
            {socialEntries.map(([name, url]) => (
              <a key={name} href={url} target="_blank" rel="noreferrer" className="text-xs md:text-sm text-text border border-border-hi p-[4px_9px] tracking-wider transition-colors duration-200 hover:text-cyan hover:border-cyan">
                {name}
              </a>
            ))}
          </div>
          <div className="text-xs md:text-sm text-cyan tracking-[0.14em] uppercase mt-6 mb-3">Off-grid Interests</div>
          <div className="flex flex-wrap gap-1.5">
            {hobbies.map((hobby) => (
              <span key={hobby} className="text-xs md:text-sm text-text-dim border border-border p-[4px_9px] tracking-wider">
                {hobby}
              </span>
            ))}
          </div>
          <div className="text-xs md:text-sm text-cyan tracking-[0.14em] uppercase mt-6 mb-3">Contact Modes</div>
          <div className="space-y-2">
            {contactEntries.map((entry) => (
              <a key={entry.method} href={entry.link} target="_blank" rel="noreferrer" className="grid grid-cols-[108px_16px_1fr] items-center text-xs md:text-sm text-text border border-border-hi p-3 transition-colors duration-200 hover:text-cyan hover:border-cyan">
                <span className="text-text-dim">{entry.method}</span>
                <span className="text-border-hi text-center">→</span>
                <span>{entry.cta}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// --- Main App Content ---

function AppContent() {
  const [isBooted, setIsBooted] = useState(false);
  const [currentSection, setCurrentSection] = useState('identity');

  useEffect(() => {
    const sections = ['identity', 'work', 'record', 'skills', 'whoami', 'signals'];
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setCurrentSection(entry.target.id === 'record' ? 'record' : entry.target.id);
        }
      });
    }, { threshold: 0.35 });

    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isBooted]);

  return (
    <div className="relative min-h-screen bg-bg text-text overflow-hidden selection:bg-cyan/15 selection:text-cyan">
      <AnimatePresence>
        {!isBooted && <BootSequence onComplete={() => setIsBooted(true)} />}
      </AnimatePresence>

      {isBooted && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Cursor />
          <CanvasBackground />
          <Nav />
          
          <main className="relative z-10 mt-[42px]">
            <Identity />
            <Work />
            <Experience />
            <Skills />
            <About />
            <Signals />
          </main>

          <Statusbar currentSection={currentSection} />
        </motion.div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
