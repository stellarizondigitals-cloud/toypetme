import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import GameHeader from "@/components/GameHeader";
import BottomTabNav from "@/components/BottomTabNav";
import AdSlot, { InContentAd } from "@/components/AdSlot";
import Footer from "@/components/Footer";
import PetDisplay from "@/components/PetDisplay";
import type { DressUpState } from "@/components/PetDisplay";
import { loadState } from "@/lib/gameStorage";
import { Sparkles, ArrowLeft, Check, Lock } from "lucide-react";
import { usePageMeta } from "@/lib/usePageMeta";

const STORAGE_KEY = "toypetme_dressup_v1";
const DEFAULT_STATE: DressUpState = { hat: "none", outfit: "none", accessory: "none", bg: "default" };

interface HatItem    { id: string; label: string; color: string; initial: string; levelRequired: number }
interface OutfitItem { id: string; label: string; color: string; initial: string; levelRequired: number }
interface AccItem    { id: string; label: string; color: string; initial: string; levelRequired: number }
interface BgItem     { id: string; label: string; gradient: string; levelRequired: number }

const HATS: HatItem[] = [
  { id: "none",   label: "None",    color: "bg-muted",      initial: "—",  levelRequired: 1  },
  { id: "bow",    label: "Bow",     color: "bg-pink-400",   initial: "Bw", levelRequired: 1  },
  { id: "party",  label: "Party",   color: "bg-yellow-400", initial: "Pa", levelRequired: 1  },
  { id: "cap",    label: "Cap",     color: "bg-blue-400",   initial: "Ca", levelRequired: 3  },
  { id: "crown",  label: "Crown",   color: "bg-amber-400",  initial: "Cr", levelRequired: 5  },
  { id: "pirate", label: "Pirate",  color: "bg-stone-700",  initial: "Pi", levelRequired: 8  },
  { id: "tophat", label: "Top Hat", color: "bg-zinc-800",   initial: "TH", levelRequired: 10 },
  { id: "wizard", label: "Wizard",  color: "bg-indigo-500", initial: "Wz", levelRequired: 15 },
  { id: "halo",   label: "Halo",    color: "bg-sky-300",    initial: "Ha", levelRequired: 20 },
];

const OUTFITS: OutfitItem[] = [
  { id: "none",   label: "None",    color: "bg-muted",       initial: "—",  levelRequired: 1  },
  { id: "sailor", label: "Sailor",  color: "bg-blue-800",    initial: "Sa", levelRequired: 2  },
  { id: "flower", label: "Flower",  color: "bg-pink-300",    initial: "Fl", levelRequired: 4  },
  { id: "space",  label: "Space",   color: "bg-slate-400",   initial: "Sp", levelRequired: 7  },
  { id: "knight", label: "Knight",  color: "bg-gray-400",    initial: "Kn", levelRequired: 12 },
  { id: "witch",  label: "Witch",   color: "bg-purple-900",  initial: "Wt", levelRequired: 18 },
  { id: "ninja",  label: "Ninja",   color: "bg-gray-900",    initial: "Nj", levelRequired: 25 },
];

const ACCESSORIES: AccItem[] = [
  { id: "none",     label: "None",     color: "bg-muted",      initial: "—",  levelRequired: 1  },
  { id: "glasses",  label: "Glasses",  color: "bg-sky-500",    initial: "Gl", levelRequired: 2  },
  { id: "necklace", label: "Necklace", color: "bg-yellow-500", initial: "Nk", levelRequired: 6  },
  { id: "wand",     label: "Wand",     color: "bg-amber-600",  initial: "Wd", levelRequired: 11 },
  { id: "aura",     label: "Aura",     color: "bg-violet-500", initial: "Au", levelRequired: 16 },
];

const BACKGROUNDS: BgItem[] = [
  { id: "default", label: "Cozy",   gradient: "from-violet-100 to-pink-100",   levelRequired: 1  },
  { id: "meadow",  label: "Meadow", gradient: "from-green-200 to-emerald-100", levelRequired: 3  },
  { id: "ocean",   label: "Ocean",  gradient: "from-sky-200 to-blue-300",      levelRequired: 5  },
  { id: "sunset",  label: "Sunset", gradient: "from-orange-200 to-rose-300",   levelRequired: 8  },
  { id: "forest",  label: "Forest", gradient: "from-green-800 to-teal-700",    levelRequired: 12 },
  { id: "space",   label: "Space",  gradient: "from-slate-800 to-indigo-900",  levelRequired: 15 },
];

function loadDressUp(petId: string): DressUpState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const all = JSON.parse(raw) as Record<string, DressUpState>;
    return { ...DEFAULT_STATE, ...all[petId] };
  } catch { return DEFAULT_STATE; }
}

function saveDressUp(petId: string, state: DressUpState) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all: Record<string, DressUpState> = raw ? JSON.parse(raw) : {};
    all[petId] = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch { /* ignore */ }
}

type Category = "hats" | "outfits" | "accessories" | "backgrounds";

interface ItemButtonProps<T extends { id: string; label: string; color?: string; gradient?: string; initial?: string; levelRequired: number }> {
  item: T;
  isSelected: boolean;
  isLocked: boolean;
  onClick: () => void;
  testIdPrefix: string;
  isBackground?: boolean;
}

function ItemButton<T extends { id: string; label: string; color?: string; gradient?: string; initial?: string; levelRequired: number }>({
  item, isSelected, isLocked, onClick, testIdPrefix, isBackground = false,
}: ItemButtonProps<T>) {
  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      data-testid={`${testIdPrefix}-${item.id}`}
      title={isLocked ? `Unlock at Level ${item.levelRequired}` : item.label}
      className={`relative flex flex-col items-center gap-1 p-2 rounded-md border transition-all ${
        isLocked
          ? "border-dashed border-muted-foreground/30 opacity-50 cursor-not-allowed"
          : isSelected
          ? "border-primary bg-primary/10"
          : "border-border hover-elevate"
      }`}
    >
      {isBackground ? (
        <div className={`w-full h-8 rounded-sm bg-gradient-to-br ${item.gradient} relative overflow-hidden`}>
          {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Lock size={12} className="text-white" />
            </div>
          )}
        </div>
      ) : (
        <div className={`w-8 h-6 rounded ${item.color} flex items-center justify-center`}>
          {isLocked
            ? <Lock size={10} className="text-white/80" />
            : <span className="text-[9px] font-bold text-white">{item.initial}</span>
          }
        </div>
      )}
      <span className="text-[9px] font-semibold text-muted-foreground text-center leading-tight">
        {isLocked ? `Lv ${item.levelRequired}` : item.label}
      </span>
      {isSelected && !isLocked && <Check size={9} className="text-primary" />}
    </button>
  );
}

export default function DressUp() {
  usePageMeta({
    title: "Dress Up Your Pet",
    description: "Customize your ToyPetMe virtual pet with hats, outfits, accessories, and backgrounds. Unlock new items as your pet levels up!",
    canonicalPath: "/dress-up",
  });
  const [, setLocation] = useLocation();
  const state = loadState();
  const pet = state.pets.find((p) => p.id === state.activePetId) ?? state.pets[0];
  const petLevel = pet?.level ?? 1;

  const [dressUp, setDressUp] = useState<DressUpState>(DEFAULT_STATE);
  const [saved, setSaved] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category>("hats");

  useEffect(() => {
    if (pet) setDressUp(loadDressUp(pet.id));
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

  const activeBg = BACKGROUNDS.find((b) => b.id === dressUp.bg) ?? BACKGROUNDS[0];
  const totalLocked =
    HATS.filter(h => h.levelRequired > petLevel).length +
    OUTFITS.filter(o => o.levelRequired > petLevel).length +
    ACCESSORIES.filter(a => a.levelRequired > petLevel).length +
    BACKGROUNDS.filter(b => b.levelRequired > petLevel).length;

  const handleSave = () => {
    saveDressUp(pet.id, dressUp);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const update = (partial: Partial<DressUpState>) => {
    setDressUp((prev) => ({ ...prev, ...partial }));
    setSaved(false);
  };

  const TABS: { key: Category; label: string; count: number }[] = [
    { key: "hats",        label: "Hats",       count: HATS.length - 1 },
    { key: "outfits",     label: "Outfits",     count: OUTFITS.length - 1 },
    { key: "accessories", label: "Accessories", count: ACCESSORIES.length - 1 },
    { key: "backgrounds", label: "Scenes",      count: BACKGROUNDS.length },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 pb-40">
      <GameHeader />

      {/* Wide-screen: flex row with sidebar ad */}
      <div className="max-w-5xl mx-auto px-4 pt-4 lg:flex lg:gap-6">

        {/* Main content column */}
        <div className="flex-1 min-w-0">
          {/* Top banner ad */}
          <AdSlot format="banner" className="mx-auto mb-3" />

          {/* Header row */}
          <div className="flex items-center gap-3 mb-4 flex-wrap gap-y-2">
            <Button variant="ghost" size="default" className="gap-2" onClick={() => setLocation("/")} data-testid="btn-back-dressup">
              <ArrowLeft size={16} />Back
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-primary" />
                <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
                  Dress Up {pet.name}
                </h1>
              </div>
              <p className="text-xs text-muted-foreground ml-7">
                Lv {petLevel} — {totalLocked} items still to unlock
              </p>
            </div>
            <Button
              size="default"
              onClick={handleSave}
              data-testid="btn-save-dressup"
              className={saved ? "bg-green-500 text-white" : ""}
            >
              {saved ? (<><Check size={14} className="mr-1.5" />Saved!</>) : "Save Look"}
            </Button>
          </div>

          <AdSlot format="banner" className="mx-auto mb-4" />

          {/* Pet preview */}
          <Card className="mb-4 overflow-hidden">
            <div className={`bg-gradient-to-br ${activeBg.gradient} p-6 flex flex-col items-center gap-2`}>
              <PetDisplay pet={pet} dressUp={dressUp} />
            </div>
          </Card>

          {/* Category tabs */}
          <div className="flex gap-1 mb-3 flex-wrap gap-y-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveCategory(tab.key)}
                data-testid={`tab-${tab.key}`}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all ${
                  activeCategory === tab.key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover-elevate"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Hats grid */}
          {activeCategory === "hats" && (
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base font-bold">Hats</CardTitle>
                  <Badge variant="secondary" className="text-xs">{HATS.filter(h => h.levelRequired <= petLevel).length - 1} unlocked</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2">
                  {HATS.map((hat) => (
                    <ItemButton
                      key={hat.id}
                      item={hat}
                      isSelected={dressUp.hat === hat.id}
                      isLocked={hat.levelRequired > petLevel}
                      onClick={() => update({ hat: hat.id })}
                      testIdPrefix="hat-option"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Outfits grid */}
          {activeCategory === "outfits" && (
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base font-bold">Outfits</CardTitle>
                  <Badge variant="secondary" className="text-xs">{OUTFITS.filter(o => o.levelRequired <= petLevel).length - 1} unlocked</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2">
                  {OUTFITS.map((outfit) => (
                    <ItemButton
                      key={outfit.id}
                      item={outfit}
                      isSelected={dressUp.outfit === outfit.id}
                      isLocked={outfit.levelRequired > petLevel}
                      onClick={() => update({ outfit: outfit.id })}
                      testIdPrefix="outfit-option"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Accessories grid */}
          {activeCategory === "accessories" && (
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base font-bold">Accessories</CardTitle>
                  <Badge variant="secondary" className="text-xs">{ACCESSORIES.filter(a => a.levelRequired <= petLevel).length - 1} unlocked</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2">
                  {ACCESSORIES.map((acc) => (
                    <ItemButton
                      key={acc.id}
                      item={acc}
                      isSelected={dressUp.accessory === acc.id}
                      isLocked={acc.levelRequired > petLevel}
                      onClick={() => update({ accessory: acc.id })}
                      testIdPrefix="acc-option"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Backgrounds grid */}
          {activeCategory === "backgrounds" && (
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base font-bold">Scene Background</CardTitle>
                  <Badge variant="secondary" className="text-xs">{BACKGROUNDS.filter(b => b.levelRequired <= petLevel).length} unlocked</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {BACKGROUNDS.map((bg) => (
                    <ItemButton
                      key={bg.id}
                      item={bg}
                      isSelected={dressUp.bg === bg.id}
                      isLocked={bg.levelRequired > petLevel}
                      onClick={() => update({ bg: bg.id })}
                      testIdPrefix="bg-option"
                      isBackground
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mt-4 mb-4">
            <AdSlot format="rectangle" className="mx-auto" />
          </div>

          <Footer />
        </div>

        {/* Sidebar ad — visible only on wide screens */}
        <aside className="hidden lg:flex flex-col gap-4 w-[160px] shrink-0 pt-16">
          <div className="sticky top-4 flex flex-col gap-4">
            <AdSlot format="rectangle" />
            <AdSlot format="rectangle" />
          </div>
        </aside>

      </div>

      <BottomTabNav />
    </div>
  );
}
