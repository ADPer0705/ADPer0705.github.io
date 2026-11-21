import type { HTMLAttributes, MouseEvent, ReactNode } from "react";
import { cn } from "../lib/utils";

interface SpotlightCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  corners?: boolean;
}

export function SpotlightCard({
  children,
  className,
  corners = false,
  onMouseMove,
  ...props
}: SpotlightCardProps) {
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
    onMouseMove?.(e);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className={cn("spotlight-card rounded-[4px]", className)}
      {...props}
    >
      {corners && (
        <>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-cyan/45"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-cyan/45"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-cyan/45"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-cyan/45"
          />
        </>
      )}
      {children}
    </div>
  );
}
