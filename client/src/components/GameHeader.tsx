import { useState } from "react";
import { useLocation } from "wouter";
import {
  Flame, Coins, Settings, BookOpen, Sparkles, RotateCcw, X, HelpCircle,
  Utensils, Dumbbell, BedDouble, TrendingUp, AlertTriangle, Crown, ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { loadState } from "@/lib/gameStorage";

const PREMIUM_KEY = "toypetme_premium";

const HOW_TO_PLAY: { Icon: typeof Utensils; title: string; desc: string }[] = [
  { Icon: Utensils,    title: "Feed your pet",   desc: "Keep hunger high — pets get sad when hungry! (5 min cooldown)" },
  { Icon: Dumbbell,    title: "Play together",    desc: "Boosts happiness and earns XP. (3 min cooldown)" },
  { Icon: Sparkles,    title: "Clean regularly",  desc: "A clean pet is a healthy pet. (10 min cooldown)" },
  { Icon: BedDouble,   title: "Let them sleep",   desc: "Restores energy for more adventures. (15 min cooldown)" },
  { Icon: TrendingUp,  title: "Level up",         desc: "Earn XP through actions to evolve through Baby → Kid → Teen → Adult." },
  { Icon: Flame,       title: "Daily streak",     desc: "Log in every day for bonus coins — bigger bonuses at streak milestones!" },
];

export default function GameHeader() {
  const state = loadState();
  const activePet = state.pets.find((p) => p.id === state.activePetId);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [, setLocation] = useLocation();
  const hasPremium = localStorage.getItem(PREMIUM_KEY) === "1";

  const handleReset = () => {
    localStorage.removeItem("toypetme_v2");
    localStorage.removeItem("toypetme_accessories_v1");
    localStorage.removeItem("toypetme_dressup_v1");
    localStorage.removeItem("toypetme_onboard");
    window.location.href = "/";
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-4 h-14 gap-2">
          <div className="flex items-center gap-2">
            {/* Paw logo icon */}
            <svg width="30" height="30" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <defs>
                <linearGradient id="hdr-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7C3AED"/>
                  <stop offset="100%" stopColor="#A855F7"/>
                </linearGradient>
              </defs>
              <rect width="64" height="64" rx="14" ry="14" fill="url(#hdr-bg)"/>
              <ellipse cx="32" cy="40" rx="13" ry="11" fill="white"/>
              <ellipse cx="18" cy="27" rx="6" ry="5.5" fill="white"/>
              <ellipse cx="27" cy="21" rx="6" ry="5.5" fill="white"/>
              <ellipse cx="37" cy="21" rx="6" ry="5.5" fill="white"/>
              <ellipse cx="46" cy="27" rx="6" ry="5.5" fill="white"/>
            </svg>
            <span
              className="text-xl font-black tracking-tight text-primary"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              ToyPetMe
            </span>
          </div>

          <div className="flex items-center gap-2">
            {hasPremium && (
              <Badge className="bg-yellow-400 text-yellow-900 gap-1 px-2" data-testid="premium-badge">
                <Crown size={11} />
                Premium
              </Badge>
            )}

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

            {/* Persistent help button — always accessible */}
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setShowHelp(true)}
              data-testid="btn-help"
            >
              <HelpCircle size={18} />
            </Button>

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
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
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
                onClick={() => { setMenuOpen(false); setLocation("/shop"); }}
                data-testid="btn-nav-shop"
              >
                <ShoppingBag size={15} className="text-amber-500 flex-shrink-0" />
                Shop &amp; Premium
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className="bg-background rounded-xl border border-border w-full max-w-sm shadow-2xl overflow-y-auto"
            style={{ maxHeight: "92vh" }}
            data-testid="how-to-play-modal"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border"
              style={{ background: "linear-gradient(135deg,#EDE9FE,#FCE7F3)" }}
            >
              <div>
                <h2 className="font-black text-foreground text-xl" style={{ fontFamily: "Outfit, sans-serif" }}>
                  How to Play
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Free forever · No sign-up · No email needed
                </p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setShowHelp(false)} data-testid="btn-close-help">
                <X size={16} />
              </Button>
            </div>

            {/* Game rules */}
            <div className="px-5 pt-4 pb-2 flex flex-col gap-4">
              <p className="text-sm font-bold text-foreground">
                Your pet needs you every day! Keep all 4 stats high to earn coins and XP.
              </p>

              {HOW_TO_PLAY.map(({ Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-primary" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-foreground">{title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats explained */}
            <div className="mx-5 my-3 rounded-lg bg-muted/50 px-4 py-3 space-y-1.5">
              <p className="text-xs font-black text-foreground uppercase tracking-wide">The 4 Stats — Keep them full!</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {[
                  ["Hunger", "Falls over time — Feed regularly"],
                  ["Happiness", "Drops when bored — Play often"],
                  ["Energy", "Drains gradually — Let them sleep"],
                  ["Cleanliness", "Gets dirty — Clean every day"],
                ].map(([stat, rule]) => (
                  <div key={stat}>
                    <p className="text-xs font-bold text-foreground">{stat}</p>
                    <p className="text-[11px] text-muted-foreground">{rule}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Evolution */}
            <div className="mx-5 mb-3 rounded-lg bg-violet-50 dark:bg-violet-950/30 px-4 py-3">
              <p className="text-xs font-black text-violet-700 dark:text-violet-300 uppercase tracking-wide mb-1">Evolution stages</p>
              <div className="flex items-center justify-between text-center">
                {[["Baby","Lv 1"],["Kid","Lv 5"],["Teen","Lv 15"],["Adult","Lv 30"]].map(([stage, lv]) => (
                  <div key={stage}>
                    <p className="text-xs font-black text-violet-700 dark:text-violet-300">{stage}</p>
                    <p className="text-[10px] text-muted-foreground">{lv}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Premium upsell */}
            {!hasPremium && (
              <div
                className="mx-5 mb-3 rounded-lg border border-yellow-400 px-4 py-3 space-y-1.5"
                style={{ background: "linear-gradient(135deg,#FFFBEB,#FEF9C3)" }}
              >
                <div className="flex items-center gap-2">
                  <Crown size={15} className="text-amber-500" />
                  <p className="text-sm font-black text-amber-900">Want more? Upgrade for £0.99</p>
                </div>
                <p className="text-xs text-amber-800">
                  One-time payment · No account · No subscription · Instant perks including bonus XP, exclusive
                  cosmetics, double streak coins, and a gold badge on your pet.
                </p>
                <Button
                  size="sm"
                  className="w-full mt-1 font-bold"
                  style={{ background: "linear-gradient(90deg,#F59E0B,#EAB308)", color: "#78350F" }}
                  onClick={() => { setShowHelp(false); setLocation("/shop"); }}
                  data-testid="btn-help-go-premium"
                >
                  <Crown size={13} className="mr-1.5" />
                  See Premium — £0.99 one-time
                </Button>
              </div>
            )}

            <div className="px-5 pb-5">
              <Button className="w-full font-bold" onClick={() => setShowHelp(false)} data-testid="btn-got-it">
                Got it — let's play!
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
              <div className="w-14 h-14 rounded-xl bg-destructive/10 mx-auto flex items-center justify-center mb-4">
                <AlertTriangle size={28} className="text-destructive" strokeWidth={1.5} />
              </div>
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
