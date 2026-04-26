import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import GameHeader from "@/components/GameHeader";
import BottomTabNav from "@/components/BottomTabNav";
import AdSlot from "@/components/AdSlot";
import Footer from "@/components/Footer";
import PetDisplay from "@/components/PetDisplay";
import { loadState } from "@/lib/gameStorage";
import { Sparkles, ArrowLeft, Check } from "lucide-react";

const STORAGE_KEY = "toypetme_dressup_v1";

interface Accessories {
  hat: string;
  bg: string;
}

const HATS: { id: string; label: string; symbol: string; svgHat?: boolean }[] = [
  { id: "none",    label: "None",         symbol: "" },
  { id: "crown",   label: "Crown",        symbol: "👑" },
  { id: "tophat",  label: "Top Hat",      symbol: "🎩" },
  { id: "party",   label: "Party Hat",    symbol: "🎉" },
  { id: "wizard",  label: "Wizard",       symbol: "🧙" },
  { id: "cap",     label: "Cap",          symbol: "🧢" },
  { id: "halo",    label: "Halo",         symbol: "😇" },
  { id: "bow",     label: "Bow",          symbol: "🎀" },
];

const BACKGROUNDS: { id: string; label: string; gradient: string }[] = [
  { id: "default",  label: "Cozy",    gradient: "from-violet-100 to-pink-100" },
  { id: "meadow",   label: "Meadow",  gradient: "from-green-200 to-emerald-100" },
  { id: "space",    label: "Space",   gradient: "from-slate-800 to-indigo-900" },
  { id: "ocean",    label: "Ocean",   gradient: "from-sky-200 to-blue-300" },
  { id: "sunset",   label: "Sunset",  gradient: "from-orange-200 to-rose-300" },
  { id: "forest",   label: "Forest",  gradient: "from-green-800 to-teal-700" },
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
  const [, setLocation] = useLocation();
  const state = loadState();
  const pet = state.pets.find((p) => p.id === state.activePetId) ?? state.pets[0];

  const [acc, setAcc] = useState<Accessories>({ hat: "none", bg: "default" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (pet) setAcc(loadAccessories(pet.id));
  }, [pet?.id]);

  if (!pet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 pb-40">
        <GameHeader />
        <div className="max-w-2xl mx-auto px-4 pt-8 text-center">
          <p className="text-muted-foreground mb-4">You need a pet first!</p>
          <Button onClick={() => setLocation("/")} data-testid="btn-create-pet">
            Create a Pet
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 pb-40">
      <GameHeader />

      <div className="max-w-2xl mx-auto px-4 pt-4">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
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
          </div>
          <Button
            size="default"
            onClick={handleSave}
            data-testid="btn-save-dressup"
            className={saved ? "bg-green-500" : ""}
          >
            {saved ? (
              <>
                <Check size={14} className="mr-1" />
                Saved!
              </>
            ) : (
              "Save Look"
            )}
          </Button>
        </div>

        <AdSlot format="banner" className="mx-auto mb-4" />

        {/* Pet Preview */}
        <Card className="mb-4 overflow-hidden">
          <div className={`bg-gradient-to-br ${activeBg.gradient} p-6 flex flex-col items-center gap-2 relative`}>
            {/* Hat overlay */}
            {activeHat.id !== "none" && (
              <div className="text-4xl leading-none mb-1 select-none" style={{ lineHeight: 1 }}>
                {activeHat.symbol}
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
            <CardTitle className="text-base font-bold">Hats & Accessories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2">
              {HATS.map((hat) => (
                <button
                  key={hat.id}
                  onClick={() => updateAcc({ hat: hat.id })}
                  data-testid={`hat-option-${hat.id}`}
                  className={`flex flex-col items-center gap-1 p-2 rounded-md border transition-all ${
                    acc.hat === hat.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover-elevate"
                  }`}
                >
                  <span className="text-2xl leading-none" style={{ lineHeight: 1.2 }}>
                    {hat.symbol || "✗"}
                  </span>
                  <span className="text-[10px] font-semibold text-muted-foreground text-center leading-tight">
                    {hat.label}
                  </span>
                  {acc.hat === hat.id && (
                    <Check size={10} className="text-primary" />
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Background selection */}
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Scene Background</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {BACKGROUNDS.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => updateAcc({ bg: bg.id })}
                  data-testid={`bg-option-${bg.id}`}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-md border transition-all ${
                    acc.bg === bg.id
                      ? "border-primary"
                      : "border-border hover-elevate"
                  }`}
                >
                  <div className={`w-full h-8 rounded-sm bg-gradient-to-br ${bg.gradient}`} />
                  <span className="text-[10px] font-semibold text-muted-foreground">{bg.label}</span>
                  {acc.bg === bg.id && (
                    <Check size={10} className="text-primary" />
                  )}
                </button>
              ))}
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
