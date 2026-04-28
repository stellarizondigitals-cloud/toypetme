import { useEffect, useRef } from "react";

interface AdSlotProps {
  slot?: string;
  format?: "banner" | "rectangle" | "leaderboard" | "square" | "responsive";
  className?: string;
  label?: boolean;
}

const SIZES: Record<string, { w: number; h: number; label: string }> = {
  banner:      { w: 320, h: 50,  label: "320×50"  },
  rectangle:   { w: 300, h: 250, label: "300×250" },
  leaderboard: { w: 728, h: 90,  label: "728×90"  },
  square:      { w: 250, h: 250, label: "250×250" },
  responsive:  { w: 640, h: 100, label: "Responsive" },
};

export default function AdSlot({
  slot = "auto",
  format = "banner",
  className = "",
  label = true,
}: AdSlotProps) {
  const insRef = useRef<HTMLModElement>(null);
  const { w, h, label: sizeLabel } = SIZES[format] ?? SIZES.banner;

  useEffect(() => {
    try {
      if (insRef.current && (window as any).adsbygoogle) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch {}
  }, []);

  const maxWidth = format === "responsive" ? "100%" : w;

  return (
    <div
      className={`flex flex-col items-center gap-0 ${className}`}
      style={{ width: "100%", maxWidth }}
      aria-label="Advertisement"
    >
      {label && (
        <span className="text-[9px] font-medium tracking-widest text-muted-foreground/50 uppercase mb-0.5 self-center">
          Advertisement
        </span>
      )}

      <div
        className="relative flex items-center justify-center w-full bg-muted/40 border border-dashed border-border/60 rounded overflow-hidden"
        style={{ minHeight: h, maxWidth: format === "responsive" ? "100%" : w }}
      >
        {/* ── Real AdSense tag — activate by replacing publisher ID ── */}
        <ins
          ref={insRef}
          className="adsbygoogle"
          style={{ display: "block", width: "100%", minHeight: h }}
          data-ad-client="ca-pub-1318056567034683"
          data-ad-slot={slot}
          data-ad-format={format === "responsive" ? "auto" : undefined}
          data-full-width-responsive={format === "responsive" ? "true" : undefined}
        />
        {/* ── Placeholder shown until AdSense activates ── */}
        <span
          className="absolute inset-0 flex items-center justify-center text-[10px] text-muted-foreground/40 font-medium pointer-events-none select-none"
          aria-hidden="true"
        >
          Ad · {sizeLabel}
        </span>
      </div>
    </div>
  );
}

/* ── Horizontal rule divider for surrounding ad slots ── */
export function AdDivider() {
  return (
    <div className="flex items-center gap-3 w-full my-1" aria-hidden="true">
      <div className="flex-1 h-px bg-border/40" />
      <span className="text-[9px] tracking-widest text-muted-foreground/30 uppercase font-semibold">Ad</span>
      <div className="flex-1 h-px bg-border/40" />
    </div>
  );
}

/* ── Full-width in-content ad block with top+bottom dividers ── */
export function InContentAd({ slot, format = "rectangle" }: { slot?: string; format?: AdSlotProps["format"] }) {
  return (
    <div className="my-4 flex flex-col items-center gap-1">
      <AdDivider />
      <AdSlot slot={slot} format={format} label={true} className="mx-auto" />
      <AdDivider />
    </div>
  );
}
