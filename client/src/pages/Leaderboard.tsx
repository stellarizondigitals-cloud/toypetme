import { useMemo } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import BottomTabNav from "@/components/BottomTabNav";
import GameHeader from "@/components/GameHeader";
import AdSlot, { InContentAd } from "@/components/AdSlot";
import Footer from "@/components/Footer";
import { loadState } from "@/lib/gameStorage";
import { ACHIEVEMENTS } from "@/lib/petData";
import {
  Trophy, Zap, Brain, ChefHat, Star, Flame, Medal, Bird,
  Target, LayoutGrid, Layers, Minus, Gamepad2, Play, Award,
} from "lucide-react";
import { usePageMeta } from "@/lib/usePageMeta";

// All 8 games — IDs must match MiniGamesHub GAMES registry
const GAMES = [
  { id: "tap",      name: "Tap Rush",      icon: Zap,        color: "text-orange-500",  bgColor: "bg-orange-100" },
  { id: "memory",   name: "Memory Match",  icon: Brain,      color: "text-violet-500",  bgColor: "bg-violet-100" },
  { id: "catch",    name: "Feed Frenzy",   icon: ChefHat,    color: "text-green-500",   bgColor: "bg-green-100"  },
  { id: "jump",     name: "Pet Jump",      icon: Bird,       color: "text-sky-500",     bgColor: "bg-sky-100"    },
  { id: "whack",    name: "Whack-a-Pet",   icon: Target,     color: "text-amber-600",   bgColor: "bg-amber-100"  },
  { id: "tiles",    name: "2048 Pets",     icon: LayoutGrid, color: "text-yellow-600",  bgColor: "bg-yellow-100" },
  { id: "snake",    name: "Snake Feast",   icon: Minus,      color: "text-emerald-600", bgColor: "bg-emerald-100"},
  { id: "breakout", name: "Brick Breaker", icon: Layers,     color: "text-red-500",     bgColor: "bg-red-100"    },
] as const;

// Bronze / Silver / Gold thresholds per game (tuned to realistic scores)
const RANK_THRESHOLDS: Record<string, { bronze: number; silver: number; gold: number }> = {
  tap:      { bronze: 10, silver: 30, gold: 60 },
  memory:   { bronze: 8,  silver: 20, gold: 40 },
  catch:    { bronze: 10, silver: 30, gold: 60 },
  jump:     { bronze: 3,  silver: 8,  gold: 15 },
  whack:    { bronze: 8,  silver: 20, gold: 40 },
  tiles:    { bronze: 64, silver: 256, gold: 1024 },
  snake:    { bronze: 5,  silver: 15, gold: 30 },
  breakout: { bronze: 10, silver: 25, gold: 50 },
};

type RankInfo = { label: string; icon: typeof Medal; iconClass: string; badgeClass: string };

function getRank(score: number, game: string): RankInfo | null {
  if (score === 0) return null;
  const t = RANK_THRESHOLDS[game];
  if (!t) return null;
  if (score >= t.gold)   return { label: "Gold",    icon: Trophy, iconClass: "text-amber-500",  badgeClass: "bg-amber-100 text-amber-700 border-amber-200"    };
  if (score >= t.silver) return { label: "Silver",  icon: Medal,  iconClass: "text-slate-400",  badgeClass: "bg-slate-100 text-slate-600 border-slate-200"    };
  if (score >= t.bronze) return { label: "Bronze",  icon: Award,  iconClass: "text-orange-600", badgeClass: "bg-orange-100 text-orange-700 border-orange-200" };
  return                         { label: "Beginner",icon: Star,   iconClass: "text-primary",    badgeClass: "bg-primary/10 text-primary border-primary/20"    };
}

export default function Leaderboard() {
  usePageMeta({
    title: "Rankings & High Scores",
    description:
      "See your ToyPetMe high scores for all 8 mini-games: Tap Rush, Memory Match, Feed Frenzy, Pet Jump, Whack-a-Pet, 2048 Pets, Snake Feast, and Brick Breaker. Track your pet's level, streak, and achievements.",
    canonicalPath: "/leaderboard",
  });

  const state = useMemo(() => loadState(), []);
  const activePet = state.pets.find((p) => p.id === state.activePetId) ?? state.pets[0];
  const unlockedCount = state.achievements.length;
  const totalCoins = state.coins;
  const gamesPlayed = state.gamesPlayed ?? 0;

  const playedCount = GAMES.filter((g) => (state.highScores[g.id] ?? 0) > 0).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 pb-40">
      <GameHeader />

      <div className="max-w-2xl mx-auto px-4 pt-4">
        <div className="mb-4">
          <h1
            className="text-2xl font-bold text-foreground"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            Rankings
          </h1>
          <p className="text-sm text-muted-foreground">
            Your personal bests across all 8 mini-games
          </p>
        </div>

        <AdSlot format="banner" className="mx-auto mb-4" />

        {/* Player summary card */}
        <Card className="mb-4 border-primary/20 bg-gradient-to-r from-violet-50 to-pink-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center text-white text-xl font-black flex-shrink-0">
                {activePet?.name[0] ?? "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-base truncate">
                  {activePet?.name ?? "No pet yet"}
                </p>
                <p className="text-xs text-muted-foreground mb-1">Your active pet</p>
                <div className="flex gap-2 flex-wrap">
                  {(activePet?.level ?? 0) > 0 && (
                    <Badge variant="secondary" data-testid="badge-level">
                      Lv {activePet!.level}
                    </Badge>
                  )}
                  <Badge variant="secondary" data-testid="badge-achievements">
                    {unlockedCount} / 40 achievements
                  </Badge>
                  <Badge variant="secondary" data-testid="badge-coins">
                    {totalCoins} coins
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Card>
            <CardContent className="p-3 text-center">
              <Gamepad2 size={20} className="text-primary mx-auto mb-1" />
              <p className="text-xl font-black text-primary" data-testid="stat-games-played">
                {gamesPlayed}
              </p>
              <p className="text-xs text-muted-foreground">Games played</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Trophy size={20} className="text-amber-500 mx-auto mb-1" />
              <p className="text-xl font-black text-amber-500" data-testid="stat-games-cleared">
                {playedCount} / {GAMES.length}
              </p>
              <p className="text-xs text-muted-foreground">Games cleared</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              {state.dailyStreak > 0 ? (
                <Flame size={20} className="text-orange-500 mx-auto mb-1" />
              ) : (
                <Star size={20} className="text-muted-foreground mx-auto mb-1" />
              )}
              <p
                className={`text-xl font-black ${state.dailyStreak > 0 ? "text-orange-500" : "text-muted-foreground"}`}
                data-testid="stat-streak"
              >
                {state.dailyStreak}
              </p>
              <p className="text-xs text-muted-foreground">Day streak</p>
            </CardContent>
          </Card>
        </div>

        <InContentAd format="rectangle" />

        {/* All 8 game score cards */}
        <section className="mb-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Mini-Game High Scores
          </h2>
          <div className="grid gap-3">
            {GAMES.map(({ id, name, icon: Icon, color, bgColor }) => {
              const best = state.highScores[id] ?? 0;
              const rank = getRank(best, id);
              const RankIcon = rank?.icon ?? Star;
              const played = best > 0;

              return (
                <Card key={id} data-testid={`score-card-${id}`}>
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={18} className={color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{name}</p>
                      {played && rank ? (
                        <div className="flex items-center gap-1 mt-0.5">
                          <RankIcon size={12} className={rank.iconClass} />
                          <span className={`text-xs font-medium ${rank.iconClass}`}>
                            {rank.label}
                          </span>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-0.5">Not played yet</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      {played ? (
                        <>
                          <p
                            className="text-xl font-black text-primary"
                            data-testid={`score-value-${id}`}
                          >
                            {best}
                          </p>
                          <p className="text-xs text-muted-foreground">best</p>
                        </>
                      ) : (
                        <Link href="/minigames">
                          <Button size="sm" variant="outline" className="text-xs gap-1">
                            <Play size={10} />
                            Play
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <InContentAd format="banner" />

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
                        <span className="text-xl flex-shrink-0">{def.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{def.name}</p>
                          <p className="text-xs text-muted-foreground">{def.description}</p>
                        </div>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {new Date(a.unlockedAt).toLocaleDateString()}
                        </span>
                      </CardContent>
                    </Card>
                  );
                })}
              <Link href="/achievements">
                <Button variant="outline" className="w-full text-sm mt-1" data-testid="btn-view-all-achievements">
                  View all {unlockedCount} achievements
                </Button>
              </Link>
            </div>
          )}
        </section>

        {/* Share CTA */}
        <Card className="mb-4 bg-muted/50">
          <CardContent className="p-4 text-center space-y-2">
            <Trophy size={28} className="text-amber-500 mx-auto" />
            <p className="font-semibold">Share Your Score!</p>
            <p className="text-sm text-muted-foreground">
              Challenge your friends to beat your records. ToyPetMe is 100% free to play!
            </p>
            <Link href="/minigames">
              <Button className="mt-1 gap-2" data-testid="btn-play-games">
                <Gamepad2 size={14} />
                Play Mini-Games
              </Button>
            </Link>
          </CardContent>
        </Card>

        <AdSlot format="rectangle" className="mx-auto mb-4" />
        <Footer />
      </div>

      <BottomTabNav />
    </div>
  );
}
