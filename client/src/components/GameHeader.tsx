import { useState } from "react";
import { useLocation } from "wouter";
import { Flame, Coins, Settings, BookOpen, Sparkles, RotateCcw, X, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadState } from "@/lib/gameStorage";

interface GameHeaderProps {
  onRefresh?: () => void;
}

const HOW_TO_PLAY = [
  { icon: "🍖", title: "Feed your pet", desc: "Keep hunger high — pets get sad when hungry!" },
  { icon: "🎮", title: "Play together", desc: "Boosts happiness and earns XP." },
  { icon: "🛁", title: "Clean regularly", desc: "A clean pet is a healthy pet." },
  { icon: "💤", title: "Let them sleep", desc: "Restores energy for more adventures." },
  { icon: "⬆️", title: "Level up", desc: "Earn XP through actions to unlock evolution stages." },
  { icon: "🎯", title: "Daily streak", desc: "Log in every day for bonus coins!" },
];

export default function GameHeader({ onRefresh }: GameHeaderProps) {
  const state = loadState();
  const activePet = state.pets.find((p) => p.id === state.activePetId);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [, setLocation] = useLocation();

  const handleReset = () => {
    localStorage.removeItem("toypetme_v2");
    localStorage.removeItem("toypetme_accessories_v1");
    localStorage.removeItem("toypetme_dressup_v1");
    window.location.href = "/";
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-4 h-14 gap-2">
          <div className="flex items-center gap-1.5">
            <span
              className="text-xl font-black tracking-tight text-primary"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              ToyPetMe
            </span>
          </div>

          <div className="flex items-center gap-2">
            {state.dailyStreak > 0 && (
              <div
                className="flex items-center gap-1 bg-orange-50 text-orange-600 rounded-full px-2 py-0.5"
                data-testid="streak-display"
              >
                <Flame size={14} />
                <span className="text-xs font-bold">{state.dailyStreak}</span>
              </div>
            )}

            <div
              className="flex items-center gap-1 bg-amber-50 text-amber-700 rounded-full px-2.5 py-0.5"
              data-testid="coins-display"
            >
              <Coins size={14} />
              <span className="text-sm font-bold">{state.coins.toLocaleString()}</span>
            </div>

            {activePet && (
              <div
                className="flex items-center gap-1 bg-violet-50 text-violet-700 rounded-full px-2.5 py-0.5"
                data-testid="level-display"
              >
                <span className="text-xs font-semibold">Lv</span>
                <span className="text-sm font-bold">{activePet.level}</span>
              </div>
            )}

            {/* Settings gear */}
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setMenuOpen((v) => !v)}
              data-testid="btn-settings"
            >
              <Settings size={18} />
            </Button>
          </div>
        </div>
      </header>

      {/* Settings dropdown */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpen(false)}
          />

          {/* Menu panel */}
          <div className="fixed top-14 right-2 z-50 w-56 rounded-md bg-background border border-border shadow-lg">
            <div className="p-1">
              <button
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-foreground hover-elevate"
                onClick={() => { setMenuOpen(false); setShowHelp(true); }}
                data-testid="btn-how-to-play"
              >
                <HelpCircle size={15} className="text-primary flex-shrink-0" />
                How to Play
              </button>

              <button
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-foreground hover-elevate"
                onClick={() => { setMenuOpen(false); setLocation("/stories"); }}
                data-testid="btn-nav-stories"
              >
                <BookOpen size={15} className="text-violet-500 flex-shrink-0" />
                Pet Stories
              </button>

              <button
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-foreground hover-elevate"
                onClick={() => { setMenuOpen(false); setLocation("/dress-up"); }}
                data-testid="btn-nav-dressup"
              >
                <Sparkles size={15} className="text-pink-500 flex-shrink-0" />
                Dress Up
              </button>

              <div className="my-1 h-px bg-border" />

              <button
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-destructive hover-elevate"
                onClick={() => { setMenuOpen(false); setShowReset(true); }}
                data-testid="btn-reset-game"
              >
                <RotateCcw size={15} className="flex-shrink-0" />
                Reset Game
              </button>
            </div>
          </div>
        </>
      )}

      {/* How to Play modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-background rounded-xl border border-border w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border">
              <h2 className="font-bold text-foreground text-lg" style={{ fontFamily: "Outfit, sans-serif" }}>
                How to Play
              </h2>
              <Button size="icon" variant="ghost" onClick={() => setShowHelp(false)} data-testid="btn-close-help">
                <X size={16} />
              </Button>
            </div>
            <div className="p-5 flex flex-col gap-3">
              {HOW_TO_PLAY.map((tip) => (
                <div key={tip.title} className="flex items-start gap-3">
                  <span className="text-xl leading-none mt-0.5">{tip.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{tip.title}</p>
                    <p className="text-xs text-muted-foreground">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 pb-5">
              <Button className="w-full" onClick={() => setShowHelp(false)} data-testid="btn-got-it">
                Got it!
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reset confirmation modal */}
      {showReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-background rounded-xl border border-border w-full max-w-sm shadow-xl">
            <div className="p-6 text-center">
              <div className="text-4xl mb-3 select-none">⚠️</div>
              <h2 className="font-bold text-foreground text-lg mb-2">Reset All Data?</h2>
              <p className="text-sm text-muted-foreground mb-6">
                This will permanently delete all your pets, coins, achievements, and progress. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowReset(false)}
                  data-testid="btn-cancel-reset"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleReset}
                  data-testid="btn-confirm-reset"
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
