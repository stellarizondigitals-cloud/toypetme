import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BottomTabNav from "@/components/BottomTabNav";
import GameHeader from "@/components/GameHeader";
import AdSlot, { InContentAd } from "@/components/AdSlot";
import Footer from "@/components/Footer";
import { loadState, saveState, updateHighScore } from "@/lib/gameStorage";
import { useToast } from "@/hooks/use-toast";
import { usePageMeta } from "@/lib/usePageMeta";
import {
  Trophy, Zap, Brain, ChefHat, ArrowLeft, ArrowUp, ArrowDown,
  ArrowRight, Target, LayoutGrid, Layers, Bird, Minus
} from "lucide-react";

type GameId = "tap" | "memory" | "catch" | "jump" | "whack" | "tiles" | "snake" | "breakout";
type ActiveGame = null | GameId;

// ─── COIN REWARD HELPER ──────────────────────────────────────────────────────
function coinsForGame(game: string, score: number): number {
  const calc: Record<string, (s: number) => number> = {
    tap:      s => Math.floor(s / 4) + 2,
    memory:   s => Math.floor(s / 8) + 3,
    catch:    s => Math.floor(s / 4) + 2,
    jump:     s => s * 4 + 2,
    whack:    s => Math.floor(s / 6) + 2,
    tiles:    s => Math.floor(s / 16) + 3,
    snake:    s => Math.floor(s / 4) + 2,
    breakout: s => Math.floor(s / 6) + 3,
  };
  return Math.min(40, calc[game]?.(score) ?? 2);
}

// ─── TAP RUSH ───────────────────────────────────────────────────────────────
function TapRushGame({ onComplete }: { onComplete: (score: number) => void }) {
  const [phase, setPhase] = useState<"ready" | "playing" | "done">("ready");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [combo, setCombo] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const comboRef = useRef(0);
  const lastTapRef = useRef(0);

  const start = () => { setScore(0); setTimeLeft(10); setCombo(0); comboRef.current = 0; setPhase("playing"); };

  useEffect(() => {
    if (phase !== "playing") return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { setPhase("done"); clearInterval(intervalRef.current!); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [phase]);

  useEffect(() => { if (phase === "done") onComplete(score); }, [phase, score, onComplete]);

  const tap = () => {
    if (phase !== "playing") return;
    const now = Date.now();
    const isCombo = now - lastTapRef.current < 400;
    lastTapRef.current = now;
    if (isCombo) {
      comboRef.current = Math.min(comboRef.current + 1, 5);
    } else {
      comboRef.current = 1;
    }
    setCombo(comboRef.current);
    const pts = comboRef.current >= 3 ? 2 : 1;
    setScore((s) => s + pts);
    if (navigator.vibrate) navigator.vibrate(8);
  };

  const comboColor = combo >= 5 ? "text-red-500" : combo >= 3 ? "text-orange-500" : "text-primary";

  return (
    <div className="flex flex-col items-center gap-5 p-4">
      <div className="text-center">
        <h2 className="text-2xl font-black" style={{ fontFamily: "Outfit" }}>Tap Rush</h2>
        <p className="text-muted-foreground text-sm">Tap fast! Combo ×2 for 3+ rapid taps</p>
      </div>
      {phase === "ready" && (
        <Button size="lg" className="text-lg font-bold px-10" onClick={start} data-testid="btn-tap-start">Start!</Button>
      )}
      {phase === "playing" && (
        <>
          <div className="flex justify-between w-full max-w-xs">
            <div className="text-center">
              <p className="text-4xl font-black text-primary">{score}</p>
              <p className="text-xs text-muted-foreground">Score</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-black ${comboColor}`}>{combo >= 2 ? `×${combo}` : ""}</p>
              <p className="text-xs text-muted-foreground">Combo</p>
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

// ─── MEMORY MATCH ────────────────────────────────────────────────────────────
const CARD_SYMBOLS = ["🐱", "🐶", "🐲", "🐰", "🦋", "🌟", "💎", "🍎"];
interface MemCard { id: number; symbol: string; flipped: boolean; matched: boolean; }

function MemoryMatchGame({ onComplete }: { onComplete: (score: number) => void }) {
  const [cards, setCards] = useState<MemCard[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matched, setMatched] = useState(0);
  const [phase, setPhase] = useState<"ready" | "playing" | "done">("ready");
  const [score, setScore] = useState(0);

  const initGame = () => {
    const symbols = [...CARD_SYMBOLS, ...CARD_SYMBOLS];
    const shuffled = symbols.map((symbol, i) => ({ id: i, symbol, flipped: false, matched: false })).sort(() => Math.random() - 0.5);
    setCards(shuffled); setFlipped([]); setMoves(0); setMatched(0); setPhase("playing");
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
        setTimeout(() => {
          setCards((prev) => prev.map((c) => (newFlipped.includes(c.id) ? { ...c, matched: true } : c)));
          setFlipped([]);
          const newMatched = matched + 1;
          setMatched(newMatched);
          if (newMatched === CARD_SYMBOLS.length) {
            const finalScore = Math.max(10, 100 - moves * 3);
            setScore(finalScore); setPhase("done"); onComplete(finalScore);
          }
        }, 300);
      } else {
        setTimeout(() => {
          setCards((prev) => prev.map((c) => (newFlipped.includes(c.id) && !c.matched ? { ...c, flipped: false } : c)));
          setFlipped([]);
        }, 800);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="text-center">
        <h2 className="text-2xl font-black" style={{ fontFamily: "Outfit" }}>Memory Match</h2>
        <p className="text-muted-foreground text-sm">Find all matching pairs with fewest moves!</p>
      </div>
      {phase === "ready" && <Button size="lg" className="font-bold" onClick={initGame} data-testid="btn-memory-start">Start Game!</Button>}
      {(phase === "playing" || phase === "done") && (
        <>
          <div className="flex gap-6 text-center">
            <div><p className="text-2xl font-black text-primary">{matched}</p><p className="text-xs text-muted-foreground">Pairs</p></div>
            <div><p className="text-2xl font-black">{moves}</p><p className="text-xs text-muted-foreground">Moves</p></div>
          </div>
          <div className="grid grid-cols-4 gap-2 w-full max-w-xs">
            {cards.map((card) => (
              <button key={card.id} onClick={() => flip(card.id)} data-testid={`card-${card.id}`}
                className={`aspect-square rounded-lg text-xl font-bold transition-all duration-200 ${card.matched ? "bg-green-100 text-green-600 scale-95" : card.flipped ? "bg-violet-100 text-foreground" : "bg-card border border-border hover:border-primary/50 text-muted-foreground/20"}`}>
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

// ─── FEED FRENZY ─────────────────────────────────────────────────────────────
const FOOD_ITEMS   = ["🍖", "🐟", "🥕", "🍎", "🦴", "🧁", "🍇", "🌽"];
const POISON_ITEMS = ["💀", "🍄", "⚗️"];
interface FallingItem { id: number; x: number; y: number; symbol: string; isPoison: boolean; speed: number; }
const GAME_H = 260, BASKET_W = 68, BASKET_H = 30, ITEM_SIZE = 36;

function FeedFrenzyGame({ onComplete }: { onComplete: (score: number) => void }) {
  const [phase, setPhase] = useState<"ready" | "playing" | "done">("ready");
  const [displayScore, setDisplayScore] = useState(0);
  const [displayLives, setDisplayLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(30);
  const [displayItems, setDisplayItems] = useState<FallingItem[]>([]);
  const [basketX, setBasketX] = useState(116);
  const containerRef = useRef<HTMLDivElement>(null);
  const basketXRef = useRef(116);
  const gameRef = useRef({ score: 0, lives: 3, active: false });
  const itemsRef = useRef<FallingItem[]>([]);
  const nextId = useRef(0);
  const getContainerW = () => containerRef.current?.getBoundingClientRect().width ?? 300;

  const start = () => {
    const cw = getContainerW();
    const initX = Math.max(0, cw / 2 - BASKET_W / 2);
    setBasketX(initX); basketXRef.current = initX;
    setDisplayScore(0); setDisplayLives(3); setTimeLeft(30);
    setDisplayItems([]); itemsRef.current = [];
    gameRef.current = { score: 0, lives: 3, active: true };
    setPhase("playing");
  };

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - BASKET_W / 2;
    const clamped = Math.max(0, Math.min(rect.width - BASKET_W, x));
    basketXRef.current = clamped; setBasketX(clamped);
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    const spawnInterval = setInterval(() => {
      if (!gameRef.current.active) return;
      const cw = getContainerW();
      const isPoison = Math.random() < 0.22;
      const symbol = isPoison ? POISON_ITEMS[Math.floor(Math.random() * POISON_ITEMS.length)] : FOOD_ITEMS[Math.floor(Math.random() * FOOD_ITEMS.length)];
      itemsRef.current = [...itemsRef.current, { id: nextId.current++, x: Math.max(0, Math.random() * (cw - ITEM_SIZE)), y: -ITEM_SIZE, symbol, isPoison, speed: 4 + Math.random() * 3.5 }];
    }, 750);

    const fallInterval = setInterval(() => {
      if (!gameRef.current.active) return;
      const basketLeft = basketXRef.current;
      const basketTop = GAME_H - BASKET_H - 6;
      let scoreInc = 0, livesLoss = 0;
      const nextItems: FallingItem[] = [];
      for (const item of itemsRef.current.map((i) => ({ ...i, y: i.y + i.speed }))) {
        const itemCenterX = item.x + ITEM_SIZE / 2;
        const itemBottom = item.y + ITEM_SIZE;
        if (itemBottom >= basketTop) {
          const inBasket = itemCenterX >= basketLeft && itemCenterX <= basketLeft + BASKET_W;
          if (inBasket && itemBottom <= GAME_H + ITEM_SIZE) {
            if (item.isPoison) livesLoss++;
            else scoreInc += 5;
            if (navigator.vibrate) navigator.vibrate(item.isPoison ? [30, 15, 30] : 12);
          } else if (itemBottom > GAME_H) {
            if (!item.isPoison) livesLoss++;
          } else { nextItems.push(item); }
        } else { nextItems.push(item); }
      }
      itemsRef.current = nextItems; setDisplayItems([...nextItems]);
      if (scoreInc > 0 || livesLoss > 0) {
        gameRef.current.score += scoreInc;
        gameRef.current.lives = Math.max(0, gameRef.current.lives - livesLoss);
        setDisplayScore(gameRef.current.score); setDisplayLives(gameRef.current.lives);
        if (gameRef.current.lives <= 0) { gameRef.current.active = false; setPhase("done"); }
      }
    }, 50);

    const timeInterval = setInterval(() => {
      setTimeLeft((t) => { if (t <= 1) { gameRef.current.active = false; setPhase("done"); return 0; } return t - 1; });
    }, 1000);

    return () => { clearInterval(spawnInterval); clearInterval(fallInterval); clearInterval(timeInterval); };
  }, [phase]);

  useEffect(() => { if (phase === "done") onComplete(gameRef.current.score); }, [phase, onComplete]);

  return (
    <div className="flex flex-col items-center gap-4 p-4 w-full">
      <div className="text-center">
        <h2 className="text-2xl font-black" style={{ fontFamily: "Outfit" }}>Feed Frenzy</h2>
        <p className="text-muted-foreground text-sm">Move the basket to catch food — avoid poison!</p>
      </div>
      {phase === "ready" && (
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-md bg-muted/60 px-4 py-3 text-center max-w-xs">
            <p className="text-sm font-medium">Drag to move the basket. Catch food, avoid poison!</p>
          </div>
          <Button size="lg" className="font-bold px-10" onClick={start} data-testid="btn-catch-start">Start!</Button>
        </div>
      )}
      {phase === "playing" && (
        <>
          <div className="flex gap-6 text-center">
            <div><p className="text-2xl font-black text-primary">{displayScore}</p><p className="text-xs text-muted-foreground">Score</p></div>
            <div><p className="text-2xl font-black text-orange-500">{timeLeft}s</p><p className="text-xs text-muted-foreground">Time</p></div>
            <div className="flex flex-col items-center gap-1">
              <div className="flex gap-1">{Array.from({ length: 3 }, (_, i) => <div key={i} className={`w-4 h-4 rounded-full transition-colors ${i < displayLives ? "bg-red-500" : "bg-muted"}`} />)}</div>
              <p className="text-xs text-muted-foreground">Lives</p>
            </div>
          </div>
          <div ref={containerRef} className="relative w-full max-w-xs bg-gradient-to-b from-sky-100 via-sky-50 to-green-50 rounded-xl border border-border touch-none" style={{ height: GAME_H, cursor: "none" }} onPointerMove={handlePointerMove} data-testid="catch-arena">
            {displayItems.map((item) => (
              <div key={item.id} className="absolute flex items-center justify-center text-3xl pointer-events-none select-none" style={{ left: item.x, top: item.y, width: ITEM_SIZE, height: ITEM_SIZE }}>{item.symbol}</div>
            ))}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-green-300/60" />
            <div className="absolute flex items-center justify-center rounded-md border-2 border-amber-600 bg-amber-100 font-bold text-xs text-amber-800" style={{ left: basketX, bottom: 6, width: BASKET_W, height: BASKET_H }} data-testid="basket">🧺</div>
          </div>
        </>
      )}
      {phase === "done" && (
        <div className="text-center space-y-4">
          <p className="text-5xl font-black text-primary">{displayScore}</p>
          <p className="text-muted-foreground">Final Score</p>
          <Button onClick={start} data-testid="btn-catch-retry">Play Again</Button>
        </div>
      )}
    </div>
  );
}

// ─── PET JUMP (Flappy Bird inspired) ─────────────────────────────────────────
const PJ_W = 290, PJ_H = 370;
const PJ_BIRD_X = 65, PJ_BIRD_R = 15;
const PJ_GRAVITY = 0.38, PJ_JUMP_V = -7.8;
const PJ_PIPE_W = 50, PJ_PIPE_GAP = 138, PJ_PIPE_SPEED = 2.4;
const PJ_SPAWN = 92;

function PetJumpGame({ onComplete }: { onComplete: (score: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<"ready" | "playing" | "dead">("ready");
  const [displayScore, setDisplayScore] = useState(0);
  const gRef = useRef({ bird: { y: 170, vy: 0 }, pipes: [] as { x: number; gap: number }[], score: 0, frame: 0, active: false });

  const jump = useCallback(() => {
    if (gRef.current.active) { gRef.current.bird.vy = PJ_JUMP_V; if (navigator.vibrate) navigator.vibrate(12); }
  }, []);

  const startGame = useCallback(() => {
    const g = gRef.current;
    g.bird = { y: 160, vy: 0 }; g.pipes = []; g.score = 0; g.frame = 0; g.active = true;
    setDisplayScore(0); setPhase("playing");
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let rafId: number;

    const draw = () => {
      const g = gRef.current;
      if (!g.active) return;
      g.frame++;

      // Physics
      g.bird.vy += PJ_GRAVITY;
      g.bird.y += g.bird.vy;

      // Spawn pipes
      if (g.frame % PJ_SPAWN === 0) {
        g.pipes.push({ x: PJ_W + 10, gap: 70 + Math.random() * (PJ_H - 200) });
      }
      g.pipes = g.pipes.map(p => ({ ...p, x: p.x - PJ_PIPE_SPEED })).filter(p => p.x > -PJ_PIPE_W);

      // Score
      for (const p of g.pipes) {
        if (Math.abs(p.x + PJ_PIPE_W / 2 - PJ_BIRD_X) < PJ_PIPE_SPEED + 1) {
          g.score++; setDisplayScore(g.score);
          if (navigator.vibrate) navigator.vibrate(6);
        }
      }

      // Collisions: floor / ceiling
      if (g.bird.y + PJ_BIRD_R > PJ_H - 25 || g.bird.y - PJ_BIRD_R < 0) {
        g.active = false; setPhase("dead"); return;
      }

      // Collisions: pipes
      for (const p of g.pipes) {
        if (PJ_BIRD_X + PJ_BIRD_R > p.x + 4 && PJ_BIRD_X - PJ_BIRD_R < p.x + PJ_PIPE_W - 4) {
          if (g.bird.y - PJ_BIRD_R < p.gap || g.bird.y + PJ_BIRD_R > p.gap + PJ_PIPE_GAP) {
            g.active = false; setPhase("dead"); return;
          }
        }
      }

      // ── Render ──
      // Sky
      const sky = ctx.createLinearGradient(0, 0, 0, PJ_H);
      sky.addColorStop(0, "#87CEEB"); sky.addColorStop(0.75, "#C8EAF9"); sky.addColorStop(1, "#98D477");
      ctx.fillStyle = sky; ctx.fillRect(0, 0, PJ_W, PJ_H);

      // Ground
      ctx.fillStyle = "#4CAF50"; ctx.fillRect(0, PJ_H - 25, PJ_W, 25);
      ctx.fillStyle = "#388E3C"; ctx.fillRect(0, PJ_H - 25, PJ_W, 4);

      // Pipes
      for (const p of g.pipes) {
        // Top
        ctx.fillStyle = "#33691E"; ctx.fillRect(p.x, 0, PJ_PIPE_W, p.gap);
        ctx.fillStyle = "#558B2F"; ctx.fillRect(p.x - 5, p.gap - 22, PJ_PIPE_W + 10, 22);
        // Bottom
        ctx.fillStyle = "#33691E"; ctx.fillRect(p.x, p.gap + PJ_PIPE_GAP, PJ_PIPE_W, PJ_H - p.gap - PJ_PIPE_GAP - 25);
        ctx.fillStyle = "#558B2F"; ctx.fillRect(p.x - 5, p.gap + PJ_PIPE_GAP, PJ_PIPE_W + 10, 22);
      }

      // Bird
      const tilt = Math.max(-Math.PI / 5, Math.min(Math.PI / 3, g.bird.vy * 0.065));
      ctx.save();
      ctx.translate(PJ_BIRD_X, g.bird.y);
      ctx.rotate(tilt);
      ctx.font = "30px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("🐱", 0, 0);
      ctx.restore();

      // Score HUD
      ctx.font = "bold 26px sans-serif"; ctx.textAlign = "center";
      ctx.strokeStyle = "rgba(0,0,0,0.4)"; ctx.lineWidth = 3;
      ctx.strokeText(String(g.score), PJ_W / 2, 44);
      ctx.fillStyle = "#fff"; ctx.fillText(String(g.score), PJ_W / 2, 44);

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [phase]);

  useEffect(() => { if (phase === "dead") onComplete(gRef.current.score); }, [phase, onComplete]);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="text-center">
        <h2 className="text-2xl font-black" style={{ fontFamily: "Outfit" }}>Pet Jump</h2>
        <p className="text-muted-foreground text-sm">Tap to flap through the pipes!</p>
      </div>
      {phase === "ready" && (
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">Your pet falls with gravity — tap the screen to flap!</p>
          <Button size="lg" className="font-bold px-10" onClick={startGame} data-testid="btn-jump-start">Let's Fly!</Button>
        </div>
      )}
      <canvas
        ref={canvasRef} width={PJ_W} height={PJ_H}
        className={`rounded-xl border border-border touch-none ${phase === "ready" ? "hidden" : "block"}`}
        style={{ maxWidth: "100%", cursor: "pointer" }}
        onPointerDown={phase === "playing" ? jump : undefined}
        data-testid="jump-canvas"
      />
      {phase === "dead" && (
        <div className="text-center space-y-3">
          <p className="text-4xl font-black text-primary">{displayScore}</p>
          <p className="text-muted-foreground text-sm">pipes passed</p>
          <Button onClick={startGame} data-testid="btn-jump-retry">Try Again</Button>
        </div>
      )}
    </div>
  );
}

// ─── WHACK-A-PET (Whack-a-Mole inspired) ────────────────────────────────────
const WAP_PETS = ["🐱", "🐶", "🐲", "🐰", "🦊"];
const WAP_HOLES = 9;

function WhackAPetGame({ onComplete }: { onComplete: (score: number) => void }) {
  const [phase, setPhase] = useState<"ready" | "playing" | "done">("ready");
  const [holes, setHoles] = useState<(string | null)[]>(Array(WAP_HOLES).fill(null));
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [miss, setMiss] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeRef = useRef(false);
  const holesRef = useRef<(string | null)[]>(Array(WAP_HOLES).fill(null));
  const scoreRef = useRef(0);
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAll = () => { timeoutRefs.current.forEach(clearTimeout); timeoutRefs.current = []; };

  const spawnPet = useCallback(() => {
    if (!activeRef.current) return;
    const emptyIdx: number[] = [];
    holesRef.current.forEach((h, i) => { if (!h) emptyIdx.push(i); });
    if (emptyIdx.length === 0) return;
    const idx = emptyIdx[Math.floor(Math.random() * emptyIdx.length)];
    const pet = WAP_PETS[Math.floor(Math.random() * WAP_PETS.length)];
    holesRef.current = [...holesRef.current];
    holesRef.current[idx] = pet;
    setHoles([...holesRef.current]);

    const hideMs = 900 + Math.random() * 500;
    const t = setTimeout(() => {
      if (!activeRef.current) return;
      holesRef.current = [...holesRef.current];
      holesRef.current[idx] = null;
      setHoles([...holesRef.current]);
    }, hideMs);
    timeoutRefs.current.push(t);

    const nextSpawn = 600 + Math.random() * 400;
    const t2 = setTimeout(spawnPet, nextSpawn);
    timeoutRefs.current.push(t2);
  }, []);

  const startGame = useCallback(() => {
    scoreRef.current = 0; activeRef.current = true;
    holesRef.current = Array(WAP_HOLES).fill(null);
    setScore(0); setMiss(0); setTimeLeft(30); setHoles(Array(WAP_HOLES).fill(null)); setPhase("playing");
    const t = setTimeout(spawnPet, 400);
    timeoutRefs.current.push(t);
  }, [spawnPet]);

  useEffect(() => {
    if (phase !== "playing") return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { activeRef.current = false; clearAll(); setPhase("done"); clearInterval(timerRef.current!); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => { clearInterval(timerRef.current!); clearAll(); };
  }, [phase]);

  useEffect(() => { if (phase === "done") onComplete(scoreRef.current); }, [phase, onComplete]);

  const whack = (idx: number) => {
    if (phase !== "playing" || !holesRef.current[idx]) { setMiss(m => m + 1); return; }
    if (navigator.vibrate) navigator.vibrate(20);
    scoreRef.current += 10; setScore(scoreRef.current);
    holesRef.current = [...holesRef.current]; holesRef.current[idx] = null;
    setHoles([...holesRef.current]);
  };

  return (
    <div className="flex flex-col items-center gap-5 p-4">
      <div className="text-center">
        <h2 className="text-2xl font-black" style={{ fontFamily: "Outfit" }}>Whack-a-Pet</h2>
        <p className="text-muted-foreground text-sm">Tap the pets before they hide!</p>
      </div>
      {phase === "ready" && (
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">Pets pop out of holes — tap them fast to score!</p>
          <Button size="lg" className="font-bold px-10" onClick={startGame} data-testid="btn-whack-start">Start!</Button>
        </div>
      )}
      {phase === "playing" && (
        <>
          <div className="flex gap-6 text-center">
            <div><p className="text-3xl font-black text-primary">{score}</p><p className="text-xs text-muted-foreground">Score</p></div>
            <div><p className="text-3xl font-black text-orange-500">{timeLeft}s</p><p className="text-xs text-muted-foreground">Time</p></div>
          </div>
          <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
            {holes.map((pet, idx) => (
              <button
                key={idx}
                onPointerDown={() => whack(idx)}
                data-testid={`hole-${idx}`}
                className="relative flex items-end justify-center overflow-hidden rounded-xl bg-amber-950/20 border-2 border-amber-800/30 touch-none select-none"
                style={{ height: 80 }}
              >
                <div className="absolute bottom-0 left-0 right-0 h-6 rounded-b-xl bg-amber-800/40" />
                <div className={`text-4xl transition-transform duration-150 mb-1 relative z-10 ${pet ? "translate-y-0 scale-110" : "translate-y-full scale-75"}`}
                  style={{ transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)" }}>
                  {pet ?? ""}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
      {phase === "done" && (
        <div className="text-center space-y-4">
          <p className="text-5xl font-black text-primary">{score}</p>
          <p className="text-muted-foreground">pets whacked!</p>
          <Button onClick={startGame} data-testid="btn-whack-retry">Play Again</Button>
        </div>
      )}
    </div>
  );
}

// ─── 2048 PETS ───────────────────────────────────────────────────────────────
type Grid2048 = number[][];

const TILE_STYLE: Record<number, { bg: string; fg: string; size: string }> = {
  0:    { bg: "#cdc1b4", fg: "transparent", size: "text-xl" },
  2:    { bg: "#eee4da", fg: "#776e65", size: "text-xl" },
  4:    { bg: "#ede0c8", fg: "#776e65", size: "text-xl" },
  8:    { bg: "#f2b179", fg: "#f9f6f2", size: "text-xl" },
  16:   { bg: "#f59563", fg: "#f9f6f2", size: "text-lg" },
  32:   { bg: "#f67c5f", fg: "#f9f6f2", size: "text-lg" },
  64:   { bg: "#f65e3b", fg: "#f9f6f2", size: "text-lg" },
  128:  { bg: "#edcf72", fg: "#f9f6f2", size: "text-base" },
  256:  { bg: "#edcc61", fg: "#f9f6f2", size: "text-base" },
  512:  { bg: "#edc850", fg: "#f9f6f2", size: "text-base" },
  1024: { bg: "#edc53f", fg: "#f9f6f2", size: "text-sm" },
  2048: { bg: "#edc22e", fg: "#f9f6f2", size: "text-sm" },
};

function getTileStyle(n: number) {
  return TILE_STYLE[n] ?? { bg: "#3c3a32", fg: "#f9f6f2", size: "text-xs" };
}

function slideRow(row: number[]): [number[], number] {
  const filtered = row.filter(x => x !== 0);
  let score = 0;
  for (let i = 0; i < filtered.length - 1; i++) {
    if (filtered[i] === filtered[i + 1]) {
      filtered[i] *= 2; score += filtered[i]; filtered.splice(i + 1, 1);
    }
  }
  while (filtered.length < 4) filtered.push(0);
  return [filtered, score];
}

function transpose(g: Grid2048): Grid2048 { return [0,1,2,3].map(r => [0,1,2,3].map(c => g[c][r])); }

function moveGrid(grid: Grid2048, dir: "left" | "right" | "up" | "down"): [Grid2048, number, boolean] {
  let work = grid.map(r => [...r]);
  if (dir === "right") work = work.map(r => [...r].reverse());
  else if (dir === "up") work = transpose(work);
  else if (dir === "down") { work = transpose(work); work = work.map(r => [...r].reverse()); }

  let score = 0, moved = false;
  work = work.map(row => {
    const orig = row.join(",");
    const [nr, s] = slideRow(row);
    score += s;
    if (nr.join(",") !== orig) moved = true;
    return nr;
  });

  if (dir === "right") work = work.map(r => [...r].reverse());
  else if (dir === "up") work = transpose(work);
  else if (dir === "down") { work = work.map(r => [...r].reverse()); work = transpose(work); }
  return [work, score, moved];
}

function addTile(grid: Grid2048): Grid2048 {
  const empty: [number, number][] = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) if (grid[r][c] === 0) empty.push([r, c]);
  if (!empty.length) return grid;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  const ng = grid.map(row => [...row]);
  ng[r][c] = Math.random() < 0.88 ? 2 : 4;
  return ng;
}

function initGrid(): Grid2048 {
  let g: Grid2048 = Array(4).fill(null).map(() => Array(4).fill(0));
  g = addTile(g); g = addTile(g); return g;
}

function isOver(grid: Grid2048): boolean {
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
    if (grid[r][c] === 0) return false;
    if (c < 3 && grid[r][c] === grid[r][c + 1]) return false;
    if (r < 3 && grid[r][c] === grid[r + 1][c]) return false;
  }
  return true;
}

function Game2048({ onComplete }: { onComplete: (score: number) => void }) {
  const [phase, setPhase] = useState<"ready" | "playing" | "done">("ready");
  const [grid, setGrid] = useState<Grid2048>(() => initGrid());
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const scoreRef = useRef(0);

  const startGame = () => {
    const g = initGrid(); setGrid(g); scoreRef.current = 0; setScore(0); setPhase("playing");
  };

  const handleMove = useCallback((dir: "left" | "right" | "up" | "down") => {
    if (phase !== "playing") return;
    setGrid(prev => {
      const [ng, s, moved] = moveGrid(prev, dir);
      if (!moved) return prev;
      scoreRef.current += s;
      setScore(scoreRef.current);
      setBest(b => Math.max(b, scoreRef.current));
      const final = addTile(ng);
      if (isOver(final)) { setPhase("done"); onComplete(scoreRef.current); }
      return final;
    });
    if (navigator.vibrate) navigator.vibrate(6);
  }, [phase, onComplete]);

  useEffect(() => {
    if (phase !== "playing") return;
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, "left"|"right"|"up"|"down"> = { ArrowLeft:"left", ArrowRight:"right", ArrowUp:"up", ArrowDown:"down" };
      if (map[e.key]) { e.preventDefault(); handleMove(map[e.key]); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, handleMove]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) < 25 && Math.abs(dy) < 25) return;
    if (Math.abs(dx) > Math.abs(dy)) handleMove(dx > 0 ? "right" : "left");
    else handleMove(dy > 0 ? "down" : "up");
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="text-center">
        <h2 className="text-2xl font-black" style={{ fontFamily: "Outfit" }}>2048 Pets</h2>
        <p className="text-muted-foreground text-sm">Swipe or use arrow keys to merge tiles!</p>
      </div>
      {phase === "ready" && (
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">Swipe tiles to merge matching numbers. Reach 2048!</p>
          <Button size="lg" className="font-bold px-10" onClick={startGame} data-testid="btn-2048-start">Play!</Button>
        </div>
      )}
      {(phase === "playing" || phase === "done") && (
        <>
          <div className="flex gap-6 text-center">
            <div><p className="text-2xl font-black text-primary">{score}</p><p className="text-xs text-muted-foreground">Score</p></div>
            <div><p className="text-2xl font-black text-amber-500">{best}</p><p className="text-xs text-muted-foreground">Best</p></div>
          </div>
          <div
            className="rounded-xl p-2 touch-none select-none"
            style={{ background: "#bbada0", width: 260 }}
            onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
            data-testid="grid-2048"
          >
            <div className="grid grid-cols-4 gap-1.5">
              {grid.map((row, r) => row.map((val, c) => {
                const s = getTileStyle(val);
                return (
                  <div key={`${r}-${c}`}
                    className={`flex items-center justify-center rounded-md font-black transition-all duration-100 ${s.size}`}
                    style={{ background: s.bg, color: s.fg, width: 56, height: 56 }}
                    data-testid={`tile-${r}-${c}`}
                  >
                    {val !== 0 ? val : ""}
                  </div>
                );
              }))}
            </div>
          </div>
          {phase === "playing" && (
            <div className="grid grid-cols-3 gap-2 w-32">
              <div />
              <Button size="icon" variant="outline" onPointerDown={() => handleMove("up")} data-testid="btn-up"><ArrowUp size={16} /></Button>
              <div />
              <Button size="icon" variant="outline" onPointerDown={() => handleMove("left")} data-testid="btn-left"><ArrowLeft size={16} /></Button>
              <Button size="icon" variant="outline" onPointerDown={() => handleMove("down")} data-testid="btn-down"><ArrowDown size={16} /></Button>
              <Button size="icon" variant="outline" onPointerDown={() => handleMove("right")} data-testid="btn-right"><ArrowRight size={16} /></Button>
            </div>
          )}
          {phase === "done" && (
            <div className="text-center space-y-3">
              <p className="font-bold text-xl text-primary">Game Over! Score: {score}</p>
              <Button onClick={startGame} data-testid="btn-2048-retry">Play Again</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── SNAKE FEAST ─────────────────────────────────────────────────────────────
const SN_COLS = 14, SN_ROWS = 14, SN_CELL = 20;
const SN_W = SN_COLS * SN_CELL, SN_H = SN_ROWS * SN_CELL;
type Pos = { x: number; y: number };

function SnakeFeastGame({ onComplete }: { onComplete: (score: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<"ready" | "playing" | "done">("ready");
  const [displayScore, setDisplayScore] = useState(0);
  const gRef = useRef({
    snake: [{ x: 7, y: 7 }, { x: 6, y: 7 }, { x: 5, y: 7 }] as Pos[],
    dir: { x: 1, y: 0 }, nextDir: { x: 1, y: 0 },
    food: { x: 10, y: 5 } as Pos,
    score: 0, active: false,
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const spawnFood = (snake: Pos[]): Pos => {
    let pos: Pos;
    do { pos = { x: Math.floor(Math.random() * SN_COLS), y: Math.floor(Math.random() * SN_ROWS) }; }
    while (snake.some(s => s.x === pos.x && s.y === pos.y));
    return pos;
  };

  const startGame = useCallback(() => {
    const g = gRef.current;
    g.snake = [{ x: 7, y: 7 }, { x: 6, y: 7 }, { x: 5, y: 7 }];
    g.dir = { x: 1, y: 0 }; g.nextDir = { x: 1, y: 0 };
    g.food = spawnFood(g.snake); g.score = 0; g.active = true;
    setDisplayScore(0); setPhase("playing");
  }, []);

  const changeDir = useCallback((dx: number, dy: number) => {
    const g = gRef.current;
    if (dx !== 0 && g.dir.x !== 0) return; // prevent reverse on same axis
    if (dy !== 0 && g.dir.y !== 0) return;
    g.nextDir = { x: dx, y: dy };
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const render = () => {
      const g = gRef.current;
      ctx.clearRect(0, 0, SN_W, SN_H);

      // Background grid
      ctx.fillStyle = "#1a2e1a";
      ctx.fillRect(0, 0, SN_W, SN_H);
      ctx.strokeStyle = "#243a24";
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= SN_COLS; x++) { ctx.beginPath(); ctx.moveTo(x * SN_CELL, 0); ctx.lineTo(x * SN_CELL, SN_H); ctx.stroke(); }
      for (let y = 0; y <= SN_ROWS; y++) { ctx.beginPath(); ctx.moveTo(0, y * SN_CELL); ctx.lineTo(SN_W, y * SN_CELL); ctx.stroke(); }

      // Food
      ctx.font = `${SN_CELL}px serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("🍎", g.food.x * SN_CELL + SN_CELL / 2, g.food.y * SN_CELL + SN_CELL / 2);

      // Snake
      g.snake.forEach((seg, i) => {
        const alpha = i === 0 ? 1 : Math.max(0.4, 1 - i * 0.03);
        ctx.fillStyle = i === 0 ? `rgba(100,220,80,${alpha})` : `rgba(60,180,50,${alpha})`;
        ctx.beginPath();
        ctx.roundRect(seg.x * SN_CELL + 1, seg.y * SN_CELL + 1, SN_CELL - 2, SN_CELL - 2, 4);
        ctx.fill();
        if (i === 0) {
          ctx.fillStyle = "#1a2e1a";
          ctx.beginPath(); ctx.arc(seg.x * SN_CELL + 6, seg.y * SN_CELL + 6, 2.5, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(seg.x * SN_CELL + SN_CELL - 6, seg.y * SN_CELL + 6, 2.5, 0, Math.PI * 2); ctx.fill();
        }
      });

      // Score
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.font = "bold 13px sans-serif"; ctx.textAlign = "left";
      ctx.fillText(`Score: ${g.score}`, 6, 16);
    };

    const tick = () => {
      const g = gRef.current;
      if (!g.active) return;
      g.dir = g.nextDir;
      const head = { x: g.snake[0].x + g.dir.x, y: g.snake[0].y + g.dir.y };

      // Wall collision
      if (head.x < 0 || head.x >= SN_COLS || head.y < 0 || head.y >= SN_ROWS) {
        g.active = false; setPhase("done"); render(); return;
      }
      // Self collision
      if (g.snake.some(s => s.x === head.x && s.y === head.y)) {
        g.active = false; setPhase("done"); render(); return;
      }

      const ateFood = head.x === g.food.x && head.y === g.food.y;
      if (ateFood) {
        g.score += 10; setDisplayScore(g.score);
        g.snake = [head, ...g.snake];
        g.food = spawnFood(g.snake);
        if (navigator.vibrate) navigator.vibrate(15);
      } else {
        g.snake = [head, ...g.snake.slice(0, -1)];
      }
      render();
    };

    // Tick speed: starts 200ms, speeds up every 50 pts
    render();
    const getTickMs = () => Math.max(100, 200 - Math.floor(gRef.current.score / 30) * 15);
    let ms = getTickMs();
    let lastMs = ms;

    const loop = () => {
      tick();
      const newMs = getTickMs();
      if (newMs !== lastMs) { lastMs = newMs; clearInterval(intervalRef.current!); intervalRef.current = setInterval(loop, newMs); }
    };
    intervalRef.current = setInterval(loop, ms);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [phase]);

  useEffect(() => { if (phase === "done") onComplete(gRef.current.score); }, [phase, onComplete]);

  useEffect(() => {
    if (phase !== "playing") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  { e.preventDefault(); changeDir(-1, 0); }
      if (e.key === "ArrowRight") { e.preventDefault(); changeDir(1, 0); }
      if (e.key === "ArrowUp")    { e.preventDefault(); changeDir(0, -1); }
      if (e.key === "ArrowDown")  { e.preventDefault(); changeDir(0, 1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, changeDir]);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="text-center">
        <h2 className="text-2xl font-black" style={{ fontFamily: "Outfit" }}>Snake Feast</h2>
        <p className="text-muted-foreground text-sm">Eat the apples — don't hit the walls!</p>
      </div>
      {phase === "ready" && (
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">Use the D-pad (or arrow keys) to steer. Eat apples to grow!</p>
          <Button size="lg" className="font-bold px-10" onClick={startGame} data-testid="btn-snake-start">Start!</Button>
        </div>
      )}
      <canvas
        ref={canvasRef} width={SN_W} height={SN_H}
        className={`rounded-xl border border-border ${phase === "ready" ? "hidden" : "block"}`}
        style={{ maxWidth: "100%" }}
        data-testid="snake-canvas"
      />
      {phase === "playing" && (
        <div className="grid grid-cols-3 gap-2 w-36">
          <div />
          <Button size="icon" variant="outline" onPointerDown={() => changeDir(0, -1)} data-testid="snake-up"><ArrowUp size={16} /></Button>
          <div />
          <Button size="icon" variant="outline" onPointerDown={() => changeDir(-1, 0)} data-testid="snake-left"><ArrowLeft size={16} /></Button>
          <Button size="icon" variant="outline" onPointerDown={() => changeDir(0, 1)} data-testid="snake-down"><ArrowDown size={16} /></Button>
          <Button size="icon" variant="outline" onPointerDown={() => changeDir(1, 0)} data-testid="snake-right"><ArrowRight size={16} /></Button>
        </div>
      )}
      {phase === "done" && (
        <div className="text-center space-y-3">
          <p className="text-4xl font-black text-primary">{displayScore}</p>
          <p className="text-muted-foreground">points scored!</p>
          <Button onClick={startGame} data-testid="btn-snake-retry">Play Again</Button>
        </div>
      )}
    </div>
  );
}

// ─── BRICK BREAKER (Breakout inspired) ───────────────────────────────────────
const BB_W = 290, BB_H = 380;
const BB_PADDLE_W = 72, BB_PADDLE_H = 11;
const BB_BALL_R = 8;
const BB_BRICK_ROWS = 5, BB_BRICK_COLS = 6;
const BB_BRICK_W = Math.floor((BB_W - 14) / BB_BRICK_COLS), BB_BRICK_H = 17;
const BB_BRICK_TOP = 40;
const BB_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6"];

function BrickBreakerGame({ onComplete }: { onComplete: (score: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<"ready" | "playing" | "done">("ready");
  const [displayScore, setDisplayScore] = useState(0);
  const [displayLives, setDisplayLives] = useState(3);
  const paddleXRef = useRef(BB_W / 2 - BB_PADDLE_W / 2);
  const gRef = useRef({
    ball: { x: BB_W / 2, y: BB_H - 80, vx: 3, vy: -3.5 },
    bricks: Array(BB_BRICK_ROWS).fill(null).map((_, r) => Array(BB_BRICK_COLS).fill(null).map((_, c) => ({ alive: true, r, c }))),
    score: 0, lives: 3, active: false, started: false,
  });

  const startGame = useCallback(() => {
    const g = gRef.current;
    g.ball = { x: BB_W / 2, y: BB_H - 80, vx: 3.2 * (Math.random() > 0.5 ? 1 : -1), vy: -3.5 };
    g.bricks = Array(BB_BRICK_ROWS).fill(null).map((_, r) => Array(BB_BRICK_COLS).fill(null).map((_, c) => ({ alive: true, r, c })));
    g.score = 0; g.lives = 3; g.active = true; g.started = true;
    paddleXRef.current = BB_W / 2 - BB_PADDLE_W / 2;
    setDisplayScore(0); setDisplayLives(3); setPhase("playing");
  }, []);

  const movePaddle = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = BB_W / rect.width;
    paddleXRef.current = Math.max(0, Math.min(BB_W - BB_PADDLE_W, (e.clientX - rect.left) * scaleX - BB_PADDLE_W / 2));
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let rafId: number;

    const draw = () => {
      const g = gRef.current;
      if (!g.active) return;
      const px = paddleXRef.current;

      ctx.clearRect(0, 0, BB_W, BB_H);

      // Background
      const bg = ctx.createLinearGradient(0, 0, 0, BB_H);
      bg.addColorStop(0, "#1e1b4b"); bg.addColorStop(1, "#312e81");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, BB_W, BB_H);

      // Bricks
      for (const row of g.bricks) {
        for (const brick of row) {
          if (!brick.alive) continue;
          const bx = 7 + brick.c * BB_BRICK_W, by = BB_BRICK_TOP + brick.r * (BB_BRICK_H + 3);
          ctx.fillStyle = BB_COLORS[brick.r];
          ctx.beginPath(); ctx.roundRect(bx, by, BB_BRICK_W - 3, BB_BRICK_H, 3); ctx.fill();
          ctx.fillStyle = "rgba(255,255,255,0.2)";
          ctx.fillRect(bx + 2, by + 2, BB_BRICK_W - 7, 4);
        }
      }

      // Paddle
      const grad = ctx.createLinearGradient(px, 0, px + BB_PADDLE_W, 0);
      grad.addColorStop(0, "#a78bfa"); grad.addColorStop(1, "#818cf8");
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.roundRect(px, BB_H - 28, BB_PADDLE_W, BB_PADDLE_H, 6); ctx.fill();

      // Ball
      ctx.beginPath(); ctx.arc(g.ball.x, g.ball.y, BB_BALL_R, 0, Math.PI * 2);
      ctx.fillStyle = "#fff"; ctx.fill();
      ctx.strokeStyle = "#a78bfa"; ctx.lineWidth = 2; ctx.stroke();

      // Lives & Score
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.font = "bold 13px sans-serif"; ctx.textAlign = "left";
      ctx.fillText(`Score: ${g.score}`, 8, 22);
      ctx.textAlign = "right";
      ctx.fillText(`❤ ${g.lives}`, BB_W - 8, 22);

      // Physics
      g.ball.x += g.ball.vx; g.ball.y += g.ball.vy;

      // Wall bounce
      if (g.ball.x - BB_BALL_R < 0) { g.ball.x = BB_BALL_R; g.ball.vx = Math.abs(g.ball.vx); }
      if (g.ball.x + BB_BALL_R > BB_W) { g.ball.x = BB_W - BB_BALL_R; g.ball.vx = -Math.abs(g.ball.vx); }
      if (g.ball.y - BB_BALL_R < 0) { g.ball.y = BB_BALL_R; g.ball.vy = Math.abs(g.ball.vy); }

      // Paddle collision
      const paddleTop = BB_H - 28;
      if (g.ball.y + BB_BALL_R >= paddleTop && g.ball.y + BB_BALL_R <= paddleTop + BB_PADDLE_H + 2 && g.ball.x >= px - 4 && g.ball.x <= px + BB_PADDLE_W + 4 && g.ball.vy > 0) {
        const hitPos = (g.ball.x - px) / BB_PADDLE_W - 0.5;
        g.ball.vx = hitPos * 8;
        g.ball.vy = -Math.abs(g.ball.vy);
        g.ball.y = paddleTop - BB_BALL_R;
        if (navigator.vibrate) navigator.vibrate(8);
      }

      // Brick collisions
      let allGone = true;
      for (const row of g.bricks) {
        for (const brick of row) {
          if (!brick.alive) continue;
          allGone = false;
          const bx = 7 + brick.c * BB_BRICK_W, by = BB_BRICK_TOP + brick.r * (BB_BRICK_H + 3);
          const bx2 = bx + BB_BRICK_W - 3, by2 = by + BB_BRICK_H;
          if (g.ball.x + BB_BALL_R > bx && g.ball.x - BB_BALL_R < bx2 && g.ball.y + BB_BALL_R > by && g.ball.y - BB_BALL_R < by2) {
            brick.alive = false;
            g.score += 10; setDisplayScore(g.score);
            const overlapL = g.ball.x + BB_BALL_R - bx, overlapR = bx2 - (g.ball.x - BB_BALL_R);
            const overlapT = g.ball.y + BB_BALL_R - by, overlapB = by2 - (g.ball.y - BB_BALL_R);
            const minH = Math.min(overlapL, overlapR), minV = Math.min(overlapT, overlapB);
            if (minH < minV) g.ball.vx *= -1; else g.ball.vy *= -1;
            if (navigator.vibrate) navigator.vibrate(5);
          }
        }
      }

      if (allGone) { g.active = false; setPhase("done"); return; }

      // Ball falls below
      if (g.ball.y - BB_BALL_R > BB_H) {
        g.lives--; setDisplayLives(g.lives);
        if (g.lives <= 0) { g.active = false; setPhase("done"); return; }
        g.ball = { x: px + BB_PADDLE_W / 2, y: BB_H - 60, vx: 3.2 * (Math.random() > 0.5 ? 1 : -1), vy: -3.5 };
        if (navigator.vibrate) navigator.vibrate([30, 15, 30]);
      }

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [phase]);

  useEffect(() => { if (phase === "done") onComplete(gRef.current.score); }, [phase, onComplete]);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="text-center">
        <h2 className="text-2xl font-black" style={{ fontFamily: "Outfit" }}>Brick Breaker</h2>
        <p className="text-muted-foreground text-sm">Move the paddle to bounce the ball!</p>
      </div>
      {phase === "ready" && (
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">Move your mouse/finger to control the paddle. Break all bricks!</p>
          <Button size="lg" className="font-bold px-10" onClick={startGame} data-testid="btn-break-start">Launch Ball!</Button>
        </div>
      )}
      <canvas
        ref={canvasRef} width={BB_W} height={BB_H}
        className={`rounded-xl border border-border touch-none ${phase === "ready" ? "hidden" : "block"}`}
        style={{ maxWidth: "100%", cursor: "none" }}
        onPointerMove={phase === "playing" ? movePaddle : undefined}
        data-testid="breakout-canvas"
      />
      {phase === "done" && (
        <div className="text-center space-y-3">
          <p className="text-4xl font-black text-primary">{displayScore}</p>
          <p className="text-muted-foreground">points!</p>
          <Button onClick={startGame} data-testid="btn-break-retry">Play Again</Button>
        </div>
      )}
    </div>
  );
}

// ─── GAMES REGISTRY ───────────────────────────────────────────────────────────
const GAMES: { id: GameId; name: string; desc: string; icon: React.ElementType; color: string; tag: string }[] = [
  { id: "tap",      name: "Tap Rush",      desc: "Tap fast — combo bonuses!",          icon: Zap,       color: "from-orange-400 to-yellow-400",  tag: "Speed" },
  { id: "memory",   name: "Memory Match",  desc: "Find all matching pairs",             icon: Brain,     color: "from-violet-400 to-pink-400",    tag: "Brain" },
  { id: "catch",    name: "Feed Frenzy",   desc: "Catch food, dodge poison!",           icon: ChefHat,   color: "from-green-400 to-teal-400",     tag: "Action" },
  { id: "jump",     name: "Pet Jump",      desc: "Flap through the pipes!",             icon: Bird,      color: "from-sky-400 to-blue-500",       tag: "Skill" },
  { id: "whack",    name: "Whack-a-Pet",   desc: "Tap the pets before they hide!",      icon: Target,    color: "from-amber-400 to-orange-500",   tag: "Reflex" },
  { id: "tiles",    name: "2048 Pets",     desc: "Swipe to merge tiles to 2048!",       icon: LayoutGrid,color: "from-yellow-400 to-amber-500",   tag: "Puzzle" },
  { id: "snake",    name: "Snake Feast",   desc: "Eat apples, don't hit the walls!",    icon: Minus,     color: "from-emerald-400 to-green-600",  tag: "Classic" },
  { id: "breakout", name: "Brick Breaker", desc: "Smash all the bricks!",               icon: Layers,    color: "from-red-400 to-purple-500",     tag: "Arcade" },
];

// ─── MAIN HUB ────────────────────────────────────────────────────────────────
export default function MiniGamesHub() {
  const [activeGame, setActiveGame] = useState<ActiveGame>(null);
  const [lastScores, setLastScores] = useState<Record<string, number>>(() => loadState().highScores);
  const { toast } = useToast();

  usePageMeta({
    title: "Mini Games — 8 Free Games | ToyPetMe",
    description: "Play 8 free mini-games on ToyPetMe: Tap Rush, Memory Match, Feed Frenzy, Pet Jump, Whack-a-Pet, 2048 Pets, Snake Feast & Brick Breaker. Earn coins for your virtual pet!",
    canonicalPath: "/minigames",
  });

  const handleComplete = useCallback((game: string, score: number) => {
    const state = loadState();
    const newState = updateHighScore(state, game, score);
    const coins = coinsForGame(game, score);
    newState.coins = Math.min(9999, (newState.coins ?? 0) + coins);
    saveState(newState);
    setLastScores(newState.highScores);
    const prev = state.highScores[game] ?? 0;
    if (score > prev) {
      toast({ title: `New High Score! 🏆 ${score}`, description: `+${coins} coins earned`, duration: 3500 });
    } else {
      toast({ title: `Score: ${score} (+${coins} coins)`, description: `Best: ${state.highScores[game] ?? score}`, duration: 2500 });
    }
  }, [toast]);

  if (activeGame) {
    const info = GAMES.find(g => g.id === activeGame)!;
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 pb-40">
        <GameHeader />
        <div className="max-w-2xl mx-auto px-4 pt-4">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="default" className="gap-2" onClick={() => setActiveGame(null)} data-testid="btn-back-games">
              <ArrowLeft size={16} /> Back
            </Button>
            <div className="flex-1">
              <p className="font-bold text-foreground">{info.name}</p>
              <p className="text-xs text-muted-foreground">{info.desc}</p>
            </div>
            {(lastScores[activeGame] ?? 0) > 0 && (
              <div className="flex items-center gap-1 text-amber-600">
                <Trophy size={13} />
                <span className="text-xs font-bold">{lastScores[activeGame]}</span>
              </div>
            )}
          </div>
          <AdSlot format="banner" className="mx-auto mb-4" />
          <Card>
            <CardContent className="p-2">
              {activeGame === "tap"      && <TapRushGame      onComplete={(s) => handleComplete("tap", s)} />}
              {activeGame === "memory"   && <MemoryMatchGame   onComplete={(s) => handleComplete("memory", s)} />}
              {activeGame === "catch"    && <FeedFrenzyGame    onComplete={(s) => handleComplete("catch", s)} />}
              {activeGame === "jump"     && <PetJumpGame       onComplete={(s) => handleComplete("jump", s)} />}
              {activeGame === "whack"    && <WhackAPetGame     onComplete={(s) => handleComplete("whack", s)} />}
              {activeGame === "tiles"    && <Game2048          onComplete={(s) => handleComplete("tiles", s)} />}
              {activeGame === "snake"    && <SnakeFeastGame    onComplete={(s) => handleComplete("snake", s)} />}
              {activeGame === "breakout" && <BrickBreakerGame  onComplete={(s) => handleComplete("breakout", s)} />}
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
          <p className="text-sm text-muted-foreground">8 games — play to earn coins for your pet!</p>
        </div>

        <AdSlot format="banner" className="mx-auto mb-4" />

        <div className="grid gap-3">
          {GAMES.map(({ id, name, desc, icon: Icon, color, tag }, idx) => {
            const best = lastScores[id] ?? 0;
            return (
              <div key={id}>
                {(idx === 2 || idx === 5) && <InContentAd format="banner" />}
                <Card className="overflow-hidden hover-elevate" data-testid={`game-card-${id}`}>
                  <CardContent className="p-0">
                    <div className={`h-1.5 bg-gradient-to-r ${color}`} />
                    <div className="p-3 flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
                        <Icon size={20} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap gap-y-0">
                          <p className="font-bold text-foreground text-sm">{name}</p>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">{tag}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                        {best > 0 && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Trophy size={10} className="text-amber-500" />
                            <span className="text-[11px] text-amber-600 font-semibold">Best: {best}</span>
                          </div>
                        )}
                      </div>
                      <Button size="sm" onClick={() => setActiveGame(id)} data-testid={`btn-play-${id}`}>
                        Play
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
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
