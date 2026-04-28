import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import GameHeader from "@/components/GameHeader";
import PetDisplay from "@/components/PetDisplay";
import ActionButtons from "@/components/ActionButtons";
import StatsPanel from "@/components/StatsPanel";
import BottomTabNav from "@/components/BottomTabNav";
import AdSlot, { InContentAd } from "@/components/AdSlot";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  loadState,
  saveState,
  createPet,
  performAction,
  checkDailyLogin,
  type GameState,
  type ActionType,
  type Species,
} from "@/lib/gameStorage";
import { PET_SPECIES, PET_NAME_SUGGESTIONS } from "@/lib/petData";
import {
  Plus, Share2, Trophy,
  Heart, Gamepad2, TrendingUp, ChevronDown, ChevronUp, Utensils, Sparkles, Crown,
} from "lucide-react";
import { usePageMeta } from "@/lib/usePageMeta";

type Screen = "loading" | "onboard" | "create" | "game" | "daily";

const ONBOARD_SLIDES = [
  {
    Icon: Heart,
    title: "Welcome to ToyPetMe!",
    body: "Adopt a virtual pet and care for it every day. No sign-up needed — just play!",
    accent: "bg-gradient-to-br from-pink-100 to-rose-100",
    iconColor: "text-rose-500",
    iconBg: "bg-rose-100",
  },
  {
    Icon: Utensils,
    title: "Care Every Day",
    body: "Feed, play, clean, and rest your pet. Keep all four stats high to earn bonus coins!",
    accent: "bg-gradient-to-br from-orange-100 to-amber-100",
    iconColor: "text-orange-500",
    iconBg: "bg-orange-100",
  },
  {
    Icon: Gamepad2,
    title: "Play Mini-Games",
    body: "Tap Rush, Memory Match, and Feed Frenzy — earn coins and set records!",
    accent: "bg-gradient-to-br from-violet-100 to-purple-100",
    iconColor: "text-violet-500",
    iconBg: "bg-violet-100",
  },
  {
    Icon: TrendingUp,
    title: "Evolve and Grow",
    body: "Level up through Baby, Kid, Teen, and Adult stages. Each stage shows a whole new look!",
    accent: "bg-gradient-to-br from-teal-100 to-cyan-100",
    iconColor: "text-teal-600",
    iconBg: "bg-teal-100",
  },
];

const STAGE_MILESTONES = [
  { stage: 0, name: "Baby", level: 1 },
  { stage: 1, name: "Kid", level: 5 },
  { stage: 2, name: "Teen", level: 15 },
  { stage: 3, name: "Adult", level: 30 },
];

const ONBOARD_KEY = "toypetme_onboard";

export default function GameHome() {
  usePageMeta({
    title: "Free Virtual Pet Game — Play Online Instantly, No Download",
    description: "Adopt a free virtual pet at ToyPetMe.com! Feed, play, clean and evolve your digital companion through 4 evolution stages. Like Tamagotchi but free — no download, no sign-up, play instantly in your browser on mobile or desktop.",
    canonicalPath: "/",
    ogImage: "https://toypetme.com/og-image.svg",
  });

  useEffect(() => {
    const videoGameSchema = {
      "@context": "https://schema.org",
      "@type": "VideoGame",
      name: "ToyPetMe",
      description:
        "A free browser-based virtual pet game. Adopt, feed, play with, and evolve your pet through Baby, Kid, Teen, and Adult stages. No sign-up required.",
      url: "https://toypetme.replit.app",
      image: "https://toypetme.replit.app/og-image.png",
      genre: ["Casual", "Simulation", "Pet Game"],
      gamePlatform: "Web Browser",
      applicationCategory: "Game",
      operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      author: { "@type": "Organization", name: "Stellarizon Digitals" },
    };

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Is ToyPetMe free to play?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes! ToyPetMe is completely free. No sign-up, no download, and no payment required.",
          },
        },
        {
          "@type": "Question",
          name: "How do I make my pet evolve?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Keep your pet's stats high and play daily to earn XP. Pets evolve at levels 5 (Kid), 15 (Teen), and 30 (Adult).",
          },
        },
        {
          "@type": "Question",
          name: "Will my progress be saved?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Your pet is saved automatically in your browser's local storage. Progress stays as long as you use the same browser.",
          },
        },
        {
          "@type": "Question",
          name: "What mini-games are available?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "ToyPetMe includes three mini-games: Tap Rush, Memory Match, and Feed Frenzy. Each rewards coins you can spend on cosmetics.",
          },
        },
      ],
    };

    const inject = (id: string, data: object) => {
      let el = document.getElementById(id) as HTMLScriptElement | null;
      if (!el) {
        el = document.createElement("script");
        el.id = id;
        el.type = "application/ld+json";
        document.head.appendChild(el);
      }
      el.textContent = JSON.stringify(data);
    };

    inject("jsonld-videogame", videoGameSchema);
    inject("jsonld-faq", faqSchema);

    return () => {
      document.getElementById("jsonld-videogame")?.remove();
      document.getElementById("jsonld-faq")?.remove();
    };
  }, []);

  const [state, setState] = useState<GameState>(() => loadState());
  const [screen, setScreen] = useState<Screen>("loading");
  const [actingAction, setActingAction] = useState<string | null>(null);
  const [dailyBonus, setDailyBonus] = useState(0);
  const [slide, setSlide] = useState(0);
  const [stageOpen, setStageOpen] = useState(false);
  const [evolutionModal, setEvolutionModal] = useState<{ petName: string; stageName: string } | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [newPetSpecies, setNewPetSpecies] = useState<Species>("cat");
  const [newPetColor, setNewPetColor] = useState<string>("#F97316");
  const [newPetName, setNewPetName] = useState("");

  useEffect(() => {
    let s = loadState();
    const { state: newState, isNew, bonus } = checkDailyLogin(s);
    if (isNew) {
      s = newState;
      setDailyBonus(bonus);
    }
    saveState(s);
    setState(s);

    if (s.pets.length === 0) {
      const onboardShown = localStorage.getItem(ONBOARD_KEY) === "1";
      setScreen(onboardShown ? "create" : "onboard");
    } else {
      setScreen(isNew ? "daily" : "game");
    }
  }, []);

  const activePet = state.pets.find((p) => p.id === state.activePetId) ?? state.pets[0];

  const handleAction = useCallback(
    (action: ActionType) => {
      if (!activePet) return;
      setActingAction(action);

      const { state: newState, result } = performAction(state, activePet.id, action);

      if (result.success) {
        saveState(newState);
        setState(newState);

        const msgs: Record<ActionType, string> = {
          feed: `Fed ${activePet.name}!`,
          play: `Played with ${activePet.name}!`,
          clean: `Cleaned ${activePet.name}!`,
          sleep: `${activePet.name} is resting...`,
        };
        toast({
          title: msgs[action],
          description: `+${result.coinsEarned} coins  +${result.xpEarned} XP`,
          duration: 1800,
        });

        if (result.evolved) {
          const stageNames = ["Baby", "Kid", "Teen", "Adult"];
          const newStageName = stageNames[result.pet.stage] ?? "new stage";
          setEvolutionModal({ petName: result.pet.name, stageName: newStageName });
        }
        if (result.leveledUp) {
          toast({ title: `Level Up! Now Lv ${result.pet.level}`, duration: 2500 });
        }
        if (result.newAchievements.length > 0) {
          result.newAchievements.forEach((id) => {
            toast({
              title: "Achievement Unlocked!",
              description: id.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
              duration: 3000,
            });
          });
        }
      } else {
        toast({ title: result.reason ?? "On cooldown", duration: 1200 });
      }

      setTimeout(() => setActingAction(null), 800);
    },
    [activePet, state, toast]
  );

  const handleCreatePet = () => {
    const name = newPetName.trim() || PET_NAME_SUGGESTIONS[newPetSpecies][0];
    const pet = createPet(name, newPetSpecies, newPetColor);
    const newState: GameState = {
      ...state,
      pets: [...state.pets, pet],
      activePetId: state.activePetId ?? pet.id,
      tutorialDone: true,
    };
    saveState(newState);
    setState(newState);
    setScreen("game");
    toast({ title: `Welcome, ${name}!`, description: "Your new pet is ready to be cared for!", duration: 3000 });
  };

  const finishOnboard = () => {
    localStorage.setItem(ONBOARD_KEY, "1");
    setScreen("create");
  };

  const handleShare = () => {
    if (!activePet) return;
    const text = `My ${activePet.name} is Level ${activePet.level} on ToyPetMe! Come play the free virtual pet game!`;
    const url = "https://toypetme.replit.app";
    if (navigator.share) {
      navigator.share({ title: "ToyPetMe", text, url }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(`${text} ${url}`).then(() => {
        toast({ title: "Copied to clipboard!", description: "Share with your friends!" });
      });
    }
  };

  // ---- SCREENS ----

  if (screen === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-pink-50">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-400 to-pink-400 mx-auto animate-pulse" />
          <p className="text-lg font-bold text-primary" style={{ fontFamily: "Outfit, sans-serif" }}>ToyPetMe</p>
        </div>
      </div>
    );
  }

  if (screen === "onboard") {
    const { Icon, title, body, accent, iconColor, iconBg } = ONBOARD_SLIDES[slide];
    const isLast = slide === ONBOARD_SLIDES.length - 1;
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 p-4">
        <div className="max-w-sm w-full space-y-5">
          <div className={`rounded-2xl p-8 text-center space-y-5 ${accent} transition-all duration-300`}>
            <div className={`w-20 h-20 rounded-2xl ${iconBg} mx-auto flex items-center justify-center`}>
              <Icon size={44} className={iconColor} strokeWidth={1.5} />
            </div>
            <div className="space-y-2">
              <h2
                className="text-2xl font-black text-foreground"
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                {title}
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">{body}</p>
            </div>
          </div>

          {/* Dot progress */}
          <div className="flex justify-center gap-2">
            {ONBOARD_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                data-testid={`onboard-dot-${i}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === slide ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            {slide > 0 ? (
              <Button
                variant="outline"
                size="default"
                onClick={() => setSlide((s) => s - 1)}
                data-testid="button-onboard-prev"
              >
                Back
              </Button>
            ) : null}

            {!isLast ? (
              <>
                <Button
                  variant="ghost"
                  size="default"
                  className="flex-1"
                  onClick={finishOnboard}
                  data-testid="button-onboard-skip"
                >
                  Skip
                </Button>
                <Button
                  size="default"
                  className="flex-1"
                  onClick={() => setSlide((s) => s + 1)}
                  data-testid="button-onboard-next"
                >
                  Next
                </Button>
              </>
            ) : (
              <Button
                size="lg"
                className="flex-1 text-base font-bold"
                onClick={finishOnboard}
                data-testid="button-onboard-start"
              >
                Adopt Your Pet!
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (screen === "daily") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 p-4">
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-amber-100 mx-auto flex items-center justify-center">
            <Trophy size={44} className="text-amber-500" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
              Daily Bonus!
            </h1>
            <p className="text-muted-foreground mt-1">
              {state.dailyStreak} day streak — keep it up!
            </p>
          </div>
          <div className="text-5xl font-black text-amber-500">+{dailyBonus}</div>
          <p className="text-muted-foreground">coins added to your balance</p>
          <Button
            size="lg"
            className="w-full text-base font-bold"
            onClick={() => setScreen("game")}
            data-testid="button-claim-daily"
          >
            Collect &amp; Play!
          </Button>
        </div>
      </div>
    );
  }

  if (screen === "create") {
    const speciesData = PET_SPECIES.find((s) => s.id === newPetSpecies) ?? PET_SPECIES[0];
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 p-4">
        <div className="max-w-2xl mx-auto space-y-6 pt-8">
          <div className="text-center space-y-1">
            <h1 className="text-3xl font-black text-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
              Adopt Your Pet
            </h1>
            <p className="text-muted-foreground">Choose your companion and start your adventure!</p>
          </div>

          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-2">Choose species</p>
            <div className="grid grid-cols-5 gap-2">
              {PET_SPECIES.map((sp) => (
                <button
                  key={sp.id}
                  onClick={() => {
                    setNewPetSpecies(sp.id);
                    setNewPetColor(sp.colors[0].hex);
                    setNewPetName("");
                  }}
                  data-testid={`species-${sp.id}`}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                    newPetSpecies === sp.id
                      ? "border-primary bg-primary/5 scale-105"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <span className="text-xs font-semibold text-center leading-tight">{sp.name.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-2">Pick a color</p>
            <div className="flex gap-3 flex-wrap">
              {speciesData.colors.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setNewPetColor(c.hex)}
                  data-testid={`color-${c.id}`}
                  className={`w-9 h-9 rounded-full border-4 transition-all ${
                    newPetColor === c.hex ? "border-primary scale-110" : "border-transparent"
                  }`}
                  style={{ background: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-2">Name your pet</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={newPetName}
                onChange={(e) => setNewPetName(e.target.value)}
                placeholder={PET_NAME_SUGGESTIONS[newPetSpecies][0]}
                maxLength={20}
                data-testid="input-pet-name"
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button
                variant="outline"
                size="default"
                onClick={() => {
                  const names = PET_NAME_SUGGESTIONS[newPetSpecies];
                  setNewPetName(names[Math.floor(Math.random() * names.length)]);
                }}
                data-testid="button-random-name"
              >
                Random
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full flex-shrink-0" style={{ background: newPetColor }} />
                <div>
                  <p className="font-semibold">{speciesData.name}</p>
                  <p className="text-xs text-muted-foreground">{speciesData.description}</p>
                  <Badge variant="secondary" className="mt-1 text-xs">{speciesData.personality}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            size="lg"
            className="w-full text-base font-bold"
            onClick={handleCreatePet}
            data-testid="button-adopt-pet"
          >
            Adopt {newPetName.trim() || PET_NAME_SUGGESTIONS[newPetSpecies][0]}!
          </Button>
        </div>
      </div>
    );
  }

  // Main game screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 pb-40">
      <GameHeader />

      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        <AdSlot format="banner" className="mx-auto" />

        {state.pets.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {state.pets.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  const updated = { ...state, activePetId: p.id };
                  saveState(updated);
                  setState(updated);
                }}
                data-testid={`switch-pet-${p.id}`}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  state.activePetId === p.id || (!state.activePetId && p === state.pets[0])
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-muted-foreground"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        )}

        {activePet && (
          <div className="flex flex-col items-center py-4">
            <PetDisplay pet={activePet} isActing={actingAction} />
          </div>
        )}

        {/* XP bar + evolution guide */}
        {activePet && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-14">XP {activePet.xp}</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, (activePet.xp / (activePet.level * 50)) * 100)}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-14 text-right">{activePet.level * 50} XP</span>
            </div>

            {/* Collapsible evolution guide */}
            <button
              onClick={() => setStageOpen((o) => !o)}
              data-testid="button-stage-guide"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {stageOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              <span>Evolution guide</span>
            </button>

            {stageOpen && (
              <div className="grid grid-cols-4 gap-1.5" data-testid="stage-guide-grid">
                {STAGE_MILESTONES.map(({ stage, name, level }) => {
                  const isCurrent = activePet.stage === stage;
                  const isUnlocked = activePet.level >= level;
                  return (
                    <div
                      key={stage}
                      data-testid={`stage-${stage}`}
                      className={`flex flex-col items-center gap-0.5 p-2 rounded-lg border text-center transition-all ${
                        isCurrent
                          ? "border-primary bg-primary/8 text-primary"
                          : isUnlocked
                          ? "border-border bg-card text-muted-foreground"
                          : "border-dashed border-muted-foreground/30 text-muted-foreground/40"
                      }`}
                    >
                      <span className="text-xs font-bold">{name}</span>
                      <span className="text-[10px]">Lv {level}</span>
                      {isCurrent && (
                        <span className="text-[9px] font-bold uppercase tracking-wide text-primary">Now</span>
                      )}
                      {!isCurrent && isUnlocked && (
                        <span className="text-[9px] text-muted-foreground">Done</span>
                      )}
                      {!isUnlocked && (
                        <span className="text-[9px] text-muted-foreground/40">Locked</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activePet && <StatsPanel pet={activePet} />}

        {activePet && (
          <ActionButtons
            pet={activePet}
            onAction={handleAction}
            disabled={!!actingAction}
            showHints={state.totalActions < 4}
          />
        )}

        {/* Mid-game in-content ad — between actions and guide (high viewability) */}
        <InContentAd format="rectangle" />

        {/* ── Quick Start Guide ── always visible card */}
        <Card data-testid="quick-guide-card">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-sm font-black text-foreground">How to Play</p>
              <span className="text-[11px] text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-full">
                Free · No sign-up needed
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Feed", rule: "Restores Hunger · 5 min cooldown" },
                { label: "Play", rule: "Boosts Happiness · 3 min cooldown" },
                { label: "Clean", rule: "Cleans pet · 10 min cooldown" },
                { label: "Sleep", rule: "Recovers Energy · 15 min cooldown" },
              ].map(({ label, rule }) => (
                <div key={label} className="bg-muted/50 rounded-lg px-3 py-2">
                  <p className="text-xs font-black text-foreground">{label}</p>
                  <p className="text-[11px] text-muted-foreground">{rule}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Keep all 4 stats high to earn XP and coins. Level up to evolve through{" "}
              <span className="font-semibold text-foreground">Baby → Kid → Teen → Adult</span>.
              Log in daily to grow your streak and earn bonus coins!
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => setLocation("/shop")}
                data-testid="button-guide-premium"
              >
                <Crown size={12} className="text-amber-500" />
                Premium — £0.99 one-time
              </Button>
              <p className="text-[11px] text-muted-foreground">Bonus XP · exclusive cosmetics · gold badge</p>
            </div>
          </CardContent>
        </Card>

        <AdSlot format="rectangle" className="mx-auto" />

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="default"
            className="flex-1 gap-2"
            onClick={handleShare}
            data-testid="button-share"
          >
            <Share2 size={15} />
            Share
          </Button>
          <Button
            variant="outline"
            size="default"
            className="flex-1 gap-2"
            onClick={() => setLocation("/leaderboard")}
            data-testid="button-leaderboard"
          >
            <Trophy size={15} />
            Ranks
          </Button>
          {state.pets.length < 8 && (
            <Button
              variant="outline"
              size="default"
              className="flex-1 gap-2"
              onClick={() => setScreen("create")}
              data-testid="button-add-pet"
            >
              <Plus size={15} />
              New Pet
            </Button>
          )}
        </div>

        <div className="text-center py-2">
          <p className="text-xs text-muted-foreground">
            ToyPetMe — Free virtual pet game. No sign-up required.
          </p>
        </div>

        <Footer />
      </div>

      <BottomTabNav />

      {/* Evolution achieved overlay */}
      {evolutionModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          data-testid="evolution-modal"
        >
          <div className="relative max-w-xs w-full mx-4">
            {/* Burst glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-400 to-pink-400 opacity-30 blur-2xl scale-110" />
            <div className="relative bg-background rounded-2xl shadow-2xl p-7 flex flex-col items-center gap-4 text-center border border-primary/20">
              {/* Animated star burst */}
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #8B5CF6, #EC4899)",
                  animation: "petEvolveBurst 0.9s ease-in-out",
                }}
              >
                <Sparkles size={40} className="text-white" />
              </div>
              <div>
                <p
                  className="text-2xl font-black text-foreground"
                  style={{ fontFamily: "Outfit, sans-serif" }}
                >
                  Evolution!
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  <span className="font-semibold text-foreground">{evolutionModal.petName}</span> grew into a{" "}
                  <span
                    className="font-bold"
                    style={{ background: "linear-gradient(135deg,#8B5CF6,#EC4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                  >
                    {evolutionModal.stageName}
                  </span>
                  !
                </p>
              </div>
              <Button
                className="w-full"
                data-testid="button-evolution-continue"
                onClick={() => setEvolutionModal(null)}
              >
                Amazing!
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
