interface AdSlotProps {
  slot?: string;
  format?: "banner" | "rectangle" | "leaderboard";
  className?: string;
}

export default function AdSlot({ slot = "auto", format = "banner", className = "" }: AdSlotProps) {
  const sizes: Record<string, { w: number; h: number; label: string }> = {
    banner: { w: 320, h: 50, label: "320×50 Banner Ad" },
    rectangle: { w: 300, h: 250, label: "300×250 Rectangle Ad" },
    leaderboard: { w: 728, h: 90, label: "728×90 Leaderboard Ad" },
  };
  const { w, h, label } = sizes[format];

  return (
    <div
      className={`flex items-center justify-center bg-muted/50 border border-dashed border-border rounded-md text-muted-foreground text-xs ${className}`}
      style={{ minHeight: h, maxWidth: w, width: "100%" }}
      data-testid={`ad-slot-${format}`}
    >
      {/* Replace this div with your Google AdSense ins tag:
          <ins class="adsbygoogle"
               style="display:block"
               data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
               data-ad-slot="XXXXXXXXXX"
               data-ad-format="auto"
               data-full-width-responsive="true"></ins>
          <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
      */}
      <span>{label}</span>
    </div>
  );
}
