import { useLocation, Link } from "wouter";
import { Home, Grid3X3, Gamepad2, Trophy, Star } from "lucide-react";

const tabs = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/collection", icon: Grid3X3, label: "Pets" },
  { path: "/minigames", icon: Gamepad2, label: "Games" },
  { path: "/leaderboard", icon: Trophy, label: "Ranks" },
  { path: "/achievements", icon: Star, label: "Awards" },
];

export default function BottomTabNav() {
  const [location] = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      data-testid="bottom-nav"
    >
      <div className="max-w-2xl mx-auto flex items-center">
        {tabs.map(({ path, icon: Icon, label }) => {
          const isActive = location === path;
          return (
            <Link
              key={path}
              href={path}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 px-1 transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`nav-${label.toLowerCase()}`}
            >
              <Icon
                size={20}
                className={`transition-transform ${isActive ? "scale-110" : ""}`}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span className="text-[10px] font-semibold tracking-wide">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
