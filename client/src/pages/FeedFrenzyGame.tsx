import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Utensils, Trophy } from "lucide-react";

interface FallingItem {
  id: number;
  x: number;
  y: number;
  speed: number;
  emoji: string;
}

export default function FeedFrenzyGame() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [gameState, setGameState] = useState<"idle" | "playing" | "ended">("idle");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [basketX, setBasketX] = useState(50);
  const [items, setItems] = useState<FallingItem[]>([]);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const itemIdCounter = useRef(0);

  const foodEmojis = ["🍎", "🍌", "🍇", "🍓", "🍕", "🍔", "🍰", "🍩"];

  const submitScoreMutation = useMutation({
    mutationFn: async (finalScore: number) => {
      const response = await apiRequest("POST", "/api/minigames/feed-frenzy/play", { score: finalScore });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit score");
      }
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Score Submitted! 🍕",
        description: `Earned ${data.coinsEarned} coins! Score: ${score}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/minigames/sessions"] });
    },
    onError: (error: any) => {
      if (error.message.includes("Cooldown active")) {
        toast({
          variant: "destructive",
          title: "Cooldown Active",
          description: error.message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Submission Failed",
          description: error.message,
        });
      }
    },
  });

  // Start game
  const startGame = () => {
    setGameState("playing");
    setScore(0);
    setTimeLeft(30);
    setItems([]);
    setBasketX(50);
    itemIdCounter.current = 0;
  };

  // Spawn items
  useEffect(() => {
    if (gameState !== "playing") return;

    const spawnInterval = setInterval(() => {
      const newItem: FallingItem = {
        id: itemIdCounter.current++,
        x: Math.random() * 90, // 0-90% to stay within bounds
        y: 0,
        speed: 1 + Math.random() * 2,
        emoji: foodEmojis[Math.floor(Math.random() * foodEmojis.length)],
      };
      setItems(prev => [...prev, newItem]);
    }, 800);

    return () => clearInterval(spawnInterval);
  }, [gameState]);

  // Move items and check collisions
  useEffect(() => {
    if (gameState !== "playing") return;

    const moveInterval = setInterval(() => {
      setItems(prev => {
        const updated = prev.map(item => ({ ...item, y: item.y + item.speed }));
        
        // Check collisions with basket
        const caught = updated.filter(
          item => item.y >= 85 && item.y <= 95 && Math.abs(item.x - basketX) < 10
        );
        
        if (caught.length > 0) {
          setScore(s => s + caught.length * 10);
        }
        
        // Remove items that fell off screen or were caught
        return updated.filter(item => item.y < 100);
      });
    }, 50);

    return () => clearInterval(moveInterval);
  }, [gameState, basketX]);

  // Timer countdown
  useEffect(() => {
    if (gameState !== "playing") return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState("ended");
          if (bestScore === null || score > bestScore) {
            setBestScore(score);
          }
          submitScoreMutation.mutate(score);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, score, bestScore]);

  // Mouse/touch control
  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (gameState !== "playing") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setBasketX(Math.max(5, Math.min(95, x)));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/minigames")}
            data-testid="button-back"
          >
            <ArrowLeft className="mr-2" />
            Back to Hub
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold font-['Outfit']" data-testid="text-page-title">
              <Utensils className="inline-block mr-2 mb-1 text-orange-500" />
              Feed Frenzy
            </h1>
          </div>
          <div className="w-24" /> {/* Spacer */}
        </div>

        {/* Stats */}
        {gameState !== "idle" && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Score</p>
                <p className="text-2xl font-bold" data-testid="text-score">{score}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="text-2xl font-bold" data-testid="text-time-left">{timeLeft}s</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Best Score */}
        {bestScore !== null && (
          <Card className="mb-6 bg-yellow-50 border-yellow-200">
            <CardContent className="p-4 text-center">
              <Trophy className="inline-block mr-2 text-yellow-600" />
              <span className="font-semibold" data-testid="text-best-score">Best Score: {bestScore}</span>
            </CardContent>
          </Card>
        )}

        {/* Game Area */}
        <Card
          className="relative h-96 bg-gradient-to-b from-sky-100 to-green-100 overflow-hidden cursor-none"
          onMouseMove={handleMove}
        >
          <CardContent className="p-0 h-full relative" data-testid="game-interaction-area">
            {/* Falling Items */}
            {items.map(item => (
              <div
                key={item.id}
                className="absolute text-3xl transition-none"
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {item.emoji}
              </div>
            ))}

            {/* Basket */}
            {gameState === "playing" && (
              <div
                className="absolute bottom-4 w-16 h-16 bg-amber-600 rounded-lg flex items-center justify-center text-3xl transition-none"
                style={{
                  left: `${basketX}%`,
                  transform: "translateX(-50%)",
                }}
                data-testid="game-basket"
              >
                🧺
              </div>
            )}

            {/* Game Over Message */}
            {gameState === "ended" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-center text-white">
                  <h2 className="text-3xl font-bold mb-2 font-['Outfit']" data-testid="text-game-over">Game Over!</h2>
                  <p className="text-xl" data-testid="text-final-score">Final Score: {score}</p>
                </div>
              </div>
            )}

            {/* Idle Message */}
            {gameState === "idle" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-2xl font-bold text-muted-foreground font-['Outfit']">
                  Click "Start Game" to begin!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-6 mb-6">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">How to Play:</h3>
            <ol className="text-sm text-muted-foreground space-y-1">
              <li>1. Move your mouse to control the basket</li>
              <li>2. Catch falling food items to score points</li>
              <li>3. Each item = 10 points</li>
              <li>4. Survive for 30 seconds and get the highest score!</li>
            </ol>
          </CardContent>
        </Card>

        {/* Start/Restart Button */}
        <Button
          onClick={startGame}
          disabled={gameState === "playing" || submitScoreMutation.isPending}
          size="lg"
          className="w-full"
          data-testid="button-start"
        >
          {submitScoreMutation.isPending
            ? "Submitting..."
            : gameState === "idle"
            ? "Start Game"
            : "Play Again"}
        </Button>
      </div>
    </div>
  );
}
