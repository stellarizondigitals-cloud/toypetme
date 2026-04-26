import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import GameHeader from "@/components/GameHeader";
import BottomTabNav from "@/components/BottomTabNav";
import AdSlot from "@/components/AdSlot";
import Footer from "@/components/Footer";
import PetDisplay from "@/components/PetDisplay";
import { loadState } from "@/lib/gameStorage";
import { Sparkles, ArrowLeft, Check, Lock } from "lucide-react";
import { usePageMeta } from "@/lib/usePageMeta";

const STORAGE_KEY = "toypetme_dressup_v1";

interface Accessories {
  hat: string;
  bg: string;
}

interface HatItem {
  id: string;
  label: string;
  color: string;
  initial: string;
  levelRequired: number;
}

interface BgItem {
  id: string;
  label: string;
  gradient: string;
  levelRequired: number;
}

const HATS: HatItem[] = [
  { id: "none",   label: "None",     color: "bg-muted",          initial: "—",  levelRequired: 1  },
  { id: "bow",    label: "Bow",      color: "bg-pink-400",       initial: "Bw", levelRequired: 1  },
  { id: "party",  label: "Party",    color: "bg-yellow-400",     initial: "Pa", levelRequired: 1  },
  { id: "cap",    label: "Cap",      color: "bg-teal-400",       initial: "Ca", levelRequired: 3  },
  { id: "crown",  label: "Crown",    color: "bg-amber-400",      initial: "Cr", levelRequired: 5  },
  { id: "tophat", label: "Top Hat",  color: "bg-zinc-800",       initial: "TH", levelRequired: 10 },
  { id: "wizard", label: "Wizard",   color: "bg-indigo-500",     initial: "Wz", levelRequired: 15 },
  { id: "halo",   label: "Halo",     color: "bg-sky-300",        initial: "Ha", levelRequired: 20 },
];

const BACKGROUNDS: BgItem[] = [
  { id: "default", label: "Cozy",    gradient: "from-violet-100 to-pink-100",   levelRequired: 1  },
  { id: "meadow",  label: "Meadow",  gradient: "from-green-200 to-emerald-100", levelRequired: 3  },
  { id: "ocean",   label: "Ocean",   gradient: "from-sky-200 to-blue-300",      levelRequired: 5  },
  { id: "sunset",  label: "Sunset",  gradient: "from-orange-200 to-rose-300",   levelRequired: 8  },
  { id: "forest",  label: "Forest",  gradient: "from-green-800 to-teal-700",    levelRequired: 12 },
  { id: "space",   label: "Space",   gradient: "from-slate-800 to-indigo-900",  levelRequired: 15 },
];

function loadAccessories(petId: string): Accessories {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { hat: "none", bg: "default" };
    const all = JSON.parse(raw) as Record<string, Accessories>;
    return all[petId] ?? { hat: "none", bg: "default" };
  } catch {
    return { hat: "none", bg: "default" };
  }
}

function saveAccessories(petId: string, acc: Accessories) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all: Record<string, Accessories> = raw ? JSON.parse(raw) : {};
    all[petId] = acc;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch { /* ignore */ }
}

export default function DressUp() {
  usePageMeta({
    title: "Dress Up Your Pet",
    description: "Customize your ToyPetMe virtual pet with hats, accessories, and backgrounds. Unlock new items as your pet levels up!",
    canonicalPath: "/dress-up",
  });
  const [, setLocation] = useLocation();
  const state = loadState();
  const pet = state.pets.find((p) => p.id === state.activePetId) ?? state.pets[0];
  const petLevel = pet?.level ?? 1;

  const [acc, setAcc] = useState<Accessories>({ hat: "none", bg: "default" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (pet) setAcc(loadAccessories(pet.id));
  }, [pet?.id]);

  if (!pet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 pb-40">
        <GameHeader />
        <div className="max-w-2xl mx-auto px-4 pt-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 mx-auto flex items-center justify-center">
            <Sparkles size={32} className="text-primary" strokeWidth={1.5} />
          </div>
          <p className="text-muted-foreground">Adopt a pet first to unlock Dress Up!</p>
          <Button onClick={() => setLocation("/")} data-testid="btn-create-pet">
            Adopt a Pet
          </Button>
        </div>
        <BottomTabNav />
      </div>
    );
  }

  const activeBg = BACKGROUNDS.find((b) => b.id === acc.bg) ?? BACKGROUNDS[0];
  const activeHat = HATS.find((h) => h.id === acc.hat) ?? HATS[0];

  const handleSave = () => {
    saveAccessories(pet.id, acc);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateAcc = (partial: Partial<Accessories>) => {
    setAcc((prev) => ({ ...prev, ...partial }));
    setSaved(false);
  };

  const lockedHats = HATS.filter((h) => h.levelRequired > petLevel).length;
  const lockedBgs = BACKGROUNDS.filter((b) => b.levelRequired > petLevel).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 pb-40">
      <GameHeader />

      <div className="max-w-2xl mx-auto px-4 pt-4">
        <div className="flex items-center gap-3 mb-4 flex-wrap gap-y-2">
          <Button
            variant="ghost"
            size="default"
            className="gap-2"
            onClick={() => setLocation("/")}
            data-testid="btn-back-dressup"
          >
            <ArrowLeft size={16} />
            Back
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-primary" />
              <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
                Dress Up {pet.name}
              </h1>
            </div>
            <p className="text-xs text-muted-foreground ml-7">
              Lv {petLevel} — {lockedHats + lockedBgs} items to unlock
            </p>
          </div>
          <Button
            size="default"
            onClick={handleSave}
            data-testid="btn-save-dressup"
            className={saved ? "bg-green-500 text-white" : ""}
          >
            {saved ? (
              <><Check size={14} className="mr-1.5" /> Saved!</>
            ) : (
              "Save Look"
            )}
          </Button>
        </div>

        <AdSlot format="banner" className="mx-auto mb-4" />

        {/* Pet Preview */}
        <Card className="mb-4 overflow-hidden">
          <div className={`bg-gradient-to-br ${activeBg.gradient} p-6 flex flex-col items-center gap-2 relative`}>
            {/* Hat overlay (colored block) */}
            {activeHat.id !== "none" && (
              <div
                className={`w-10 h-6 rounded-md ${activeHat.color} flex items-center justify-center mb-0.5`}
                title={activeHat.label}
              >
                <span className="text-[10px] font-bold text-white">{activeHat.label}</span>
              </div>
            )}
            <PetDisplay pet={pet} />
            <div className="absolute top-3 right-3 bg-background/60 backdrop-blur-sm rounded-full px-2.5 py-1">
              <span className="text-xs font-semibold text-foreground">{activeBg.label}</span>
            </div>
          </div>
        </Card>

        {/* Hat selection */}
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base font-bold">Hats &amp; Accessories</CardTitle>
              {lockedHats > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {lockedHats} locked
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2">
              {HATS.map((hat) => {
                const isLocked = hat.levelRequired > petLevel;
                const isSelected = acc.hat === hat.id;
                return (
                  <button
                    key={hat.id}
                    onClick={() => !isLocked && updateAcc({ hat: hat.id })}
                    disabled={isLocked}
                    data-testid={`hat-option-${hat.id}`}
                    title={isLocked ? `Unlock at Level ${hat.levelRequired}` : hat.label}
                    className={`relative flex flex-col items-center gap-1 p-2 rounded-md border transition-all ${
                      isLocked
                        ? "border-dashed border-muted-foreground/30 opacity-50 cursor-not-allowed"
                        : isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border hover-elevate"
                    }`}
                  >
                    {/* Hat color swatch */}
                    <div className={`w-8 h-6 rounded ${hat.color} flex items-center justify-center`}>
                      {isLocked
                        ? <Lock size={10} className="text-white/80" />
                        : <span className="text-[9px] font-bold text-white">{hat.initial}</span>
                      }
                    </div>
                    <span className="text-[9px] font-semibold text-muted-foreground text-center leading-tight">
                      {isLocked ? `Lv ${hat.levelRequired}` : hat.label}
                    </span>
                    {isSelected && !isLocked && (
                      <Check size={9} className="text-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Background selection */}
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base font-bold">Scene Background</CardTitle>
              {lockedBgs > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {lockedBgs} locked
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {BACKGROUNDS.map((bg) => {
                const isLocked = bg.levelRequired > petLevel;
                const isSelected = acc.bg === bg.id;
                return (
                  <button
                    key={bg.id}
                    onClick={() => !isLocked && updateAcc({ bg: bg.id })}
                    disabled={isLocked}
                    data-testid={`bg-option-${bg.id}`}
                    title={isLocked ? `Unlock at Level ${bg.levelRequired}` : bg.label}
                    className={`relative flex flex-col items-center gap-1.5 p-2 rounded-md border transition-all ${
                      isLocked
                        ? "border-dashed border-muted-foreground/30 opacity-50 cursor-not-allowed"
                        : isSelected
                        ? "border-primary"
                        : "border-border hover-elevate"
                    }`}
                  >
                    <div className={`w-full h-8 rounded-sm bg-gradient-to-br ${bg.gradient} relative overflow-hidden`}>
                      {isLocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <Lock size={12} className="text-white" />
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] font-semibold text-muted-foreground">
                      {isLocked ? `Lv ${bg.levelRequired}` : bg.label}
                    </span>
                    {isSelected && !isLocked && (
                      <Check size={9} className="text-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 mb-4">
          <AdSlot format="rectangle" className="mx-auto" />
        </div>

        <Footer />
      </div>

      <BottomTabNav />
    </div>
  );
}
