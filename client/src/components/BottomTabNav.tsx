import { useLocation, Link } from "wouter";
import { Home, Grid3X3, Gamepad2, BookOpen, Sparkles, Star } from "lucide-react";
import AdSlot from "@/components/AdSlot";

const tabs = [
  { path: "/",             icon: Home,     label: "Home"    },
  { path: "/collection",   icon: Grid3X3,  label: "Pets"    },
  { path: "/minigames",    icon: Gamepad2, label: "Games"   },
  { path: "/stories",      icon: BookOpen, label: "Stories" },
  { path: "/dress-up",     icon: Sparkles, label: "Dress Up"},
  { path: "/achievements", icon: Star,     label: "Awards"  },
];

export default function BottomTabNav() {
  const [location] = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      data-testid="bottom-nav"
    >
      {/* Sticky anchor banner ad — highest CPM placement on mobile */}
      <div className="flex items-center justify-center py-1 bg-muted/30 border-b border-border/40">
        <AdSlot format="banner" slot="sticky-bottom" className="mx-auto" />
      </div>

      <div className="max-w-2xl mx-auto flex items-center">
        {tabs.map(({ path, icon: Icon, label }) => {
          const isActive = location === path;
          return (
            <Link
              key={path}
              href={path}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 px-0.5 transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <Icon
                size={18}
                className={`transition-transform ${isActive ? "scale-110" : ""}`}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span className="text-[9px] font-semibold tracking-wide leading-none">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
