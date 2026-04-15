import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BottomTabNav from "@/components/BottomTabNav";
import GameHeader from "@/components/GameHeader";
import AdSlot from "@/components/AdSlot";
import Footer from "@/components/Footer";
import { loadState, saveState, updateHighScore } from "@/lib/gameStorage";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Zap, Brain, ChefHat, ArrowLeft } from "lucide-react";

type ActiveGame = null | "tap" | "memory" | "catch";

// ---- TAP RUSH GAME ----
function TapRushGame({ onComplete }: { onComplete: (score: number) => void }) {
  const [phase, setPhase] = useState<"ready" | "playing" | "done">("ready");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = () => {
    setScore(0);
    setTimeLeft(10);
    setPhase("playing");
  };

  useEffect(() => {
    if (phase !== "playing") return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setPhase("done");
          clearInterval(intervalRef.current!);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [phase]);

  useEffect(() => {
    if (phase === "done") onComplete(score);
  }, [phase, score, onComplete]);

  const tap = () => {
    if (phase !== "playing") return;
    setScore((s) => s + 1);
    if (navigator.vibrate) navigator.vibrate(10);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <div className="text-center">
        <h2 className="text-2xl font-black" style={{ fontFamily: "Outfit" }}>Tap Rush</h2>
        <p className="text-muted-foreground text-sm">Tap as fast as you can in 10 seconds!</p>
      </div>

      {phase === "ready" && (
        <Button size="lg" className="text-lg font-bold px-10" onClick={start} data-testid="btn-tap-start">
          Start!
        </Button>
      )}

      {phase === "playing" && (
        <>
          <div className="flex justify-between w-full max-w-xs">
            <div className="text-center">
              <p className="text-4xl font-black text-primary">{score}</p>
              <p className="text-xs text-muted-foreground">Taps</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black text-orange-500">{timeLeft}s</p>
              <p className="text-xs text-muted-foreground">Time</p>
            </div>
          </div>
          <button
            onPointerDown={tap}
            data-testid="btn-tap-button"
            className="w-48 h-48 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 text-white text-2xl font-black shadow-xl active:scale-95 transition-transform select-none touch-none"
          >
            TAP!
          </button>
        </>
      )}

      {phase === "done" && (
        <div className="text-center space-y-4">
          <p className="text-5xl font-black text-primary">{score}</p>
          <p className="text-muted-foreground">taps!</p>
          <Button onClick={start} data-testid="btn-tap-retry">Play Again</Button>
        </div>
      )}
    </div>
  );
}

// ---- MEMORY MATCH GAME ----
const CARD_SYMBOLS = ["🐱", "🐶", "🐲", "🐰", "🦋", "🌟", "💎", "🍎"];

interface MemCard {
  id: number;
  symbol: string;
  flipped: boolean;
  matched: boolean;
}

function MemoryMatchGame({ onComplete }: { onComplete: (score: number) => void }) {
  const [cards, setCards] = useState<MemCard[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matched, setMatched] = useState(0);
  const [phase, setPhase] = useState<"ready" | "playing" | "done">("ready");
  const [score, setScore] = useState(0);

  const initGame = () => {
    const symbols = [...CARD_SYMBOLS, ...CARD_SYMBOLS];
    const shuffled = symbols
      .map((symbol, i) => ({ id: i, symbol, flipped: false, matched: false }))
      .sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlipped([]);
    setMoves(0);
    setMatched(0);
    setPhase("playing");
  };

  const flip = (id: number) => {
    if (phase !== "playing") return;
    const card = cards.find((c) => c.id === id);
    if (!card || card.flipped || card.matched || flipped.length >= 2) return;

    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, flipped: true } : c)));

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = newFlipped.map((fid) => cards.find((c) => c.id === fid)!);
      if (a.symbol === b.symbol) {
        // Match!
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) => (newFlipped.includes(c.id) ? { ...c, matched: true } : c))
          );
          setFlipped([]);
          const newMatched = matched + 1;
          setMatched(newMatched);
          if (newMatched === CARD_SYMBOLS.length) {
            const finalScore = Math.max(10, 100 - moves * 3);
            setScore(finalScore);
            setPhase("done");
            onComplete(finalScore);
          }
        }, 300);
      } else {
        // No match
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              newFlipped.includes(c.id) && !c.matched ? { ...c, flipped: false } : c
            )
          );
          setFlipped([]);
        }, 800);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="text-center">
        <h2 className="text-2xl font-black" style={{ fontFamily: "Outfit" }}>Memory Match</h2>
        <p className="text-muted-foreground text-sm">Find all matching pairs!</p>
      </div>

      {phase === "ready" && (
        <Button size="lg" className="font-bold" onClick={initGame} data-testid="btn-memory-start">
          Start Game!
        </Button>
      )}

      {(phase === "playing" || phase === "done") && (
        <>
          <div className="flex gap-6 text-center">
            <div>
              <p className="text-2xl font-black text-primary">{matched}</p>
              <p className="text-xs text-muted-foreground">Pairs</p>
            </div>
            <div>
              <p className="text-2xl font-black">{moves}</p>
              <p className="text-xs text-muted-foreground">Moves</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 w-full max-w-xs">
            {cards.map((card) => (
              <button
                key={card.id}
                onClick={() => flip(card.id)}
                data-testid={`card-${card.id}`}
                className={`aspect-square rounded-lg text-xl font-bold transition-all duration-200 ${
                  card.matched
                    ? "bg-green-100 text-green-600 scale-95"
                    : card.flipped
                    ? "bg-violet-100 text-foreground"
                    : "bg-card border border-border hover:border-primary/50 text-muted-foreground/20"
                }`}
              >
                {card.flipped || card.matched ? card.symbol : "?"}
              </button>
            ))}
          </div>

          {phase === "done" && (
            <div className="text-center space-y-3">
              <p className="font-bold text-xl text-primary">Score: {score}!</p>
              <Button onClick={initGame} data-testid="btn-memory-retry">Play Again</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ---- FEED FRENZY GAME ----
const FOOD_ITEMS = ["🍖", "🐟", "🥕", "🍎", "🦴", "🧁"];
const POISON_ITEMS = ["💀", "🍄"];

interface FallingItem {
  id: number;
  x: number;
  y: number;
  symbol: string;
  isPoison: boolean;
  speed: number;
}

function FeedFrenzyGame({ onComplete }: { onComplete: (score: number) => void }) {
  const [phase, setPhase] = useState<"ready" | "playing" | "done">("ready");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [items, setItems] = useState<FallingItem[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const nextId = useRef(0);
  const gameRef = useRef({ score: 0, lives: 3 });

  const spawnItem = useCallback(() => {
    const isPoison = Math.random() < 0.2;
    const symbol = isPoison
      ? POISON_ITEMS[Math.floor(Math.random() * POISON_ITEMS.length)]
      : FOOD_ITEMS[Math.floor(Math.random() * FOOD_ITEMS.length)];
    setItems((prev) => [
      ...prev,
      {
        id: nextId.current++,
        x: 5 + Math.random() * 80,
        y: 0,
        symbol,
        isPoison,
        speed: 0.5 + Math.random() * 1,
      },
    ]);
  }, []);

  const catchItem = (id: number, isPoison: boolean) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (isPoison) {
      setLives((l) => {
        const newL = Math.max(0, l - 1);
        gameRef.current.lives = newL;
        if (newL === 0) setPhase("done");
        return newL;
      });
    } else {
      setScore((s) => {
        const newS = s + 5;
        gameRef.current.score = newS;
        return newS;
      });
    }
    if (navigator.vibrate) navigator.vibrate(isPoison ? [50, 30, 50] : 15);
  };

  useEffect(() => {
    if (phase !== "playing") return;
    const spawnInterval = setInterval(spawnItem, 800);
    const fallInterval = setInterval(() => {
      setItems((prev) => {
        const updated = prev
          .map((i) => ({ ...i, y: i.y + i.speed * 3 }))
          .filter((i) => {
            if (i.y >= 95) {
              if (!i.isPoison) {
                // Missed food
                setLives((l) => {
                  const newL = Math.max(0, l - 1);
                  gameRef.current.lives = newL;
                  if (newL === 0) setPhase("done");
                  return newL;
                });
              }
              return false;
            }
            return true;
          });
        return updated;
      });
    }, 50);
    const timeInterval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setPhase("done");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      clearInterval(spawnInterval);
      clearInterval(fallInterval);
      clearInterval(timeInterval);
    };
  }, [phase, spawnItem]);

  useEffect(() => {
    if (phase === "done") onComplete(score);
  }, [phase, score, onComplete]);

  const start = () => {
    setScore(0);
    setLives(3);
    setItems([]);
    setTimeLeft(30);
    gameRef.current = { score: 0, lives: 3 };
    setPhase("playing");
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 w-full">
      <div className="text-center">
        <h2 className="text-2xl font-black" style={{ fontFamily: "Outfit" }}>Feed Frenzy</h2>
        <p className="text-muted-foreground text-sm">Catch food, avoid poison! 30 seconds.</p>
      </div>

      {phase === "ready" && (
        <Button size="lg" className="font-bold" onClick={start} data-testid="btn-catch-start">
          Start!
        </Button>
      )}

      {phase === "playing" && (
        <>
          <div className="flex gap-6 text-center">
            <div><p className="text-2xl font-black text-primary">{score}</p><p className="text-xs text-muted-foreground">Score</p></div>
            <div><p className="text-2xl font-black text-orange-500">{timeLeft}s</p><p className="text-xs text-muted-foreground">Time</p></div>
            <div><p className="text-2xl font-black text-red-500">{"❤️".repeat(lives)}</p><p className="text-xs text-muted-foreground">Lives</p></div>
          </div>

          <div
            className="relative w-full max-w-xs bg-gradient-to-b from-sky-100 to-green-100 rounded-xl overflow-hidden border border-border"
            style={{ height: 280 }}
            data-testid="catch-arena"
          >
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => catchItem(item.id, item.isPoison)}
                className="absolute text-2xl leading-none select-none touch-none transition-none"
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
                data-testid={`falling-item-${item.id}`}
              >
                {item.symbol}
              </button>
            ))}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-green-200 rounded-b-xl flex items-center justify-center">
              <p className="text-xs text-green-700 font-medium">Catch here!</p>
            </div>
          </div>
        </>
      )}

      {phase === "done" && (
        <div className="text-center space-y-4">
          <p className="text-5xl font-black text-primary">{score}</p>
          <p className="text-muted-foreground">Final Score</p>
          <Button onClick={start} data-testid="btn-catch-retry">Play Again</Button>
        </div>
      )}
    </div>
  );
}

// ---- MAIN HUB PAGE ----
const GAMES = [
  { id: "tap" as ActiveGame, name: "Tap Rush", desc: "Tap as fast as possible!", icon: Zap, color: "from-orange-400 to-yellow-400", textColor: "text-orange-600" },
  { id: "memory" as ActiveGame, name: "Memory Match", desc: "Find all matching pairs", icon: Brain, color: "from-violet-400 to-pink-400", textColor: "text-violet-600" },
  { id: "catch" as ActiveGame, name: "Feed Frenzy", desc: "Catch food, avoid poison!", icon: ChefHat, color: "from-green-400 to-teal-400", textColor: "text-green-600" },
];

export default function MiniGamesHub() {
  const [activeGame, setActiveGame] = useState<ActiveGame>(null);
  const [lastScores, setLastScores] = useState<Record<string, number>>(() => {
    const s = loadState();
    return s.highScores;
  });
  const { toast } = useToast();

  const handleComplete = useCallback(
    (game: string, score: number) => {
      const state = loadState();
      const newState = updateHighScore(state, game, score);
      saveState(newState);
      setLastScores(newState.highScores);

      const prev = state.highScores[game] ?? 0;
      if (score > prev) {
        toast({
          title: `New High Score! ${score}`,
          description: `Beat your previous best of ${prev}`,
          duration: 3000,
        });
      } else {
        toast({ title: `Score: ${score}`, description: `Best: ${state.highScores[game] ?? score}`, duration: 2000 });
      }
    },
    [toast]
  );

  if (activeGame) {
    const gameInfo = GAMES.find((g) => g.id === activeGame)!;
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 pb-40">
        <GameHeader />
        <div className="max-w-2xl mx-auto px-4 pt-4">
          <Button
            variant="ghost"
            size="default"
            className="gap-2 mb-4"
            onClick={() => setActiveGame(null)}
            data-testid="btn-back-games"
          >
            <ArrowLeft size={16} />
            Back to Games
          </Button>

          {/* Ad above active game */}
          <AdSlot format="banner" className="mx-auto mb-4" />

          <Card>
            <CardContent className="p-2">
              {activeGame === "tap" && (
                <TapRushGame onComplete={(s) => handleComplete("tap", s)} />
              )}
              {activeGame === "memory" && (
                <MemoryMatchGame onComplete={(s) => handleComplete("memory", s)} />
              )}
              {activeGame === "catch" && (
                <FeedFrenzyGame onComplete={(s) => handleComplete("catch", s)} />
              )}
            </CardContent>
          </Card>

          <AdSlot format="rectangle" className="mx-auto mt-4" />
          <Footer />
        </div>
        <BottomTabNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 pb-40">
      <GameHeader />

      <div className="max-w-2xl mx-auto px-4 pt-4">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
            Mini Games
          </h1>
          <p className="text-sm text-muted-foreground">Play games, earn coins, set records!</p>
        </div>

        <AdSlot format="banner" className="mx-auto mb-4" />

        <div className="grid gap-4">
          {GAMES.map(({ id, name, desc, icon: Icon, color, textColor }) => {
            const best = lastScores[id!] ?? 0;
            return (
              <Card key={id} className="overflow-hidden hover-elevate" data-testid={`game-card-${id}`}>
                <CardContent className="p-0">
                  <div className={`h-2 bg-gradient-to-r ${color}`} />
                  <div className="p-4 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={22} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-foreground">{name}</p>
                      <p className="text-sm text-muted-foreground">{desc}</p>
                      {best > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <Trophy size={11} className="text-amber-500" />
                          <span className="text-xs text-amber-600 font-semibold">Best: {best}</span>
                        </div>
                      )}
                    </div>
                    <Button
                      size="default"
                      onClick={() => setActiveGame(id)}
                      data-testid={`btn-play-${id}`}
                    >
                      Play
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-4">
          <AdSlot format="rectangle" className="mx-auto" />
        </div>

        <Footer />
      </div>

      <BottomTabNav />
    </div>
  );
}
