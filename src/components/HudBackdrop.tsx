import { useEffect, useRef } from "react";

export function HudBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const GRID = 64;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let animId = 0;

    const mouse = { x: -1000, y: -1000 };
    let pulses: { x: number; y: number; r: number; maxR: number }[] = [];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const handleMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const spawnPulse = () => {
      if (prefersReducedMotion || pulses.length >= 3) return;
      const gx = Math.floor(Math.random() * Math.max(1, Math.ceil(width / GRID)));
      const gy = Math.floor(Math.random() * Math.max(1, Math.ceil(height / GRID)));
      pulses.push({
        x: gx * GRID,
        y: gy * GRID,
        r: 4,
        maxR: GRID * 2.6 + Math.random() * GRID,
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Subtle architectural coordinate grid
      ctx.strokeStyle = "rgba(110, 145, 200, 0.045)";
      ctx.lineWidth = 0.75;
      for (let x = 0; x <= width; x += GRID) {
        ctx.beginPath();
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, height);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y += GRID) {
        ctx.beginPath();
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(width, y + 0.5);
        ctx.stroke();
      }

      // Intersections with gentle optical proximity illumination
      const radiusSq = 240 * 240;
      for (let x = 0; x <= width; x += GRID) {
        for (let y = 0; y <= height; y += GRID) {
          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < radiusSq) {
            const intensity = 1 - Math.sqrt(distSq) / 240;
            ctx.fillStyle = `rgba(0, 229, 200, ${0.12 + intensity * 0.42})`;
            ctx.beginPath();
            ctx.arc(x, y, 1 + intensity * 1.1, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = "rgba(110, 145, 200, 0.14)";
            ctx.beginPath();
            ctx.arc(x, y, 0.85, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Concentric telemetry ripples
      if (!prefersReducedMotion) {
        pulses = pulses.filter((p) => p.r < p.maxR);
        for (const p of pulses) {
          const t = p.r / p.maxR;
          const alpha = (1 - t) * 0.14;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0, 229, 200, ${alpha})`;
          ctx.lineWidth = 0.75;
          ctx.stroke();
          p.r += 0.35;
        }
      }

      if (!prefersReducedMotion) {
        animId = requestAnimationFrame(draw);
      }
    };

    resize();
    draw();

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("mouseleave", handleLeave);
    const interval = window.setInterval(spawnPulse, 3200);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", handleLeave);
      window.clearInterval(interval);
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <>
      {/* Ambient optical top illumination */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 75% 45% at 50% -10%, rgba(0, 229, 200, 0.085), transparent 65%), radial-gradient(ellipse 45% 35% at 85% 20%, rgba(56, 189, 248, 0.055), transparent 60%)",
        }}
      />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="fixed inset-0 z-0 pointer-events-none"
      />
    </>
  );
}
