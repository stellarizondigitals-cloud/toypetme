import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import BottomTabNav from "@/components/BottomTabNav";
import GameHeader from "@/components/GameHeader";
import AdSlot from "@/components/AdSlot";
import { loadState, applyDecay, getHealth } from "@/lib/gameStorage";
import { PET_SPECIES, getStageName } from "@/lib/petData";
import { Zap, Heart, Utensils, Droplets, Crown } from "lucide-react";

export default function Collection() {
  const state = useMemo(() => loadState(), []);
  const ownedSpecies = new Set(state.pets.map((p) => p.species));

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 pb-20">
      <GameHeader />

      <div className="max-w-2xl mx-auto px-4 pt-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
              My Collection
            </h1>
            <p className="text-sm text-muted-foreground">
              {state.pets.length} pet{state.pets.length !== 1 ? "s" : ""} owned
            </p>
          </div>
          <Badge variant="secondary">{ownedSpecies.size}/5 species</Badge>
        </div>

        <AdSlot format="banner" className="mx-auto mb-4" />

        {/* Your pets */}
        {state.pets.length > 0 && (
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Your Pets</h2>
            <div className="grid gap-3">
              {state.pets.map((pet) => {
                const decayed = applyDecay(pet);
                const health = getHealth(decayed);
                const stageName = getStageName(pet.species as any, pet.stage);
                return (
                  <Card key={pet.id} data-testid={`pet-card-${pet.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Pet color circle */}
                        <div
                          className="w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-lg"
                          style={{ background: `linear-gradient(135deg, ${pet.color}, ${pet.color}99)` }}
                        >
                          {pet.name[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-foreground">{pet.name}</span>
                            {pet.stage === 3 && <Crown size={14} className="text-amber-500" />}
                            <Badge variant="secondary" className="text-xs">{stageName}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground capitalize">
                            {PET_SPECIES.find((s) => s.id === pet.species)?.name} · Lv {pet.level}
                          </p>
                          {/* Mini stat bars */}
                          <div className="grid grid-cols-4 gap-1 mt-2">
                            {[
                              { val: Math.round(decayed.hunger), color: "#F97316", icon: Utensils },
                              { val: Math.round(decayed.happiness), color: "#EC4899", icon: Heart },
                              { val: Math.round(decayed.energy), color: "#8B5CF6", icon: Zap },
                              { val: Math.round(decayed.cleanliness), color: "#3B82F6", icon: Droplets },
                            ].map(({ val, color, icon: Icon }, i) => (
                              <div key={i} className="flex flex-col items-center gap-0.5">
                                <Icon size={10} style={{ color }} />
                                <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full"
                                    style={{ width: `${val}%`, background: color }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div
                            className="text-lg font-black"
                            style={{
                              color: health > 60 ? "#22C55E" : health > 30 ? "#EAB308" : "#EF4444",
                            }}
                          >
                            {health}
                          </div>
                          <div className="text-xs text-muted-foreground">HP</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Species Compendium */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Species Guide
          </h2>
          <div className="grid gap-3">
            {PET_SPECIES.map((species) => {
              const owned = ownedSpecies.has(species.id);
              const ownedPet = state.pets.find((p) => p.species === species.id);
              return (
                <Card
                  key={species.id}
                  className={owned ? "border-primary/30" : "opacity-60"}
                  data-testid={`species-card-${species.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-12 h-12 rounded-full flex-shrink-0"
                        style={{
                          background: owned
                            ? `linear-gradient(135deg, ${species.colors[0].hex}, ${species.colors[1].hex})`
                            : "#E5E7EB",
                        }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold">{species.name}</span>
                          {owned && <Badge className="text-xs">Owned</Badge>}
                          {!owned && <Badge variant="outline" className="text-xs">Not yet</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground italic">{species.tagline}</p>
                        <p className="text-xs text-muted-foreground mt-1">{species.description}</p>
                        {owned && ownedPet && (
                          <p className="text-xs text-primary font-medium mt-1">
                            Your pet: {ownedPet.name} · {getStageName(species.id, ownedPet.stage)}
                          </p>
                        )}
                        <div className="flex gap-1 mt-2">
                          {species.colors.map((c) => (
                            <div
                              key={c.id}
                              className="w-4 h-4 rounded-full"
                              style={{ background: c.hex }}
                              title={c.name}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </div>

      <BottomTabNav />
    </div>
  );
}
