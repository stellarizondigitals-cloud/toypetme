import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BottomTabNav from "@/components/BottomTabNav";
import GameHeader from "@/components/GameHeader";
import AdSlot from "@/components/AdSlot";
import Footer from "@/components/Footer";
import { loadState } from "@/lib/gameStorage";
import { ACHIEVEMENTS } from "@/lib/petData";
import { Trophy, Zap, Brain, ChefHat, Star } from "lucide-react";

export default function Leaderboard() {
  const state = useMemo(() => loadState(), []);
  const activePet = state.pets.find((p) => p.id === state.activePetId) ?? state.pets[0];
  const highestLevel = activePet?.level ?? 0;
  const unlockedCount = state.achievements.length;
  const totalCoins = state.coins;

  const games = [
    { id: "tap", name: "Tap Rush", icon: Zap, color: "text-orange-500" },
    { id: "memory", name: "Memory Match", icon: Brain, color: "text-violet-500" },
    { id: "catch", name: "Feed Frenzy", icon: ChefHat, color: "text-green-500" },
  ];

  const getRank = (score: number, game: string) => {
    if (score === 0) return null;
    // Fun simulated global ranks
    const thresholds: Record<string, { bronze: number; silver: number; gold: number }> = {
      tap: { bronze: 15, silver: 35, gold: 60 },
      memory: { bronze: 20, silver: 50, gold: 80 },
      catch: { bronze: 20, silver: 50, gold: 80 },
    };
    const t = thresholds[game];
    if (!t) return null;
    if (score >= t.gold) return { label: "Gold", color: "text-amber-500", emoji: "🥇" };
    if (score >= t.silver) return { label: "Silver", color: "text-gray-400", emoji: "🥈" };
    if (score >= t.bronze) return { label: "Bronze", color: "text-orange-700", emoji: "🥉" };
    return { label: "Beginner", color: "text-muted-foreground", emoji: "🎮" };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 pb-40">
      <GameHeader />

      <div className="max-w-2xl mx-auto px-4 pt-4">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
            Rankings
          </h1>
          <p className="text-sm text-muted-foreground">Your progress and achievements</p>
        </div>

        <AdSlot format="banner" className="mx-auto mb-4" />

        {/* Player Card */}
        <Card className="mb-4 border-primary/30 bg-gradient-to-r from-violet-50 to-pink-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center text-white text-2xl font-black">
                {activePet?.name[0] ?? "?"}
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg">{activePet?.name ?? "No pet yet"}</p>
                <p className="text-sm text-muted-foreground">Your highest pet</p>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {highestLevel > 0 && (
                    <Badge variant="secondary">Lv {highestLevel}</Badge>
                  )}
                  <Badge variant="secondary">{unlockedCount} achievements</Badge>
                  <Badge variant="secondary">{totalCoins} coins</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Streak card */}
        {state.dailyStreak > 0 && (
          <Card className="mb-4">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-2xl flex-shrink-0">
                🔥
              </div>
              <div>
                <p className="font-bold">{state.dailyStreak} Day Streak!</p>
                <p className="text-sm text-muted-foreground">Login daily for bigger rewards</p>
              </div>
              <div className="ml-auto text-2xl font-black text-orange-500">{state.dailyStreak}</div>
            </CardContent>
          </Card>
        )}

        {/* Game Scores */}
        <section className="mb-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Mini Game Records
          </h2>
          <div className="grid gap-3">
            {games.map(({ id, name, icon: Icon, color }) => {
              const best = state.highScores[id] ?? 0;
              const rank = getRank(best, id);
              return (
                <Card key={id} data-testid={`score-card-${id}`}>
                  <CardContent className="flex items-center gap-3 p-4">
                    <Icon size={20} className={color} />
                    <div className="flex-1">
                      <p className="font-semibold">{name}</p>
                      {rank ? (
                        <p className="text-sm text-muted-foreground">Rank: {rank.emoji} {rank.label}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">Not played yet</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-primary">{best > 0 ? best : "—"}</p>
                      <p className="text-xs text-muted-foreground">best</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Recent achievements */}
        <section className="mb-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Recent Achievements
          </h2>
          {state.achievements.length === 0 ? (
            <Card>
              <CardContent className="p-4 text-center text-muted-foreground text-sm">
                No achievements yet — start caring for your pet!
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-2">
              {state.achievements
                .slice()
                .sort((a, b) => b.unlockedAt - a.unlockedAt)
                .slice(0, 5)
                .map((a) => {
                  const def = ACHIEVEMENTS.find((ac) => ac.id === a.id);
                  if (!def) return null;
                  return (
                    <Card key={a.id}>
                      <CardContent className="flex items-center gap-3 p-3">
                        <span className="text-xl">{def.icon}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{def.name}</p>
                          <p className="text-xs text-muted-foreground">{def.description}</p>
                        </div>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {new Date(a.unlockedAt).toLocaleDateString()}
                        </span>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </section>

        {/* Global note */}
        <Card className="mb-4 bg-muted/50">
          <CardContent className="p-4 text-center space-y-2">
            <Trophy size={28} className="text-amber-500 mx-auto" />
            <p className="font-semibold">Share Your Score!</p>
            <p className="text-sm text-muted-foreground">
              Challenge your friends to beat your records. ToyPetMe is 100% free to play!
            </p>
          </CardContent>
        </Card>

        <AdSlot format="rectangle" className="mx-auto mb-4" />
        <Footer />
      </div>

      <BottomTabNav />
    </div>
  );
}
