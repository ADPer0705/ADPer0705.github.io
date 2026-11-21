import { useEffect, useState } from "react";

export function PrecisionCursor() {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isDown, setIsDown] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (!isFinePointer) return;

    const handleMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      setVisible(true);
      const target = e.target as HTMLElement | null;
      const interactive = Boolean(
        target?.closest('a, button, [role="button"], input, textarea'),
      );
      setIsHovering(interactive);
    };
    const handleDown = () => setIsDown(true);
    const handleUp = () => setIsDown(false);
    const handleLeave = () => setVisible(false);

    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);
    document.addEventListener("mouseleave", handleLeave);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
      document.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  if (!visible) return null;

  return (
    <>
      <div
        aria-hidden="true"
        className="fixed pointer-events-none z-[9999] transition-[width,height,border-color,transform] duration-100 ease-out rounded-full"
        style={{
          left: pos.x,
          top: pos.y,
          width: isHovering ? 34 : 22,
          height: isHovering ? 34 : 22,
          border: isHovering
            ? "1px solid rgba(0, 229, 200, 0.65)"
            : "1px solid rgba(0, 229, 200, 0.25)",
          background: isHovering ? "rgba(0, 229, 200, 0.05)" : "transparent",
          transform: `translate(-50%, -50%) scale(${isDown ? 0.78 : 1})`,
        }}
      >
        {!isHovering && (
          <>
            <span className="absolute w-px h-full left-1/2 -translate-x-1/2 bg-cyan/55" />
            <span className="absolute h-px w-full top-1/2 -translate-y-1/2 bg-cyan/55" />
          </>
        )}
      </div>
      <div
        aria-hidden="true"
        className="fixed w-[3px] h-[3px] bg-cyan rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2"
        style={{ left: pos.x, top: pos.y }}
      />
    </>
  );
}
