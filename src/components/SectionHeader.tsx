interface SectionHeaderProps {
  title: string;
  index: string;
  total?: string;
  eyebrow?: string;
}

export function SectionHeader({
  title,
  index,
  total = "06",
  eyebrow,
}: SectionHeaderProps) {
  return (
    <div className="mb-12">
      {eyebrow && (
        <div className="font-mono flex items-center gap-2.5 text-[11px] text-cyan/80 tracking-[0.2em] uppercase mb-3">
          <span className="w-5 h-px bg-cyan/70 shrink-0" />
          <span>{eyebrow}</span>
        </div>
      )}
      <div className="flex items-end gap-5">
        <h2 className="font-display font-black text-[clamp(40px,5.5vw,64px)] text-text-hi uppercase tracking-[-0.01em] leading-none">
          {title}
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-cyan/45 via-border-hi/50 to-transparent mb-2.5" />
        <div className="font-mono text-xs text-text-dim tracking-[0.14em] mb-1.5 shrink-0 tabular-nums">
          <span className="text-cyan">{index}</span>
          <span className="mx-1.5 text-border-hi">/</span>
          <span>{total}</span>
        </div>
      </div>
    </div>
  );
}
